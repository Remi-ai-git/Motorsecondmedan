// =========================================================================
// Express App — konfigurasi middleware & route mounting
// =========================================================================
// File ini sengaja dipisah dari server.js: `app.js` hanya merakit aplikasi
// Express (testable, bisa di-import tanpa benar-benar listen ke port),
// sedangkan server.js yang menjalankan http server-nya. Ini mempermudah
// automated testing di langkah berikutnya (mis. dengan supertest).
// =========================================================================

require('express-async-errors');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const apiRoutes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));

// Health check — dipakai untuk memastikan API & koneksi DB hidup
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// CRUD Motor, BiayaPerbaikan (nested), Penjualan, PengeluaranOperasional,
// plus Laporan (laba/rugi per unit & bulanan + export PDF/Excel).
app.use('/api', apiRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint tidak ditemukan' });
});

// Global error handler (menangkap error sinkron & async berkat express-async-errors)
app.use(errorHandler);

module.exports = app;
