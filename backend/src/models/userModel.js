const { pool } = require('../config/db');

exports.findByEmail = async (email) => {
  const [rows] = await pool.query('SELECT * FROM Users WHERE email = ? LIMIT 1', [email]);
  return rows[0] || null;
};

exports.findById = async (id, conn = pool) => {
  const [rows] = await conn.query('SELECT * FROM Users WHERE user_id = ? LIMIT 1', [id]);
  return rows[0] || null;
};

exports.create = async ({ full_name, email, password_hash, role }) => {
  const [result] = await pool.query(
    'INSERT INTO Users (full_name, email, password_hash, role) VALUES (?, ?, ?, ?)',
    [full_name, email, password_hash, role]
  );
  return exports.findById(result.insertId);
};
