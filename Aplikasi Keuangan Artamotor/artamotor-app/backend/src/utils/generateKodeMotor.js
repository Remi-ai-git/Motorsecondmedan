// =========================================================================
// Generate kode bisnis motor, format: MTR-{TAHUN}-{URUT 4 digit}
// mis. "MTR-2026-0001". Dihitung dari jumlah motor yang sudah dibuat
// tahun berjalan. Kode ini yang tampil ke user, terpisah dari `id` (UUID)
// yang jadi primary key teknis.
// =========================================================================

const prisma = require('../config/database');

async function generateKodeMotor() {
  const year = new Date().getFullYear();
  const prefix = `MTR-${year}-`;

  const count = await prisma.motor.count({
    where: { kodeMotor: { startsWith: prefix } },
  });

  const urut = String(count + 1).padStart(4, '0');
  return `${prefix}${urut}`;
}

module.exports = generateKodeMotor;
