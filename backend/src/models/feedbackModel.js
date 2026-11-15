// Customer_Feedback tablosu: CSAT kayıtları ve ortalaması.
const { pool } = require('../config/db');

exports.findByTicketId = async (ticketId, conn = pool) => {
  const [rows] = await conn.query(
    'SELECT * FROM Customer_Feedback WHERE ticket_id = ? LIMIT 1', [ticketId]
  );
  return rows[0] || null;
};

exports.create = async (conn, { ticket_id, user_id, satisfaction_rating, comments }) => {
  const [result] = await conn.query(
    `INSERT INTO Customer_Feedback
      (ticket_id, user_id, satisfaction_rating, comments)
     VALUES (?, ?, ?, ?)`,
    [ticket_id, user_id, satisfaction_rating, comments || null]
  );
  const [rows] = await conn.query(
    'SELECT * FROM Customer_Feedback WHERE feedback_id = ?', [result.insertId]
  );
  return rows[0];
};

exports.getSummary = async () => {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS total_feedback,
            ROUND(AVG(satisfaction_rating), 2) AS average_csat
       FROM Customer_Feedback`
  );
  return {
    total_feedback: Number(rows[0].total_feedback) || 0,
    average_csat: rows[0].average_csat === null ? null : Number(rows[0].average_csat)
  };
};
