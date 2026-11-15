// MySQL bağlantı havuzu (mysql2/promise) - geçici store.js yerine helpdesk_db kullanılır.
// Not: dotenv, app.js (veya script) tarafından bu dosyadan ÖNCE yüklenmiş olmalıdır.
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'helpdesk_db',
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4',
  timezone: 'Z' // JS Date <-> DATETIME dönüşümü UTC olarak yapılır
});

// Her bağlantıda oturum saat dilimi UTC: tarihler tutarlı saklanır, SLA hesabı Europe/Istanbul'a slaService'te çevrilir
pool.on('connection', (conn) => conn.query("SET time_zone = '+00:00'"));

// Birden fazla sorguyu tek işlem (transaction) olarak çalıştırır; hata olursa geri alır.
async function withTransaction(work) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await work(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function testConnection() {
  const [rows] = await pool.query('SELECT DATABASE() AS db');
  return rows[0].db;
}

module.exports = { pool, withTransaction, testConnection };