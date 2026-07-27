const penjualanService = require('../services/penjualan.service');

async function list(req, res) {
  const { startDate, endDate, metodePembayaran, page, limit } = req.query;
  const result = await penjualanService.listPenjualan({
    startDate,
    endDate,
    metodePembayaran,
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
  });
  res.json({ success: true, ...result });
}

async function detail(req, res) {
  const penjualan = await penjualanService.getPenjualanById(req.params.id);
  res.json({ success: true, data: penjualan });
}

async function create(req, res) {
  const penjualan = await penjualanService.createPenjualan(req.body);
  res.status(201).json({ success: true, data: penjualan });
}

async function update(req, res) {
  const penjualan = await penjualanService.updatePenjualan(req.params.id, req.body);
  res.json({ success: true, data: penjualan });
}

async function remove(req, res) {
  await penjualanService.deletePenjualan(req.params.id);
  res.status(204).send();
}

module.exports = { list, detail, create, update, remove };
