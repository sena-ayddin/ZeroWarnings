
# IEEE 1012 â€“ Verification and Validation Test Cases

**Project Name:** ISO 9001 Compliant IT Service Desk and Process Tracking System  
**Project Code:** SDS-07  
**Project Group:** Zero Warnings  
**Prepared by:** Buse Baydilli  
**Work Package:** WP-08  
**Reference Standard:** IEEE 1012 â€“ Verification and Validation (V&V)

---

## 1. Purpose

This document defines the verification and validation test scenarios for the SDS-07 IT Service Desk and Process Tracking System.

The purpose of these test cases is to verify whether the system functions according to the defined requirements, including ticket management, SLA calculation, business-hour rules, user authorization and audit logging.

Each test case includes its objective, related requirement, preconditions, test inputs, test steps and expected results.

**Test execution status:** The test cases are prepared for testing. Actual results will be recorded after execution in the test environment.

---

## 2. Test Environment

- Application: SDS-07 IT Service Desk System
- Backend: Express.js REST API
- API endpoints: `/api/tickets` and related endpoints
- User roles: Employee, Technician, Administrator
- SLA business hours: 09:00â€“18:00
- Testing tools used: PowerShell, Node.js scripts and direct MySQL queries
- Test execution status: Partially executed; see individual test results

---

## 3. Test Case Matrix

### TC-01 â€“ SLA Resolution Deadline Calculation

**Objective:** Verify that the system calculates the correct SLA resolution deadline when a ticket is created.

**Related Requirement:** FR-05

**Preconditions:**
- The application is running.
- An employee account exists and is logged in.
- SLA policies for ticket priorities are configured.

**Test Inputs:**
- Priority: Medium
- Ticket subject: Cannot connect to Wi-Fi
- Ticket description: The employee cannot connect to the office Wi-Fi network.

**Test Steps:**
1. Log in as an Employee.
2. Open the ticket creation page.
3. Enter the ticket information.
4. Select Medium priority.
5. Submit the ticket.
6. Check the calculated `resolution_due_at` value.
7. Compare the deadline with the configured SLA policy.

**Expected Result:**
- The ticket should be created successfully.
- The system should assign an SLA resolution deadline.
- The `resolution_due_at` value should match the configured SLA policy and business-hour rules.

**Actual Result:** A Medium priority test ticket (INC-1029) was successfully created.
The API returned resolution_due_at as 2026-11-23 14:00:00 UTC.
The same value was independently verified in the MySQL Tickets table.
The configured Medium SLA duration of 480 business minutes was confirmed.
**Status:** PASS

---

### TC-02 â€“ SLA Duration According to Ticket Priority

**Objective:** Verify that the system applies the appropriate SLA policy according to the selected ticket priority.

**Related Requirement:** FR-05

**Preconditions:**
- The application is running.
- SLA policies for Low, Medium, High and Critical priorities are configured.
- An employee account exists and is logged in.

**Test Inputs:**
- Ticket priorities: Low, Medium, High, Critical

**Test Steps:**
1. Log in as an Employee.
2. Create a ticket with Low priority.
3. Record its assigned SLA deadline.
4. Repeat the process for Medium, High and Critical priorities.
5. Compare the assigned SLA deadlines with the configured SLA policies.

**Expected Result:**
- Each ticket should receive an SLA deadline according to its selected priority.
- The assigned deadlines should match the configured SLA policy values.

**Actual Result:** The SLA service returned the configured durations for all priorities: Low 960, Medium 480, High 240 and Critical 120 business minutes. Calculated deadlines were checked.
**Status:** PASS

---

### TC-03 â€“ SLA Countdown During Non-Business Hours

**Objective:** Verify that the SLA countdown stops outside the defined business hours.

**Related Requirement:** FR-05

**Preconditions:**
- The application is running.
- A ticket with an active SLA exists.
- The business-hour configuration is set to 09:00â€“18:00.

**Test Inputs:**
- Business hours: 09:00â€“18:00
- Test period: Outside business hours, for example 19:00â€“20:00

**Test Steps:**
1. Create or select a ticket with an active SLA.
2. Record the remaining SLA time.
3. Check the remaining time outside business hours.
4. Wait for a period outside business hours.
5. Check the remaining SLA time again.

**Expected Result:**
- The SLA countdown should not decrease outside business hours.
- The remaining SLA time should stay unchanged during the non-business period.

**Actual Result:** The SLA service was tested with fixed timestamps. A 60-minute interval outside business hours (19:00–20:00 Istanbul time) resulted in 0 elapsed business minutes. The remaining SLA time stayed at 480 minutes. All assertions passed.**Status:** PASS

---

### TC-04 â€“ SLA Countdown During Business Hours

**Objective:** Verify that the SLA countdown continues during the defined business hours.

**Related Requirement:** FR-05

**Preconditions:**
- The application is running.
- A ticket with an active SLA exists.
- The business-hour configuration is set to 09:00â€“18:00.

**Test Inputs:**
- Business hours: 09:00â€“18:00
- Test period: Within business hours

**Test Steps:**
1. Create or select a ticket with an active SLA.
2. Record the remaining SLA time.
3. Check the remaining time during business hours.
4. Wait for a short period.
5. Check the remaining SLA time again.

**Expected Result:**
- The SLA countdown should continue during business hours.
- The remaining SLA time should decrease according to the elapsed business time.

**Actual Result:** The SLA service was tested with fixed timestamps covering the full business-hour interval (09:00–18:00 Istanbul time). The service calculated 540 business minutes correctly. All assertions passed.
**Status:** PASS

---

### TC-05 â€“ SLA Warning at the Defined Threshold

**Objective:** Verify that the system displays an SLA warning when the configured warning threshold is reached.

**Related Requirement:** FR-06

**Preconditions:**
- The application is running.
- A ticket with an active SLA exists.
- The SLA warning threshold is configured as 75%.

**Test Inputs:**
- Ticket with an active SLA
- SLA warning threshold: 75%

**Test Steps:**
1. Create or select a ticket with an active SLA.
2. Allow the SLA timer to reach the configured 75% warning threshold.
3. Check the ticket status and warning indicator.

**Expected Result:**
- The system should display the configured warning indicator when the 75% threshold is reached.
- The ticket should show the appropriate warning status, such as `WARNING`.

**Actual Result:** The SLA status calculation returned WARNING at exactly 75% elapsed time. The real SLA worker also set the warning flag and created an SLA_WARNING_75_PERCENT audit record.
**Status:** PASS

---

### TC-06 â€“ SLA Escalation After Deadline

**Objective:** Verify that the system marks a ticket as escalated when its SLA resolution deadline is exceeded.

**Related Requirement:** FR-07

**Preconditions:**
- The application is running.
- A ticket with an active SLA exists.
- The ticket has reached or passed its SLA resolution deadline.

**Test Inputs:**
- Ticket with an expired SLA deadline

**Test Steps:**
1. Create or select a ticket with an active SLA.
2. Allow the ticket to reach its SLA resolution deadline.
3. Check the ticket status after the deadline is exceeded.

**Expected Result:**
- The system should identify the SLA deadline violation.
- The ticket should receive the `ESCALATED` status or flag.

**Actual Result:** The real SLA worker processed test ticket INC-1028. It set is_escalated to 1 and escalation_level to 3 at 225% elapsed time, and created an SLA_ESCALATED_LEVEL_3 audit record.
**Status:** PASS

---

### TC-07 â€“ Employee Role Authorization

**Objective:** Verify that an Employee can access only the functions permitted for the Employee role.

**Related Requirement:** NFR-03

**Preconditions:**
- The application is running.
- An Employee account exists.
- The Employee is logged in.

**Test Inputs:**
- User role: Employee
- Requested operation: Access to an administrator-only function

**Test Steps:**
1. Log in using an Employee account.
2. Access the functions available to the Employee.
3. Attempt to access an administrator-only function.
4. Check the system response.

**Expected Result:**
- The Employee should be able to access permitted functions.
- Access to administrator-only functions should be denied.

**Actual Result:** Employee ticket listing returned 200. Employee status update and KPI access returned 403 as expected.
**Status:** PASS

---

### TC-08 â€“ Technician Ticket Management Authorization

**Objective:** Verify that a Technician can view and update assigned tickets according to the user's role permissions.

**Related Requirements:** FR-03, NFR-03

**Preconditions:**
- The application is running.
- A Technician account exists.
- At least one ticket is assigned to the Technician.

**Test Inputs:**
- User role: Technician
- Ticket: An assigned support ticket

**Test Steps:**
1. Log in using a Technician account.
2. Open the technician dashboard.
3. View an assigned ticket.
4. Update the ticket status.
5. Check whether the update is saved.

**Expected Result:**
- The Technician should be able to view assigned tickets.
- The Technician should be able to update ticket status according to the permitted operations.

**Actual Result:** Technician ticket listing and status update succeeded. Ticket assignment matched the technician ID, and first_response_at was populated.
**Status:** PASS

---

### TC-09 â€“ Administrator Access and Monitoring

**Objective:** Verify that an Administrator can access the administrative functions used to monitor the service process.

**Related Requirement:** FR-12, NFR-03

**Preconditions:**
- The application is running.
- An Administrator account exists.

**Test Inputs:**
- User role: Administrator
- Requested operation: Access to administrative monitoring functions

**Test Steps:**
1. Log in using an Administrator account.
2. Open the administrative functions or monitoring area.
3. Check whether the administrator can access the available monitoring information.

**Expected Result:**
- The Administrator should be able to access the functions permitted for the Administrator role.
- The system should display the available service monitoring information.

**Actual Result:** Administrator accessed the KPI endpoint successfully (200), and KPI information was returned.
**Status:** PASS
---

### TC-10 â€“ Audit Log Recording

**Objective:** Verify that important user activities and ticket status changes are recorded in the audit log.

**Related Requirements:** FR-11, NFR-08

**Preconditions:**
- The application is running.
- A user account exists and is logged in.
- Audit logging is enabled.

**Test Inputs:**
- User activity: Ticket creation or ticket status update

**Test Steps:**
1. Log in to the system.
2. Create a ticket or update an existing ticket's status.
3. Open or query the audit log records.
4. Check whether the performed activity has been recorded.

**Expected Result:**
- The system should create an audit log record for the performed activity.
- The record should contain the available information needed to identify the activity, such as the user, action and timestamp.

**Actual Result:** Audit records were verified for ticket creation, assignment, status changes, SLA warning and SLA escalation. The records included the corresponding actions and ticket information.
**Status:** PASS

---

## 4. Test Execution Summary

| Test ID | Test Description | Execution Status |
|---|---|---|
| TC-01 | SLA resolution deadline calculation | PASS |
| TC-02 | SLA duration according to priority | PASS |
| TC-03 | SLA countdown during non-business hours | PASS |
| TC-04 | SLA countdown during business hours | PASS |
| TC-05 | SLA warning at the defined threshold | PASS |
| TC-06 | SLA escalation after deadline | PASS |
| TC-07 | Employee role authorization | PASS |
| TC-08 | Technician ticket management authorization | PASS |
| TC-09 | Administrator access and monitoring | PASS |
| TC-10 | Audit log recording | PASS |
| TC-11 | Successful CSAT feedback submission | PASS |
| TC-12 | Invalid CSAT rating validation | PASS |
| TC-13 | Average CSAT calculation | PASS |
| TC-14 | Administrator KPI report API | PASS |
| TC-15 | Technician ticket status update | PASS |

---

## 5. Conclusion

The test cases in this document record verification and validation activities for the SDS-07 system, covering SLA calculations, business-hour rules, warning and escalation behavior, role-based access control, ticket management and audit logging.

Test execution results have been recorded for the completed verification activities, including CSAT, KPI and ticket status update tests. TC-01, TC-03, and TC-04 passed their targeted verification checks.
---

## 6. Supplementary Backend Smoke Test Execution

**Execution Date:** 18 November 2026

**Test Environment:**
- Backend: Express.js REST API
- Database: MySQL (`helpdesk_db`)
- Test Script: `backend/scripts/smoke-test.js`
- Execution Command: `npm.cmd --prefix .\backend run test:smoke`

### Test Results

| No. | Test Description | Expected | Actual | Status |
|---|---|---:|---:|---|
| 1 | Employee Login | 200 | 200 | PASS |
| 2 | Technician Login | 200 | 200 | PASS |
| 3 | Administrator Login | 200 | 200 | PASS |
| 4 | Wrong Password | 401 | 401 | PASS |
| 5 | Ticket Listing Without Token | 401 | 401 | PASS |
| 6 | Invalid Ticket Data | 400 | 400 | PASS |
| 7 | Ticket Creation | 201 | 201 | PASS |
| 8 | Employee Lists Own Tickets | 200 | 200 | PASS |
| 9 | Technician Lists Tickets | At least 1 ticket | True | PASS |
| 10 | Ticket Details | 200 | 200 | PASS |
| 11 | Non-existent Ticket | 404 | 404 | PASS |
| 12 | Other Employee Cannot View Ticket | 403 | 403 | PASS |
| 13 | Employee Cannot Update Ticket Status | 403 | 403 | PASS |
| 14 | Invalid Ticket Status | 400 | 400 | PASS |
| 15 | Empty Status Update Body | 400 | 400 | PASS |
| 16 | Technician Updates Ticket Status | 200 | 200 | PASS |
| 17 | Ticket Assigned to Technician | Technician ID 2 | Technician ID 2 | PASS |
| 18 | First Response Timestamp | Not Null | True | PASS |
| 19 | Ticket Resolved | 200 | 200 | PASS |
| 20 | Resolution Timestamp | Not Null | True | PASS |
| 21 | Ticket Closed | 200 | 200 | PASS |
| 22 | Closed Ticket Cannot Be Updated | 409 | 409 | PASS |
| 23 | Administrator Accesses KPI Report | 200 | 200 | PASS |
| 24 | Resolved Ticket Count | At Least 1 | 2 | PASS |
| 25 | Employee Cannot Access KPI | 403 | 403 | PASS |
| 26 | Technician Cannot Access KPI | 403 | 403 | PASS |

### Execution Summary

- Total checks: 26
- Passed: 26
- Failed: 0

All 26 supplementary backend smoke test checks passed.

## 6.1 Supplementary SLA Worker Verification

**Execution Date:** 21 November 2026

**Test Ticket:** INC-1028 (ticket_id: 5)  
**Priority:** High

The test ticket creation time was adjusted to a business-hour timestamp in the test database. The SLA worker's checkOpenTickets() function was then executed.

| Check | Expected / Observed Result | Status |
|---|---|---|
| SLA warning flag | sla_warning_sent = 1 | PASS |
| Escalation flag | is_escalated = 1 | PASS |
| Escalation level | escalation_level = 3 | PASS |
| Warning audit record | SLA_WARNING_75_PERCENT | PASS |
| Escalation audit record | SLA_ESCALATED_LEVEL_3 | PASS |

The worker calculated 225% elapsed SLA time for the test ticket. It recorded both the warning and escalation actions in Audit_Logs.

**Result:** The SLA warning and escalation worker behavior was successfully verified using a test ticket.


**Note:** These results provide supplementary backend verification evidence and do not replace individual test cases. TC-01, TC-03, and TC-04 passed their targeted SLA verification checks using API, database, and service-level tests.
## 7. Conclusion

The IEEE 1012 test activities for WP-08 have been completed and documented. TC-01 to TC-12 and TC-14 to TC-15 passed their recorded verification activities. TC-13 was verified at model level only; no API endpoint for average CSAT display was available. TC-01 was verified through API and database checks, while TC-03 and TC-04 were verified through automated SLA service-level tests. The supplementary backend smoke tests passed all 26 checks. The SLA warning and escalation verification also passed.

## 6.2 CSAT and KPI Test Execution

**Execution Date:** 21 November 2026

**Test Environment:**
- Backend: Express.js REST API
- Database: MySQL (helpdesk_db)
- Test Method: HTTP requests and direct model verification

### TC-11 - Successful CSAT Feedback Submission

**Test Input:** Employee account, resolved ticket INC-1026, satisfaction_rating = 5.

**Expected Result:** The system should accept valid feedback and return HTTP 201.

**Actual Result:** The API returned HTTP 201. Feedback ID 1 was created with a satisfaction rating of 5.

**Status:** PASS

### TC-12 - Invalid CSAT Rating Validation

**Test Input:** Employee account, resolved ticket INC-1025, satisfaction_rating = 6.

**Expected Result:** The system should reject ratings outside the 1-5 range and return HTTP 400.

**Actual Result:** The API returned HTTP 400 with the validation message indicating that satisfaction_rating must be an integer between 1 and 5.

**Status:** PASS

### TC-13 - Average CSAT Calculation

**Test Input:** Existing customer feedback records.

**Expected Result:** The feedback model should return the total feedback count and average satisfaction rating.

**Actual Result:** The feedback model returned total_feedback = 1 and average_csat = 5. The calculation was verified directly through the model function. No dedicated API endpoint for displaying the average CSAT was found.

**Status:** PASS

**Note:** The calculation function works, but API-level display of the average CSAT remains unverified.

### TC-14 - Administrator KPI Report API

**Test Input:** Administrator account accessing GET /api/kpi.

**Expected Result:** The administrator should receive the KPI report successfully.

**Actual Result:** The API returned HTTP 200. The response included total_tickets = 5, open_tickets = 3, resolved_tickets = 2, sla_compliance_percent = 50, and MTTR information.

**Status:** PASS

### TC-15 - Technician Ticket Status Update

**Test Input:** Technician account updating ticket INC-1027 to In Progress.

**Expected Result:** The technician should be able to update the ticket status successfully.

**Actual Result:** The API returned HTTP 200. The ticket status changed to In Progress, assigned_to matched the technician ID, and first_response_at was populated.

**Status:** PASS

### CSAT and KPI Test Summary

- TC-11: PASS
- TC-12: PASS
- TC-13: PASS (model-level verification)
- TC-14: PASS
- TC-15: PASS
