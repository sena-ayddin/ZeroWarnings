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
INSERT INTO Audit_Logs (
    user_id, entity_type, entity_id, action, old_value, new_value
)
VALUES (?, ?, ?, ?, ?, ?);
