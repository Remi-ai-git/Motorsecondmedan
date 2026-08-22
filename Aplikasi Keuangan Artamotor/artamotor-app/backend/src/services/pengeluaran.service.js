// =========================================================================
// Pengeluaran Operasional Service — CRUD biaya showroom (sewa, listrik,
// gaji, iklan, dll), tidak terikat ke motor tertentu.
// =========================================================================

const prisma = require('../config/database');
const AppError = require('../utils/AppError');

async function listPengeluaran({ startDate, endDate, kategori, page = 1, limit = 20 } = {}) {
  const where = {};
  if (kategori) where.kategori = kategori;
  if (startDate || endDate) {
    where.tanggal = {};
    if (startDate) where.tanggal.gte = new Date(startDate);
    if (endDate) where.tanggal.lte = new Date(endDate);
  }

  const skip = (page - 1) * limit;
  const [data, total] = await prisma.$transaction([
    prisma.pengeluaranOperasional.findMany({
      where,
      skip,
      take: limit,
      orderBy: { tanggal: 'desc' },
    }),
    prisma.pengeluaranOperasional.count({ where }),
  ]);

  return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 } };
}

async function getPengeluaranById(id) {
  const item = await prisma.pengeluaranOperasional.findUnique({ where: { id } });
  if (!item) throw new AppError('Data pengeluaran tidak ditemukan', 404);
  return item;
}

async function createPengeluaran(data) {
  return prisma.pengeluaranOperasional.create({ data });
}

async function updatePengeluaran(id, data) {
  await getPengeluaranById(id);
  return prisma.pengeluaranOperasional.update({ where: { id }, data });
}

async function deletePengeluaran(id) {
  await getPengeluaranById(id);
  return prisma.pengeluaranOperasional.delete({ where: { id } });
}

module.exports = {
  listPengeluaran,
  getPengeluaranById,
  createPengeluaran,
  updatePengeluaran,
  deletePengeluaran,
};
