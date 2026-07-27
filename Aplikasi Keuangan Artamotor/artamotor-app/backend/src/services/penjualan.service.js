// =========================================================================
// Penjualan Service — mencatat transaksi jual & menjaga konsistensi status
// motor. Membuat/menghapus penjualan SELALU dalam satu transaksi DB
// bersama perubahan status motor, supaya keduanya tidak pernah "nyasar"
// (mis. motor tercatat TERJUAL padahal record penjualannya gagal dibuat).
// =========================================================================

const prisma = require('../config/database');
const AppError = require('../utils/AppError');

async function listPenjualan({ startDate, endDate, metodePembayaran, page = 1, limit = 20 } = {}) {
  const where = {};
  if (metodePembayaran) where.metodePembayaran = metodePembayaran;
  if (startDate || endDate) {
    where.tanggalPenjualan = {};
    if (startDate) where.tanggalPenjualan.gte = new Date(startDate);
    if (endDate) where.tanggalPenjualan.lte = new Date(endDate);
  }

  const skip = (page - 1) * limit;
  const [data, total] = await prisma.$transaction([
    prisma.penjualan.findMany({
      where,
      skip,
      take: limit,
      orderBy: { tanggalPenjualan: 'desc' },
      include: { motor: true },
    }),
    prisma.penjualan.count({ where }),
  ]);

  return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 } };
}

async function getPenjualanById(id) {
  const penjualan = await prisma.penjualan.findUnique({
    where: { id },
    include: { motor: { include: { biayaPerbaikan: true } } },
  });
  if (!penjualan) throw new AppError('Data penjualan tidak ditemukan', 404);
  return penjualan;
}

async function createPenjualan(data) {
  const { motorId, ...rest } = data;

  return prisma.$transaction(async (tx) => {
    const motor = await tx.motor.findUnique({ where: { id: motorId } });
    if (!motor) throw new AppError('Motor tidak ditemukan', 404);
    if (motor.status === 'TERJUAL') {
      throw new AppError('Motor ini sudah tercatat terjual sebelumnya', 409);
    }

    const penjualan = await tx.penjualan.create({ data: { motorId, ...rest } });
    await tx.motor.update({ where: { id: motorId }, data: { status: 'TERJUAL' } });

    return penjualan;
  });
}

async function updatePenjualan(id, data) {
  await getPenjualanById(id);
  return prisma.penjualan.update({ where: { id }, data });
}

async function deletePenjualan(id) {
  const penjualan = await getPenjualanById(id);

  return prisma.$transaction(async (tx) => {
    await tx.penjualan.delete({ where: { id } });
    // Batal jual -> motor kembali berstatus tersedia
    await tx.motor.update({ where: { id: penjualan.motorId }, data: { status: 'TERSEDIA' } });
  });
}

module.exports = {
  listPenjualan,
  getPenjualanById,
  createPenjualan,
  updatePenjualan,
  deletePenjualan,
};
