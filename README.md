# SDS-07 IT Service Desk – Backend API

Node.js / Express + MySQL (`helpdesk_db`). Katmanlı mimari: `routes` → `controllers` → `models` → `config/db.js`.

## Kurulum
```bash
# 1) Veritabanı: schema.sql ve seed.sql'i çalıştırın (bkz. docs/DB_Setup_Guide.md)
cd backend
cp .env.example .env        # JWT_SECRET ve DB_* değerlerini doldurun
npm install
npm run seed:passwords      # seed kullanıcılarına gerçek bcrypt şifresi yazar
npm run dev                 # http://localhost:3000
npm run test:smoke          # (ayrı terminalde) uçtan uca duman testi
```

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
| GET | /api/kpi | Administrator | Açık/çözülen sayısı, SLA uyum %, MTTR |
| GET | /api/health | Herkes | Sunucu ve veritabanı durumu |

Korumalı uçlar için başlık: `Authorization: Bearer <token>`

### PATCH /api/tickets/:id/status
```json
{ "status": "In Progress" }              // atanmamış bileti işleme alan teknisyen otomatik üstüne alır
{ "assigned_to": "me" }                  // sadece üstüne al
{ "status": "Resolved" }
{ "assigned_to": 2, "status": "In Progress" }   // Administrator başka teknisyene atayabilir
```
`status`: In Progress, Resolved, Closed. Kapalı bilet güncellenemez (409). Bilet güncellemesi ve audit kaydı tek transaction'dadır.

### GET /api/kpi
```json
{ "kpi": { "total_tickets": 12, "open_tickets": 5, "resolved_tickets": 7, "resolved_this_month": 7,
           "sla_compliance_percent": 85.71, "mttr_minutes": 190.5, "mttr_hours": 3.18, "generated_at": "..." } }
```
- **SLA Uyum Oranı** = SLA içinde çözülenler / (çözülenler + süresi geçmiş açık biletler) × 100
- **MTTR** = çözülen biletlerin ortalama çözüm süresi (mesai dakikası, `slaService.calculateBusinessMinutes`)

### Bilet açma gövdesi
```json
{ "title": "Bilgisayar açılmıyor", "description": "...", "category": "Hardware",
  "priority": "High", "request_type": "Incident" }
```
`category`: Hardware, Software, Network, Access, Email, Other · `priority`: Low, Medium, High, Critical · `request_type`: Incident, Change Request

## Test Kullanıcıları ve Şifreler
`seed.sql` dosyasındaki şifre hash'leri örnek veridir. Sisteme sorunsuz giriş yapabilmek için veritabanını kurduktan sonra `backend` klasöründe şu komutları çalıştırmalısınız:
```bash
npm install
npm run seed:passwords



## Hata biçimi
```json
{ "success": false, "error": { "status": 403, "message": "...", "details": [] } }
```
400 doğrulama · 401 token yok/geçersiz · 403 yetki yok · 404 bulunamadı · 409 çakışma · 503 veritabanı yok · 500 sunucu hatası
