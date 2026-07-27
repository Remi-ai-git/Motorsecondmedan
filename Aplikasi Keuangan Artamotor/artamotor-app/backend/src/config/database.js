// =========================================================================
// Prisma Client Singleton
// =========================================================================
// Best practice: jangan buat `new PrismaClient()` di setiap file yang
// butuh akses database — itu akan membuka banyak koneksi DB terpisah
// dan bisa menghabiskan connection pool. Sebagai gantinya, buat SATU
// instance di sini lalu import `prisma` ini dari service/controller lain.
// =========================================================================

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === 'development'
      ? ['query', 'warn', 'error']
      : ['warn', 'error'],
});

// Menutup koneksi Prisma dengan rapi saat aplikasi dimatikan
// (mis. saat deploy ulang / restart server).
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

module.exports = prisma;
