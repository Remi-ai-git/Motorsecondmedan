const express = require('express');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

// Publik — register & login tidak butuh token.
router.use('/auth', require('./auth.routes'));

// Semua route di bawah ini WAJIB login (header "Authorization: Bearer <token>").
router.use(authenticate);

router.use('/motors', require('./motor.routes'));
router.use('/penjualan', require('./penjualan.routes'));
router.use('/pengeluaran', require('./pengeluaran.routes'));
router.use('/laporan', require('./laporan.routes'));

module.exports = router;
