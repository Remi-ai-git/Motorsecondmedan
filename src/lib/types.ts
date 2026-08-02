export interface Motor {
  id: string;
  slug: string;
  brand: string;
  model: string;
  variant: string | null;
  category: "matic" | "bebek" | "sport" | "trail" | "touring";
  year: number;
  price: number;
  km: number;
  color: string;
  engine_cc: number | null;
  fuel_consumption_kml: number | null;
  condition: string;
  condition_note: string | null;
  tax_status: "hidup" | "mati";
  tax_expiry: string | null;
  stnk: boolean;
  stnk_expiry: string | null;
  bpkb: boolean;
  faktur: boolean;
  status: "tersedia" | "booking" | "terjual";
  promo: string | null;
  description: string | null;
  tags: string[];
  images: string[];
  /** Subsidi tambahan ke DP pembeli, diatur admin per motor (rupiah). */
  dp_discount: number;
  /**
   * DP yang diisi manual oleh admin (rupiah) — dipakai sebagai input ke
   * kalkulator kredit untuk menentukan "DP Minimal" & "Cicilan mulai" yang
   * tampil di katalog. Kalau kosong (null), sistem fallback ke taksiran
   * otomatis dari persentase DP minimum di credit_settings.
   */
  dp_amount: number | null;
  created_at: string;
  updated_at: string;
}

/** Konfigurasi tarif simulasi kredit (singleton, diedit admin). */
export interface CreditSettings {
  id: true;
  min_dp_percent: number;
  vehicle_insurance_rate_12: number;
  vehicle_insurance_rate_24: number;
  vehicle_insurance_rate_36: number;
  vehicle_insurance_monthly_below_12: number;
  vehicle_insurance_monthly_12_23: number;
  vehicle_insurance_monthly_24_35: number;
  vehicle_insurance_monthly_36_plus: number;
  life_insurance_base_premium: number;
  pgi_premium: number;
  pgi_excluded_models: string[];
  oona_premium: number;
  admin_fee: number;
  tenors: number[];
  /** Bunga pembiayaan per tahun (%), key = tenor (bulan) sebagai string. */
  financing_rates: Record<string, number>;
  first_installment_discount: number;
  effective_from: string;
  effective_until: string | null;
  updated_at: string;
}

/** Rincian hasil simulasi kredit untuk satu pilihan tenor. */
export interface CreditSimulationRow {
  tenor: number;
  vehicle_insurance: number;
  life_insurance: number;
  pgi: number;
  oona: number;
  admin_fee: number;
  annual_rate_percent: number;
  monthly_installment: number;
  first_installment: number;
}

export interface CreditSimulationResult {
  otr: number;
  dp_input: number;
  dp_discount: number;
  dp_effective: number;
  dp_percent: number;
  financed_principal: number;
  rows: CreditSimulationRow[];
}

/**
 * Bentuk baris hasil simulasi yang aman dikirim ke publik — tanpa
 * annual_rate_percent (bunga) & first_installment, keduanya info internal.
 */
export type PublicCreditSimulationRow = Omit<
  CreditSimulationRow,
  "annual_rate_percent" | "first_installment"
>;

export interface PublicCreditSimulationResult extends Omit<CreditSimulationResult, "rows"> {
  rows: PublicCreditSimulationRow[];
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  sort_order: number;
}

export function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}
