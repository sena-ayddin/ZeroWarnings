# Software Requirements Specification (SRS)

## Project Information

**Project Name:** ISO 9001 Compliant IT Service Desk and Process Tracking System

**Project Code:** SDS-07

**Project Group:** Zero Warnings

**Prepared by:** Buse Baydilli

**Reference Standard:** IEEE 29148

---

## 1. Introduction

### 1.1 Purpose

The purpose of this document is to define the functional and non-functional requirements of the SDS-07 IT Service Desk and Process Tracking System.

The system aims to manage corporate IT support requests according to ISO 9001 Quality Management System principles. It focuses on customer satisfaction, process improvement, documented procedures, and Service Level Agreement (SLA) monitoring.

### 1.2 Scope

The SDS-07 project covers the management of IT incidents and change requests within an organization.

The system will allow employees to submit IT support requests, technicians to manage and resolve these requests, and administrators to monitor service quality and system performance.

The main objectives of the project are:

- Managing IT incidents and support requests.
- Recording and tracking IT change requests.
- Monitoring SLA deadlines and providing violation warnings.
- Implementing an escalation mechanism for overdue tickets.
- Collecting and evaluating customer satisfaction feedback.
- Providing KPI reports to evaluate service performance.
- Maintaining records of important system activities.

### 1.3 User Roles

The system will have three main user roles.

| User Role | Description |
|---|---|
| Employee (User) | Creates IT support requests and follows their progress. |
| IT Technician | Reviews assigned tickets, updates their status, and resolves incidents. |
| Administrator | Manages users, monitors service processes, and views performance reports. |

---

## 2. Functional Requirements

Functional requirements describe the operations that the system must perform.

| ID | Functional Requirement |
|---|---|
| FR-01 | The system shall allow employees to create IT support tickets by entering a title, description, category, and priority level. |
| FR-02 | The system shall allow employees to view their submitted tickets and track their current status. |
| FR-03 | The system shall allow IT technicians to view assigned tickets and update their status during the resolution process. |
| FR-04 | The system shall allow users to submit IT change requests and enable administrators to review and track these requests. |
| FR-05 | The system shall assign SLA deadlines to support tickets according to their priority levels. |
| FR-06 | The system shall display a warning when 75% of the assigned SLA time has elapsed. |
| FR-07 | The system shall automatically escalate overdue tickets hierarchically from Level 1 to Level 2 (Senior Technician) and Level 3 (IT Manager) when SLA resolution thresholds are breached. |
| FR-08 | The system shall allow employees to submit customer satisfaction ratings after their support requests are resolved. |
| FR-09 | The system shall calculate and display customer satisfaction results based on submitted feedback. |
| FR-10 | The system shall provide a KPI dashboard displaying service performance indicators such as ticket numbers, resolution times, SLA compliance, and customer satisfaction scores. |
| FR-11 | The system shall record important user activities and ticket status changes in an audit log. |
| FR-12 | The system shall allow administrators to monitor ticket management and service performance processes. |

---

## 3. Non-Functional Requirements

Non-functional requirements define the quality attributes and operating expectations of the system.

| ID | Category | Requirement |
|---|---|---|
| NFR-01 | Usability | The system shall provide a simple and understandable interface for all user roles. |
| NFR-02 | Performance | The system shall respond to normal user operations within 3 seconds under expected usage conditions. |
| NFR-03 | Security | The system shall restrict access to system functions according to user roles. |
| NFR-04 | Reliability | The system shall maintain accurate ticket and change request records. |
| NFR-05 | Maintainability | The system shall have a modular structure to support future updates and improvements. |
| NFR-06 | Compatibility | The system shall support commonly used modern web browsers. |
| NFR-07 | Data Integrity | The system shall prevent unauthorized changes to stored records. |
| NFR-08 | Traceability | Important system activities shall be recorded to support process monitoring and auditing. |

---

## 4. Requirement and Standard Mapping

The following table connects the system requirements with the relevant standards and quality management objectives.

| Requirement ID | Related Standard | Explanation |
|---|---|---|
| FR-01, FR-02, FR-03 | IEEE 29148 | Defining and documenting functional system requirements. |
| FR-04 | ISO 9001:2015 - Clause 8.5.6 | Monitoring and controlling changes. |
| FR-05, FR-06, FR-07 | ISO 9001:2015 - Clause 8.2 | Operational planning and control of service processes. |
| FR-08, FR-09 | ISO 9001:2015 - Clause 9.1.2 | Monitoring customer satisfaction. |
| FR-10 | ISO 9001:2015 - Clause 9.1 | Monitoring, measurement, analysis, and evaluation. |
| FR-11, NFR-08 | ISO 9001:2015 - Clause 7.5 | Maintaining documented information. |
| NFR-01 to NFR-07 | ISO/IEC 25010 | Defining software quality requirements. |

---

## 5. Acceptance Criteria

The initial system requirements will be considered satisfied when:

- Employees can create and track IT support tickets.
- Technicians can manage and update assigned incidents.
- Employees can submit IT change requests.
- SLA deadlines can be assigned and monitored.
- The system can display SLA warning notifications.
- Overdue tickets can be escalated.
- Customer satisfaction feedback can be collected and evaluated.
- Administrators can view KPI reports.
- Important system activities can be recorded.

---

## 6. Conclusion

This document defines the initial functional and non-functional requirements of the SDS-07 project. These requirements provide a foundation for the system design and implementation process.

The requirements will be used during the following development stages and may be updated when necessary according to project progress and quality objectives.
