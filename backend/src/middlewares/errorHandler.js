// Global hata yönetimi: standart HTTP hata yanıtları

class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

const notFound = (req, res, next) => {
  next(new ApiError(404, `Rota bulunamadı: ${req.method} ${req.originalUrl}`));
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let status = err.status || 500;
  let message = err.message || 'Sunucu hatası';

  if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'Geçersiz JSON gövdesi';
  }
  if (err.code === 'ER_DUP_ENTRY') {
    status = 409;
    message = 'Kayıt zaten mevcut';
  } else if (['ECONNREFUSED', 'PROTOCOL_CONNECTION_LOST', 'ER_ACCESS_DENIED_ERROR', 'ER_BAD_DB_ERROR'].includes(err.code)) {
    status = 503;
    message = 'Veritabanına ulaşılamıyor';
  }
  if (status === 500) console.error(err);

  res.status(status).json({
    success: false,
    error: { status, message, ...(err.details && { details: err.details }) }
  });
};

module.exports = { ApiError, notFound, errorHandler };