import { z } from "zod";

/** Skema input form admin — dipakai di client (validasi form) & server (API). */
export const motorInputSchema = z.object({
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
  bpkb: z.coerce.boolean().default(false),
  status: z.enum(["tersedia", "booking", "terjual"]),
  promo: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  tags: z.array(z.string()).default([]),
  images: z.array(z.string()).default([]),
  dp_discount: z.coerce.number().min(0).default(0),
});

export type MotorInput = z.infer<typeof motorInputSchema>;

/** Slug URL-safe dari brand + model + tahun + suffix acak (biar unik). */
export function generateSlug(brand: string, model: string, year: number): string {
  const base = `${brand}-${model}-${year}`
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base}-${suffix}`;
}

export const CATEGORY_OPTIONS = ["matic", "bebek", "sport", "trail", "touring"] as const;
export const TAX_STATUS_OPTIONS = ["hidup", "mati"] as const;
export const STATUS_OPTIONS = ["tersedia", "booking", "terjual"] as const;
