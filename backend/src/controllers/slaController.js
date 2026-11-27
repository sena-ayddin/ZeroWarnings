const slaModel = require('../models/slaModel');
const { getSlaStatus } = require('../services/slaService');

exports.getAlerts = async (req, res, next) => {
  try {
    const tickets = await slaModel.listOpenTickets();
    const alerts = tickets.map((ticket) => {
      const result = getSlaStatus({
        id: ticket.ticket_id, priority: ticket.priority, createdAt: ticket.created_at
      });
      return {
        ticket_id: ticket.ticket_id, ticket_number: ticket.ticket_number,
        title: ticket.title, priority: ticket.priority, status: ticket.status,
        sla_status: result.slaStatus, remaining_minutes: result.remainingMinutes,
        escalation_level: Number(ticket.escalation_level) || 1,
        resolution_due_at: ticket.resolution_due_at,
        percentage_elapsed: result.percentageElapsed
      };
    }).filter((ticket) => ['WARNING', 'ESCALATED'].includes(ticket.sla_status));
    res.json({ success: true, count: alerts.length, alerts });
  } catch (err) { next(err); }
};
