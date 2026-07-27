const express = require('express');
const controller = require('../controllers/penjualan.controller');
const validate = require('../middlewares/validate');
const { requireRole } = require('../middlewares/auth');
const { createPenjualanSchema, updatePenjualanSchema } = require('../validators/penjualan.validator');

const router = express.Router();

router.get('/', controller.list);
router.get('/:id', controller.detail);
router.post('/', validate(createPenjualanSchema), controller.create);
router.put('/:id', validate(updatePenjualanSchema), controller.update);
// Membatalkan transaksi penjualan hanya boleh ADMIN.
router.delete('/:id', requireRole('ADMIN'), controller.remove);

module.exports = router;
