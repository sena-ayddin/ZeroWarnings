
/**
 * SDS-07 - SLA Policies
 * SLA durations are measured in business minutes.
 */

const SLA_POLICIES = {
    Low: 16 * 60,
    Medium: 8 * 60,
    High: 4 * 60,
    Critical: 2 * 60
};

const WARNING_THRESHOLD = 75;
const ESCALATION_THRESHOLD = 100;

module.exports = {
    SLA_POLICIES,
    WARNING_THRESHOLD,
    ESCALATION_THRESHOLD
};
