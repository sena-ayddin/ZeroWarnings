// Change_Requests tablosu (FR-04, ISO 9001 Madde 8.5.6). Her talep bir CHG-xxxx biletine bağlıdır.
const { pool } = require('../config/db');

const BASE = `SELECT cr.*, t.ticket_number, t.priority, t.status AS ticket_status, t.assigned_to
                FROM Change_Requests cr
                JOIN Tickets t ON t.ticket_id = cr.ticket_id`;

// ref: sayısal change_id veya CHG-0872 gibi bilet numarası
exports.findByRef = async (ref, conn = pool, forUpdate = false) => {
  const where = /^\d+$/.test(String(ref)) ? 'cr.change_id = ?' : 't.ticket_number = ?';
  const [rows] = await conn.query(`${BASE} WHERE ${where} LIMIT 1 ${forUpdate ? 'FOR UPDATE' : ''}`, [ref]);
  return rows[0] || null;
};

exports.list = async (requestedBy = null) => {
  const [rows] = requestedBy
    ? await pool.query(`${BASE} WHERE cr.requested_by = ? ORDER BY cr.created_at DESC`, [requestedBy])
    : await pool.query(`${BASE} ORDER BY cr.created_at DESC`);
  return rows;
};

exports.create = (conn, fields) => conn.query('INSERT INTO Change_Requests SET ?', [fields]);

exports.update = (conn, changeId, fields) =>
  conn.query('UPDATE Change_Requests SET ? WHERE change_id = ?', [fields, changeId]);