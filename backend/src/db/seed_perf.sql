USE helpdesk_db;

-- Performans testi için 210 adet bilet üretimi (Recursive CTE ile 1..210)
-- Not: seed.sql çalıştırıldıktan sonra test ortamında çalıştırılır.
WITH RECURSIVE seq AS (
    SELECT 1 AS n
    UNION ALL
    SELECT n + 1 FROM seq WHERE n < 210
)
INSERT INTO Tickets (
    ticket_number,
    user_id,
    assigned_to,
    sla_policy_id,
    title,
    description,
    category,
    priority,
    status,
    request_type,
    escalation_level,
    created_at,
    response_due_at,
    resolution_due_at,
    resolved_at
)
SELECT
    CONCAT('PERF-', LPAD(n, 4, '0')) AS ticket_number,
    CASE (n % 3)
        WHEN 1 THEN 1
        WHEN 2 THEN 2
        ELSE 1
    END AS user_id,
    CASE (n % 2)
        WHEN 0 THEN 2
        ELSE 3
    END AS assigned_to,
    ((n - 1) % 4) + 1 AS sla_policy_id,
    CONCAT('Performans Test Bileti #', n) AS title,
    CONCAT('NFR-02 yanıt süresi ve indeks doğrulaması için üretilmiş sentetik kayıt #', n) AS description,
    CASE (n % 4)
        WHEN 0 THEN 'Network'
        WHEN 1 THEN 'Hardware'
        WHEN 2 THEN 'Software'
        ELSE 'Database'
    END AS category,
    CASE ((n - 1) % 4) + 1
        WHEN 1 THEN 'Low'
        WHEN 2 THEN 'Medium'
        WHEN 3 THEN 'High'
        ELSE 'Critical'
    END AS priority,
    CASE
        WHEN n <= 120 THEN 'Resolved'
        WHEN n <= 160 THEN 'In Progress'
        WHEN n <= 185 THEN 'Open'
        ELSE 'Closed'
    END AS status,
    CASE
        WHEN n % 7 = 0 THEN 'Change Request'
        ELSE 'Incident'
    END AS request_type,
    CASE
        WHEN n % 5 = 0 THEN 2
        ELSE 1
    END AS escalation_level,
    DATE_SUB(UTC_TIMESTAMP(), INTERVAL (n * 15) MINUTE) AS created_at,
    DATE_SUB(UTC_TIMESTAMP(), INTERVAL ((n * 15) - 60) MINUTE) AS response_due_at,
    DATE_SUB(UTC_TIMESTAMP(), INTERVAL ((n * 15) - 240) MINUTE) AS resolution_due_at,
    CASE
        WHEN n <= 120 OR n > 185 THEN DATE_SUB(UTC_TIMESTAMP(), INTERVAL ((n * 15) - 90) MINUTE)
        ELSE NULL
    END AS resolved_at
FROM seq;
