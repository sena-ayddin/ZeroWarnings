// Tickets / SLA_Policies tablolarına erişim. SQL'ler Elif'in queries.sql dosyasıyla eşlenebilir.
const { pool, withTransaction } = require('../config/db');
const audit = require('./auditModel');

const toTicket = (r) => r && { ...r, sla_warning_sent: !!r.sla_warning_sent, is_escalated: !!r.is_escalated };

// ref: sayısal ticket_id veya INC-1024 / CHG-0872 gibi ticket_number
exports.findByRef = async (ref, conn = pool, forUpdate = false) => {
  const column = /^\d+$/.test(String(ref)) ? 'ticket_id' : 'ticket_number';
  const [rows] = await conn.query(`SELECT * FROM Tickets WHERE ${column} = ? LIMIT 1 ${forUpdate ? 'FOR UPDATE' : ''}`, [ref]);
  return toTicket(rows[0]) || null;
};

exports.list = async (userId = null) => {
  const [rows] = userId
    ? await pool.query('SELECT * FROM Tickets WHERE user_id = ? ORDER BY created_at DESC', [userId])
    : await pool.query('SELECT * FROM Tickets ORDER BY created_at DESC');
  return rows.map(toTicket);
};

exports.getSlaPolicy = async (priority) => {
  const [rows] = await pool.query(
    'SELECT * FROM SLA_Policies WHERE priority = ? AND is_active = TRUE ORDER BY sla_policy_id LIMIT 1', [priority]
  );
  return rows[0] || null;
};

// INC-1025, CHG-0872 ... mevcut en büyük numaranın bir fazlası (seed: INC-1024, dashboard: CHG-0871)
const nextNumber = async (conn, requestType) => {
  const prefix = requestType === 'Change Request' ? 'CHG' : 'INC';
  const [rows] = await conn.query(
    'SELECT MAX(CAST(SUBSTRING(ticket_number, 5) AS UNSIGNED)) AS maxNum FROM Tickets WHERE ticket_number LIKE ?',
    [`${prefix}-%`]
  );
  const next = Math.max(Number(rows[0].maxNum) || 0, prefix === 'CHG' ? 871 : 1023) + 1;
  return prefix === 'CHG' ? `CHG-${String(next).padStart(4, '0')}` : `INC-${next}`;
};

// Bileti ve audit kaydını tek transaction'da oluşturur; aynı anda aynı numara üretilirse yeniden dener.
// afterCreate(conn, ticket): aynı transaction içinde ek kayıt (örn. Change_Requests) yazmak için, isteğe bağlı.
exports.createWithAudit = async (data, afterCreate) => {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      return await withTransaction(async (conn) => {
        const ticket_number = await nextNumber(conn, data.request_type);
        const [result] = await conn.query('INSERT INTO Tickets SET ?', [{ ...data, ticket_number }]);
        await audit.log(conn, {
          user_id: data.user_id, entity_type: 'Ticket', entity_id: result.insertId, action: 'TICKET_CREATED',
          new_value: { ticket_number, priority: data.priority, category: data.category, request_type: data.request_type }
        });
        const ticket = await exports.findByRef(result.insertId, conn);
        if (afterCreate) await afterCreate(conn, ticket);
        return ticket;
      });
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY' && attempt < 4) continue;
      throw err;
    }
  }
};

exports.update = (conn, ticketId, fields) =>
  conn.query('UPDATE Tickets SET ? WHERE ticket_id = ?', [fields, ticketId]);

// --- KPI sorguları (FR-10) ---
exports.kpiCounts = async (monthStart) => {
  const [rows] = await pool.query(
    `SELECT
       COUNT(*) AS total_tickets,
       COALESCE(SUM(status IN ('Open','In Progress','Pending')), 0) AS open_tickets,
       COALESCE(SUM(status IN ('Resolved','Closed')), 0) AS resolved_tickets,
       COALESCE(SUM(status IN ('Resolved','Closed') AND resolved_at >= ?), 0) AS resolved_this_month,
       COALESCE(SUM(status IN ('Resolved','Closed') AND resolved_at IS NOT NULL
                    AND resolution_due_at IS NOT NULL AND resolved_at <= resolution_due_at), 0) AS resolved_on_time,
       COALESCE(SUM(status IN ('Open','In Progress','Pending')
                    AND resolution_due_at IS NOT NULL AND resolution_due_at < NOW()), 0) AS open_overdue
     FROM Tickets`,
    [monthStart]
  );
  return rows[0];
};

exports.resolvedTimes = async () => {
  const [rows] = await pool.query(
    "SELECT created_at, resolved_at FROM Tickets WHERE status IN ('Resolved','Closed') AND resolved_at IS NOT NULL"
  );
  return rows;
};