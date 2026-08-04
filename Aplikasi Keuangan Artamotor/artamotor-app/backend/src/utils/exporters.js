// =========================================================================
// Exporters — merender data laporan (yang sudah dihitung laporan.service.js)
// jadi file Excel (exceljs) atau PDF (pdfkit), langsung di-stream ke
// response Express. Dipisah dari laporan.service.js supaya logika
// perhitungan angka tidak bercampur dengan logika rendering dokumen.
// =========================================================================

const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const formatRupiah = require('./formatRupiah');

function tanggalID(date) {
  return new Date(date).toLocaleDateString('id-ID');
}

// -------------------------------------------------------------------------
// Laba per unit (rentang tanggal bebas)
// -------------------------------------------------------------------------

async function exportLabaPerUnitToExcel(res, { rows, totalLaba, periodeLabel = '' }) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Aplikasi Keuangan Artamotor';
  const sheet = workbook.addWorksheet('Laba per Unit');

  sheet.columns = [
    { header: 'Kode Motor', key: 'kodeMotor', width: 16 },
    { header: 'Merek', key: 'merek', width: 14 },
    { header: 'Tipe', key: 'tipe', width: 16 },
    { header: 'Tanggal Jual', key: 'tanggalPenjualan', width: 14 },
    { header: 'Harga Beli', key: 'hargaBeli', width: 16 },
    { header: 'Biaya Perbaikan', key: 'totalBiayaPerbaikan', width: 16 },
    { header: 'Harga Jual', key: 'hargaJual', width: 16 },
    { header: 'Laba/Rugi', key: 'laba', width: 16 },
  ];
  sheet.getRow(1).font = { bold: true };

  rows.forEach((r) => {
    sheet.addRow({ ...r, tanggalPenjualan: tanggalID(r.tanggalPenjualan) });
  });

  sheet.addRow({});
  const totalRow = sheet.addRow({ tipe: 'TOTAL', laba: totalLaba });
  totalRow.font = { bold: true };

  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  );
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="laba-per-unit${periodeLabel ? `-${periodeLabel}` : ''}.xlsx"`,
  );

  await workbook.xlsx.write(res);
  res.end();
}

function exportLabaPerUnitToPdf(res, { rows, totalLaba, periodeLabel = '' }) {
  const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="laba-per-unit${periodeLabel ? `-${periodeLabel}` : ''}.pdf"`,
  );
  doc.pipe(res);

  doc.fontSize(16).text('Laporan Laba/Rugi per Unit Motor', { align: 'center' });
  if (periodeLabel) {
    doc.fontSize(10).text(`Periode: ${periodeLabel}`, { align: 'center' });
  }
  doc.moveDown();

  const columns = [
    { key: 'kodeMotor', label: 'Kode', width: 75 },
    { key: 'merek', label: 'Merek', width: 75 },
    { key: 'tipe', label: 'Tipe', width: 95 },
    { key: 'tanggalPenjualan', label: 'Tgl Jual', width: 75 },
    { key: 'hargaBeli', label: 'Harga Beli', width: 100 },
    { key: 'totalBiayaPerbaikan', label: 'Biaya Perbaikan', width: 100 },
    { key: 'hargaJual', label: 'Harga Jual', width: 100 },
    { key: 'laba', label: 'Laba/Rugi', width: 100 },
  ];
  const startX = doc.page.margins.left;
  const tableWidth = columns.reduce((sum, c) => sum + c.width, 0);
  let y = doc.y;

  function drawRow(values, bold = false) {
    let x = startX;
    doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(9);
    columns.forEach((col, i) => {
      doc.text(String(values[i]), x, y, { width: col.width, align: i === 0 ? 'left' : 'right' });
      x += col.width;
    });
    y += 18;
  }

  drawRow(columns.map((c) => c.label), true);
  doc.moveTo(startX, y).lineTo(startX + tableWidth, y).stroke();
  y += 4;

  rows.forEach((r) => {
    if (y > doc.page.height - doc.page.margins.bottom - 40) {
      doc.addPage();
      y = doc.page.margins.top;
    }
    drawRow([
      r.kodeMotor,
      r.merek,
      r.tipe,
      tanggalID(r.tanggalPenjualan),
      formatRupiah(r.hargaBeli),
      formatRupiah(r.totalBiayaPerbaikan),
      formatRupiah(r.hargaJual),
      formatRupiah(r.laba),
    ]);
  });

  y += 6;
  doc.moveTo(startX, y).lineTo(startX + tableWidth, y).stroke();
  y += 10;
  doc.fontSize(11).font('Helvetica-Bold').text(`Total Laba/Rugi: Rp ${formatRupiah(totalLaba)}`, startX, y);

  doc.end();
}

// -------------------------------------------------------------------------
// Laba/Rugi bulanan (ringkasan + rincian penjualan + rincian pengeluaran)
// -------------------------------------------------------------------------

async function exportBulananToExcel(res, data) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Aplikasi Keuangan Artamotor';
  const sheet = workbook.addWorksheet(`Laba Rugi ${data.periode}`);

  sheet.addRow([`Laporan Laba/Rugi Bulanan — ${data.periode}`]).font = { bold: true, size: 14 };
  sheet.addRow([]);
  sheet.addRow(['Jumlah Unit Terjual', data.jumlahUnitTerjual]);
  sheet.addRow(['Total Laba Kotor', data.totalLabaKotor]);
  sheet.addRow(['Total Pengeluaran Operasional', data.totalPengeluaranOperasional]);
  sheet.addRow(['Laba Bersih', data.labaBersih]).font = { bold: true };
  sheet.addRow([]);

  sheet.addRow(['Rincian Penjualan']).font = { bold: true };
  sheet.addRow(['Kode Motor', 'Merek', 'Tipe', 'Tgl Jual', 'Harga Beli', 'Biaya Perbaikan', 'Harga Jual', 'Laba']).font = {
    bold: true,
  };
  data.rincianPenjualan.forEach((r) => {
    sheet.addRow([
      r.kodeMotor,
      r.merek,
      r.tipe,
      tanggalID(r.tanggalPenjualan),
      r.hargaBeli,
      r.totalBiayaPerbaikan,
      r.hargaJual,
      r.laba,
    ]);
  });
  sheet.addRow([]);

  sheet.addRow(['Rincian Pengeluaran Operasional']).font = { bold: true };
  sheet.addRow(['Tanggal', 'Kategori', 'Deskripsi', 'Jumlah']).font = { bold: true };
  data.rincianPengeluaran.forEach((p) => {
    sheet.addRow([tanggalID(p.tanggal), p.kategori, p.deskripsi, p.jumlah]);
  });

  [1, 2, 3, 4, 5, 6, 7, 8].forEach((i) => {
    sheet.getColumn(i).width = 18;
  });

  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  );
  res.setHeader('Content-Disposition', `attachment; filename="laba-rugi-${data.periode}.xlsx"`);

  await workbook.xlsx.write(res);
  res.end();
}

function exportBulananToPdf(res, data) {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="laba-rugi-${data.periode}.pdf"`);
  doc.pipe(res);

  doc.fontSize(16).text(`Laporan Laba/Rugi Bulanan — ${data.periode}`, { align: 'center' });
  doc.moveDown();

  doc.fontSize(11).font('Helvetica');
  doc.text(`Jumlah Unit Terjual: ${data.jumlahUnitTerjual}`);
  doc.text(`Total Laba Kotor: Rp ${formatRupiah(data.totalLabaKotor)}`);
  doc.text(`Total Pengeluaran Operasional: Rp ${formatRupiah(data.totalPengeluaranOperasional)}`);
  doc.font('Helvetica-Bold').text(`Laba Bersih: Rp ${formatRupiah(data.labaBersih)}`);
  doc.font('Helvetica');
  doc.moveDown();

  doc.fontSize(13).text('Rincian Penjualan', { underline: true });
  doc.moveDown(0.5);
  if (data.rincianPenjualan.length === 0) {
    doc.fontSize(9).text('Tidak ada penjualan pada periode ini.');
  }
  data.rincianPenjualan.forEach((r) => {
    doc
      .fontSize(9)
      .text(
        `${r.kodeMotor}  ${r.merek} ${r.tipe}  |  Jual: ${tanggalID(r.tanggalPenjualan)}  |  Laba: Rp ${formatRupiah(r.laba)}`,
      );
  });
  doc.moveDown();

  doc.fontSize(13).text('Rincian Pengeluaran Operasional', { underline: true });
  doc.moveDown(0.5);
  if (data.rincianPengeluaran.length === 0) {
    doc.fontSize(9).text('Tidak ada pengeluaran pada periode ini.');
  }
  data.rincianPengeluaran.forEach((p) => {
    doc
      .fontSize(9)
      .text(`${tanggalID(p.tanggal)}  ${p.kategori}  ${p.deskripsi}  |  Rp ${formatRupiah(p.jumlah)}`);
  });

  doc.end();
}

module.exports = {
  exportLabaPerUnitToExcel,
  exportLabaPerUnitToPdf,
  exportBulananToExcel,
  exportBulananToPdf,
};
