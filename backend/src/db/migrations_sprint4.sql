USE helpdesk_db;

-- Tickets indeksleri
CREATE INDEX idx_tickets_user_id
    ON Tickets (user_id);

CREATE INDEX idx_tickets_assigned_to
    ON Tickets (assigned_to);

CREATE INDEX idx_tickets_created_at
    ON Tickets (created_at);

-- Audit_Logs bileşik indeksi
CREATE INDEX idx_audit_logs_entity
    ON Audit_Logs (entity_type, entity_id);

-- Customer_Feedback indeksi
CREATE INDEX idx_feedback_submitted_rating
    ON Customer_Feedback (submitted_at, satisfaction_rating);
