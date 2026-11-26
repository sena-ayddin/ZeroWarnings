-- NOT: Bu sorgular referans amaçlıdır. 
-- İş mantığı ve mesai saati (09:00 - 18:00) filtreleri nedeniyle 
-- Backend API sonuçlarıyla aralarında küçük farklar bulunabilir.

USE helpdesk_db;

-- 1. CSAT Average
SELECT
    COUNT(*) AS total_feedback,
    ROUND(AVG(satisfaction_rating), 2) AS average_csat
FROM Customer_Feedback;

-- 2. MTTR (Mean Time to Resolution - Minutes)
-- NOT: Bu sorgu toplam takvim dakikasını (7/24) hesaplar; Backend API ise yalnızca
-- mesai saatleri (09:00 - 18:00) içerisindeki dakikaları saydığı için sonuçlar arasında fark oluşur.
SELECT
    ROUND(AVG(TIMESTAMPDIFF(MINUTE, created_at, resolved_at)), 2)
        AS average_mttr_minutes
FROM Tickets
WHERE status IN ('Resolved', 'Closed')
  AND resolved_at IS NOT NULL;

-- 3. SLA Compliance Percentage (Süresi Geçmiş Açık Biletler Dahil)
-- NOT: Çözülen biletlerin yanı sıra resolution_due_at süresi dolmuş açık biletler de
-- SLA kapsamına (ihlale) dahil edilerek Backend API mantığıyla hizalanmıştır.
SELECT
    COUNT(*) AS total_evaluated_tickets,
    SUM(
        CASE
            WHEN status IN ('Resolved', 'Closed')
                 AND resolved_at IS NOT NULL
                 AND resolved_at <= resolution_due_at
            THEN 1
            ELSE 0
        END
    ) AS sla_compliant_tickets,
    ROUND(
        100.0 * SUM(
            CASE
                WHEN status IN ('Resolved', 'Closed')
                     AND resolved_at IS NOT NULL
                     AND resolved_at <= resolution_due_at
                THEN 1
                ELSE 0
            END
        ) / NULLIF(COUNT(*), 0),
        2
    ) AS sla_compliance_percentage
FROM Tickets
WHERE resolution_due_at IS NOT NULL
  AND (
      (status IN ('Resolved', 'Closed') AND resolved_at IS NOT NULL)
      OR (status NOT IN ('Resolved', 'Closed') AND resolution_due_at < UTC_TIMESTAMP())
  );
  
  -- 4. Audit Logs Insertion
-- NOT: Bu sorgu '?' parametre yer tutucuları içerdiği için doğrudan çalıştırılamayan bir şablondur (backend uygulaması üzerinden değerlerle çalıştırılır).
INSERT INTO Audit_Logs (
    user_id, entity_type, entity_id, action, old_value, new_value
)
VALUES (?, ?, ?, ?, ?, ?);

-- 5. Change Requests Listeleme (Tickets ve Users ile JOIN)
-- Çalışan kendi kayıtlarını filtrelemek için WHERE t.user_id = ? koşulu eklenebilir;
-- Technician ve Administrator tüm kayıtları görebilir.
SELECT
    cr.change_id,
    t.ticket_id,
    t.ticket_number,
    t.title AS ticket_title,
    t.status AS ticket_status,
    t.priority,
    t.user_id,
    cr.requested_by,
    u.full_name AS requester_name,
    cr.change_title,
    cr.description,
    cr.reason,
    cr.impact_level,
    cr.risk_level,
    cr.status AS change_status,
    cr.planned_date,
    t.created_at
FROM Change_Requests cr
INNER JOIN Tickets t
    ON cr.ticket_id = t.ticket_id
LEFT JOIN Users u
    ON cr.requested_by = u.user_id
ORDER BY t.created_at DESC;

-- 6. Change Request Durum Güncelleme (Şablon Sorgu - ? Parametreli)
-- NOT: Bu sorgu '?' parametre yer tutucuları içerdiği için doğrudan çalıştırılamayan bir şablondur
-- (backend uygulaması üzerinden değerlerle çalıştırılır; her değişiklik Audit_Logs tablosuna da işlenmelidir).
UPDATE Change_Requests
SET status = ?
WHERE change_id = ?;

-- 7. FCR (First Contact Resolution - İlk Temasta Çözüm Yüzdesi)
-- Tanım: Çözülen veya kapatılan biletler arasında eskalasyon olmadan (escalation_level = 1)
-- çözülen biletlerin yüzdesi (ISO 9001 Madde 9.1.1).
SELECT
    COUNT(*) AS total_resolved_tickets,
    SUM(CASE WHEN escalation_level = 1 THEN 1 ELSE 0 END) AS fcr_tickets,
    ROUND(
        100.0 * SUM(CASE WHEN escalation_level = 1 THEN 1 ELSE 0 END)
        / NULLIF(COUNT(*), 0),
        2
    ) AS fcr_percent
FROM Tickets
WHERE status IN ('Resolved', 'Closed');
