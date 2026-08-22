// =========================================================================
// Seed data — contoh data awal untuk development/testing
// Jalankan dengan: npm run prisma:seed
// =========================================================================

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  // Akun admin awal — supaya ada login pertama sebelum ada UI registrasi.
  // GANTI PASSWORD INI setelah login pertama kali di produksi.
  const adminPasswordHash = await bcrypt.hash('Admin123!', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@artamotor.test' },
    update: {},
    create: {
      nama: 'Admin ArtaMotor',
      email: 'admin@artamotor.test',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
    },
  });

  const motor1 = await prisma.motor.create({
    data: {
      kodeMotor: 'MTR-2026-0001',
      merek: 'Honda',
      tipe: 'Beat FI',
      tahunPembuatan: 2021,
      platNomor: 'B 1234 XYZ',
      hargaBeli: 9500000,
      status: 'TERSEDIA',
      biayaPerbaikan: {
        create: [
          { tanggal: new Date('2026-07-01'), deskripsi: 'Ganti oli & servis', jumlahBiaya: 150000 },
          { tanggal: new Date('2026-07-02'), deskripsi: 'Cat ulang bodi', jumlahBiaya: 350000 },
        ],
      },
    },
  });

  const motor2 = await prisma.motor.create({
    data: {
      kodeMotor: 'MTR-2026-0002',
      merek: 'Yamaha',
      tipe: 'NMAX',
      tahunPembuatan: 2020,
      platNomor: 'B 5678 ABC',
      hargaBeli: 21000000,
      status: 'TERJUAL',
      penjualan: {
        create: {
          tanggalPenjualan: new Date('2026-07-10'),
          hargaJual: 24500000,
          namaPembeli: 'Budi Santoso',
          metodePembayaran: 'CASH',
        },
      },
    },
  });

  await prisma.pengeluaranOperasional.createMany({
    data: [
      { tanggal: new Date('2026-07-01'), kategori: 'SEWA_TEMPAT', deskripsi: 'Sewa showroom Juli', jumlah: 3000000 },
      { tanggal: new Date('2026-07-05'), kategori: 'GAJI_PEGAWAI', deskripsi: 'Gaji 2 pegawai', jumlah: 6000000 },
      { tanggal: new Date('2026-07-08'), kategori: 'IKLAN', deskripsi: 'Iklan Facebook Ads', jumlah: 500000 },
    ],
  });

  console.log('Seed selesai:', {
    admin: admin.email,
    motor1: motor1.kodeMotor,
    motor2: motor2.kodeMotor,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
