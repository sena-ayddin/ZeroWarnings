// Sunucu giriş noktası ve global middleware konfigürasyonu
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { testConnection } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const kpiRoutes = require('./routes/kpiRoutes');
const changeRequestRoutes = require('./routes/changeRequestRoutes');
const { notFound, errorHandler } = require('./middlewares/errorHandler');

if (!process.env.JWT_SECRET) {
  console.warn('[UYARI] JWT_SECRET tanımlı değil, geliştirme anahtarı kullanılıyor. .env dosyası oluşturun!');
  process.env.JWT_SECRET = 'dev-only-secret';
}

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

app.get('/api/health', async (req, res) => {
  try {
    await testConnection();
    res.json({ status: 'ok', database: 'up', time: new Date().toISOString() });
  } catch (err) {
    res.status(503).json({ status: 'degraded', database: 'down', time: new Date().toISOString() });
  }
});
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/kpi', kpiRoutes);
app.use('/api/change-requests', changeRequestRoutes);
// Gülçin'in CSAT ve otomatik SLA izleme modülleri
require('./services/slaWorker').start();

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
if (require.main === module) {
  testConnection()
    .then((db) => console.log(`MySQL bağlantısı hazır: ${db}`))
    .catch((err) => console.error(`[HATA] MySQL'e bağlanılamadı (${err.code || err.message}). .env ayarlarını ve docs/DB_Setup_Guide.md adımlarını kontrol edin.`));
  app.listen(PORT, () => console.log(`IT Service Desk API http://localhost:${PORT} adresinde çalışıyor`));
}

module.exports = app;