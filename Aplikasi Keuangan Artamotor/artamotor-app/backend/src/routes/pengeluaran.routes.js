const express = require('express');
const controller = require('../controllers/pengeluaran.controller');
const validate = require('../middlewares/validate');
const { requireRole } = require('../middlewares/auth');
const { createPengeluaranSchema, updatePengeluaranSchema } = require('../validators/pengeluaran.validator');

const router = express.Router();

router.get('/', controller.list);
router.get('/:id', controller.detail);
router.post('/', validate(createPengeluaranSchema), controller.create);
router.put('/:id', validate(updatePengeluaranSchema), controller.update);
// Hapus catatan pengeluaran hanya boleh ADMIN.
router.delete('/:id', requireRole('ADMIN'), controller.remove);

module.exports = router;
