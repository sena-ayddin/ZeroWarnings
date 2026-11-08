
# SDS-07 – SLA Calculation Logic

**Project:** IT Service Desk and Process Tracking System  
**Project Code:** SDS-07  
**Standard:** ISO 9001:2015  
**Responsible:** Gülçin Hacıimam  
**Version:** 1.0

## 1. Purpose

This document describes the SLA (Service Level Agreement) calculation mechanism developed for the SDS-07 project.

The purpose of this service is to calculate ticket resolution deadlines, monitor working hours, generate SLA warnings and trigger escalation when the resolution deadline is reached.

The implementation supports controlled and measurable IT service processes.

## 2. SLA Priority Policies

The system defines four priority levels. Each priority has a different resolution target.

| Priority | Resolution Time | Minutes |
|----------|-----------------|---------|
| Low      | 16 hours        | 960     |
| Medium   | 8 hours         | 480     |
| High     | 4 hours         | 240     |
| Critical | 2 hours         | 120     |

These values are initial example policies. They can be updated according to organizational requirements and database SLA_Policies.

## 3. Business Hours

The SLA timer operates only during defined business hours.

- Working days: Monday to Friday
- Start time: 09:00
- End time: 18:00
- Weekends: Excluded
- Daily working time: 9 hours

Time outside business hours is excluded from SLA calculations.

The application should use the Europe/Istanbul timezone consistently when processing dates and working hours.

## 4. SLA Deadline Calculation

When a new ticket is created, the system:

1. Reads the ticket creation date.
2. Identifies its priority level.
3. Retrieves the corresponding SLA resolution time.
4. Adds the required business minutes to the creation date.
5. Calculates the final SLA deadline.

The calculated deadline is returned as a JavaScript Date object.

## 5. Business Hours Calculation Algorithm

The system uses business-minute calculations instead of ordinary elapsed time.

The algorithm:

1. Validates the start and end dates.
2. Checks whether each day is a working day.
3. Excludes Saturdays and Sundays.
4. Considers only the interval between 09:00 and 18:00.
5. Calculates the total working minutes.
6. Excludes all non-working periods.

### Example

A High priority ticket is created on Monday at 16:00.

Its SLA resolution target is 4 business hours.

Calculation:

- Monday, 16:00–18:00: 2 hours
- Tuesday, 09:00–11:00: 2 hours

**SLA Deadline: Tuesday at 11:00.**

The timer does not progress overnight or during weekends.

## 6. Warning and Escalation Mechanism

The system monitors the percentage of consumed SLA time.

| SLA Consumption | Status | System Action |
|-----------------|--------|---------------|
| Below 75% | ON_TRACK | Normal monitoring |
| 75% or above | WARNING | Warning flag activated |
| 100% / Deadline reached | ESCALATED | Escalation flag activated |

### Warning Mechanism

When 75% of the allocated SLA time has elapsed, the system changes the SLA status to WARNING.

This indicates that the ticket is approaching its resolution deadline.

### Escalation Mechanism

When the SLA deadline is reached, the system changes the SLA status to ESCALATED.

The escalated flag becomes true.

This identifies tickets requiring escalation to the responsible team or higher-level management.

## 7. Main JavaScript Functions

The SLA calculation service is implemented in:

`backend/src/services/slaService.js`

| Function | Description |
|----------|-------------|
| validateDate() | Validates date values |
| isWorkingDay() | Checks whether a day is a working day |
| moveToBusinessHours() | Moves a date into valid business hours |
| calculateBusinessMinutes() | Calculates working minutes between two dates |
| addBusinessMinutes() | Adds business minutes to a date |
| calculateSlaDeadline() | Calculates the SLA resolution deadline |
| getSlaStatus() | Determines warning and escalation status |

## 8. Returned SLA Information

The getSlaStatus() function returns the following information:

| Field | Description |
|-------|-------------|
| slaDeadline | Final resolution deadline |
| totalMinutes | Total allocated SLA minutes |
| elapsedMinutes | Consumed business minutes |
| remainingMinutes | Remaining SLA minutes |
| percentageElapsed | Percentage of consumed SLA time |
| slaStatus | Current SLA status |
| warning | Warning flag |
| escalated | Escalation flag |

## 9. ISO 9001:2015 Relationship

The SLA calculation service supports the following ISO 9001:2015 clauses:

### Clause 8.2 – Requirements for Products and Services

Defines service requirements and SLA resolution targets for IT support requests.

### Clause 8.5.1 – Control of Service Provision

Supports controlled IT service processes through deadline monitoring and escalation mechanisms.

### Clause 9.1.1 – Monitoring, Measurement, Analysis and Evaluation

Provides measurable SLA performance information, including elapsed time, remaining time and SLA violations.

### Clause 7.5 – Documented Information

Supports the documentation and traceability of SLA calculation rules and process information.

## 10. Limitations and Future Improvements

The current implementation uses initial example SLA values.

Future improvements may include:

- Loading SLA policies directly from the database.
- Supporting organizational holidays.
- Configuring different business hours.
- Recording escalation events in Audit_Logs.
- Integrating SLA warnings with the technician dashboard.
- Supporting different response and resolution time targets.

## 11. Conclusion

The SLA calculation service provides a structured approach to monitoring IT support requests.

By calculating resolution deadlines using business hours, generating warnings at the 75% threshold and triggering escalation at the 100% threshold, the system supports service quality monitoring and process control.

This implementation contributes to the quality management objectives of the SDS-07 project.
