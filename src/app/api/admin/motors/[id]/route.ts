import { getSupabaseAdmin } from "@/lib/supabase";
import { motorInputSchema } from "@/lib/motor-schema";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = getSupabaseAdmin();
  if (!admin) {
    return Response.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY belum di-set di server." },
      { status: 500 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = motorInputSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Data tidak valid.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const input = parsed.data;
  const slug = input.slug && input.slug.trim() ? input.slug.trim() : undefined;

  const { data, error } = await admin
    .from("motors")
    .update({ ...input, ...(slug ? { slug } : {}) })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  return Response.json({ motor: data });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = getSupabaseAdmin();
  if (!admin) {
    return Response.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY belum di-set di server." },
      { status: 500 }
    );
  }

  const { error } = await admin.from("motors").delete().eq("id", id);
  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  return Response.json({ ok: true });
}
