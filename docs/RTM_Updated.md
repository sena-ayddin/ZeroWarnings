
# Requirements Traceability Matrix (RTM) – Updated

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

The test cases are currently prepared but have not yet been executed. Therefore, the execution status is recorded as "Not Run".

---

## 2. Requirement Traceability Matrix

| Requirement ID | Requirement Description | Test Case ID | Verification Method | Test Status |
|---|---|---|---|---|
| FR-01 | Employees can create IT support tickets. | TC-01 | Ticket creation and SLA assignment check | Not Run |
| FR-02 | Employees can view submitted tickets and their current status. | Not Covered | No dedicated test case prepared yet. | Not Tested |
| FR-03 | Technicians can view assigned tickets and update their status. | TC-08 | Technician authorization and ticket status update check | Not Run |
| FR-04 | Users can submit IT change requests for administrative review. | Not Covered | No dedicated test case prepared yet. | Not Tested |
| FR-05 | The system assigns SLA deadlines according to ticket priority. | TC-01, TC-02, TC-03, TC-04 | SLA deadline and business-hour calculation checks | Not Run |
| FR-06 | The system displays a warning when the defined SLA threshold is reached. | TC-05 | SLA warning threshold check | Not Run |
| FR-07 | The system escalates overdue tickets. | TC-06 | SLA deadline violation and escalation status check | Not Run |
| FR-08 | Employees can submit satisfaction ratings after ticket resolution. | Not Covered | No dedicated test case prepared yet. | Not Tested |
| FR-09 | The system calculates and displays customer satisfaction (CSAT). | Not Covered | No dedicated test case prepared yet. | Not Tested |
| FR-10 | The system provides KPI reports and service performance information. | Not Covered | No dedicated test case prepared yet. | Not Tested |
| FR-11 | Important user activities and ticket status changes are recorded in the audit log. | TC-10 | Audit log record verification | Not Run |
| FR-12 | Administrators can monitor ticket management and service performance. | TC-09 | Administrator access and monitoring check | Not Run |
| NFR-01 | The system provides a simple and understandable user interface. | Not Covered | No dedicated usability test case prepared yet. | Not Tested |
| NFR-02 | Normal operations should respond within 3 seconds under expected usage. | Not Covered | No dedicated performance test case prepared yet. | Not Tested |
| NFR-03 | Access to system functions is restricted according to user roles. | TC-07, TC-08, TC-09 | Role-based access control verification | Not Run |
| NFR-04 | Ticket and change request records should be accurate and reliable. | Not Covered | No dedicated reliability test case prepared yet. | Not Tested |
| NFR-05 | The system should have a modular and maintainable structure. | Not Covered | No dedicated maintainability test case prepared yet. | Not Tested |
| NFR-06 | The system should be compatible with modern web browsers. | Not Covered | No dedicated browser compatibility test case prepared yet. | Not Tested |
| NFR-07 | Unauthorized changes to stored records should be prevented. | Not Covered | No dedicated data integrity test case prepared yet. | Not Tested |
| NFR-08 | Important activities should be recorded for monitoring and auditing. | TC-10 | Audit log verification | Not Run |

---

## 3. Test Case to Requirement Mapping

| Test Case ID | Test Case Description | Related Requirement(s) |
|---|---|---|
| TC-01 | SLA resolution deadline calculation during ticket creation | FR-01, FR-05 |
| TC-02 | SLA duration according to ticket priority | FR-05 |
| TC-03 | SLA countdown during non-business hours | FR-05 |
| TC-04 | SLA countdown during business hours | FR-05 |
| TC-05 | SLA warning at the defined threshold | FR-06 |
| TC-06 | SLA escalation after deadline | FR-07 |
| TC-07 | Employee role authorization | NFR-03 |
| TC-08 | Technician ticket management authorization | FR-03, NFR-03 |
| TC-09 | Administrator access and monitoring | FR-12, NFR-03 |
| TC-10 | Audit log recording | FR-11, NFR-08 |

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

**Integration note:** The development team has stated that the policy values in `slaPolicies.js` are not yet fully connected to `slaService.js`. Therefore, the integration and actual SLA calculation results must be verified after this connection is completed.

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

All test cases are currently marked as "Not Run". Their actual results and final pass/fail statuses will be recorded after execution in the API test environment.

---

## 6. Conclusion

This updated Requirements Traceability Matrix links the prepared IEEE 1012 test cases to the functional and non-functional requirements defined in the SDS-07 SRS document.

It provides a basis for tracking test coverage and identifying requirements that need additional verification. The matrix will be updated as implementation and test execution progress.
