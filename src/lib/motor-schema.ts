import { z } from "zod";
import { modelsForBrand, SUPPORTED_CREDIT_BRANDS } from "@/lib/motor-model-catalog";

/** Skema input form admin — dipakai di client (validasi form) & server (API). */
export const motorInputSchema = z
  .object({
  slug: z.string().optional(),
  brand: z.string().min(1, "Wajib diisi"),
  model: z.string().min(1, "Wajib diisi"),
  variant: z.string().optional().nullable(),
  category: z.enum(["matic", "bebek", "sport", "trail", "touring"]),
  year: z.coerce.number().int().min(1980).max(2100),
  price: z.coerce.number().int().min(0),
  km: z.coerce.number().int().min(0),
  color: z.string().min(1, "Wajib diisi"),
  engine_cc: z.coerce.number().int().min(0).optional().nullable(),
  fuel_consumption_kml: z.coerce.number().min(0).optional().nullable(),
  condition: z.string().min(1, "Wajib diisi"),
  condition_note: z.string().optional().nullable(),
  tax_status: z.enum(["hidup", "mati"]),
  tax_expiry: z.string().optional().nullable(),
  stnk: z.coerce.boolean().default(false),
  stnk_expiry: z.string().optional().nullable(),
  bpkb: z.coerce.boolean().default(false),
  plat_expiry: z.string().optional().nullable(),
  faktur: z.coerce.boolean().default(false),
  status: z.enum(["tersedia", "booking", "terjual"]),
  promo: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  tags: z.array(z.string()).default([]),
  images: z.array(z.string()).max(6, "Maksimal 6 foto per motor").default([]),
  // Subsidi DP dari penjual — bisa positif (menambah DP efektif, angsuran
  // lebih ringan) atau negatif (surcharge, mengurangi DP efektif).
  dp_discount: z.coerce.number().default(0),
  })
  .refine(
    (data) => {
      const brand = data.brand.trim().toUpperCase();
      if (!SUPPORTED_CREDIT_BRANDS.includes(brand)) return true; // brand "Lainnya" — model bebas
      const model = data.model.trim().toUpperCase();
      return modelsForBrand(brand).some((m) => m.toUpperCase() === model);
    },
    {
      message:
        "Model tidak dikenali untuk brand ini. Pilih dari daftar model resmi supaya perhitungan kredit (PGI) akurat.",
      path: ["model"],
    }
  );

export type MotorInput = z.infer<typeof motorInputSchema>;

/**
 * Rapikan string bebas jadi slug URL-safe (lowercase, spasi/simbol jadi "-").
 * Dipakai untuk slug custom yang diketik admin, supaya tidak ada spasi atau
 * karakter aneh yang bikin halaman detail 404 (pernah kejadian: admin ketik
 * "NMAX Keren Test" apa adanya di kolom Slug URL, hasilnya /motor/NMAX%20...
 * tidak bisa diakses).
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Slug URL-safe dari brand + model + tahun + suffix acak (biar unik). */
export function generateSlug(brand: string, model: string, year: number): string {
  const base = slugify(`${brand}-${model}-${year}`);
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base}-${suffix}`;
}

export const CATEGORY_OPTIONS = ["matic", "bebek", "sport", "trail", "touring"] as const;
export const TAX_STATUS_OPTIONS = ["hidup", "mati"] as const;
export const STATUS_OPTIONS = ["tersedia", "booking", "terjual"] as const;
