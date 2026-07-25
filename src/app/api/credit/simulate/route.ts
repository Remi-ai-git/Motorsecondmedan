import { getSupabase } from "@/lib/supabase";
import { CreditCalcError, simulateCredit } from "@/lib/credit-calc";
import type { CreditSettings, Motor } from "@/lib/types";
import { z } from "zod";

const bodySchema = z.object({
  motorId: z.string().uuid(),
  dp: z.coerce.number().min(0),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Input tidak valid.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { motorId, dp } = parsed.data;

  const supabase = getSupabase();
  const [{ data: motor, error: motorError }, { data: settings, error: settingsError }] =
    await Promise.all([
      supabase.from("motors").select("*").eq("id", motorId).single(),
      supabase.from("credit_settings").select("*").eq("id", true).single(),
    ]);

  if (motorError || !motor) {
    return Response.json({ error: "Motor tidak ditemukan." }, { status: 404 });
  }
  if (settingsError || !settings) {
    return Response.json(
      { error: "Konfigurasi simulasi kredit belum tersedia." },
      { status: 500 }
    );
  }

  const s = settings as CreditSettings;
  if (s.effective_until && new Date(s.effective_until) < new Date()) {
    return Response.json(
      {
        error: `Tarif kredit periode ini sudah kedaluwarsa (berlaku s/d ${s.effective_until}). Hubungi admin untuk update tarif terbaru.`,
      },
      { status: 409 }
    );
  }

  try {
    const result = simulateCredit({ motor: motor as Motor, settings: s, dpInput: dp });
    // Bunga (annual_rate_percent) & angsuran ke-1 (first_installment) adalah
    // informasi internal (rahasia penjual) — sengaja tidak dikirim ke publik,
    // bukan cuma disembunyikan di UI, supaya tidak bisa dilihat lewat Network tab.
    const publicResult = {
      ...result,
      rows: result.rows.map(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ({ annual_rate_percent, first_installment, ...publicRow }) => publicRow
      ),
    };
    return Response.json({ result: publicResult });
  } catch (e) {
    if (e instanceof CreditCalcError) {
      return Response.json({ error: e.message }, { status: 400 });
    }
    return Response.json({ error: "Gagal menghitung simulasi kredit." }, { status: 500 });
  }
}
