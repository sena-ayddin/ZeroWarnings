# DB Performance Notes — Sprint 4 (NFR-02)

## 1. Kapsam ve Ortam
- **Proje:** SDS-07 — ISO 9001 Uyumlu IT Servis Masası ve Süreç Takip Sistemi
- **Veritabanı:** `helpdesk_db` (MySQL / `InnoDB`, `utf8mb4_unicode_ci`)
- **Zaman Standardı:** `UTC_TIMESTAMP()`
- **Test Veri Seti:** `seed.sql` temel kayıtları + `seed_perf.sql` ile eklenen 210 adet performans test bileti (`PERF-0001` .. `PERF-0210`).
- **Hedef:** NFR-02 kapsamında sorgu yanıt sürelerinin 3 saniyenin altında kalmasını desteklemek ve sık kullanılan filtre/birleştirme (`JOIN`) yollarında indeks kullanımını doğrulamak.

## 2. Eklenen İndeksler (`schema.sql` & `migrations_sprint4.sql`)
- **`Tickets`:**
  - `idx_tickets_user_id (user_id)` — Kullanıcının kendi biletlerini listeleme ve `Change_Requests` birleştirmeleri için.
  - `idx_tickets_assigned_to (assigned_to)` — Teknisyen/yönetici atama listeleri ve iş yükü sorguları için.
  - `idx_tickets_created_at (created_at)` — Zaman sıralı (`ORDER BY created_at DESC`) listeleme ve tarih filtreleri için.
  - *(Mevcut indeksler korundu: `idx_status`, `idx_priority`.)*
- **`Audit_Logs`:**
  - `idx_audit_logs_entity (entity_type, entity_id)` — Belirli bir kayıt/nesneye ait denetim geçmişini (`Audit_Logs`) hızlı getirmek için.
  - *(Mevcut indeks korundu: `idx_timestamp`.)*
- **`Customer_Feedback`:**
  - `idx_feedback_submitted_rating (submitted_at, satisfaction_rating)` — Geri bildirim zamanı ve CSAT puan raporlamaları için.

## 3. `EXPLAIN` Doğrulama Sorguları
MySQL üzerinde aşağıdaki sorguların başına `EXPLAIN` ekleyerek indeks kullanımını kontrol edebilirsin:

```sql
USE helpdesk_db;

-- 1. Kullanıcının kendi biletleri (FR-02 / idx_tickets_user_id)
EXPLAIN
SELECT ticket_id, ticket_number, title, status, created_at
FROM Tickets
WHERE user_id = 1
ORDER BY created_at DESC;

-- 2. Teknisyene atanan biletler (idx_tickets_assigned_to)
EXPLAIN
SELECT ticket_id, ticket_number, priority, status
FROM Tickets
WHERE assigned_to = 2;

-- 3. Denetim kaydı sorgusu (idx_audit_logs_entity)
EXPLAIN
SELECT log_id, action, old_value, new_value, action_timestamp
FROM Audit_Logs
WHERE entity_type = 'ChangeRequest' AND entity_id = 1;

-- 4. Geri bildirim puan ve tarih analizi (idx_feedback_submitted_rating)
EXPLAIN
SELECT feedback_id, satisfaction_rating, submitted_at
FROM Customer_Feedback
WHERE submitted_at >= DATE_SUB(UTC_TIMESTAMP(), INTERVAL 30 DAY);
