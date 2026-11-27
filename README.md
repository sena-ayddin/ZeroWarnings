# SDS-07 IT Service Desk – Backend API

Node.js / Express + MySQL (`helpdesk_db`). Katmanlı mimari: `routes` → `controllers` → `models` → `config/db.js`.

## Kurulum
```bash
# 1) Veritabanı: schema.sql ve seed.sql'i çalıştırın (bkz. docs/DB_Setup_Guide.md)
cd backend
cp .env.example .env        # JWT_SECRET ve DB_* değerlerini doldurun
npm install
npm run seed:passwords      # seed kullanıcılarına gerçek bcrypt şifresi yazar (giriş için gerekli)
npm run dev                 # http://localhost:3000
npm run test:smoke          # (ayrı terminalde) uçtan uca duman testi
```
`seed.sql` içindeki şifre hash'leri örnek veridir; `npm run seed:passwords` çalıştırılmadan giriş yapılamaz.

## Test kullanıcıları (seed:passwords sonrası)
| Rol | E-posta | Şifre |
|---|---|---|
| Employee | ahmet@iku.edu.tr | Emp123! |
| Technician | mehmet@iku.edu.tr | Tech123! |
| Administrator | elif@iku.edu.tr | Admin123! |

## Uç Noktalar
| Metot | Yol | Yetki | Açıklama |
|---|---|---|---|
| POST | /api/auth/login | Herkes | Giriş, JWT döner |
| POST | /api/auth/register | Herkes | Yeni Employee kaydı |
| GET | /api/auth/me | Giriş yapmış | Token sahibinin bilgisi |
| POST | /api/tickets | Tüm roller | Bilet açar, SLA son tarihini hesaplar |
| GET | /api/tickets | Tüm roller | Biletleri SLA durumuyla listeler (Employee: sadece kendi) |
| GET | /api/tickets/:id | Tüm roller | Detay (`INC-1024` veya sayısal `ticket_id`) |
| PATCH | /api/tickets/:id/status | Technician, Administrator | Durum güncelleme / teknisyen atama (Audit_Logs'a yazılır) |
| POST | /api/tickets/:id/feedback | Bilet sahibi | CSAT puanı (1-5) ve yorum |
| POST | /api/change-requests | Tüm roller | Değişiklik talebi açar (CHG-xxxx bileti ile birlikte) |
| GET | /api/change-requests | Tüm roller | Talepleri listeler (Employee: sadece kendi) |
| GET | /api/change-requests/:id | Tüm roller | Talep detayı (`CHG-0872` veya sayısal `change_id`) |
| PATCH | /api/change-requests/:id/status | Technician, Administrator | Onay / ret / uygulama (Audit_Logs'a yazılır) |
| GET | /api/kpi | Administrator | Açık/çözülen sayısı, SLA uyum %, MTTR, CSAT ortalaması |
| GET | /api/health | Herkes | Sunucu ve veritabanı durumu |

Korumalı uçlar için başlık: `Authorization: Bearer <token>`

Yanıtlardaki bilet nesnesi `ticket_number`, `title`, `request_type`, `priority`, `status`, `resolution_due_at` alanlarını ve `sla` bloğunu (`slaStatus`: ON_TRACK / WARNING / ESCALATED, `remainingMinutes`, `percentageElapsed`) içerir. Liste yanıtı `{ "success": true, "count": n, "tickets": [...] }` biçimindedir.

### Bilet açma gövdesi
```json
{ "title": "Bilgisayar açılmıyor", "description": "...", "category": "Hardware",
  "priority": "High", "request_type": "Incident" }
```
`category`: Hardware, Software, Network, Access, Email, Other · `priority`: Low, Medium, High, Critical · `request_type`: `Incident` veya `Change Request`

### PATCH /api/tickets/:id/status
```json
{ "status": "In Progress" }              // atanmamış bileti işleme alan teknisyen otomatik üstüne alır
{ "assigned_to": "me" }                  // sadece üstüne al
{ "status": "Resolved" }
{ "assigned_to": 2, "status": "In Progress" }   // Administrator başka teknisyene atayabilir
```
`status`: In Progress, Resolved, Closed. Kapalı bilet güncellenemez (409). Bilet güncellemesi ve audit kaydı tek transaction'dadır.

### POST /api/tickets/:id/feedback
```json
{ "satisfaction_rating": 5, "comments": "Problem hızlı çözüldü." }
```
Sadece bilet sahibi, sadece `Resolved` veya `Closed` bilet için ve bilet başına bir kez gönderebilir (aksi halde 403 / 409). Puan 1-5 tam sayı olmalıdır (400). Geri bildirim ve audit kaydı tek transaction'dadır.

### Değişiklik Talebi (Change Request)
```json
{ "title": "VPN erişimi", "description": "...", "reason": "Evden çalışma", "impact_level": "Low",
  "risk_level": "Low", "planned_date": "2026-12-20", "category": "Access", "priority": "Medium" }
```
`impact_level` / `risk_level`: Low, Medium, High. `category` ve `priority` isteğe bağlıdır (varsayılan Other / Medium).
Durum akışı: **Pending → Approved | Rejected** (sadece Administrator), **Approved → Implemented | Failed** (Technician veya Administrator). Geçersiz geçiş 409, yetkisiz rol 403 döner.
Bağlı CHG biletinin durumu otomatik güncellenir: Approved → In Progress, Implemented → Resolved, Rejected / Failed → Closed. Talep ve bilet güncellemesi ile audit kayıtları tek transaction'dadır.

### GET /api/kpi
```json
{ "kpi": { "total_tickets": 12, "open_tickets": 5, "resolved_tickets": 7, "resolved_this_month": 7,
           "sla_compliance_percent": 85.71, "mttr_minutes": 190.5, "mttr_hours": 3.18,
           "total_feedback": 4, "average_csat": 4.5, "generated_at": "..." } }
```
- **SLA Uyum Oranı** = SLA içinde çözülenler / (çözülenler + süresi geçmiş açık biletler) × 100
- **MTTR** = çözülen biletlerin ortalama çözüm süresi (mesai dakikası, `slaService.calculateBusinessMinutes`). Mesai dışında açılıp çözülen biletlerde 0 çıkması normaldir.
- **CSAT** = `Customer_Feedback.satisfaction_rating` ortalaması

Formül ayrıntıları: `docs/KPI_CSAT_Formulas.md`

## Otomatik SLA izleyicisi
Sunucu açılırken `services/slaWorker.js` başlar ve açık biletleri periyodik tarar: SLA süresinin %75'inde uyarı (`sla_warning_sent`), %100'de eskalasyon seviye 2, %150'de seviye 3 (`is_escalated`, `escalation_level`). Her olay `Audit_Logs`'a yazılır. Kontrol aralığı `.env` içindeki `SLA_WORKER_INTERVAL_MS` ile ayarlanır (varsayılan 60 sn, en az 15 sn).

## Hata biçimi
```json
{ "success": false, "error": { "status": 403, "message": "...", "details": [] } }
```
400 doğrulama · 401 token yok/geçersiz · 403 yetki yok · 404 bulunamadı · 409 çakışma · 503 veritabanı yok · 500 sunucu hatası

## Ön yüz entegrasyonu
- Giriş: `POST /api/auth/login` → dönen `token` her istekte `Authorization: Bearer <token>` başlığıyla gönderilmelidir.
- Sayfalar Live Server ile `http://localhost:5500` veya `http://127.0.0.1:5500` üzerinden açılmalıdır (CORS izin listesi `.env` içindeki `CORS_ORIGIN`'dir; `file://` ile çalışmaz).