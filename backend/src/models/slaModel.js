const { pool } = require('../config/db');

exports.listOpenTickets = async () => {
  const [rows] = await pool.query(
    `SELECT ticket_id, ticket_number, title, priority, status, created_at,
            resolution_due_at, escalation_level, sla_warning_sent, is_escalated
       FROM Tickets
      WHERE status IN ('Open', 'In Progress', 'Pending')
      ORDER BY resolution_due_at ASC`
  );
  return rows;
};
