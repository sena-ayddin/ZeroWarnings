// SLA monitor: warning at the policy threshold (default 75%), Level 2 at the
// escalation threshold (default 100%), and Level 3 50 percentage points later
// (default 150%). Maximum escalation level implemented here is 3.
const { pool, withTransaction } = require('../config/db');
const slaService = require('./slaService');
const audit = require('../models/auditModel');

// Environment variable is in milliseconds; default is 60 seconds, minimum 15 seconds.
const INTERVAL_MS = Math.max(15000, Number(process.env.SLA_WORKER_INTERVAL_MS) || 60000);
let timer = null;
let running = false;

async function checkOpenTickets() {
  if (running) return;
  running = true;
  try {
    const [tickets] = await pool.query(
      `SELECT t.ticket_id, t.ticket_number, t.user_id, t.priority, t.created_at,
              t.sla_warning_sent, t.is_escalated, t.escalation_level,
              p.resolution_time_minutes,
              p.warning_threshold_percent, p.escalation_threshold_percent
         FROM Tickets t
         LEFT JOIN SLA_Policies p ON p.sla_policy_id = t.sla_policy_id
        WHERE t.status IN ('Open', 'In Progress', 'Pending')
          AND t.resolved_at IS NULL`
    );

    for (const ticket of tickets) {
      const total = Number(ticket.resolution_time_minutes);
      if (!Number.isFinite(total) || total <= 0) continue;
      const elapsed = slaService.calculateBusinessMinutes(ticket.created_at, new Date());
      const percent = (elapsed / total) * 100;
      const warningAt = Number(ticket.warning_threshold_percent) || 75;
      const escalationAt = Number(ticket.escalation_threshold_percent) || 100;
      const shouldWarn = !ticket.sla_warning_sent && percent >= warningAt;
      const targetLevel = percent >= escalationAt + 50 ? 3 : (percent >= escalationAt ? 2 : 1);
      const shouldEscalate = targetLevel > Number(ticket.escalation_level || 1);
      if (!shouldWarn && !shouldEscalate) continue;

      await withTransaction(async (conn) => {
        const [lockedRows] = await conn.query(
          'SELECT * FROM Tickets WHERE ticket_id = ? FOR UPDATE', [ticket.ticket_id]
        );
        const current = lockedRows[0];
        if (!current || !['Open', 'In Progress', 'Pending'].includes(current.status) || current.resolved_at) return;

        if (shouldWarn && !current.sla_warning_sent) {
          await conn.query('UPDATE Tickets SET sla_warning_sent = TRUE, updated_at = UTC_TIMESTAMP() WHERE ticket_id = ?', [ticket.ticket_id]);
          await audit.log(conn, {
            user_id: null, entity_type: 'Ticket', entity_id: ticket.ticket_id,
            action: 'SLA_WARNING_75_PERCENT',
            new_value: { percentage_elapsed: Number(percent.toFixed(2)), threshold_percent: warningAt }
          });
        }

        const freshLevel = Number(current.escalation_level || 1);
        const newLevel = Math.max(freshLevel, targetLevel);
        if (newLevel > freshLevel) {
          await conn.query(
            `UPDATE Tickets
                SET is_escalated = TRUE, escalation_level = ?,
                    escalated_at = UTC_TIMESTAMP(), updated_at = UTC_TIMESTAMP()
              WHERE ticket_id = ?`, [newLevel, ticket.ticket_id]
          );
          await audit.log(conn, {
            user_id: null, entity_type: 'Ticket', entity_id: ticket.ticket_id,
            action: newLevel === 2 ? 'SLA_ESCALATED_LEVEL_2' : 'SLA_ESCALATED_LEVEL_3',
            old_value: { escalation_level: freshLevel },
            new_value: { escalation_level: newLevel, percentage_elapsed: Number(percent.toFixed(2)) }
          });
        }
      });
    }
  } catch (err) {
    console.error('[SLA Worker] Kontrol sırasında hata:', err.message);
  } finally {
    running = false;
  }
}

function start() {
  if (timer) return;
  console.log(`[SLA Worker] Başlatıldı. Kontrol aralığı: ${INTERVAL_MS / 1000} saniye.`);
  checkOpenTickets();
  timer = setInterval(checkOpenTickets, INTERVAL_MS);
  if (typeof timer.unref === 'function') timer.unref();
}

function stop() {
  if (timer) clearInterval(timer);
  timer = null;
}

module.exports = { start, stop, checkOpenTickets };
