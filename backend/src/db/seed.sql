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

-- 3. Örnek Bilet (SLA Politikasıyla ve UTC Saat Standardıyla Uyumlu)
INSERT INTO Tickets (
    ticket_number, user_id, assigned_to, sla_policy_id,
    title, description, category, priority, status, request_type,
    created_at, response_due_at, resolution_due_at
) VALUES (
    'INC-1024', 1, 2, 3,
    'Monitör Görüntü Vermiyor',
    'Ofisteki ikincil monitörüm HDMI kablosunu kontrol etmeme rağmen açılmıyor.',
    'Hardware', 'High', 'Open', 'Incident',
    UTC_TIMESTAMP(),
    DATE_ADD(UTC_TIMESTAMP(), INTERVAL 60 MINUTE),
    DATE_ADD(UTC_TIMESTAMP(), INTERVAL 240 MINUTE)
);
-- 4. Örnek Change Request Biletleri (CHG-xxxx ve UTC Saat Standardıyla Uyumlu)
INSERT INTO Tickets (
    ticket_number, user_id, assigned_to, sla_policy_id,
    title, description, category, priority, status, request_type,
    created_at, response_due_at, resolution_due_at
) VALUES
(
    'CHG-2001', 1, 2, 2,
    'E-posta Sunucusu TLS Sertifika Güncellemesi',
    'Kurumsal e-posta sunucusundaki TLS sertifikasının bakım penceresinde yenilenmesi.',
    'Network', 'Medium', 'Open', 'Change Request',
    UTC_TIMESTAMP(),
    DATE_ADD(UTC_TIMESTAMP(), INTERVAL 120 MINUTE),
    DATE_ADD(UTC_TIMESTAMP(), INTERVAL 480 MINUTE)
),
(
    'CHG-2002', 2, 3, 3,
    'Veritabanı Yedekleme Zamanlayıcı Kuralı Değişikliği',
    'Gece yarısı yedekleme işlerinin yoğunluk saatleri dışında çalışacak şekilde güncellenmesi.',
    'Database', 'High', 'In Progress', 'Change Request',
    UTC_TIMESTAMP(),
    DATE_ADD(UTC_TIMESTAMP(), INTERVAL 60 MINUTE),
    DATE_ADD(UTC_TIMESTAMP(), INTERVAL 240 MINUTE)
),
(
    'CHG-2003', 1, 2, 1,
    'VPN İstemci Sürüm Dağıtımı',
    'Kullanıcı bilgisayarlarına güncel VPN istemci paketinin kademeli dağıtılması.',
    'Software', 'Low', 'Open', 'Change Request',
    UTC_TIMESTAMP(),
    DATE_ADD(UTC_TIMESTAMP(), INTERVAL 240 MINUTE),
    DATE_ADD(UTC_TIMESTAMP(), INTERVAL 960 MINUTE)
);

-- 5. Örnek Change_Requests Kayıtları
INSERT INTO Change_Requests (
    ticket_id, requested_by, change_title, description,
    reason, impact_level, risk_level, status, planned_date
)
SELECT
    ticket_id,
    user_id,
    title,
    description,
    'Mevcut sertifikanın süresinin dolmak üzere olması ve kesintisiz mail akışı sağlanması.',
    'Medium',
    'Low',
    'Pending',
    DATE_ADD(UTC_TIMESTAMP(), INTERVAL 1 DAY)
FROM Tickets WHERE ticket_number = 'CHG-2001'
UNION ALL
SELECT
    ticket_id,
    user_id,
    title,
    description,
    'Yedekleme sırasında I/O bekleme sürelerini azaltmak ve ISO 9001 yedeklilik sürekliliğini korumak.',
    'High',
    'Medium',
    'Approved',
    DATE_ADD(UTC_TIMESTAMP(), INTERVAL 2 DAY)
FROM Tickets WHERE ticket_number = 'CHG-2002'
UNION ALL
SELECT
    ticket_id,
    user_id,
    title,
    description,
    'Uzak bağlantı güvenliğini artırmak ve eski istemci hatalarını gidermek.',
    'Low',
    'Low',
    'Pending',
    DATE_ADD(UTC_TIMESTAMP(), INTERVAL 3 DAY)
FROM Tickets WHERE ticket_number = 'CHG-2003';
