const motorService = require('../services/motor.service');

async function list(req, res) {
  const { status, search, page, limit } = req.query;
  const result = await motorService.listMotors({
    status,
    search,
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
  });
  res.json({ success: true, ...result });
}

async function detail(req, res) {
  const motor = await motorService.getMotorById(req.params.id);
  res.json({ success: true, data: motor });
}

async function create(req, res) {
  const motor = await motorService.createMotor(req.body);
  res.status(201).json({ success: true, data: motor });
}

async function update(req, res) {
  const motor = await motorService.updateMotor(req.params.id, req.body);
  res.json({ success: true, data: motor });
}

async function remove(req, res) {
  await motorService.deleteMotor(req.params.id);
  res.status(204).send();
}

async function addBiaya(req, res) {
  const biaya = await motorService.addBiayaPerbaikan(req.params.id, req.body);
  res.status(201).json({ success: true, data: biaya });
}

async function listBiaya(req, res) {
  const biaya = await motorService.listBiayaPerbaikan(req.params.id);
  res.json({ success: true, data: biaya });
}

async function removeBiaya(req, res) {
  await motorService.deleteBiayaPerbaikan(req.params.id, req.params.biayaId);
  res.status(204).send();
}

module.exports = { list, detail, create, update, remove, addBiaya, listBiaya, removeBiaya };
