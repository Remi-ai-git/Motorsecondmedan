// =========================================================================
// Middleware autentikasi & otorisasi berbasis JWT.
//
//   authenticate       — wajib ada header "Authorization: Bearer <token>"
//                         yang valid. Mengisi req.user = { id, email, role }.
//   requireRole(...roles) — dipasang SETELAH authenticate, menolak request
//                         kalau role user tidak termasuk daftar yang diizinkan.
// =========================================================================

const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    throw new AppError('Token otentikasi tidak ditemukan', 401);
  }

  const token = header.slice('Bearer '.length);

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.sub, email: payload.email, role: payload.role };
    next();
  } catch (err) {
    throw new AppError('Token tidak valid atau kedaluwarsa', 401);
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new AppError('Anda tidak memiliki akses untuk aksi ini', 403);
    }
    next();
  };
}

module.exports = { authenticate, requireRole };
