require('dotenv').config();
const app = require('./src/app');
const prisma = require('./src/config/database');

const PORT = process.env.PORT || 4000;

async function main() {
  // Cek koneksi database sebelum server mulai menerima request
  await prisma.$connect();
  console.log('Koneksi database berhasil.');

  app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error('Gagal menjalankan server:', err);
  process.exit(1);
});
