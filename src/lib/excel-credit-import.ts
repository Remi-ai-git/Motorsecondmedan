import * as XLSX from "xlsx";

/**
 * Import konfigurasi simulasi kredit dari file Excel "Tools UMC SOF ..."
 * yang dikirim leasing setiap periode (biasanya tiap 3 bulan). Admin cukup
 * upload file dengan struktur yang sama (sheet "Tools" + "Sheet3") setiap
 * kali tarif berubah — tidak perlu edit kode.
 *
 * Parsing dibuat toleran per-field: kalau satu sel tidak ditemukan/berubah
 * bentuk, field itu di-skip (masuk daftar `warnings`) dan nilai lama di
 * credit_settings tetap dipakai, bukan bikin seluruh import gagal.
 */

export interface ParsedCreditSettings {
  min_dp_percent?: number;
  vehicle_insurance_rate_12?: number;
  vehicle_insurance_rate_24?: number;
  vehicle_insurance_rate_36?: number;
  vehicle_insurance_monthly_below_12?: number;
  vehicle_insurance_monthly_12_23?: number;
  vehicle_insurance_monthly_24_35?: number;
  vehicle_insurance_monthly_36_plus?: number;
  life_insurance_base_premium?: number;
  pgi_premium?: number;
  pgi_excluded_models?: string[];
  oona_premium?: number;
  admin_fee?: number;
  first_installment_discount?: number;
  financing_rates?: Record<string, number>;
  effective_until?: string;
}

export interface ImportResult {
  settings: ParsedCreditSettings;
  warnings: string[];
}

const TENOR_COLUMNS = ["N", "O", "P", "Q", "R", "S", "T", "U", "V", "W"];

function readNumber(
  ws: XLSX.WorkSheet,
  addr: string,
  label: string,
  warnings: string[]
): number | undefined {
  const cell = ws[addr];
  if (!cell || typeof cell.v !== "number" || Number.isNaN(cell.v)) {
    warnings.push(`Tidak bisa membaca "${label}" (sel ${addr}) — nilai lama dipertahankan.`);
    return undefined;
  }
  return cell.v;
}

function excelSerialToIsoDate(serial: number): string | undefined {
  const parsed = XLSX.SSF?.parse_date_code?.(serial);
  if (!parsed) return undefined;
  const mm = String(parsed.m).padStart(2, "0");
  const dd = String(parsed.d).padStart(2, "0");
  return `${parsed.y}-${mm}-${dd}`;
}

/** Parse formula PGI (Sheet3!X7): cari daftar model exclusion + nilai flat-nya. */
function parsePgiFormula(
  sheet3: XLSX.WorkSheet,
  tools: XLSX.WorkSheet,
  warnings: string[]
): { premium?: number; excludedModels?: string[] } {
  const cell = sheet3["X7"];
  if (!cell) {
    warnings.push('Tidak menemukan sel Premi PGI (Sheet3!X7) — nilai lama dipertahankan.');
    return {};
  }
  if (!cell.f) {
    // Tidak ada formula (mungkin diketik manual sebagai angka) — anggap flat, tanpa exclusion.
    if (typeof cell.v === "number") {
      warnings.push(
        "Premi PGI berupa angka tetap (bukan formula) — daftar model exclusion tidak berubah."
      );
      return { premium: cell.v };
    }
    warnings.push("Tidak bisa membaca Premi PGI (Sheet3!X7).");
    return {};
  }

  const refPattern = /Tools!\$?([A-Z]{1,3})\$?(\d+)/g;
  const refs = [...cell.f.matchAll(refPattern)].filter(
    (m) => !(m[1] === "H" && m[2] === "8") // buang referensi LHS (model yang lagi dipilih)
  );

  const excludedModels: string[] = [];
  for (const ref of refs) {
    const addr = `${ref[1]}${ref[2]}`;
    const value = tools[addr]?.v;
    if (typeof value === "string" && value.trim()) {
      excludedModels.push(value.trim().toUpperCase());
    }
  }

  const withoutRefs = cell.f.replace(refPattern, "");
  const numbers = [...withoutRefs.matchAll(/\d+(?:\.\d+)?/g)].map((m) => Number(m[0]));
  const premium = numbers.find((n) => n !== 0);

  if (premium === undefined) {
    warnings.push("Tidak bisa menentukan nominal Premi PGI dari formula — nilai lama dipertahankan.");
  }
  if (excludedModels.length === 0) {
    warnings.push("Tidak menemukan daftar model exclusion PGI dari formula.");
  }

  return { premium, excludedModels: excludedModels.length ? excludedModels : undefined };
}

/** Parse ambang DP minimum dari formula Tools!F20 (contoh: "...<15%..."). */
function parseMinDpPercent(tools: XLSX.WorkSheet, warnings: string[]): number | undefined {
  const formula = tools["F20"]?.f;
  if (!formula) {
    warnings.push("Tidak menemukan formula DP minimum (Tools!F20).");
    return undefined;
  }
  const match = formula.match(/<\s*(\d+(?:\.\d+)?)\s*%/);
  if (!match) {
    warnings.push("Tidak bisa membaca ambang DP minimum dari formula Tools!F20.");
    return undefined;
  }
  return Number(match[1]) / 100;
}

function parseFinancingRates(
  sheet3: XLSX.WorkSheet,
  tools: XLSX.WorkSheet,
  warnings: string[]
): Record<string, number> | undefined {
  const tenors = TENOR_COLUMNS.map((c) => sheet3[`${c}14`]?.v).filter(
    (v): v is number => typeof v === "number"
  );
  if (tenors.length !== TENOR_COLUMNS.length) {
    warnings.push("Header tenor di Sheet3 baris 14 tidak lengkap/berubah — tabel bunga tidak diupdate.");
    return undefined;
  }

  const targetYear = tools["D13"]?.v;
  let targetRow: number | undefined;
  const yearRows: { row: number; year: number }[] = [];
  for (let row = 15; row <= 23; row++) {
    const year = sheet3[`M${row}`]?.v;
    if (typeof year === "number") yearRows.push({ row, year });
  }
  if (typeof targetYear === "number") {
    targetRow = yearRows.find((r) => r.year === targetYear)?.row;
  }
  if (!targetRow) {
    targetRow = yearRows.sort((a, b) => b.year - a.year)[0]?.row ?? 15;
  }

  const rates: Record<string, number> = {};
  TENOR_COLUMNS.forEach((c, i) => {
    const value = sheet3[`${c}${targetRow}`]?.v;
    if (typeof value === "number") {
      rates[String(tenors[i])] = value;
    }
  });

  if (Object.keys(rates).length !== TENOR_COLUMNS.length) {
    warnings.push("Sebagian tabel bunga per tenor tidak terbaca — tabel bunga tidak diupdate.");
    return undefined;
  }
  return rates;
}

export function parseCreditToolsExcel(buffer: ArrayBuffer): ImportResult {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheet3 = workbook.Sheets["Sheet3"];
  const tools = workbook.Sheets["Tools"];

  if (!sheet3 || !tools) {
    throw new Error(
      'File tidak sesuai template — sheet "Tools" dan "Sheet3" tidak ditemukan. Pastikan upload file yang sama strukturnya dengan sebelumnya.'
    );
  }

  const warnings: string[] = [];
  const settings: ParsedCreditSettings = {};

  settings.vehicle_insurance_rate_12 = readNumber(sheet3, "R3", "Tarif asuransi kendaraan 12 bulan", warnings);
  settings.vehicle_insurance_rate_24 = readNumber(sheet3, "S3", "Tarif asuransi kendaraan 24 bulan", warnings);
  settings.vehicle_insurance_rate_36 = readNumber(sheet3, "T3", "Tarif asuransi kendaraan 36 bulan", warnings);
  settings.vehicle_insurance_monthly_below_12 = readNumber(sheet3, "R4", "Kenaikan bulanan <12 bulan", warnings);
  settings.vehicle_insurance_monthly_12_23 = readNumber(sheet3, "S4", "Kenaikan bulanan 12-23 bulan", warnings);
  settings.vehicle_insurance_monthly_24_35 = readNumber(sheet3, "T4", "Kenaikan bulanan 24-35 bulan", warnings);
  settings.vehicle_insurance_monthly_36_plus = readNumber(sheet3, "U4", "Kenaikan bulanan 36+ bulan", warnings);
  settings.life_insurance_base_premium = readNumber(sheet3, "X4", "Premi asuransi jiwa dasar", warnings);
  settings.admin_fee = readNumber(sheet3, "X6", "Biaya admin", warnings);
  settings.oona_premium = readNumber(sheet3, "X8", "Premi Oona", warnings);
  settings.first_installment_discount = readNumber(sheet3, "K27", "Potongan angsuran pertama", warnings);

  const pgi = parsePgiFormula(sheet3, tools, warnings);
  settings.pgi_premium = pgi.premium;
  settings.pgi_excluded_models = pgi.excludedModels;

  settings.min_dp_percent = parseMinDpPercent(tools, warnings);
  settings.financing_rates = parseFinancingRates(sheet3, tools, warnings);

  const expiryCell = tools["T7"];
  if (typeof expiryCell?.v === "number") {
    settings.effective_until = excelSerialToIsoDate(expiryCell.v);
    if (!settings.effective_until) {
      warnings.push("Tidak bisa membaca tanggal berakhir masa berlaku (Tools!T7).");
    }
  } else {
    warnings.push("Tidak menemukan tanggal berakhir masa berlaku (Tools!T7).");
  }

  // Buang field undefined supaya caller cukup spread ke settings lama.
  (Object.keys(settings) as (keyof ParsedCreditSettings)[]).forEach((key) => {
    if (settings[key] === undefined) delete settings[key];
  });

  return { settings, warnings };
}
