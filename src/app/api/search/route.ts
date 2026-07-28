import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import { getSupabase } from "@/lib/supabase";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { computeMotorCreditSummary } from "@/lib/credit-calc";
import type { CreditSettings, Motor } from "@/lib/types";

export const maxDuration = 15;

// Maks 20 pencarian / menit per IP.
const SEARCH_LIMIT = 20;
const SEARCH_WINDOW_MS = 60_000;

const filterSchema = z.object({
  budget_max: z.number().nullable(),
  budget_min: z.number().nullable(),
  brand: z.string().nullable(),
  model: z.string().nullable(),
  category: z.enum(["matic", "bebek", "sport", "trail", "touring"]).nullable(),
  year_min: z.number().nullable(),
  year_max: z.number().nullable(),
  km_max: z.number().nullable(),
  color: z.string().nullable(),
  tax_status: z.enum(["hidup", "mati"]).nullable(),
  tags: z
    .array(z.string())
    .describe(
      "Kebutuhan tersirat: irit, mahasiswa, harian, touring, wanita, keluarga, kerja, ojol, murah, km rendah, tahun muda, sporty, seperti baru"
    ),
});

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const limit = rateLimit(`search:${ip}`, SEARCH_LIMIT, SEARCH_WINDOW_MS);
  if (!limit.allowed) {
    return Response.json(
      { error: "Terlalu banyak pencarian dalam waktu singkat. Coba lagi sebentar lagi." },
      {
        status: 429,
        headers: {
          "Retry-After": String(
            Math.ceil((limit.resetAt - Date.now()) / 1000)
          ),
        },
      }
    );
  }

  const { query } = (await req.json()) as { query: string };
  if (!query?.trim()) {
    return Response.json({ error: "Query kosong" }, { status: 400 });
  }
  if (query.length > 300) {
    return Response.json({ error: "Query terlalu panjang" }, { status: 400 });
  }

  const { object: f } = await generateObject({
    // Model ringan & murah (Flash-Lite) — cukup untuk ekstraksi filter
    // pencarian sederhana, biaya jauh lebih rendah daripada Flash/Pro biasa.
    model: google("gemini-3.1-flash-lite"),
    schema: filterSchema,
    prompt: `Terjemahkan pencarian motor bekas berikut menjadi filter database. Harga dalam rupiah ("18 juta" = 18000000). Set null jika tidak disebut/tersirat.\n\nPencarian: "${query}"`,
  });

  const supabase = getSupabase();
  let q = supabase.from("motors").select("*").eq("status", "tersedia");

  if (f.budget_max) q = q.lte("price", f.budget_max);
  if (f.budget_min) q = q.gte("price", f.budget_min);
  if (f.brand) q = q.ilike("brand", `%${f.brand}%`);
  if (f.model) q = q.ilike("model", `%${f.model}%`);
  if (f.category) q = q.eq("category", f.category);
  if (f.year_min) q = q.gte("year", f.year_min);
  if (f.year_max) q = q.lte("year", f.year_max);
  if (f.km_max) q = q.lte("km", f.km_max);
  if (f.color) q = q.ilike("color", `%${f.color}%`);
  if (f.tax_status) q = q.eq("tax_status", f.tax_status);

  let { data, error } = await q.order("price").limit(12);
  if (error) return Response.json({ error: error.message }, { status: 500 });

  // Fallback: jika filter ketat tidak menemukan apa pun, coba cocokkan lewat tags
  if ((!data || data.length === 0) && f.tags.length > 0) {
    const res = await supabase
      .from("motors")
      .select("*")
      .eq("status", "tersedia")
      .overlaps("tags", f.tags)
      .order("price")
      .limit(12);
    data = res.data;
  }

  // Tempel ringkasan "DP mulai" / "Cicilan mulai" per motor, sama seperti di
  // katalog & homepage, supaya hasil pencarian AI juga konsisten.
  const { data: settingsData } = await supabase
    .from("credit_settings")
    .select("*")
    .eq("id", true)
    .single();
  const settings = settingsData as CreditSettings | null;

  const results = ((data as Motor[]) ?? []).map((m) => {
    const summary = settings ? computeMotorCreditSummary(m, settings) : null;
    return {
      ...m,
      dp_minimal: summary?.dp_minimal ?? null,
      cicilan_mulai: summary?.cicilan_mulai ?? null,
    };
  });

  return Response.json({ filters: f, results });
}
