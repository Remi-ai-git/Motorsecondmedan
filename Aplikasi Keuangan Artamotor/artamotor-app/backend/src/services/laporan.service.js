// =========================================================================
// Laporan Service — implementasi rumus laba/rugi:
//
//   Laba per unit  = harga_jual - (harga_beli + SUM(biaya_perbaikan))
//   Laba bulanan   = SUM(laba per unit motor yang terjual bulan itu)
//                    - SUM(pengeluaran_operasional bulan itu)
//
// Semua perhitungan uang pakai Prisma.Decimal (bukan Number langsung)
// sampai tahap akhir, supaya tidak ada error pembulatan floating point
// saat menjumlahkan banyak baris biaya perbaikan / pengeluaran.
// =========================================================================

const { Prisma } = require('@prisma/client');
const prisma = require('../config/database');
const AppError = require('../utils/AppError');

function toNumber(decimal) {
  return decimal === null || decimal === undefined ? 0 : Number(decimal);
}

function sumDecimal(items, pick) {
  return items.reduce((sum, item) => sum.plus(pick(item)), new Prisma.Decimal(0));
}

/** Laba/rugi untuk satu motor spesifik (harus sudah terjual). */
async function labaPerUnitMotor(motorId) {
  const motor = await prisma.motor.findUnique({
    where: { id: motorId },
    include: { biayaPerbaikan: true, penjualan: true },
  });
  if (!motor) throw new AppError('Motor tidak ditemukan', 404);
  if (!motor.penjualan) {
    throw new AppError('Motor ini belum terjual, laba/rugi belum bisa dihitung', 400);
  }

  const totalBiayaPerbaikan = sumDecimal(motor.biayaPerbaikan, (b) => b.jumlahBiaya);
  const modal = new Prisma.Decimal(motor.hargaBeli).plus(totalBiayaPerbaikan);
  const laba = new Prisma.Decimal(motor.penjualan.hargaJual).minus(modal);

  return {
    motorId: motor.id,
    kodeMotor: motor.kodeMotor,
    merek: motor.merek,
    tipe: motor.tipe,
    tanggalPenjualan: motor.penjualan.tanggalPenjualan,
    hargaBeli: toNumber(motor.hargaBeli),
    totalBiayaPerbaikan: toNumber(totalBiayaPerbaikan),
    modal: toNumber(modal),
    hargaJual: toNumber(motor.penjualan.hargaJual),
    laba: toNumber(laba),
  };
}

/** Laba/rugi per unit untuk semua motor yang terjual dalam rentang tanggal. */
async function labaPerUnitDalamRentang({ startDate, endDate } = {}) {
  const where = {};
  if (startDate || endDate) {
    where.tanggalPenjualan = {};
    if (startDate) where.tanggalPenjualan.gte = new Date(startDate);
    if (endDate) where.tanggalPenjualan.lte = new Date(endDate);
  }

  const penjualanList = await prisma.penjualan.findMany({
    where,
    include: { motor: { include: { biayaPerbaikan: true } } },
    orderBy: { tanggalPenjualan: 'asc' },
  });

  const rows = penjualanList.map((p) => {
    const totalBiayaPerbaikan = sumDecimal(p.motor.biayaPerbaikan, (b) => b.jumlahBiaya);
    const modal = new Prisma.Decimal(p.motor.hargaBeli).plus(totalBiayaPerbaikan);
    const laba = new Prisma.Decimal(p.hargaJual).minus(modal);

    return {
      motorId: p.motor.id,
      kodeMotor: p.motor.kodeMotor,
      merek: p.motor.merek,
      tipe: p.motor.tipe,
      tanggalPenjualan: p.tanggalPenjualan,
      hargaBeli: toNumber(p.motor.hargaBeli),
      totalBiayaPerbaikan: toNumber(totalBiayaPerbaikan),
      hargaJual: toNumber(p.hargaJual),
      laba: toNumber(laba),
    };
  });

  const totalLaba = rows.reduce((sum, r) => sum + r.laba, 0);
  return { rows, totalLaba, jumlahUnit: rows.length };
}

/** Laba/rugi bulanan: laba kotor penjualan bulan itu dikurangi pengeluaran operasional bulan itu. */
async function labaRugiBulanan({ year, month }) {
  if (!year || !month || Number.isNaN(year) || Number.isNaN(month)) {
    throw new AppError('Parameter year dan month wajib diisi dan berupa angka', 400);
  }

  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 1)); // eksklusif, awal bulan berikutnya

  const { rows, totalLaba } = await labaPerUnitDalamRentang({
    startDate: start,
    endDate: new Date(end.getTime() - 1),
  });

  const pengeluaranList = await prisma.pengeluaranOperasional.findMany({
    where: { tanggal: { gte: start, lt: end } },
    orderBy: { tanggal: 'asc' },
  });
  const totalPengeluaran = pengeluaranList.reduce((sum, p) => sum + toNumber(p.jumlah), 0);

  return {
    periode: `${year}-${String(month).padStart(2, '0')}`,
    jumlahUnitTerjual: rows.length,
    totalLabaKotor: totalLaba,
    totalPengeluaranOperasional: totalPengeluaran,
    labaBersih: totalLaba - totalPengeluaran,
    rincianPenjualan: rows,
    rincianPengeluaran: pengeluaranList.map((p) => ({
      id: p.id,
      tanggal: p.tanggal,
      kategori: p.kategori,
      deskripsi: p.deskripsi,
      jumlah: toNumber(p.jumlah),
    })),
  };
}

/** Ringkasan untuk halaman Dashboard. */
async function dashboardSummary() {
  const now = new Date();
  const startOfMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));
  const startOfNextMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 1));

  const [totalMotorTersedia, penjualanBulanIni, pengeluaranBulanIni] = await Promise.all([
    prisma.motor.count({ where: { status: 'TERSEDIA' } }),
    prisma.penjualan.findMany({
      where: { tanggalPenjualan: { gte: startOfMonth, lt: startOfNextMonth } },
      include: { motor: { include: { biayaPerbaikan: true } } },
    }),
    prisma.pengeluaranOperasional.findMany({
      where: { tanggal: { gte: startOfMonth, lt: startOfNextMonth } },
    }),
  ]);

  const totalPendapatan = penjualanBulanIni.reduce((sum, p) => sum + toNumber(p.hargaJual), 0);
  const totalLabaKotor = penjualanBulanIni.reduce((sum, p) => {
    const totalBiaya = p.motor.biayaPerbaikan.reduce((s, b) => s + toNumber(b.jumlahBiaya), 0);
    const modal = toNumber(p.motor.hargaBeli) + totalBiaya;
    return sum + (toNumber(p.hargaJual) - modal);
  }, 0);
  const totalPengeluaran = pengeluaranBulanIni.reduce((sum, p) => sum + toNumber(p.jumlah), 0);

  return {
    totalMotorTersedia,
    totalMotorTerjualBulanIni: penjualanBulanIni.length,
    totalPendapatanBulanIni: totalPendapatan,
    estimasiLabaBersihBulanIni: totalLabaKotor - totalPengeluaran,
  };
}

module.exports = {
  labaPerUnitMotor,
  labaPerUnitDalamRentang,
  labaRugiBulanan,
  dashboardSummary,
};
