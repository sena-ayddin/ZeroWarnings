# SDS-07 IT Service Desk – Backend API

Node.js / Express, katmanlı mimari: `routes` → `controllers` → `models`, ortak `middlewares`.

## Kurulum
```bash
cd backend
cp .env.example .env   # JWT_SECRET değerini değiştirin
npm install
npm run dev            # http://localhost:3000
node scripts/smoke-test.js
```

## Roller (RBAC)
| Rol | Yetki |
|---|---|
| Employee | Bilet açar, sadece kendi biletlerini görür |
| Technician | Tüm biletleri listeler ve görüntüler |
| Administrator | Tüm biletleri listeler ve görüntüler |

## Uç Noktalar
| Metot | Yol | Yetki | Açıklama |
|---|---|---|---|
| POST | /api/auth/login | Herkes | E-posta/şifre ile giriş, JWT döner |
| POST | /api/auth/register | Herkes | Yeni Employee kaydı |
| GET | /api/auth/me | Giriş yapmış | Token sahibinin bilgisi |
| POST | /api/tickets | Tüm roller | Bilet açar, SLA son tarihini hesaplar |
| GET | /api/tickets | Tüm roller | Biletleri SLA durumuyla listeler |
| GET | /api/tickets/:id | Tüm roller | Bilet detayı (örn. INC-1024) |

Korumalı uçlar için başlık: `Authorization: Bearer <token>`

### Bilet açma gövdesi
```json
{ "title": "Bilgisayar açılmıyor", "description": "...", "category": "Hardware",
  "priority": "High", "request_type": "Incident" }
```
`category`: Hardware, Software, Network, Access, Email, Other · `priority`: Low, Medium, High, Critical · `request_type`: Incident, Change Request

### SLA bilgisi
Her bilet yanıtında `resolution_due_at` ve `sla` bloğu bulunur (`slaStatus`: ON_TRACK / WARNING / ESCALATED, `remainingMinutes`, `percentageElapsed`). Hesaplama `services/slaService.js` tarafından yapılır.

## Hata biçimi
```json
{ "success": false, "error": { "status": 403, "message": "...", "details": [] } }
```
Kodlar: 400 doğrulama, 401 token yok/geçersiz, 403 yetki yok, 404 bulunamadı, 409 çakışma, 500 sunucu hatası.

## Entegrasyon notları
- `models/store.js` geçici bellek içi veridir; `db/schema.sql` bağlandığında sadece bu dosya değişecek.
- Frontend: login sonrası gelen token her istekte `Authorization` başlığıyla gönderilmelidir.