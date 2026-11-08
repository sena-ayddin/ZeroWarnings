
/**
 * SDS-07 - SLA Calculation Service
 * ISO 9001:2015
 *
 * Working hours: Monday-Friday, 09:00-18:00
 * Warning threshold: 75%
 * Escalation threshold: 100%
 */

// 1. SLA POLICIES

const SLA_POLICIES = {
    Low: 16 * 60,
    Medium: 8 * 60,
    High: 4 * 60,
    Critical: 2 * 60
};

// 2. BUSINESS HOURS

const BUSINESS_HOURS = {
    start: 9,
    end: 18,
    workingDays: [1, 2, 3, 4, 5]
};

const WARNING_THRESHOLD = 75;

// 3. DATE VALIDATION

function validateDate(date) {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        throw new Error("Invalid date provided.");
    }

    return parsedDate;
}

// 4. CHECK WORKING DAY

function isWorkingDay(date) {
    return BUSINESS_HOURS.workingDays.includes(
        date.getDay()
    );
}

// 5. MOVE DATE TO BUSINESS HOURS

function moveToBusinessHours(date) {
    const result = new Date(date);

    while (true) {

        // Skip weekends
        if (!isWorkingDay(result)) {
            result.setDate(result.getDate() + 1);
            result.setHours(BUSINESS_HOURS.start, 0, 0, 0);
            continue;
        }

        const hour = result.getHours();

        // Before working hours
        if (hour < BUSINESS_HOURS.start) {
            result.setHours(BUSINESS_HOURS.start, 0, 0, 0);
        }

        // After working hours
        else if (hour >= BUSINESS_HOURS.end) {
            result.setDate(result.getDate() + 1);
            result.setHours(BUSINESS_HOURS.start, 0, 0, 0);
        }

        else {
            break;
        }
    }

    return result;
}

// 6. CALCULATE BUSINESS MINUTES

function calculateBusinessMinutes(startDate, endDate) {

    const start = validateDate(startDate);
    const end = validateDate(endDate);

    if (end <= start) {
        return 0;
    }

    let totalMinutes = 0;

    const currentDay = new Date(start);
    currentDay.setHours(0, 0, 0, 0);

    while (currentDay < end) {

        if (isWorkingDay(currentDay)) {

            const workStart = new Date(currentDay);
            workStart.setHours(BUSINESS_HOURS.start, 0, 0, 0);

            const workEnd = new Date(currentDay);
            workEnd.setHours(BUSINESS_HOURS.end, 0, 0, 0);

            const intervalStart = Math.max(
                start.getTime(),
                workStart.getTime()
            );

            const intervalEnd = Math.min(
                end.getTime(),
                workEnd.getTime()
            );

            if (intervalEnd > intervalStart) {
                totalMinutes +=
                    (intervalEnd - intervalStart) / 60000;
            }
        }

        currentDay.setDate(currentDay.getDate() + 1);
    }

    return totalMinutes;
}

// 7. ADD BUSINESS MINUTES

function addBusinessMinutes(startDate, minutes) {

    if (!Number.isFinite(minutes) || minutes < 0) {
        throw new Error("Minutes must be non-negative.");
    }

    let currentDate = moveToBusinessHours(
        validateDate(startDate)
    );

    let remainingMinutes = minutes;

    while (remainingMinutes > 0) {

        const workEnd = new Date(currentDate);
        workEnd.setHours(BUSINESS_HOURS.end, 0, 0, 0);

        const availableMinutes =
            (workEnd.getTime() - currentDate.getTime()) / 60000;

        if (remainingMinutes <= availableMinutes) {

            currentDate = new Date(
                currentDate.getTime() +
                remainingMinutes * 60000
            );

            remainingMinutes = 0;

        } else {

            remainingMinutes -= availableMinutes;

            currentDate.setDate(
                currentDate.getDate() + 1
            );

            currentDate.setHours(
                BUSINESS_HOURS.start, 0, 0, 0
            );

            currentDate = moveToBusinessHours(currentDate);
        }
    }

    return currentDate;
}

// 8. CALCULATE SLA DEADLINE

function calculateSlaDeadline(createdAt, priority) {

    if (!SLA_POLICIES[priority]) {
        throw new Error("Invalid ticket priority.");
    }

    const creationDate = validateDate(createdAt);

    const slaMinutes = SLA_POLICIES[priority];

    return addBusinessMinutes(
        creationDate,
        slaMinutes
    );
}

// 9. CALCULATE SLA STATUS

function getSlaStatus(ticket, now = new Date()) {

    if (!ticket || !ticket.priority || !ticket.createdAt) {
        throw new Error(
            "Ticket priority and createdAt are required."
        );
    }

    const creationDate = validateDate(ticket.createdAt);
    const currentDate = validateDate(now);

    if (currentDate < creationDate) {
        throw new Error(
            "Current date cannot be before ticket creation."
        );
    }

    const totalMinutes = SLA_POLICIES[ticket.priority];

    if (!totalMinutes) {
        throw new Error("Invalid ticket priority.");
    }

    const slaDeadline = calculateSlaDeadline(
        creationDate,
        ticket.priority
    );

    const elapsedMinutes = calculateBusinessMinutes(
        creationDate,
        currentDate
    );

    const remainingMinutes = Math.max(
        0,
        totalMinutes - elapsedMinutes
    );

    const percentageElapsed = Math.min(
        100,
        (elapsedMinutes / totalMinutes) * 100
    );

    let slaStatus = "ON_TRACK";
    let warning = false;
    let escalated = false;

    // 75% warning
    if (percentageElapsed >= WARNING_THRESHOLD) {
        slaStatus = "WARNING";
        warning = true;
    }

    // 100% escalation
    if (currentDate >= slaDeadline) {
        slaStatus = "ESCALATED";
        escalated = true;
    }

    return {
        slaDeadline,
        totalMinutes,
        elapsedMinutes,
        remainingMinutes,
        percentageElapsed: Number(
            percentageElapsed.toFixed(2)
        ),
        slaStatus,
        warning,
        escalated
    };
}

// 10. EXPORT FUNCTIONS

module.exports = {
    SLA_POLICIES,
    BUSINESS_HOURS,
    isWorkingDay,
    calculateBusinessMinutes,
    addBusinessMinutes,
    calculateSlaDeadline,
    getSlaStatus
};
