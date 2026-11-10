// Sunucu giriş noktası ve global middleware konfigürasyonu
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
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

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, () => console.log(`IT Service Desk API http://localhost:${PORT} adresinde çalışıyor`));
}

module.exports = app;