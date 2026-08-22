const express = require('express');
const controller = require('../controllers/motor.controller');
const validate = require('../middlewares/validate');
const { requireRole } = require('../middlewares/auth');
const { createMotorSchema, updateMotorSchema } = require('../validators/motor.validator');
const { createBiayaPerbaikanSchema } = require('../validators/biayaPerbaikan.validator');

const router = express.Router();

router.get('/', controller.list);
router.get('/:id', controller.detail);
router.post('/', validate(createMotorSchema), controller.create);
router.put('/:id', validate(updateMotorSchema), controller.update);
// Hapus data inventaris hanya boleh ADMIN — aksi destruktif pada data finansial.
router.delete('/:id', requireRole('ADMIN'), controller.remove);

router.get('/:id/biaya-perbaikan', controller.listBiaya);
router.post('/:id/biaya-perbaikan', validate(createBiayaPerbaikanSchema), controller.addBiaya);
router.delete('/:id/biaya-perbaikan/:biayaId', requireRole('ADMIN'), controller.removeBiaya);

module.exports = router;
