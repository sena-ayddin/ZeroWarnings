
# IEEE 1012 – Verification and Validation Test Cases

**Project Name:** ISO 9001 Compliant IT Service Desk and Process Tracking System  
**Project Code:** SDS-07  
**Project Group:** Zero Warnings  
**Prepared by:** Buse Baydilli  
**Work Package:** WP-08  
**Reference Standard:** IEEE 1012 – Verification and Validation (V&V)

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
- SLA business hours: 09:00–18:00
- Testing tool planned: Postman
- Test execution status: Not Run

---

## 3. Test Case Matrix

### TC-01 – SLA Resolution Deadline Calculation

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

**Actual Result:** Not Run  
**Status:** Not Run

---

### TC-02 – SLA Duration According to Ticket Priority

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

**Actual Result:** Not Run  
**Status:** Not Run

---

### TC-03 – SLA Countdown During Non-Business Hours

**Objective:** Verify that the SLA countdown stops outside the defined business hours.

**Related Requirement:** FR-05

**Preconditions:**
- The application is running.
- A ticket with an active SLA exists.
- The business-hour configuration is set to 09:00–18:00.

**Test Inputs:**
- Business hours: 09:00–18:00
- Test period: Outside business hours, for example 19:00–20:00

**Test Steps:**
1. Create or select a ticket with an active SLA.
2. Record the remaining SLA time.
3. Check the remaining time outside business hours.
4. Wait for a period outside business hours.
5. Check the remaining SLA time again.

**Expected Result:**
- The SLA countdown should not decrease outside business hours.
- The remaining SLA time should stay unchanged during the non-business period.

**Actual Result:** Not Run  
**Status:** Not Run

---

### TC-04 – SLA Countdown During Business Hours

**Objective:** Verify that the SLA countdown continues during the defined business hours.

**Related Requirement:** FR-05

**Preconditions:**
- The application is running.
- A ticket with an active SLA exists.
- The business-hour configuration is set to 09:00–18:00.

**Test Inputs:**
- Business hours: 09:00–18:00
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

**Actual Result:** Not Run  
**Status:** Not Run

---

### TC-05 – SLA Warning at the Defined Threshold

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

**Actual Result:** Not Run  
**Status:** Not Run

---

### TC-06 – SLA Escalation After Deadline

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

**Actual Result:** Not Run  
**Status:** Not Run

---

### TC-07 – Employee Role Authorization

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

**Actual Result:** Not Run  
**Status:** Not Run

---

### TC-08 – Technician Ticket Management Authorization

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

**Actual Result:** Not Run  
**Status:** Not Run

---

### TC-09 – Administrator Access and Monitoring

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

**Actual Result:** Not Run  
**Status:** Not Run

---

### TC-10 – Audit Log Recording

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

**Actual Result:** Not Run  
**Status:** Not Run

---

## 4. Test Execution Summary

| Test ID | Test Description | Execution Status |
|---|---|---|
| TC-01 | SLA resolution deadline calculation | Not Run |
| TC-02 | SLA duration according to priority | Not Run |
| TC-03 | SLA countdown during non-business hours | Not Run |
| TC-04 | SLA countdown during business hours | Not Run |
| TC-05 | SLA warning at the defined threshold | Not Run |
| TC-06 | SLA escalation after deadline | Not Run |
| TC-07 | Employee role authorization | Not Run |
| TC-08 | Technician ticket management authorization | Not Run |
| TC-09 | Administrator access and monitoring | Not Run |
| TC-10 | Audit log recording | Not Run |

---

## 5. Conclusion

The test cases in this document define the planned verification and validation activities for the SDS-07 system. They cover SLA calculations, business-hour rules, warning and escalation behavior, role-based access control, ticket management and audit logging.

The test cases will be executed in the API test environment. Actual results and pass/fail statuses will be added after test execution.
