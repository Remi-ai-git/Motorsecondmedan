/**
 * Master daftar "Type" (varian/trim) per Brand+Model, diambil dari kolom
 * "Asset Brand Item Desc" (Sheet2) di file Excel "Tools UMC SOF SUMUT Area
 * with PGI & Oona Insurance" yang sama dengan sumber Brand+Model
 * (motor-model-catalog.ts). Dipakai supaya admin pilih Type dari dropdown
 * resmi, bukan ketik bebas — konsisten dengan penamaan leasing.
 *
 * Kalau Model yang dipilih tidak ada di daftar ini (model baru/belum
 * terdaftar), form otomatis fallback ke input teks bebas untuk Type.
 */
export const MOTOR_TYPE_CATALOG: Record<string, Record<string, string[]>> = 
{
  "HONDA": {
    "ADV 150": [
      "ADV 150 ABS",
      "ADV 150 CBS"
    ],
    "ADV 160": [
      "ADV 160 ABS",
      "ADV 160 ABS ROADSYNC",
      "ADV 160 CBS"
    ],
    "BEAT SPORTY": [
      "ALL NEW BEAT CBS",
      "ALL NEW BEAT CBS ISS",
      "ALL NEW BEAT CBS ISS DELUXE",
      "ALL NEW BEAT DELUXE SMART KEY",
      "ALL NEW BEAT STREET",
      "ALL NEW BEAT STREET ANTI THEFT",
      "ALL NEW HONDA BEAT ESP CBS",
      "ALL NEW HONDA BEAT ESP CBS ISS",
      "ALL NEW HONDA BEAT ESP CW",
      "NEW BEAT",
      "NEW BEAT ESP CBS",
      "NEW BEAT ESP CBS ISS",
      "NEW BEAT ESP CW",
      "NEW BEAT STREET ESP"
    ],
    "NEW CB": [
      "ALL NEW CB 150R STREET FIRE",
      "ALL NEW CB 150R STREET FIRE REPSOL",
      "ALL NEW CB 150R STREET FIRE SE",
      "CB 150R STREETFIRE",
      "CB 150X",
      "CB 150X SE"
    ],
    "CBR 150": [
      "ALL NEW CBR 150R ABS RACING RED",
      "ALL NEW CBR 150R ABS REPSOL",
      "ALL NEW CBR 150R ABS STD",
      "ALL NEW CBR 150R ABS TRICOLOR",
      "ALL NEW CBR 150R RACING RED",
      "ALL NEW CBR 150R REPSOL",
      "ALL NEW CBR 150R STD",
      "ALL NEW CBR 150R TRICOLOR",
      "CBR 150 R",
      "CBR 150 R MMC",
      "CBR 150 R REPSOL",
      "CBR 150 R REPSOL MMC"
    ],
    "CBR 250": [
      "ALL NEW CBR 250R ABS MMC REPSOL",
      "ALL NEW CBR 250R ABS MMC STD",
      "ALL NEW CBR 250R MMC REPSOL",
      "ALL NEW CBR 250R MMC STD",
      "ALL NEW CBR 250RR",
      "ALL NEW CBR 250RR ABS SP",
      "ALL NEW CBR 250RR ABS SP QS",
      "ALL NEW CBR 250RR ABS SP QS RACING RED",
      "ALL NEW CBR 250RR ABS SP QS TRICOLOR",
      "ALL NEW CBR 250RR ABS TRICOLOR",
      "CBR 250R",
      "CBR 250R (ABS)",
      "CBR 250R ABS REPSOL",
      "CBR 250R REPSOL",
      "NEW CBR 250 R",
      "NEW CBR 250 R ABS",
      "NEW CBR 250 RR REPSOL",
      "NEW CBR 250 RR SE"
    ],
    "BEAT POP": [
      "ALL NEW HONDA BEAT ESP POP CBS",
      "ALL NEW HONDA BEAT ESP POP CBS COMIC",
      "ALL NEW HONDA BEAT ESP POP CBS ISS",
      "ALL NEW HONDA BEAT ESP POP CBS ISS COMIC",
      "ALL NEW HONDA BEAT ESP POP CBS ISS PIXEL",
      "ALL NEW HONDA BEAT ESP POP CBS PIXEL",
      "ALL NEW HONDA BEAT ESP POP CW",
      "ALL NEW HONDA BEAT ESP POP CW COMIC",
      "ALL NEW HONDA BEAT ESP POP CW PIXEL"
    ],
    "PCX": [
      "ALL NEW HONDA PCX 150",
      "PCX",
      "PCX 150",
      "PCX 150 BUILT-UP"
    ],
    "NEW PCX": [
      "ALL NEW PCX 160 ABS",
      "ALL NEW PCX 160 ABS-ROADSYNC",
      "ALL NEW PCX 160 CBS",
      "NEW PCX 150 ABS",
      "NEW PCX 150 CBS"
    ],
    "SCOOPY": [
      "ALL NEW SCOOPY ENERGETIC",
      "ALL NEW SCOOPY FASHION",
      "ALL NEW SCOOPY PLAYFUL",
      "ALL NEW SCOOPY PRESTIGE",
      "ALL NEW SCOOPY SPORTY",
      "ALL NEW SCOOPY STYLISH",
      "NEW SCOOPY ESP SPORTY",
      "NEW SCOOPY ESP STYLISH",
      "SCOOPY FI MMC SPORTY",
      "SCOOPY FI MMC STYLISH",
      "SCOOPY FI SPORTY",
      "SCOOPY FI STYLISH"
    ],
    "SUPRA X 150": [
      "ALL NEW SUPRA GTR 150 EXCLUSIVE",
      "ALL NEW SUPRA GTR 150 SPORTY"
    ],
    "VARIO 125": [
      "ALL NEW VARIO 125 CBS",
      "ALL NEW VARIO 125 CBS ISS",
      "ALL NEW VARIO TECHNO 125 CBS PGM FI",
      "ALL NEW VARIO TECHNO 125 CBS PGM FI PLUS",
      "ALL NEW VARIO TECHNO 125 PGM FI",
      "ALL NEW VARIO TECHNO 125 PGM FI PLUS",
      "NEW VARIO 125 CBS",
      "NEW VARIO 125 CBS ISS",
      "NEW VARIO 125 STREET",
      "NEW VARIO TECHNO 125 FI MMC",
      "NEW VARIO TECHNO CBS",
      "NEW VARIO TECHNO CBS MMC",
      "VARIO 125 ESP CBS",
      "VARIO 125 ESP CBS ISS",
      "VARIO CBS 125 ISS",
      "VARIO CBS 125 ISS MMC",
      "VARIO NON CBS 125 ISS",
      "VARIO TECHNO",
      "VARIO TECHNO CBS PLUS",
      "VARIO TECHNO NON CBS",
      "VARIO TECHNO NON CBS PLUS"
    ],
    "VARIO 150": [
      "ALL NEW VARIO 150",
      "VARIO 150 ESP MONOTONE EXCLUSIVE",
      "VARIO 150 ESP SPORTY"
    ],
    "VARIO 160": [
      "ALL NEW VARIO 160 ABS",
      "ALL NEW VARIO 160 CBS"
    ],
    "CB": [
      "CB 150 R MMC",
      "CB 150 R PLUS",
      "CB 150R",
      "CB 150R SE"
    ],
    "CRF 150": [
      "CRF 150 L"
    ],
    "CRF 250": [
      "CRF 250 RALLY",
      "CRF 250L"
    ],
    "FORZA": [
      "FORZA"
    ],
    "GENIO 110": [
      "GENIO CBS",
      "GENIO CBS ISS",
      "NEW GENIO CBS",
      "NEW GENIO CBS ISS"
    ],
    "REVO": [
      "NEW ABSOLUTE REVO 110",
      "NEW ABSOLUTE REVO 110 CW",
      "NEW REVO FI CW",
      "NEW REVO FI FIT",
      "NEW REVO FI SW",
      "NEW REVO X",
      "REVO CW",
      "REVO FIT"
    ],
    "VERZA": [
      "NEW CB150 VERZA CW",
      "NEW CB150 VERZA SPOKE",
      "VERZA 150 CW",
      "VERZA 150 CW MMC",
      "VERZA 150 SW",
      "VERZA 150 SW MMC"
    ],
    "SONIC": [
      "NEW HONDA SONIC 150R",
      "NEW HONDA SONIC 150R RACING RED",
      "NEW HONDA SONIC 150R REPSOL",
      "NEW HONDA SONIC 150R SE"
    ],
    "SUPRA X 125": [
      "NEW SUPRA X 125 CW PLUS ( NF 125 TR2 PLUS )",
      "NEW SUPRA X 125 D (NF 125 TD)",
      "NEW SUPRA X 125 FI CW",
      "NEW SUPRA X 125 FI CW SPORTY AGGRESSIVE",
      "NEW SUPRA X 125 FI CW SPORTY LUXURY",
      "NEW SUPRA X 125 FI SW",
      "NEW SUPRA X 125 FI SW SPORTY AGGRESSIVE",
      "NEW SUPRA X 125 PGM-FI CW (NF 125 TRF)",
      "NEW SUPRA X 125 R (NF 125 TR)",
      "SUPRA X 125",
      "SUPRA X 125 D",
      "SUPRA X 125 D CW (NF 125 SC)",
      "SUPRA X 125 HELM IN",
      "SUPRA X 125 HELM IN PGM-FI",
      "SUPRA X 125 MMC",
      "SUPRA X 125 PGM DISC ( NF 125 SF )",
      "SUPRA X 125 PGM RACING ( NF 125 SFC )",
      "SUPRA X 125 R"
    ],
    "VARIO 110": [
      "NEW VARIO 110 ESP CBS ADVANCE",
      "NEW VARIO 110 ESP CBS ISS ADVANCE",
      "NEW VARIO 110 ESP CBS ISS STD",
      "NEW VARIO 110 ESP CBS STD"
    ],
    "STYLO 160": [
      "STYLO 160 ABS",
      "STYLO 160 CBS"
    ]
  },
  "YAMAHA": {
    "AEROX": [
      "AEROX",
      "AEROX GP"
    ],
    "AEROX 150": [
      "AEROX 155 VVA",
      "AEROX 155 VVA GP",
      "AEROX 155 VVA R-VERSION",
      "AEROX 155 VVA S-VERSION",
      "AEROX ALPHA",
      "AEROX ALPHA CYBERCITY",
      "AEROX ALPHA CYBERCITY ABS",
      "AEROX ALPHA TURBO",
      "AEROX ALPHA TURBO ULTIMATE",
      "ALL NEW AEROX 155 CONNECTED",
      "ALL NEW AEROX 155 CONNECTED / ABS",
      "ALL NEW AEROX 155 CONNECTED / ABS GP",
      "ALL NEW AEROX 155 CONNECTED / ABS WGP",
      "ALL NEW AEROX 155 CONNECTED CYBERCITY",
      "ALL NEW AEROX 155 CYBERCITY",
      "ALL NEW AEROX 155 STANDARD"
    ],
    "BYSON": [
      "ALL NEW BYSON FI"
    ],
    "NMAX": [
      "ALL NEW NMAX 155 CONNECTED",
      "ALL NEW NMAX 155 CONNECTED / ABS",
      "ALL NEW NMAX 155 S VERSION",
      "ALL NEW NMAX 155 STANDARD",
      "NMAX ABS",
      "NMAX NEO",
      "NMAX NEO S",
      "NMAX NON ABS",
      "NMAX TURBO",
      "NMAX TURBO TECH MAX",
      "NMAX TURBO TECH MAX ULTIMATE"
    ],
    "YZF 150": [
      "ALL NEW R15 CONNECTED",
      "ALL NEW R15M CONNECTED - ABS",
      "ALL NEW R15M CONNECTED - ABS WGP",
      "ALL NEW YZF R15 VVA",
      "ALL NEW YZF R15 VVA GP",
      "MT-15",
      "YZF R15",
      "YZF R15 GP MOVISTAR/TECH 3",
      "YZF R15 SE"
    ],
    "MIO SOUL GT": [
      "ALL NEW SOUL GT 125 AKS",
      "ALL NEW SOUL GT 125 AKS SSS",
      "ALL NEW SOUL GT 125 BLUE CORE",
      "MIO SOUL GT",
      "MIO SOUL GT MUSCLE",
      "MIO SOUL GT STREET"
    ],
    "VIXION": [
      "ALL NEW V-IXION",
      "ALL NEW V-IXION GP",
      "ALL NEW V-IXION R",
      "NEW V-IXION ADVANCE",
      "NEW V-IXION ADVANCE GP LIVERY",
      "NEW V-IXION ADVANCE SE",
      "NEW V-IXION LIGHTNING KS",
      "NEW V-IXION LIGHTNING KS MOTOGP SE",
      "NEW V-IXION LIGHTNING KS SE",
      "NEW V-IXION LIGHTNING NON KS",
      "NEW VIXION",
      "V-IXION",
      "VIXION LE",
      "VIXION SE"
    ],
    "X-RIDE": [
      "ALL NEW X-RIDE 125",
      "ALL NEW X-RIDE 125 AKS",
      "X-RIDE ADVENTURE",
      "X-RIDE SE",
      "X-RIDE STD"
    ],
    "FAZZIO 125": [
      "FAZZIO HYBRID NEO",
      "FAZZIO LUX",
      "FAZZIO NEO"
    ],
    "FREEGO": [
      "FREEGO 125 CONNECTED",
      "FREEGO 125 STANDARD",
      "FREEGO CONNECTED",
      "FREEGO S",
      "FREEGO S ABS",
      "FREEGO STD"
    ],
    "GEAR 125": [
      "G ULTIMA HYBRID",
      "G ULTIMA HYBRID S",
      "G ULTIMA HYBRID SMART",
      "G ULTIMA HYBRID SOLID",
      "GEAR 125 S VERSION",
      "GEAR 125 STANDARD"
    ],
    "GRAND FILANO": [
      "GRAND FILANO HYBRID CONNECTED LUX",
      "GRAND FILANO HYBRID LUX",
      "GRAND FILANO NEO HYBRID"
    ],
    "XEON": [
      "GT 125",
      "GT 125 GARUDA",
      "GT 125 SE"
    ],
    "JUPITER Z": [
      "JUPITER Z1 FI CW",
      "NEW JUPITER Z 110",
      "NEW JUPITER Z 115",
      "NEW JUPITER Z CW 110",
      "NEW JUPITER Z CW 115"
    ],
    "LEXI": [
      "LEXI",
      "LEXI - S ABS",
      "LEXI LX 155 CONNECTED ABS",
      "LEXI LX 155 STANDARD",
      "LEXI-S"
    ],
    "MIO GT": [
      "MIO GT",
      "MIO GT MOTOGP SE"
    ],
    "MIO M3 125": [
      "MIO M3 AKS SSS",
      "NEW MIO BLUE CORE M3 125 CW",
      "NEW MIO BLUE CORE M3 125 SP"
    ],
    "MIO S": [
      "MIO S 125"
    ],
    "MIO STD": [
      "MIO SOUL"
    ],
    "MIO Z": [
      "MIO Z"
    ],
    "YZF 250": [
      "MT-25",
      "YZF R25",
      "YZF R25 ABS",
      "YZF R25 GP MOVISTAR /TECH 3"
    ],
    "MX KING 150": [
      "MX KING 150",
      "MX KING 150 DOXOU VERSION",
      "MX KING 150 GP LIVERY",
      "MX KING 150 WGP"
    ],
    "MIO FINO 125": [
      "NEW FINO 125 BLUE CORE GRANDE",
      "NEW FINO PREMIUM 125 BLUE CORE",
      "NEW FINO SPORTY 125 BLUE CORE"
    ],
    "JUPITER MX 150": [
      "NEW JUPITER MX 150"
    ],
    "VEGA": [
      "VEGA FORCE DB",
      "VEGA FORCE DB CW",
      "VEGA FORCE DRUM"
    ],
    "WR 150": [
      "WR 155 R",
      "WR 155 R GP MONSTER"
    ],
    "XABRE": [
      "XABRE"
    ],
    "XMAX": [
      "XMAX",
      "XMAX CONNECTED"
    ],
    "XSR 150": [
      "XSR 155",
      "XSR 155 WGP"
    ]
  },
  "KAWASAKI": {
    "D-TRACKERX 150": [
      "D-TRACKER 150 NEW",
      "D-TRACKER 150 NEW SE",
      "D-TRACKERX"
    ],
    "KLX 140": [
      "KLX 140"
    ],
    "KLX 150": [
      "KLX 150",
      "KLX 150 BF",
      "KLX 150 BF SE",
      "KLX 150 BF SE EXTREME",
      "KLX 150 BF SE YELLOW",
      "KLX 150 G",
      "KLX 150 L"
    ],
    "KLX 250": [
      "KLX 250",
      "KLX250S"
    ],
    "KLX 230": [
      "KLX230",
      "KLX230 SE",
      "KLX230 SM",
      "KLX230 SM SE",
      "KLX230S"
    ],
    "KSR": [
      "KSR 110 PRO"
    ],
    "NINJA 250": [
      "NEW NINJA 250",
      "NINJA 250 ABS LTD",
      "NINJA 250 ABS LTD (MOTOR PREMIUM)",
      "NINJA 250 ABS SE",
      "NINJA 250 ABS SE LTD",
      "NINJA 250 ABS SE MDP",
      "NINJA 250 ABS SE MDP SMART KEY",
      "NINJA 250 ABS SE SMART KEY",
      "NINJA 250 FI (SLIPPER CLUTCH)",
      "NINJA 250 FI ABS (SLIPPER CLUTCH)",
      "NINJA 250 FI SE (SLIPPER CLUTCH)",
      "NINJA 250 LTD",
      "NINJA 250 LTD (MOTOR PREMIUM)",
      "NINJA 250 LTD BEET PERFORMANCE",
      "NINJA 250 LTD BEET PERFORMANCE (MOTOR PREMIUM)",
      "NINJA 250 R",
      "NINJA 250 R FI",
      "NINJA 250 R FI ABS",
      "NINJA 250 SE BEET PERFORMANCE",
      "NINJA 250 SE LTD",
      "NINJA 250 SE MDP",
      "NINJA 250 SL KRT EDITION",
      "NINJA 250SL",
      "NINJA EX 250L",
      "NINJA EX 250M",
      "Z250",
      "Z250 ABS",
      "Z250 SL",
      "Z250 SL ABS"
    ],
    "VERSYS": [
      "VERSYS-X 250 CITY",
      "VERSYS-X 250 TOURER"
    ],
    "W 175": [
      "W 175 SE BLACK STYLE NEW",
      "W 175 TR NEW",
      "W 175 TR SE NEW",
      "W175",
      "W175 CAFE",
      "W175 SE"
    ],
    "W 250": [
      "W250",
      "W250 SE"
    ],
    "NINJA < 150": [
      "Z125 PRO",
      "Z125 PRO SE"
    ]
  },
  "PIAGGIO": {
    "GTS": [
      "GTS SUPER 150 IE 3V"
    ],
    "LX": [
      "LX 125 I-GET",
      "LX 150"
    ],
    "VESPA": [
      "PIAGGIO MEDLEY ABS 150 I-GET",
      "VESPA PRIMAVERA 150 IE 3V",
      "VESPA PRIMAVERA S 150 I-GET ABS",
      "VESPA S 125 I-GET",
      "VESPA SPRINT 150 I-GET ABS",
      "VESPA SPRINT S 150 I-GET ABS"
    ]
  }
}
;

/** Daftar Type untuk kombinasi Brand+Model tertentu (case-insensitive). */
export function typesForModel(brand: string, model: string): string[] {
  const brandKey = Object.keys(MOTOR_TYPE_CATALOG).find(
    (b) => b.toUpperCase() === brand.trim().toUpperCase()
  );
  if (!brandKey) return [];
  const models = MOTOR_TYPE_CATALOG[brandKey];
  const modelKey = Object.keys(models).find(
    (m) => m.toUpperCase() === model.trim().toUpperCase()
  );
  return modelKey ? models[modelKey] : [];
}
