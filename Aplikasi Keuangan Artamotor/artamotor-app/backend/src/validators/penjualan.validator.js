const { z } = require('zod');

const createPenjualanSchema = z
  .object({
    motorId: z.string().uuid('motorId tidak valid'),
    tanggalPenjualan: z.coerce.date(),
    hargaJual: z.coerce.number().positive('Harga jual harus lebih dari 0'),
    namaPembeli: z.string().min(1, 'Nama pembeli wajib diisi'),
    noTeleponPembeli: z.string().optional().nullable(),
    metodePembayaran: z.enum(['CASH', 'KREDIT']),
    namaLeasing: z.string().optional().nullable(),
    keterangan: z.string().optional().nullable(),
  })
  .refine((data) => data.metodePembayaran !== 'KREDIT' || !!data.namaLeasing, {
    message: 'Nama leasing wajib diisi jika metode pembayaran KREDIT',
    path: ['namaLeasing'],
  });

const updatePenjualanSchema = z.object({
  tanggalPenjualan: z.coerce.date().optional(),
  hargaJual: z.coerce.number().positive('Harga jual harus lebih dari 0').optional(),
  namaPembeli: z.string().min(1, 'Nama pembeli wajib diisi').optional(),
  noTeleponPembeli: z.string().optional().nullable(),
  metodePembayaran: z.enum(['CASH', 'KREDIT']).optional(),
  namaLeasing: z.string().optional().nullable(),
  keterangan: z.string().optional().nullable(),
});

module.exports = { createPenjualanSchema, updatePenjualanSchema };
