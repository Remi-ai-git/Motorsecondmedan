/**
 * Master daftar "Asset Brand Group" (nama model) sesuai tabel leasing
 * (Tools UMC SOF — sheet "Tools", kolom AO/AP/AQ/AR). Nilai-nilai ini
 * dipakai leasing untuk cocokkan aturan PGI (Sheet3!X7) dan tabel harga
 * referensi per merek+tahun.
 *
 * Kenapa harus persis sama: kalau admin salah ketik nama model (misal
 * "CBR250" tanpa spasi), sistem tidak akan mengenali motor itu masuk
 * daftar exclusion PGI, sehingga premi PGI yang dihitung salah. Makanya
 * field Model di form admin dibuat dropdown dari daftar ini, bukan teks
 * bebas, untuk brand yang didukung leasing ini.
 *
 * Catatan: leasing ini hanya mendukung 4 merek di bawah. Kalau motor di
 * luar 4 merek ini (misal Suzuki, TVS, dll), pilih Brand "Lainnya" — Model
 * jadi teks bebas dan premi PGI dihitung dengan tarif flat standar (tidak
 * ada exclusion yang berlaku karena memang di luar daftar leasing ini).
 *
 * Update tiap ganti periode (~3 bulan): kalau leasing mengirim daftar
 * model baru, update array di bawah supaya tetap sinkron dengan file Excel
 * "Tools" terbaru.
 */
export const MOTOR_MODEL_CATALOG: Record<string, string[]> = {
  HONDA: [
    "ADV 150",
    "ADV 160",
    "BEAT POP",
    "BEAT SPORTY",
    "BLADE",
    "CB",
    "CBR 150",
    "CBR 250",
    "CRF 150",
    "CRF 250",
    "GENIO 110",
    "MEGA PRO",
    "NEW CB",
    "NEW PCX",
    "PCX",
    "REVO",
    "SCOOPY",
    "SH 150",
    "SONIC",
    "SPACY",
    "STYLO 160",
    "SUPRA X 125",
    "SUPRA X 150",
    "VARIO 110",
    "VARIO 125",
    "VARIO 150",
    "VARIO 160",
    "VERZA",
  ],
  KAWASAKI: [
    "ATHLETE",
    "D-TRACKERX 150",
    "D-TRACKERX 250",
    "ESTRELLA",
    "KLX 140",
    "KLX 150",
    "KLX 230",
    "KLX 250",
    "KSR",
    "NINJA < 150",
    "NINJA 150",
    "NINJA 250",
    "VERSYS",
    "W 175",
    "W 250",
  ],
  YAMAHA: [
    "AEROX",
    "AEROX 150",
    "BYSON",
    "FAZZIO 125",
    "FORCE",
    "FREEGO",
    "GEAR 125",
    "GRAND FILANO",
    "JUPITER MX 135",
    "JUPITER MX 150",
    "JUPITER Z",
    "LEXI",
    "MIO",
    "MIO FINO 115",
    "MIO FINO 125",
    "MIO GT",
    "MIO J",
    "MIO LPM",
    "MIO M3 125",
    "MIO S",
    "MIO SOUL GT",
    "MIO STD",
    "MIO Z",
    "MX KING 150",
    "NMAX",
    "SCORPIO",
    "VEGA",
    "ViXION",
    "WR 150",
    "XABRE",
    "XEON",
    "XMAX",
    "X-RIDE",
    "XSR 150",
    "YZF 150",
    "YZF 250",
  ],
  PIAGGIO: ["GTS", "LX", "VESPA"],
};

/** Brand yang didukung tabel leasing (punya daftar model resmi). */
export const SUPPORTED_CREDIT_BRANDS = Object.keys(MOTOR_MODEL_CATALOG);

export const OTHER_BRAND_OPTION = "Lainnya";

export const BRAND_OPTIONS = [...SUPPORTED_CREDIT_BRANDS, OTHER_BRAND_OPTION];

export function modelsForBrand(brand: string): string[] {
  return MOTOR_MODEL_CATALOG[brand.toUpperCase()] ?? [];
}
