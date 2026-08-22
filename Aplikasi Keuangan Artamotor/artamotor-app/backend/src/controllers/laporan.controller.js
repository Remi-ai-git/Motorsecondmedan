const laporanService = require('../services/laporan.service');
const exporters = require('../utils/exporters');

function buildPeriodeLabel(startDate, endDate) {
  if (!startDate && !endDate) return '';
  return `${startDate || 'awal'}_sd_${endDate || 'sekarang'}`;
}

async function dashboard(req, res) {
  const data = await laporanService.dashboardSummary();
  res.json({ success: true, data });
}

async function labaPerUnitMotor(req, res) {
  const data = await laporanService.labaPerUnitMotor(req.params.id);
  res.json({ success: true, data });
}

async function labaPerUnitList(req, res) {
  const { startDate, endDate } = req.query;
  const data = await laporanService.labaPerUnitDalamRentang({ startDate, endDate });
  res.json({ success: true, data });
}

async function bulanan(req, res) {
  const { year, month } = req.query;
  const data = await laporanService.labaRugiBulanan({ year: Number(year), month: Number(month) });
  res.json({ success: true, data });
}

async function exportLabaPerUnitExcel(req, res) {
  const { startDate, endDate } = req.query;
  const data = await laporanService.labaPerUnitDalamRentang({ startDate, endDate });
  await exporters.exportLabaPerUnitToExcel(res, { ...data, periodeLabel: buildPeriodeLabel(startDate, endDate) });
}

async function exportLabaPerUnitPdf(req, res) {
  const { startDate, endDate } = req.query;
  const data = await laporanService.labaPerUnitDalamRentang({ startDate, endDate });
  exporters.exportLabaPerUnitToPdf(res, { ...data, periodeLabel: buildPeriodeLabel(startDate, endDate) });
}

async function exportBulananExcel(req, res) {
  const { year, month } = req.query;
  const data = await laporanService.labaRugiBulanan({ year: Number(year), month: Number(month) });
  await exporters.exportBulananToExcel(res, data);
}

async function exportBulananPdf(req, res) {
  const { year, month } = req.query;
  const data = await laporanService.labaRugiBulanan({ year: Number(year), month: Number(month) });
  exporters.exportBulananToPdf(res, data);
}

module.exports = {
  dashboard,
  labaPerUnitMotor,
  labaPerUnitList,
  bulanan,
  exportLabaPerUnitExcel,
  exportLabaPerUnitPdf,
  exportBulananExcel,
  exportBulananPdf,
};
