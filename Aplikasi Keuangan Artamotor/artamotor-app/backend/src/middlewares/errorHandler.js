// =========================================================================
// Error handler terpusat. Menerjemahkan:
//  - AppError (error terkontrol dari service/controller) -> status & pesan aslinya
//  - Prisma error umum (unique constraint, FK constraint, not found) -> pesan ramah
//  - Error lain yang tak terduga -> 500 generik (detail lengkap tetap di-log ke console)
// =========================================================================

const { Prisma } = require('@prisma/client');
const AppError = require('../utils/AppError');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      details: err.details,
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: `Data duplikat pada field: ${err.meta?.target ?? 'tidak diketahui'}`,
      });
    }
    if (err.code === 'P2003') {
      return res.status(409).json({
        success: false,
        message: 'Operasi gagal karena data ini masih berelasi dengan data lain.',
      });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Data tidak ditemukan.',
      });
    }
  }

  console.error(err);
  return res.status(500).json({
    success: false,
    message: 'Terjadi kesalahan pada server.',
  });
}

module.exports = errorHandler;
