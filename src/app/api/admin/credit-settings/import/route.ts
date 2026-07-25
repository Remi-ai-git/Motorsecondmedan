import { getSupabaseAdmin } from "@/lib/supabase";
import { parseCreditToolsExcel } from "@/lib/excel-credit-import";

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export async function POST(req: Request) {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return Response.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY belum di-set di server." },
      { status: 500 }
    );
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!file || !(file instanceof File)) {
    return Response.json({ error: "File Excel tidak ditemukan." }, { status: 400 });
  }
  if (file.size > MAX_SIZE_BYTES) {
    return Response.json({ error: "Ukuran file maksimal 10MB." }, { status: 400 });
  }

  let parsed: ReturnType<typeof parseCreditToolsExcel>;
  try {
    const buffer = await file.arrayBuffer();
    parsed = parseCreditToolsExcel(buffer);
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Gagal membaca file Excel." },
      { status: 400 }
    );
  }

  if (Object.keys(parsed.settings).length === 0) {
    return Response.json(
      {
        error: "Tidak ada nilai yang bisa dibaca dari file ini. Pastikan struktur sheet Tools/Sheet3 belum diubah.",
        warnings: parsed.warnings,
      },
      { status: 422 }
    );
  }

  const { data, error } = await admin
    .from("credit_settings")
    .update({ ...parsed.settings, updated_at: new Date().toISOString() })
    .eq("id", true)
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ settings: data, warnings: parsed.warnings });
}
