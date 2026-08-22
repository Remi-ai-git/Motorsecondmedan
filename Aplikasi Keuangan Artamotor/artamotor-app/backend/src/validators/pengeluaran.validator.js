const { z } = require('zod');

const KATEGORI = [
  'SEWA_TEMPAT',
  'LISTRIK',
  'GAJI_PEGAWAI',
  'IKLAN',
  'PERAWATAN_SHOWROOM',
  'LAIN_LAIN',
];

const createPengeluaranSchema = z.object({
  tanggal: z.coerce.date(),
  kategori: z.enum(KATEGORI),
  deskripsi: z.string().min(1, 'Deskripsi wajib diisi'),
  jumlah: z.coerce.number().positive('Jumlah harus lebih dari 0'),
});

const updatePengeluaranSchema = createPengeluaranSchema.partial();

module.exports = { createPengeluaranSchema, updatePengeluaranSchema, KATEGORI };
