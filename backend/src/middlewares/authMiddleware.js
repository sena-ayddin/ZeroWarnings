// JWT doğrulama (authenticate) ve rol bazlı yetkilendirme (authorize - RBAC)
const jwt = require('jsonwebtoken');
const { ApiError } = require('./errorHandler');

const ROLES = { EMPLOYEE: 'Employee', TECHNICIAN: 'Technician', ADMIN: 'Administrator' };

const authenticate = (req, res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(new ApiError(401, "Yetkilendirme token'ı gerekli (Authorization: Bearer <token>)"));
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.id, email: payload.email, role: payload.role };
    next();
  } catch (err) {
    const msg = err.name === 'TokenExpiredError' ? 'Token süresi dolmuş' : 'Geçersiz token';
    next(new ApiError(401, msg));
  }
};

const authorize = (...allowedRoles) => (req, res, next) => {
  if (!req.user) return next(new ApiError(401, 'Kimlik doğrulaması yapılmamış'));
  if (!allowedRoles.includes(req.user.role)) {
    return next(new ApiError(403, `Bu işlem için yetkiniz yok (gerekli rol: ${allowedRoles.join(', ')})`));
  }
  next();
};

module.exports = { authenticate, authorize, ROLES };