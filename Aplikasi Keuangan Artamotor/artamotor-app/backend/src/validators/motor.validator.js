const { z } = require('zod');

const currentYear = new Date().getFullYear();

const createMotorSchema = z.object({
  merek: z.string().min(1, 'Merek wajib diisi'),
  tipe: z.string().min(1, 'Tipe wajib diisi'),
  tahunPembuatan: z.coerce
    .number()
    .int('Tahun pembuatan harus bilangan bulat')
    .gte(1980, 'Tahun pembuatan tidak valid')
    .lte(currentYear + 1, 'Tahun pembuatan tidak valid'),
  platNomor: z.string().min(1, 'Plat nomor wajib diisi'),
  noRangka: z.string().optional().nullable(),
  noMesin: z.string().optional().nullable(),
  warna: z.string().optional().nullable(),
  hargaBeli: z.coerce.number().positive('Harga beli harus lebih dari 0'),
  tanggalMasuk: z.coerce.date().optional(),
  keterangan: z.string().optional().nullable(),
});

// Update: semua field opsional, ditambah `status` untuk koreksi manual bila
// perlu (mis. motor batal terjual). Perubahan status akibat transaksi jual
// normalnya terjadi otomatis lewat penjualan.service, bukan lewat endpoint ini.
const updateMotorSchema = createMotorSchema.partial().extend({
  status: z.enum(['TERSEDIA', 'TERJUAL']).optional(),
});

module.exports = { createMotorSchema, updateMotorSchema };
