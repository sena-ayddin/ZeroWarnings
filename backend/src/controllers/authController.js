const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { users, nextUserId } = require('../models/store');
const { ApiError } = require('../middlewares/errorHandler');
const { ROLES } = require('../middlewares/authMiddleware');

const signToken = (user) =>
  jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '8h'
  });

const publicUser = ({ id, name, email, role }) => ({ id, name, email, role });

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) throw new ApiError(400, 'email ve password zorunludur');

    const user = users.find((u) => u.email.toLowerCase() === String(email).toLowerCase());
    const ok = user && (await bcrypt.compare(password, user.passwordHash));
    if (!ok) throw new ApiError(401, 'E-posta veya şifre hatalı');

    res.json({ success: true, token: signToken(user), user: publicUser(user) });
  } catch (err) { next(err); }
};

// Kayıt olan herkes Employee olur; rol yükseltme sadece Administrator tarafından yapılabilir.
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) throw new ApiError(400, 'name, email ve password zorunludur');
    if (String(password).length < 8) throw new ApiError(400, 'Şifre en az 8 karakter olmalı');
    if (users.some((u) => u.email.toLowerCase() === String(email).toLowerCase())) {
      throw new ApiError(409, 'Bu e-posta zaten kayıtlı');
    }
    const user = {
      id: nextUserId(), name, email,
      passwordHash: await bcrypt.hash(password, 10),
      role: ROLES.EMPLOYEE
    };
    users.push(user);
    res.status(201).json({ success: true, token: signToken(user), user: publicUser(user) });
  } catch (err) { next(err); }
};

exports.me = (req, res, next) => {
  const user = users.find((u) => u.id === req.user.id);
  if (!user) return next(new ApiError(404, 'Kullanıcı bulunamadı'));
  res.json({ success: true, user: publicUser(user) });
};