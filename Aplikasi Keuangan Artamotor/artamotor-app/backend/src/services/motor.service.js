// =========================================================================
// Motor Service — logika bisnis inventaris & biaya perbaikan.
// Tidak bergantung pada Express (req/res) sehingga mudah dites terpisah.
// =========================================================================

const prisma = require('../config/database');
const AppError = require('../utils/AppError');
const generateKodeMotor = require('../utils/generateKodeMotor');

async function listMotors({ status, search, page = 1, limit = 20 } = {}) {
  const where = {};
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { merek: { contains: search, mode: 'insensitive' } },
      { tipe: { contains: search, mode: 'insensitive' } },
      { platNomor: { contains: search, mode: 'insensitive' } },
      { kodeMotor: { contains: search, mode: 'insensitive' } },
    ];
  }

  const skip = (page - 1) * limit;
  const [data, total] = await prisma.$transaction([
    prisma.motor.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { biayaPerbaikan: true, penjualan: true },
    }),
    prisma.motor.count({ where }),
  ]);

  return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 } };
}

async function getMotorById(id) {
  const motor = await prisma.motor.findUnique({
    where: { id },
    include: {
      biayaPerbaikan: { orderBy: { tanggal: 'asc' } },
      penjualan: true,
    },
  });
  if (!motor) throw new AppError('Motor tidak ditemukan', 404);
  return motor;
}

async function createMotor(data) {
  // Retry beberapa kali kalau ada race condition saat generate kode_motor
  // (dua request create hampir bersamaan bisa dapat kode yang sama).
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const kodeMotor = await generateKodeMotor();
    try {
      // eslint-disable-next-line no-await-in-loop
      return await prisma.motor.create({ data: { ...data, kodeMotor } });
    } catch (err) {
      const isDuplicateKode = err.code === 'P2002' && err.meta?.target?.includes('kode_motor');
      if (!isDuplicateKode) throw err;
      // lanjut ke percobaan berikutnya
    }
  }
  throw new AppError('Gagal membuat kode motor unik, silakan coba lagi', 500);
}

async function updateMotor(id, data) {
  await getMotorById(id);
  return prisma.motor.update({ where: { id }, data });
}

async function deleteMotor(id) {
  const motor = await getMotorById(id);
  if (motor.status === 'TERJUAL') {
    throw new AppError('Motor yang sudah terjual tidak boleh dihapus dari inventaris', 400);
  }
  return prisma.motor.delete({ where: { id } });
}

async function addBiayaPerbaikan(motorId, data) {
  const motor = await getMotorById(motorId);
  if (motor.status === 'TERJUAL') {
    throw new AppError('Tidak bisa menambah biaya perbaikan untuk motor yang sudah terjual', 400);
  }
  return prisma.biayaPerbaikan.create({ data: { ...data, motorId } });
}

async function listBiayaPerbaikan(motorId) {
  await getMotorById(motorId);
  return prisma.biayaPerbaikan.findMany({ where: { motorId }, orderBy: { tanggal: 'asc' } });
}

async function deleteBiayaPerbaikan(motorId, biayaId) {
  const biaya = await prisma.biayaPerbaikan.findFirst({ where: { id: biayaId, motorId } });
  if (!biaya) throw new AppError('Data biaya perbaikan tidak ditemukan', 404);
  return prisma.biayaPerbaikan.delete({ where: { id: biayaId } });
}

module.exports = {
  listMotors,
  getMotorById,
  createMotor,
  updateMotor,
  deleteMotor,
  addBiayaPerbaikan,
  listBiayaPerbaikan,
  deleteBiayaPerbaikan,
};
