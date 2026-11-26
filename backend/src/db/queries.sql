-- NOT: Bu sorgular referans amaçlıdır. 
-- İş mantığı ve mesai saati (09:00 - 18:00) filtreleri nedeniyle 
-- Backend API sonuçlarıyla aralarında küçük farklar bulunabilir.

USE helpdesk_db;

-- 1. CSAT Average
SELECT
    COUNT(*) AS total_feedback,
    ROUND(AVG(satisfaction_rating), 2) AS average_csat
FROM Customer_Feedback;

-- 2. MTTR (minutes)
SELECT
    ROUND(AVG(TIMESTAMPDIFF(MINUTE, created_at, resolved_at)), 2)
        AS average_mttr_minutes
FROM Tickets
WHERE status IN ('Resolved', 'Closed')
  AND resolved_at IS NOT NULL;

-- 3. SLA Compliance Percentage
SELECT
    COUNT(*) AS total_resolved_tickets,
    SUM(CASE WHEN resolved_at <= resolution_due_at THEN 1 ELSE 0 END)
        AS sla_compliant_tickets,
    ROUND(
        100.0 * SUM(CASE WHEN resolved_at <= resolution_due_at THEN 1 ELSE 0 END)
        / NULLIF(COUNT(*), 0),
        2
    ) AS sla_compliance_percentage
FROM Tickets
WHERE status IN ('Resolved', 'Closed')
  AND resolved_at IS NOT NULL
  AND resolution_due_at IS NOT NULL;
  
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
