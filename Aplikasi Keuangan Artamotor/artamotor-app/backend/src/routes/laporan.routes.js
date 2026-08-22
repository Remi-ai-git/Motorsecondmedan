const express = require('express');
const controller = require('../controllers/laporan.controller');

const router = express.Router();

router.get('/dashboard', controller.dashboard);
router.get('/motor/:id', controller.labaPerUnitMotor);
router.get('/laba-per-unit', controller.labaPerUnitList);
router.get('/bulanan', controller.bulanan);

router.get('/export/laba-per-unit/excel', controller.exportLabaPerUnitExcel);
router.get('/export/laba-per-unit/pdf', controller.exportLabaPerUnitPdf);
router.get('/export/bulanan/excel', controller.exportBulananExcel);
router.get('/export/bulanan/pdf', controller.exportBulananPdf);

module.exports = router;
