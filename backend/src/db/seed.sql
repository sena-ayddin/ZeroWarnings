USE helpdesk_db;

-- 1. Örnek Kullanıcılar
INSERT INTO Users (full_name, email, password_hash, role, department) VALUES 
('Ahmet Çalışan', 'ahmet@iku.edu.tr', '$2b$10$examplehashcift1', 'Employee', 'IT Support'),
('Mehmet Teknisyen', 'mehmet@iku.edu.tr', '$2b$10$examplehashcift2', 'Technician', 'Helpdesk'),
('Elif Admin', 'elif@iku.edu.tr', '$2b$10$examplehashcift3', 'Administrator', 'Management');

-- 2. SLA Politikaları (Öncelik ve Dakika Bazlı - SDS-07 standartları)
INSERT INTO SLA_Policies (policy_name, priority, response_time_minutes, resolution_time_minutes) VALUES 
('Low Priority Policy', 'Low', 240, 960),
('Medium Priority Policy', 'Medium', 120, 480),
('High Priority Policy', 'High', 60, 240),
('Critical Priority Policy', 'Critical', 15, 120);

-- 3. Örnek Bilet
INSERT INTO Tickets (ticket_number, user_id, assigned_to, sla_policy_id, title, description, category, priority, status, request_type, response_due_at, resolution_due_at) VALUES 
('INC-1024', 1, 2, 3, 'Monitör Görüntü Vermiyor', 'Ofisteki ikincil monitörüm HDMI kablosunu kontrol etmeme rağmen açılmıyor.', 'Hardware', 'High', 'Open', 'Incident', DATE_ADD(NOW(), INTERVAL 60 MINUTE), DATE_ADD(NOW(), INTERVAL 480 MINUTE));
