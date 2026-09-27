import { getSupabaseAdmin } from "@/lib/supabase";
import { motorInputSchema, slugify } from "@/lib/motor-schema";
import { deleteR2ImagesByUrl } from "@/lib/r2-images";

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
  const slug = input.slug ? slugify(input.slug) : undefined;

  // Ambil daftar foto lama SEBELUM di-update, supaya bisa dibandingkan dan
  // foto yang sudah tidak dipakai lagi (diganti/dihapus admin) ikut dibersihkan
  // dari R2 — mencegah storage bloat seperti yang dulu terjadi di Supabase.
  const { data: before } = await admin
    .from("motors")
    .select("images")
    .eq("id", id)
    .single();
  const oldImages: string[] = before?.images ?? [];

  const { data, error } = await admin
    .from("motors")
    .update({ ...input, ...(slug ? { slug } : {}) })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const newImages: string[] = data?.images ?? [];
  const removed = oldImages.filter((u) => !newImages.includes(u));
  if (removed.length > 0) {
    await deleteR2ImagesByUrl(removed);
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

  const { data: existing } = await admin
    .from("motors")
    .select("images")
    .eq("id", id)
    .single();

  const { error } = await admin.from("motors").delete().eq("id", id);
  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const images: string[] = existing?.images ?? [];
  if (images.length > 0) {
    await deleteR2ImagesByUrl(images);
  }

  return Response.json({ ok: true });
}
