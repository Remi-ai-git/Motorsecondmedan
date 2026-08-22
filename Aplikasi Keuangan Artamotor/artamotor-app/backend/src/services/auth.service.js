// =========================================================================
// Auth Service — register, login, dan ambil profil sendiri.
// Password di-hash dengan bcrypt sebelum disimpan; tidak pernah menyimpan
// atau mengembalikan password asli/plain text ke client.
// =========================================================================

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');
const AppError = require('../utils/AppError');

const SALT_ROUNDS = 10;

function signToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' },
  );
}

function sanitizeUser(user) {
  const { passwordHash, ...safe } = user;
  return safe;
}

async function register({ nama, email, password, role }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new AppError('Email sudah terdaftar', 409);

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: { nama, email, passwordHash, role: role || 'STAFF' },
  });

  return { user: sanitizeUser(user), token: signToken(user) };
}

async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  // Pesan error sengaja sama untuk email tidak ditemukan & password salah,
  // supaya tidak bocor informasi email mana yang terdaftar.
  if (!user) throw new AppError('Email atau password salah', 401);

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new AppError('Email atau password salah', 401);

  return { user: sanitizeUser(user), token: signToken(user) };
}

async function getProfile(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError('User tidak ditemukan', 404);
  return sanitizeUser(user);
}

module.exports = { register, login, getProfile };
