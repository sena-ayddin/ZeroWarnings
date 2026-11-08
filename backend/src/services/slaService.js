
/**
 * SDS-07 - SLA Calculation Service
 * ISO 9001:2015
 *
 * Working days: Monday-Friday
 * Working hours: 09:00-18:00
 * Timezone: Europe/Istanbul (UTC+3)
 * Warning threshold: 75%
 * Escalation threshold: 100%
 *
 * No external packages required.
 */

// 1. SLA POLICIES (business minutes)

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
    workingDays: [1, 2, 3, 4, 5],
    timeZone: "Europe/Istanbul"
};

const WARNING_THRESHOLD = 75;
const ESCALATION_THRESHOLD = 100;
const ISTANBUL_OFFSET_MINUTES = 180;

// 3. DATE VALIDATION

function validateDate(date) {
    const parsed = date instanceof Date
        ? new Date(date.getTime())
        : new Date(date);

    if (Number.isNaN(parsed.getTime())) {
        throw new Error("Invalid date provided.");
    }

    return parsed;
}

// 4. CONVERT TO ISTANBUL WALL-CLOCK TIME
// Turkey uses UTC+3.

function toIstanbulTime(date) {
    const parsed = validateDate(date);

    return new Date(
        parsed.getTime() +
        ISTANBUL_OFFSET_MINUTES * 60000
    );
}

function fromIstanbulTime(date) {
    return new Date(
        date.getTime() -
        ISTANBUL_OFFSET_MINUTES * 60000
    );
}

// 5. CHECK WORKING DAY

function isWorkingDay(date) {
    const istanbulDate = toIstanbulTime(date);

    // JavaScript: Sunday = 0, Monday = 1, ..., Saturday = 6
    const day = istanbulDate.getUTCDay();

    return BUSINESS_HOURS.workingDays.includes(day);
}

// 6. MOVE DATE TO BUSINESS HOURS

function moveToBusinessHours(date) {
    let current = toIstanbulTime(date);

    while (true) {
        const day = current.getUTCDay();

        // Skip weekends
        if (!BUSINESS_HOURS.workingDays.includes(day)) {
            current.setUTCDate(current.getUTCDate() + 1);
            current.setUTCHours(
                BUSINESS_HOURS.start, 0, 0, 0
            );
            continue;
        }

        const hour = current.getUTCHours();

        // Before working hours
        if (hour < BUSINESS_HOURS.start) {
            current.setUTCHours(
                BUSINESS_HOURS.start, 0, 0, 0
            );
        }

        // At or after closing time
        else if (hour >= BUSINESS_HOURS.end) {
            current.setUTCDate(current.getUTCDate() + 1);
            current.setUTCHours(
                BUSINESS_HOURS.start, 0, 0, 0
            );
        }

        else {
            return current;
        }
    }
}

// 7. CALCULATE BUSINESS MINUTES

function calculateBusinessMinutes(startDate, endDate) {
    const start = toIstanbulTime(startDate);
    const end = toIstanbulTime(endDate);

    if (end <= start) {
        return 0;
    }

    let totalMinutes = 0;

    const currentDay = new Date(start);
    currentDay.setUTCHours(0, 0, 0, 0);

    while (currentDay < end) {
        const day = currentDay.getUTCDay();

        if (BUSINESS_HOURS.workingDays.includes(day)) {
            const workStart = new Date(currentDay);
            workStart.setUTCHours(
                BUSINESS_HOURS.start, 0, 0, 0
            );

            const workEnd = new Date(currentDay);
            workEnd.setUTCHours(
                BUSINESS_HOURS.end, 0, 0, 0
            );

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

        currentDay.setUTCDate(
            currentDay.getUTCDate() + 1
        );
    }

    return totalMinutes;
}

// 8. ADD BUSINESS MINUTES

function addBusinessMinutes(startDate, minutes) {
    if (!Number.isFinite(minutes) || minutes < 0) {
        throw new Error(
            "Minutes must be a non-negative number."
        );
    }

    let current = moveToBusinessHours(startDate);
    let remainingMinutes = minutes;

    while (remainingMinutes > 0) {
        const workEnd = new Date(current);

        workEnd.setUTCHours(
            BUSINESS_HOURS.end, 0, 0, 0
        );

        const availableMinutes =
            (workEnd.getTime() - current.getTime()) / 60000;

        if (remainingMinutes <= availableMinutes) {
            current = new Date(
                current.getTime() +
                remainingMinutes * 60000
            );

            remainingMinutes = 0;
        } else {
            remainingMinutes -= availableMinutes;

            current.setUTCDate(
                current.getUTCDate() + 1
            );

            current.setUTCHours(
                BUSINESS_HOURS.start, 0, 0, 0
            );

            current = moveToBusinessHours(
                fromIstanbulTime(current)
            );
        }
    }

    return fromIstanbulTime(current);
}

// 9. CALCULATE SLA DEADLINE

function calculateSlaDeadline(createdAt, priority) {
    if (!Object.prototype.hasOwnProperty.call(
        SLA_POLICIES,
        priority
    )) {
        throw new Error("Invalid ticket priority.");
    }

    return addBusinessMinutes(
        createdAt,
        SLA_POLICIES[priority]
    );
}

// 10. CALCULATE SLA STATUS

function getSlaStatus(ticket, now = new Date()) {
    if (
        !ticket ||
        !ticket.priority ||
        !ticket.createdAt
    ) {
        throw new Error(
            "Ticket priority and createdAt are required."
        );
    }

    if (!Object.prototype.hasOwnProperty.call(
        SLA_POLICIES,
        ticket.priority
    )) {
        throw new Error("Invalid ticket priority.");
    }

    const creationDate = validateDate(ticket.createdAt);
    const currentDate = validateDate(now);

    if (currentDate < creationDate) {
        throw new Error(
            "Current date cannot be before ticket creation."
        );
    }

    const calculationEnd = ticket.resolvedAt
        ? validateDate(ticket.resolvedAt)
        : currentDate;

    if (calculationEnd < creationDate) {
        throw new Error(
            "Resolution date cannot be before ticket creation."
        );
    }

    const totalMinutes = SLA_POLICIES[ticket.priority];

    const slaDeadline = calculateSlaDeadline(
        creationDate,
        ticket.priority
    );

    const elapsedMinutes = calculateBusinessMinutes(
        creationDate,
        calculationEnd
    );

    const remainingMinutes = Math.max(
        0,
        totalMinutes - elapsedMinutes
    );

    const percentageElapsed = Math.min(
        100,
        (elapsedMinutes / totalMinutes) * 100
    );

    const escalated =
        elapsedMinutes >= totalMinutes;

    const warning =
        percentageElapsed >= WARNING_THRESHOLD;

    let slaStatus = "ON_TRACK";

    if (escalated) {
        slaStatus = "ESCALATED";
    } else if (warning) {
        slaStatus = "WARNING";
    }

    return {
        ticketId: ticket.id ?? null,
        priority: ticket.priority,
        timeZone: BUSINESS_HOURS.timeZone,
        slaDeadline,
        totalMinutes,
        elapsedMinutes: Number(
            elapsedMinutes.toFixed(2)
        ),
        remainingMinutes: Number(
            remainingMinutes.toFixed(2)
        ),
        percentageElapsed: Number(
            percentageElapsed.toFixed(2)
        ),
        slaStatus,
        warning,
        escalated
    };
}

// 11. EXPORT FUNCTIONS

module.exports = {
    SLA_POLICIES,
    BUSINESS_HOURS,
    WARNING_THRESHOLD,
    ESCALATION_THRESHOLD,
    isWorkingDay,
    calculateBusinessMinutes,
    addBusinessMinutes,
    calculateSlaDeadline,
    getSlaStatus
};
