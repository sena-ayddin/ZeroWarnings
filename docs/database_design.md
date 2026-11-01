# Database Design – SDS-07

## ISO 9001 Compliant IT Service Desk and Process Tracking System

### 1. Introduction

This document describes the proposed database structure of the SDS-07 project: ISO 9001 Compliant IT Service Desk and Process Tracking System.

The database is designed according to the functional and non-functional requirements defined in the Software Requirements Specification (SRS).

The system manages IT support tickets, incident resolution processes, change requests, SLA deadlines, customer satisfaction feedback, and audit records.

The database design supports the following objectives:

- Managing IT support tickets and incidents.
- Assigning tickets to IT technicians.
- Monitoring SLA response and resolution deadlines.
- Generating SLA warnings and escalation records.
- Managing IT change requests.
- Collecting and evaluating customer satisfaction feedback.
- Providing data for KPI and performance reports.
- Maintaining traceable records of important system activities.

### 2. Database Overview

The proposed database consists of six main tables:

1. **Users:** Stores employee, technician, and administrator information.
2. **Tickets:** Stores IT support tickets and incident information.
3. **SLA_Policies:** Defines SLA response and resolution time limits.
4. **Audit_Logs:** Records important system activities and changes.
5. **Change_Requests:** Stores IT change requests and their approval processes.
6. **Customer_Feedback:** Stores customer satisfaction ratings and comments.

These tables are connected through primary key (PK) and foreign key (FK) relationships to maintain data integrity.

---

### 3. Table Structures

#### 3.1 Users

**Purpose:** Stores information about employees, IT technicians, and administrators who use the system.

| Column Name   | Data Type    | Constraints                 | Description                                     |
| ------------- | ------------ | --------------------------- | ----------------------------------------------- |
| user_id       | INT          | PRIMARY KEY, AUTO_INCREMENT | Unique user ID                                  |
| full_name     | VARCHAR(100) | NOT NULL                    | User's full name                                |
| email         | VARCHAR(150) | UNIQUE, NOT NULL            | User's email address                            |
| password_hash | VARCHAR(255) | NOT NULL                    | Securely hashed user password                   |
| role          | VARCHAR(30)  | NOT NULL                    | User role (Employee, Technician, Administrator) |
| department    | VARCHAR(100) | NULL                        | User's department                               |
| is_active     | BOOLEAN      | DEFAULT TRUE                | Indicates whether the account is active         |
| created_at    | DATETIME     | NOT NULL                    | Account creation date                           |

**Related Requirements:** FR-01, FR-02, FR-03, FR-04, FR-12, NFR-03.

#### 3.2 Tickets

**Purpose:** Stores IT support tickets created by employees. It also tracks technician assignments, ticket status, SLA deadlines, warnings, and escalation processes.

| Column Name       | Data Type    | Constraints                 | Description                                                  |
| ----------------- | ------------ | --------------------------- | ------------------------------------------------------------ |
| ticket_id         | INT          | PRIMARY KEY, AUTO_INCREMENT | Unique ticket ID                                             |
| ticket_number     | VARCHAR(30)  | UNIQUE, NOT NULL            | Ticket reference number                                      |
| user_id           | INT          | FOREIGN KEY, NOT NULL       | Employee who created the ticket                              |
| assigned_to       | INT          | FOREIGN KEY, NULL           | Technician assigned to the ticket                            |
| sla_policy_id     | INT          | FOREIGN KEY, NULL           | Associated SLA policy                                        |
| title             | VARCHAR(200) | NOT NULL                    | Ticket title                                                 |
| description       | TEXT         | NOT NULL                    | Detailed description of the issue                            |
| category          | VARCHAR(50)  | NOT NULL                    | IT support category                                          |
| priority          | VARCHAR(20)  | NOT NULL                    | Priority level (Low, Medium, High, Critical)                 |
| status            | VARCHAR(30)  | NOT NULL                    | Ticket status (Open, In Progress, Pending, Resolved, Closed) |
| created_at        | DATETIME     | NOT NULL                    | Ticket creation date                                         |
| updated_at        | DATETIME     | NULL                        | Last update date                                             |
| first_response_at | DATETIME     | NULL                        | Date of the first technician response                        |
| response_due_at   | DATETIME     | NULL                        | SLA first response deadline                                  |
| resolution_due_at | DATETIME     | NULL                        | SLA resolution deadline                                      |
| resolved_at       | DATETIME     | NULL                        | Ticket resolution date                                       |
| closed_at         | DATETIME     | NULL                        | Ticket closing date                                          |
| sla_warning_sent  | BOOLEAN      | DEFAULT FALSE               | Indicates whether the 75% SLA warning has been sent          |
| is_escalated      | BOOLEAN      | DEFAULT FALSE               | Indicates whether the ticket has been escalated              |
| escalated_at      | DATETIME     | NULL                        | Date and time of SLA escalation                              |

**Related Requirements:** FR-01, FR-02, FR-03, FR-05, FR-06, FR-07, FR-10, FR-11, FR-12, NFR-04, NFR-08.

#### 3.3 SLA_Policies

**Purpose:** Defines SLA rules according to ticket priority. These rules determine the maximum response and resolution times allowed for support requests.

| Column Name                  | Data Type    | Constraints                 | Description                                     |
| ---------------------------- | ------------ | --------------------------- | ----------------------------------------------- |
| sla_policy_id                | INT          | PRIMARY KEY, AUTO_INCREMENT | Unique SLA policy ID                            |
| policy_name                  | VARCHAR(100) | NOT NULL                    | SLA policy name                                 |
| priority                     | VARCHAR(20)  | NOT NULL                    | Priority level covered by the policy            |
| response_time_minutes        | INT          | NOT NULL                    | Maximum allowed first response time             |
| resolution_time_minutes      | INT          | NOT NULL                    | Maximum allowed resolution time                 |
| warning_threshold_percent    | INT          | DEFAULT 75                  | Percentage at which an SLA warning is triggered |
| escalation_threshold_percent | INT          | DEFAULT 100                 | Percentage at which escalation is triggered     |
| is_active                    | BOOLEAN      | DEFAULT TRUE                | Indicates whether the policy is active          |
| created_at                   | DATETIME     | NOT NULL                    | Policy creation date                            |

**Related Requirements:** FR-05, FR-06, FR-07.

#### 3.4 Audit_Logs

**Purpose:** Records important system activities, including ticket updates, status changes, user actions, and administrative operations. These records provide traceability and support auditing processes.

| Column Name      | Data Type    | Constraints                 | Description                                                        |
| ---------------- | ------------ | --------------------------- | ------------------------------------------------------------------ |
| log_id           | INT          | PRIMARY KEY, AUTO_INCREMENT | Unique log ID                                                      |
| user_id          | INT          | FOREIGN KEY, NULL           | User who performed the action                                      |
| entity_type      | VARCHAR(50)  | NOT NULL                    | Type of affected record (Ticket, User, SLA Policy, Change Request) |
| entity_id        | INT          | NOT NULL                    | ID of the affected record                                          |
| action           | VARCHAR(100) | NOT NULL                    | Description of the action performed                                |
| old_value        | TEXT         | NULL                        | Previous value before the change                                   |
| new_value        | TEXT         | NULL                        | New value after the change                                         |
| action_timestamp | DATETIME     | NOT NULL                    | Date and time of the action                                        |

**Related Requirements:** FR-11, FR-12, NFR-07, NFR-08.

#### 3.5 Change_Requests

**Purpose:** Stores IT change requests submitted by employees and tracks their review, approval, and implementation processes.

| Column Name  | Data Type    | Constraints                 | Description                                               |
| ------------ | ------------ | --------------------------- | --------------------------------------------------------- |
| change_id    | INT          | PRIMARY KEY, AUTO_INCREMENT | Unique change request ID                                  |
| ticket_id    | INT          | FOREIGN KEY, NULL           | Related support ticket, if applicable                     |
| requested_by | INT          | FOREIGN KEY, NOT NULL       | User who submitted the change request                     |
| reviewed_by  | INT          | FOREIGN KEY, NULL           | Administrator who reviewed the request                    |
| approved_by  | INT          | FOREIGN KEY, NULL           | Administrator who approved the request                    |
| change_title | VARCHAR(200) | NOT NULL                    | Change request title                                      |
| description  | TEXT         | NOT NULL                    | Description of the requested change                       |
| reason       | TEXT         | NOT NULL                    | Reason for the requested change                           |
| impact_level | VARCHAR(30)  | NOT NULL                    | Expected impact level                                     |
| risk_level   | VARCHAR(30)  | NOT NULL                    | Risk level of the change                                  |
| status       | VARCHAR(30)  | NOT NULL                    | Status (Pending, Approved, Rejected, Implemented, Failed) |
| planned_date | DATETIME     | NULL                        | Planned implementation date                               |
| completed_at | DATETIME     | NULL                        | Actual completion date                                    |
| created_at   | DATETIME     | NOT NULL                    | Request creation date                                     |

**Related Requirements:** FR-04, FR-11, FR-12, NFR-04, NFR-08.

#### 3.6 Customer_Feedback

**Purpose:** Stores customer satisfaction ratings and comments submitted by employees after their support tickets have been resolved.

| Column Name         | Data Type | Constraints                   | Description                         |
| ------------------- | --------- | ----------------------------- | ----------------------------------- |
| feedback_id         | INT       | PRIMARY KEY, AUTO_INCREMENT   | Unique feedback ID                  |
| ticket_id           | INT       | FOREIGN KEY, UNIQUE, NOT NULL | Related support ticket              |
| user_id             | INT       | FOREIGN KEY, NOT NULL         | Employee who submitted the feedback |
| satisfaction_rating | INT       | NOT NULL                      | Customer satisfaction score (1–5)   |
| comments            | TEXT      | NULL                          | Additional customer comments        |
| submitted_at        | DATETIME  | NOT NULL                      | Feedback submission date            |

**Related Requirements:** FR-08, FR-09, FR-10.

---

### 4. Relationships Between Tables

The following relationships define how the database tables are connected.

| Relationship                                        | Type        | Description                                                         |
| --------------------------------------------------- | ----------- | ------------------------------------------------------------------- |
| Users – Tickets (user_id)                           | One-to-Many | One employee can create multiple support tickets.                   |
| Users – Tickets (assigned_to)                       | One-to-Many | One technician can be assigned to multiple tickets.                 |
| SLA_Policies – Tickets                              | One-to-Many | One SLA policy can be applied to multiple tickets.                  |
| Users – Audit_Logs                                  | One-to-Many | One user can perform multiple actions recorded in the audit log.    |
| Tickets – Change_Requests                           | One-to-Many | One support ticket can be associated with multiple change requests. |
| Users – Change_Requests (requested_by)              | One-to-Many | One user can submit multiple change requests.                       |
| Users – Change_Requests (reviewed_by / approved_by) | One-to-Many | One administrator can review and approve multiple change requests.  |
| Tickets – Customer_Feedback                         | One-to-One  | Each ticket can have one customer feedback record.                  |
| Users – Customer_Feedback                           | One-to-Many | One employee can submit feedback for multiple tickets.              |

**Note:** The `entity_id` field in Audit_Logs is used to identify different types of affected records through `entity_type`. Since it can refer to different tables, it is not defined as a direct foreign key.

---

### 5. KPI and Performance Reporting

The system will calculate KPI values using the information stored in the database. These values will be displayed on the administrator dashboard.

The following performance indicators will be supported:

| KPI                         | Description                                               | Required Data         |
| --------------------------- | --------------------------------------------------------- | --------------------- |
| Total Ticket Count          | Total number of support tickets created                   | Tickets               |
| Open Ticket Count           | Number of tickets that have not been resolved or closed   | Tickets               |
| Average Resolution Time     | Average time between ticket creation and resolution       | Tickets               |
| SLA Compliance Rate         | Percentage of tickets resolved within their SLA deadlines | Tickets, SLA_Policies |
| SLA Violation Count         | Number of tickets exceeding their SLA deadlines           | Tickets               |
| Customer Satisfaction Score | Average customer satisfaction rating (1–5)                | Customer_Feedback     |
| Change Request Success Rate | Percentage of successfully implemented change requests    | Change_Requests       |

KPI values will be calculated from existing database records rather than stored as manually entered values. This approach helps maintain accurate and up-to-date performance reports.

---

### 6. Database Design Considerations

The following design principles will be applied:

- **Primary Keys:** Each table has a primary key to uniquely identify its records.
- **Foreign Keys:** Relationships between tables are maintained through foreign keys to support referential integrity.
- **Password Security:** User passwords are stored as secure hashes, not as plain text.
- **Role-Based Access:** User roles determine which system operations each user is authorized to perform.
- **SLA Monitoring:** Response and resolution deadlines are stored in the Tickets table to support deadline monitoring.
- **SLA Warnings:** The `sla_warning_sent` field tracks whether the 75% warning has been sent.
- **SLA Escalation:** The `is_escalated` and `escalated_at` fields track overdue ticket escalation.
- **Auditability:** Important system activities are recorded in Audit_Logs to support traceability.
- **Customer Feedback:** Customer ratings are stored separately to support satisfaction analysis.
- **Data Integrity:** Constraints and validation rules help prevent invalid or inconsistent records.
- **KPI Calculation:** Performance indicators are calculated from existing records to avoid unnecessary data duplication.

The application logic will be responsible for automatically checking SLA thresholds, sending warnings, and triggering escalation when deadlines are exceeded.

---

### 7. Mapping Database Tables to SRS Requirements

The following table demonstrates how the database structure supports the functional requirements defined in the SRS document.

| SRS Requirement                       | Supporting Database Tables                                | Implementation                                                                                      |
| ------------------------------------- | --------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| FR-01: Create support tickets         | Users, Tickets                                            | Ticket information is stored with the creator's user ID.                                            |
| FR-02: View submitted tickets         | Tickets                                                   | Tickets are retrieved using the employee's user ID.                                                 |
| FR-03: Manage assigned tickets        | Users, Tickets                                            | Tickets are assigned to technicians and their statuses are updated.                                 |
| FR-04: Manage change requests         | Users, Change_Requests                                    | Change requests are stored and tracked through their approval status.                               |
| FR-05: Assign SLA deadlines           | Tickets, SLA_Policies                                     | SLA rules define response and resolution deadlines.                                                 |
| FR-06: Display 75% SLA warning        | Tickets, SLA_Policies                                     | The warning threshold is defined in SLA_Policies and its notification status is tracked in Tickets. |
| FR-07: Escalate overdue tickets       | Tickets, SLA_Policies, Audit_Logs                         | Escalation status and timestamp are recorded, and the action can be logged.                         |
| FR-08: Submit satisfaction feedback   | Tickets, Customer_Feedback                                | Employees can submit feedback for resolved tickets.                                                 |
| FR-09: Calculate satisfaction results | Customer_Feedback                                         | Satisfaction scores are used to calculate average ratings.                                          |
| FR-10: Display KPI dashboard          | Tickets, SLA_Policies, Customer_Feedback, Change_Requests | KPI values are calculated from stored records.                                                      |
| FR-11: Record important activities    | Users, Audit_Logs                                         | Important actions and ticket changes are recorded.                                                  |
| FR-12: Monitor service performance    | All relevant tables                                       | Administrators can monitor ticket, SLA, change, and feedback records.                               |

---

### 8. Conclusion

This database design provides the proposed data structure for the SDS-07 IT Service Desk and Process Tracking System.

It is aligned with the functional and non-functional requirements defined in the SRS document.

The database supports incident management, change management, SLA monitoring, customer satisfaction evaluation, audit traceability, and KPI reporting.

It also supports ISO 9001:2015 quality management objectives, particularly customer satisfaction, operational control, documented information, performance evaluation, and continuous improvement.

**Note:** This database design supports processes related to ISO 9001:2015. However, the database structure alone does not establish full ISO 9001 compliance or certification.



| SRS bölümü      | Veritabanı karşılığı                                      |
| --------------- | --------------------------------------------------------- |
| FR-01 – FR-03   | Users, Tickets                                            |
| FR-04           | Change_Requests                                           |
| FR-05 – FR-07   | SLA_Policies, Tickets                                     |
| FR-08 – FR-09   | Customer_Feedback                                         |
| FR-10           | Tickets, SLA_Policies, Customer_Feedback, Change_Requests |
| FR-11           | Audit_Logs                                                |
| FR-12           | İlgili tüm tablolar                                       |
| NFR-03          | Users (role, password_hash)                               |
| NFR-07 – NFR-08 | Audit_Logs ve ilişkisel bütünlük                          |

