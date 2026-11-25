// Yönetici KPI raporu (FR-10, ISO 9001 Madde 9.1.1)
const ticketModel = require('../models/ticketModel');
const feedbackModel = require('../models/feedbackModel');
const slaService = require('../services/slaService');

const round2 = (n) => Math.round(n * 100) / 100;

// GET /api/kpi (Administrator)
exports.getKpi = async (req, res, next) => {
  try {
    const now = new Date();
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

    const [c, feedbackSummary] = await Promise.all([
      ticketModel.kpiCounts(monthStart),
      feedbackModel.getSummary()
    ]);

    const num = (v) => Number(v) || 0;
    const resolved = num(c.resolved_tickets);
    const onTime = num(c.resolved_on_time);
    const overdueOpen = num(c.open_overdue);

    // SLA Compliance = on-time resolved / (resolved + overdue open) * 100
    const denominator = resolved + overdueOpen;
    const slaCompliance =
      denominator > 0 ? round2((onTime / denominator) * 100) : null;

    // MTTR: average business minutes for resolved/closed tickets.
    const times = await ticketModel.resolvedTimes();
    const mttrMinutes = times.length
      ? round2(
          times.reduce(
            (sum, t) =>
              sum + slaService.calculateBusinessMinutes(t.created_at, t.resolved_at),
            0
          ) / times.length
        )
      : null;

    res.json({
      success: true,
      kpi: {
        total_tickets: num(c.total_tickets),
        open_tickets: num(c.open_tickets),
        resolved_tickets: resolved,
        resolved_this_month: num(c.resolved_this_month),
        sla_compliance_percent: slaCompliance,
        mttr_minutes: mttrMinutes,
        mttr_hours: mttrMinutes === null ? null : round2(mttrMinutes / 60),
        // CSAT fields required by docs/KPI_CSAT_Formulas.md
        total_feedback: feedbackSummary.total_feedback,
        average_csat: feedbackSummary.average_csat,
        generated_at: now.toISOString()
      }
    });
  } catch (err) {
    next(err);
  }
};
