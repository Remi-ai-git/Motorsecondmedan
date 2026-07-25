import { getSupabaseAdmin } from "@/lib/supabase";
import { creditSettingsInputSchema } from "@/lib/credit-settings-schema";

export async function GET() {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return Response.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY belum di-set di server." },
      { status: 500 }
    );
  }
  const { data, error } = await admin.from("credit_settings").select("*").eq("id", true).single();
  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  return Response.json({ settings: data });
}

export async function PATCH(req: Request) {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return Response.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY belum di-set di server." },
      { status: 500 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = creditSettingsInputSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Data tidak valid.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { data, error } = await admin
    .from("credit_settings")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", true)
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  return Response.json({ settings: data });
}
