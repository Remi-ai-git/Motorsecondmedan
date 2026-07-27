import { getSupabaseAdmin } from "@/lib/supabase";
import { motorInputSchema, generateSlug, slugify } from "@/lib/motor-schema";

export async function POST(req: Request) {
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
  const customSlug = input.slug ? slugify(input.slug) : "";
  const slug = customSlug || generateSlug(input.brand, input.model, input.year);

  const { data, error } = await admin
    .from("motors")
    .insert([{ ...input, slug }])
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  return Response.json({ motor: data }, { status: 201 });
}
