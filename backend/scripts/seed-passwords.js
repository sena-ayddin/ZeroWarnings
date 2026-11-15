// seed.sql'deki örnek kullanıcıların password_hash değerleri gerçek bcrypt hash'i değildir,
// bu yüzden giriş yapılamaz. Bu betik test şifrelerini bcrypt ile yazar:
//   node scripts/seed-passwords.js
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool } = require('../src/config/db');

const accounts = [
  ['ahmet@iku.edu.tr', 'Emp123!'],      // Employee
  ['mehmet@iku.edu.tr', 'Tech123!'],    // Technician
  ['elif@iku.edu.tr', 'Admin123!']      // Administrator
];

(async () => {
  for (const [email, password] of accounts) {
    const [r] = await pool.query('UPDATE Users SET password_hash = ? WHERE email = ?', [await bcrypt.hash(password, 10), email]);
    console.log(`${email}: ${r.affectedRows ? 'güncellendi' : 'kullanıcı bulunamadı (seed.sql çalıştı mı?)'}`);
  }
  await pool.end();
})().catch((e) => { console.error('Hata:', e.message); process.exit(1); });