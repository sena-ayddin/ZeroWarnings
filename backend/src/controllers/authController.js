const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const { ApiError } = require('../middlewares/errorHandler');
const { ROLES } = require('../middlewares/authMiddleware');

const signToken = (user) =>
  jwt.sign({ id: user.user_id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '8h'
  });

const publicUser = (u) => ({ id: u.user_id, name: u.full_name, email: u.email, role: u.role });

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) throw new ApiError(400, 'email ve password zorunludur');

    const user = await userModel.findByEmail(String(email).trim());
    const ok = user && user.is_active && (await bcrypt.compare(password, user.password_hash));
    if (!ok) throw new ApiError(401, 'E-posta veya şifre hatalı');

    res.json({ success: true, token: signToken(user), user: publicUser(user) });
  } catch (err) { next(err); }
};

// Kayıt olan herkes Employee olur; rol yükseltme sadece veritabanından/Administrator tarafından yapılır.
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) throw new ApiError(400, 'name, email ve password zorunludur');
    if (String(password).length < 8) throw new ApiError(400, 'Şifre en az 8 karakter olmalı');
    if (await userModel.findByEmail(String(email).trim())) throw new ApiError(409, 'Bu e-posta zaten kayıtlı');

    const user = await userModel.create({
      full_name: String(name).trim(),
      email: String(email).trim(),
      password_hash: await bcrypt.hash(password, 10),
      role: ROLES.EMPLOYEE
    });
    res.status(201).json({ success: true, token: signToken(user), user: publicUser(user) });
  } catch (err) { next(err); }
};

exports.me = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user.id);
    if (!user) throw new ApiError(404, 'Kullanıcı bulunamadı');
    res.json({ success: true, user: publicUser(user) });
  } catch (err) { next(err); }
};