
# Requirements Traceability Matrix (RTM) â€“ Updated

**Project Name:** ISO 9001 Compliant IT Service Desk and Process Tracking System  
**Project Code:** SDS-07  
**Project Group:** Zero Warnings  
**Prepared by:** Buse Baydilli  
**Work Package:** WP-08  
**Reference Standards:** IEEE 29148, IEEE 1012

---

## 1. Purpose

This document establishes the relationship between the functional and non-functional requirements defined in the Software Requirements Specification (SRS) and the verification test cases prepared for the SDS-07 project.

The matrix helps ensure that the requirements are linked to appropriate test cases and that test coverage can be tracked throughout the verification and validation process.

The test execution results are recorded in this matrix. Completed, partially verified and not-run test cases are identified separately.

---

## 2. Requirement Traceability Matrix

| Requirement ID | Requirement Description | Test Case ID | Verification Method | Test Status |
|---|---|---|---|---|
| FR-01 | Employees can create IT support tickets. | TC-01 | Ticket creation and SLA assignment check | PARTIAL |
| FR-02 | Employees can view submitted tickets and their current status. | Not Covered | No dedicated test case prepared yet. | Not Tested |
| FR-03 | Technicians can view assigned tickets and update their status. | TC-08 | Technician authorization and ticket status update check | PASS |
| FR-04 | Users can submit IT change requests for administrative review. | Not Covered | No dedicated test case prepared yet. | Not Tested |
| FR-05 | The system assigns SLA deadlines according to ticket priority. | TC-01, TC-02, TC-03, TC-04 | SLA deadline and business-hour calculation checks | PARTIAL |
| FR-06 | The system displays a warning when the defined SLA threshold is reached. | TC-05 | SLA warning threshold check | PASS |
| FR-07 | The system escalates overdue tickets. | TC-06 | SLA deadline violation and escalation status check | PASS |
| FR-08 | Employees can submit satisfaction ratings after ticket resolution. | TC-11, TC-12 | Valid feedback submission and invalid rating validation | PASS |
| FR-09 | The system calculates and displays customer satisfaction (CSAT). | TC-13 | Average CSAT calculation verified at model level; API display not available | PARTIAL |
| FR-10 | The system provides KPI reports and service performance information. | TC-14 | Administrator KPI API verification | PASS |
| FR-11 | Important user activities and ticket status changes are recorded in the audit log. | TC-10 | Audit log record verification | PASS |
| FR-12 | Administrators can monitor ticket management and service performance. | TC-09 | Administrator access and monitoring check | PASS |
| NFR-01 | The system provides a simple and understandable user interface. | Not Covered | No dedicated usability test case prepared yet. | Not Tested |
| NFR-02 | Normal operations should respond within 3 seconds under expected usage. | Not Covered | No dedicated performance test case prepared yet. | Not Tested |
| NFR-03 | Access to system functions is restricted according to user roles. | TC-07, TC-08, TC-09 | Role-based access control verification | PASS |
| NFR-04 | Ticket and change request records should be accurate and reliable. | Not Covered | No dedicated reliability test case prepared yet. | Not Tested |
| NFR-05 | The system should have a modular and maintainable structure. | Not Covered | No dedicated maintainability test case prepared yet. | Not Tested |
| NFR-06 | The system should be compatible with modern web browsers. | Not Covered | No dedicated browser compatibility test case prepared yet. | Not Tested |
| NFR-07 | Unauthorized changes to stored records should be prevented. | Not Covered | No dedicated data integrity test case prepared yet. | Not Tested |
| NFR-08 | Important activities should be recorded for monitoring and auditing. | TC-10 | Audit log verification | PASS |

---

## 3. Test Case to Requirement Mapping

| Test Case ID | Test Case Description | Related Requirement(s) | Execution Status |
|---|---|---|
| TC-01 | SLA resolution deadline calculation during ticket creation | FR-01, FR-05 PARTIAL |
| TC-02 | SLA duration according to ticket priority | FR-05 PASS |
| TC-03 | SLA countdown during non-business hours | FR-05 Not Run |
| TC-04 | SLA countdown during business hours | FR-05 PARTIAL |
| TC-05 | SLA warning at the defined threshold | FR-06 PASS |
| TC-06 | SLA escalation after deadline | FR-07 PASS |
| TC-07 | Employee role authorization | NFR-03 PASS |
| TC-08 | Technician ticket management authorization | FR-03, NFR-03 PASS |
| TC-09 | Administrator access and monitoring | FR-12, NFR-03 PASS |
| TC-10 | Audit log recording | FR-11, NFR-08 PASS |

---

## 4. SLA Verification References

The following names are based on the SLA service information shared by the development team. They are included to maintain consistency between the test documentation and the backend implementation.

### 4.1 SLA Configuration

- `SLA_POLICIES`
- `BUSINESS_HOURS`
- `WARNING_THRESHOLD`
- `ESCALATION_THRESHOLD`

### 4.2 SLA Functions

- `validateDate()`
- `isWorkingDay()`
- `moveToBusinessHours()`
- `calculateBusinessMinutes()`
- `addBusinessMinutes()`
- `calculateSlaDeadline()`
- `getSlaStatus()`

### 4.3 Ticket Data Fields

- `id`
- `priority`
- `createdAt`
- `resolvedAt`

### 4.4 SLA Result Fields

- `ticketId`
- `priority`
- `timeZone`
- `slaDeadline`
- `totalMinutes`
- `elapsedMinutes`
- `remainingMinutes`
- `percentageElapsed`
- `slaStatus`
- `warning`
- `escalated`

### 4.5 SLA Status Values

- `ON_TRACK`
- `WARNING`
- `ESCALATED`

**Related implementation files:**
- `backend/src/services/slaService.js`
- `backend/src/config/slaPolicies.js`

**Integration verification:** The SLA service and policy configuration were inspected and exercised. Priority-based deadline calculations, warning and escalation thresholds, and the SLA worker were verified using test scripts and a dedicated test ticket.

---

## 5. Coverage Summary

The current test set contains 10 planned test cases (TC-01 to TC-10).

The test cases cover the following requirement areas:

- Ticket creation and SLA deadline assignment
- SLA policies based on ticket priority
- Business-hour-aware SLA countdown
- SLA warning and escalation behavior
- Role-based access control
- Technician ticket management
- Administrator monitoring
- Audit log recording

Requirements marked as "Not Covered" need additional test scenarios in a later verification activity.

Execution status: 7 test cases passed, 2 were partially verified and 1 remains not run. The individual results are recorded in the test case mapping above.

---
## 6. Supplementary Backend Smoke Test Execution

**Execution Date:** 18 November 2026  
**Test Environment:** Express.js REST API and MySQL  
**Execution Command:** `npm.cmd --prefix .\backend run test:smoke`  
**Test Script:** `backend/scripts/smoke-test.js`

The supplementary backend smoke test was executed successfully.

### 6.1 Supplementary SLA Worker Verification

**Execution Date:** 21 November 2026  
**Test Ticket:** INC-1028 (ticket_id: 5)  
**Priority:** High

The test ticket creation time was adjusted to a business-hour timestamp in the test database. The SLA worker function `checkOpenTickets()` was executed.

| Verification | Actual Result | Status |
|---|---|---|
| SLA warning flag | sla_warning_sent = 1 | PASS |
| Escalation flag | is_escalated = 1 | PASS |
| Escalation level | escalation_level = 3 | PASS |
| Warning audit record | SLA_WARNING_75_PERCENT | PASS |
| Escalation audit record | SLA_ESCALATED_LEVEL_3 | PASS |

The worker recorded 225% elapsed SLA time for the test ticket. Both warning and escalation actions were written to the Audit_Logs table.

**Result:** Real SLA warning and escalation worker behavior was successfully verified using a dedicated test ticket.


**Execution Summary:**
- Total checks: 26
- Passed: 26
- Failed: 0

**Verified areas:**
- Employee, Technician, and Administrator login
- Invalid password and unauthorized access
- Ticket creation and validation
- Employee and Technician ticket access
- Ticket details and ownership restrictions
- Role-based ticket status updates
- Ticket assignment and response timestamps
- Ticket resolution and closure
- KPI report access and role restrictions

**Result:** All 26 supplementary smoke test checks passed.

**Note:** These smoke tests provide additional implementation-level verification evidence. They do not replace the individual execution of TC-01 to TC-10. Individual test case results are tracked in the mapping above. TC-01, TC-03, and TC-04 remain partially verified.

---

## 7. Conclusion

This updated Requirements Traceability Matrix links the prepared IEEE 1012 test cases to the functional and non-functional requirements defined in the SDS-07 SRS document.

The supplementary backend smoke test was executed successfully, with 26 passed checks and no failures. The completed test results are recorded in the traceability matrix. TC-03 and partially verified areas remain clearly identified.
