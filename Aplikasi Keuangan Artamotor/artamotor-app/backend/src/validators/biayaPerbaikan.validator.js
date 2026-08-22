const { z } = require('zod');

const createBiayaPerbaikanSchema = z.object({
  tanggal: z.coerce.date(),
  deskripsi: z.string().min(1, 'Deskripsi wajib diisi'),
  jumlahBiaya: z.coerce.number().positive('Jumlah biaya harus lebih dari 0'),
});

module.exports = { createBiayaPerbaikanSchema };
