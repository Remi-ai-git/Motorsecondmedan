const pengeluaranService = require('../services/pengeluaran.service');

async function list(req, res) {
  const { startDate, endDate, kategori, page, limit } = req.query;
  const result = await pengeluaranService.listPengeluaran({
    startDate,
    endDate,
    kategori,
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
  });
  res.json({ success: true, ...result });
}

async function detail(req, res) {
  const item = await pengeluaranService.getPengeluaranById(req.params.id);
  res.json({ success: true, data: item });
}

async function create(req, res) {
  const item = await pengeluaranService.createPengeluaran(req.body);
  res.status(201).json({ success: true, data: item });
}

async function update(req, res) {
  const item = await pengeluaranService.updatePengeluaran(req.params.id, req.body);
  res.json({ success: true, data: item });
}

async function remove(req, res) {
  await pengeluaranService.deletePengeluaran(req.params.id);
  res.status(204).send();
}

module.exports = { list, detail, create, update, remove };
