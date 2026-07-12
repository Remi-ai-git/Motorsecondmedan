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
  bpkb: boolean;
  status: "tersedia" | "booking" | "terjual";
  promo: string | null;
  description: string | null;
  tags: string[];
  images: string[];
  created_at: string;
  updated_at: string;
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
