-- Veritabanı Oluşturma
CREATE DATABASE IF NOT EXISTS helpdesk_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE helpdesk_db;

-- 1. Users Tablosu (SDS-07 Bölüm 3.1)
CREATE TABLE IF NOT EXISTS Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL, -- 'Employee', 'Technician', 'Administrator'
    department VARCHAR(100) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. SLA_Policies Tablosu (SDS-07 Bölüm 3.3)
CREATE TABLE IF NOT EXISTS SLA_Policies (
    sla_policy_id INT AUTO_INCREMENT PRIMARY KEY,
    policy_name VARCHAR(100) NOT NULL,
    priority VARCHAR(20) NOT NULL, -- 'Low', 'Medium', 'High', 'Critical'
    response_time_minutes INT NOT NULL,
    resolution_time_minutes INT NOT NULL,
    warning_threshold_percent INT DEFAULT 75,
    escalation_threshold_percent INT DEFAULT 100,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 3. Tickets Tablosu (SDS-07 Bölüm 3.2)
CREATE TABLE IF NOT EXISTS Tickets (
    ticket_id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_number VARCHAR(30) NOT NULL UNIQUE,
    user_id INT NOT NULL,
    assigned_to INT NULL,
    sla_policy_id INT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    priority VARCHAR(20) NOT NULL,
    status VARCHAR(30) NOT NULL, -- 'Open', 'In Progress', 'Pending', 'Resolved', 'Closed'
    request_type VARCHAR(20) NOT NULL, -- 'Incident' / 'Change Request'
    escalation_level INT DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NULL,
    first_response_at DATETIME NULL,
    response_due_at DATETIME NULL,
    resolution_due_at DATETIME NULL,
    resolved_at DATETIME NULL,
    closed_at DATETIME NULL,
    sla_warning_sent BOOLEAN DEFAULT FALSE,
    is_escalated BOOLEAN DEFAULT FALSE,
    escalated_at DATETIME NULL,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES Users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (sla_policy_id) REFERENCES SLA_Policies(sla_policy_id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_priority (priority)
) ENGINE=InnoDB;

-- 4. Change_Requests Tablosu (SDS-07 Bölüm 3.5)
CREATE TABLE IF NOT EXISTS Change_Requests (
    change_id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_id INT NULL,
    requested_by INT NOT NULL,
    reviewed_by INT NULL,
    approved_by INT NULL,
    change_title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    reason TEXT NOT NULL,
    impact_level VARCHAR(30) NOT NULL,
    risk_level VARCHAR(30) NOT NULL,
    status VARCHAR(30) NOT NULL, -- 'Pending', 'Approved', 'Rejected', 'Implemented', 'Failed'
    planned_date DATETIME NULL,
    completed_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES Tickets(ticket_id) ON DELETE CASCADE,
    FOREIGN KEY (requested_by) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES Users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (approved_by) REFERENCES Users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 5. Audit_Logs Tablosu (SDS-07 Bölüm 3.4)
CREATE TABLE IF NOT EXISTS Audit_Logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INT NOT NULL,
    action VARCHAR(100) NOT NULL,
    old_value TEXT NULL,
    new_value TEXT NULL,
    action_timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE SET NULL,
    INDEX idx_timestamp (action_timestamp)
) ENGINE=InnoDB;

-- 6. Customer_Feedback Tablosu (SDS-07 Bölüm 3.6)
CREATE TABLE IF NOT EXISTS Customer_Feedback (
    feedback_id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_id INT NOT NULL UNIQUE,
    user_id INT NOT NULL,
    satisfaction_rating INT NOT NULL CHECK (satisfaction_rating BETWEEN 1 AND 5),
    comments TEXT NULL,
    submitted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES Tickets(ticket_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;
