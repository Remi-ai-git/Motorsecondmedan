import { tool } from "ai";
import { z } from "zod";
import { getSupabase } from "@/lib/supabase";
import type { Motor } from "@/lib/types";

/** Kolom yang dikirim ke model — cukup untuk menjawab tanpa membengkakkan token. */
const MOTOR_COLUMNS =
  "slug, brand, model, variant, category, year, price, km, color, engine_cc, fuel_consumption_kml, condition_note, tax_status, tax_expiry, stnk, bpkb, status, promo, description, tags";

export const searchMotors = tool({
  description:
    "Cari motor di inventori Arta Motor berdasarkan filter. Gunakan untuk rekomendasi, pencarian budget, atau kebutuhan spesifik (irit, touring, ojol, dll). Selalu gunakan tool ini sebelum menyebutkan motor apa pun.",
  parameters: z.object({
    budget_max: z.number().optional().describe("Harga maksimum dalam rupiah"),
    budget_min: z.number().optional().describe("Harga minimum dalam rupiah"),
    brand: z.string().optional().describe("Merek, mis. Honda, Yamaha"),
    model: z.string().optional().describe("Model, mis. Beat, NMAX"),
    category: z
      .enum(["matic", "bebek", "sport", "trail", "touring"])
      .optional(),
    year_min: z.number().optional(),
    year_max: z.number().optional(),
    km_max: z.number().optional().describe("Kilometer maksimum"),
    color: z.string().optional(),
    tax_status: z.enum(["hidup", "mati"]).optional(),
    tags: z
      .array(z.string())
      .optional()
      .describe(
        "Kebutuhan pengguna, mis: irit, mahasiswa, harian, touring, wanita, keluarga, kerja, ojol, murah, km rendah, tahun muda, sporty"
      ),
    limit: z.number().default(5),
  }),
  execute: async (args) => {
    const supabase = getSupabase();
    let q = supabase
      .from("motors")
      .select(MOTOR_COLUMNS)
      .eq("status", "tersedia");

    if (args.budget_max) q = q.lte("price", args.budget_max);
    if (args.budget_min) q = q.gte("price", args.budget_min);
    if (args.brand) q = q.ilike("brand", `%${args.brand}%`);
    if (args.model) q = q.ilike("model", `%${args.model}%`);
    if (args.category) q = q.eq("category", args.category);
    if (args.year_min) q = q.gte("year", args.year_min);
    if (args.year_max) q = q.lte("year", args.year_max);
    if (args.km_max) q = q.lte("km", args.km_max);
    if (args.color) q = q.ilike("color", `%${args.color}%`);
    if (args.tax_status) q = q.eq("tax_status", args.tax_status);
    if (args.tags && args.tags.length > 0) q = q.overlaps("tags", args.tags);

    const { data, error } = await q
      .order("price", { ascending: true })
      .limit(args.limit ?? 5);

    if (error) return { error: error.message };
    if (!data || data.length === 0)
      return {
        results: [],
        note: "Tidak ada motor yang cocok dengan kriteria ini di stok saat ini.",
      };
    return { results: data };
  },
});

export const getMotorDetail = tool({
  description:
    "Ambil detail lengkap satu motor berdasarkan slug atau nama model.",
  parameters: z.object({
    slug: z.string().optional().describe("Slug motor, mis. honda-beat-2022-hitam"),
    model: z.string().optional().describe("Nama model jika slug tidak diketahui"),
  }),
  execute: async ({ slug, model }) => {
    const supabase = getSupabase();
    let q = supabase.from("motors").select(MOTOR_COLUMNS);
    if (slug) q = q.eq("slug", slug);
    else if (model) q = q.ilike("model", `%${model}%`);
    else return { error: "Berikan slug atau model." };

    const { data, error } = await q.limit(3);
    if (error) return { error: error.message };
    if (!data || data.length === 0)
      return { note: "Motor tidak ditemukan di database." };
    return { results: data };
  },
});

export const compareMotors = tool({
  description:
    "Bandingkan 2-3 motor dari inventori. Ambil data faktual keduanya untuk perbandingan harga, mesin, konsumsi BBM, dll.",
  parameters: z.object({
    models: z
      .array(z.string())
      .min(2)
      .max(3)
      .describe("Daftar nama model, mis. ['Beat', 'Scoopy']"),
  }),
  execute: async ({ models }) => {
    const supabase = getSupabase();
    const results: Record<string, Partial<Motor>[]> = {};
    for (const m of models) {
      const { data } = await supabase
        .from("motors")
        .select(MOTOR_COLUMNS)
        .ilike("model", `%${m}%`)
        .eq("status", "tersedia")
        .limit(2);
      results[m] = (data as Partial<Motor>[]) ?? [];
    }
    return { comparison: results };
  },
});

export const simulateCredit = tool({
  description:
    "Hitung simulasi kredit motor. Gunakan harga asli dari database, jangan mengarang harga.",
  parameters: z.object({
    price: z.number().describe("Harga motor dalam rupiah"),
    dp: z.number().describe("Uang muka dalam rupiah (minimal 10% harga)"),
    tenor_months: z.number().describe("Tenor dalam bulan (11, 17, 23, 29, atau 35)"),
  }),
  execute: async ({ price, dp, tenor_months }) => {
    const minDp = Math.round(price * 0.1);
    if (dp < minDp)
      return {
        error: `DP minimal 10% dari harga, yaitu Rp ${minDp.toLocaleString("id-ID")}.`,
      };
    const principal = price - dp;
    const monthlyRate = 0.02; // flat 2%/bulan (estimasi)
    const totalInterest = principal * monthlyRate * tenor_months;
    const adminFee = 300000;
    const installment = Math.round((principal + totalInterest) / tenor_months);
    return {
      price,
      dp,
      tenor_months,
      installment_per_month: installment,
      admin_fee_once: adminFee,
      note: "Ini estimasi dengan bunga flat 2%/bulan. Angka pasti tergantung leasing — arahkan pelanggan ke sales WhatsApp untuk penawaran resmi.",
    };
  },
});

export const getFaqs = tool({
  description:
    "Ambil FAQ resmi Arta Motor (lokasi, kredit, pembelian, tukar tambah, jual motor, garansi). Gunakan sebelum menjawab pertanyaan proses/kebijakan.",
  parameters: z.object({
    category: z
      .enum(["umum", "kredit", "pembelian", "tukar-tambah", "jual", "garansi"])
      .optional(),
  }),
  execute: async ({ category }) => {
    const supabase = getSupabase();
    let q = supabase
      .from("faqs")
      .select("question, answer, category")
      .order("sort_order");
    if (category) q = q.eq("category", category);
    const { data, error } = await q;
    if (error) return { error: error.message };
    return { faqs: data ?? [] };
  },
});

export const aiTools = {
  searchMotors,
  getMotorDetail,
  compareMotors,
  simulateCredit,
  getFaqs,
};
