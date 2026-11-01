Software Requirements Specification (SRS)

SDS-07 – ISO 9001 Compliant IT Service Desk and Process Tracking System

Project Code: SDS-07
Project Group: Zero Warnings
Prepared by: Buse Baydilli
Document: SRS.md
Reference Standard: IEEE 29148

⸻

1. Introduction

1.1 Purpose

The purpose of this document is to define the functional and non-functional requirements of the SDS-07 IT Service Desk and Process Tracking System.

The system aims to manage corporate IT support requests according to ISO 9001:2015 Quality Management System principles. It focuses on customer satisfaction, process control, SLA monitoring, and continual improvement.

1.2 Scope

The system will provide a platform for managing IT incidents and change requests within an organization.

Employees will be able to create support requests and follow their progress. IT technicians will manage and resolve assigned requests. Administrators will monitor system activities and evaluate service performance.

The main objectives of the system are:

* Managing IT incidents and support requests.
* Recording and tracking IT change requests.
* Monitoring Service Level Agreements (SLA).
* Providing SLA violation warnings and escalation mechanisms.
* Collecting and evaluating customer satisfaction feedback.
* Reporting service performance through KPI dashboards.
* Maintaining records of important system activities.

1.3 User Roles

The system will have three main user roles:

User Role	Description
Employee (User)	Creates IT support requests and follows their status.
IT Technician	Reviews assigned requests, updates their status, and resolves incidents.
Administrator	Manages users, monitors processes, and views performance reports.

⸻

2. Functional Requirements

Functional requirements describe the main operations that the system must perform.

ID	Functional Requirement
FR-01	The system shall allow employees to create IT support tickets by entering a title, description, category, and priority level.
FR-02	The system shall allow employees to view their submitted tickets and follow their current status.
FR-03	The system shall allow IT technicians to view assigned tickets and update their status during the resolution process.
FR-04	The system shall allow users to submit IT change requests and allow administrators to review and track these requests.
FR-05	The system shall monitor SLA deadlines according to defined service level policies.
FR-06	The system shall provide warning notifications when an SLA deadline approaches.
FR-07	The system shall escalate tickets when their SLA deadlines are exceeded.
FR-08	The system shall allow employees to submit satisfaction ratings and feedback after their support requests are resolved.
FR-09	The system shall collect and evaluate customer satisfaction survey results.
FR-10	The system shall provide a KPI dashboard displaying ticket numbers, resolution times, SLA performance, and customer satisfaction results.
FR-11	The system shall record important activities, including ticket status changes and user actions, in an audit log.
FR-12	The system shall allow administrators to monitor incident and change management processes.

⸻

3. Non-Functional Requirements

Non-functional requirements define the quality attributes and expected behavior of the system.

ID	Category	Requirement
NFR-01	Usability	The system shall provide a simple and understandable interface for all user roles.
NFR-02	Performance	The system shall provide timely responses to user operations under normal usage conditions.
NFR-03	Security	The system shall restrict access to functions according to user roles.
NFR-04	Reliability	The system shall maintain accurate and consistent ticket and change request records.
NFR-05	Maintainability	The system shall have a structured design that supports future updates and improvements.
NFR-06	Compatibility	The system shall support commonly used modern web browsers.
NFR-07	Data Integrity	The system shall prevent unauthorized modification of stored records.
NFR-08	Traceability	Important system activities shall be recorded to support monitoring and auditing processes.

⸻

4. Requirement and Standard Mapping

The following table connects the system requirements with relevant ISO 9001:2015 clauses and software engineering standards.

Requirement ID	Related Standard / Clause	Explanation
FR-01, FR-02	ISO 9001:2015 - Clause 8.2	Recording service requests and defining service requirements.
FR-03	ISO 9001:2015 - Clause 8.5.1	Managing and controlling service provision processes.
FR-04	ISO 9001:2015 - Clause 8.5.6	Recording and controlling changes.
FR-05, FR-06, FR-07	ISO 9001:2015 - Clauses 8.2 and 8.5.1	Monitoring service requirements and controlling service processes.
FR-08, FR-09	ISO 9001:2015 - Clause 9.1.2	Monitoring customer satisfaction.
FR-10	ISO 9001:2015 - Clause 9.1.1	Monitoring, measuring, analyzing, and evaluating performance.
FR-11, NFR-08	ISO 9001:2015 - Clause 7.5	Maintaining documented information and activity records.
FR-10	ISO 9001:2015 - Clause 10.3	Supporting continual improvement through performance evaluation.
FR-01 to FR-12	IEEE 29148	Defining and documenting system requirements.
NFR-01 to NFR-07	ISO/IEC 25010	Defining software quality requirements.

⸻

5. Acceptance Criteria

The initial system requirements will be considered satisfied when:

* Employees can create and track IT support tickets.
* IT technicians can manage and update assigned tickets.
* Change requests can be recorded and reviewed.
* SLA deadlines can be monitored.
* The system can provide warnings about approaching SLA deadlines.
* Overdue tickets can be escalated.
* Customer satisfaction feedback can be collected.
* Administrators can view KPI reports.
* Important system activities can be recorded.

⸻

6. Conclusion

This document defines the initial functional and non-functional requirements of the SDS-07 project.

These requirements provide a foundation for the system design and development process. They also support the project’s objectives of improving IT service quality, monitoring service performance, maintaining documented information, and ensuring customer satisfaction.

The requirements may be reviewed and updated during the following project stages according to project needs.
