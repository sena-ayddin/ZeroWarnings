USE helpdesk_db;

DROP TEMPORARY TABLE IF EXISTS tmp_seq;
CREATE TEMPORARY TABLE tmp_seq (n INT PRIMARY KEY);

INSERT INTO tmp_seq (n)
SELECT a.d + b.d * 10 + c.d * 100 + 1
FROM (SELECT 0 AS d UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4
      UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) a
CROSS JOIN (SELECT 0 AS d UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4
            UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) b
CROSS JOIN (SELECT 0 AS d UNION ALL SELECT 1 UNION ALL SELECT 2) c
WHERE a.d + b.d * 10 + c.d * 100 + 1 <= 210;

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
    CONCAT('PERF-', LPAD(n, 4, '0')),
    CASE (n % 3)
        WHEN 1 THEN 1
        WHEN 2 THEN 2
        ELSE 1
    END,
    CASE (n % 2)
        WHEN 0 THEN 2
        ELSE 3
    END,
    ((n - 1) % 4) + 1,
    CONCAT('Performans Test Bileti #', n),
    CONCAT('NFR-02 yanıt süresi ve indeks doğrulaması için üretilmiş sentetik kayıt #', n),
    CASE (n % 4)
        WHEN 0 THEN 'Network'
        WHEN 1 THEN 'Hardware'
        WHEN 2 THEN 'Software'
        ELSE 'Database'
    END,
    CASE ((n - 1) % 4) + 1
        WHEN 1 THEN 'Low'
        WHEN 2 THEN 'Medium'
        WHEN 3 THEN 'High'
        ELSE 'Critical'
    END,
    CASE
        WHEN n <= 120 THEN 'Resolved'
        WHEN n <= 160 THEN 'In Progress'
        WHEN n <= 185 THEN 'Open'
        ELSE 'Closed'
    END,
    CASE
        WHEN n % 7 = 0 THEN 'Change Request'
        ELSE 'Incident'
    END,
    CASE
        WHEN n % 5 = 0 THEN 2
        ELSE 1
    END,
    DATE_SUB(UTC_TIMESTAMP(), INTERVAL (n * 15) MINUTE),
    DATE_SUB(UTC_TIMESTAMP(), INTERVAL ((n * 15) - 60) MINUTE),
    DATE_SUB(UTC_TIMESTAMP(), INTERVAL ((n * 15) - 240) MINUTE),
    CASE
        WHEN n <= 120 OR n > 185 THEN DATE_SUB(UTC_TIMESTAMP(), INTERVAL ((n * 15) - 90) MINUTE)
        ELSE NULL
    END
FROM tmp_seq;

DROP TEMPORARY TABLE IF EXISTS tmp_seq;
