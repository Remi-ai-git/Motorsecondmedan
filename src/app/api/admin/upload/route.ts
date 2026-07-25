import { getSupabaseAdmin } from "@/lib/supabase";

// Runtime default (Node.js) — sesuai dokumentasi @opennextjs/cloudflare,
// bukan "edge", supaya jalan benar saat di-deploy ke Cloudflare Workers.
const BUCKET = "motor-images";
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

function sanitizeFileName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.\-]+/g, "-")
    .replace(/-+/g, "-");
}

export async function POST(req: Request) {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return Response.json(
      {
        error:
          "SUPABASE_SERVICE_ROLE_KEY belum di-set di server. Upload gambar butuh service role key untuk menulis ke Storage.",
      },
      { status: 500 }
    );
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!file || !(file instanceof File)) {
    return Response.json({ error: "File tidak ditemukan." }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return Response.json(
      { error: "Format tidak didukung. Gunakan JPG, PNG, atau WebP." },
      { status: 400 }
    );
  }
  if (file.size > MAX_SIZE_BYTES) {
    return Response.json(
      { error: "Ukuran file maksimal 5MB." },
      { status: 400 }
    );
  }

  const ext = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
  const path = `motors/${crypto.randomUUID()}-${sanitizeFileName(file.name || `foto.${ext}`)}`;

  const { error: uploadError } = await admin.storage
    .from(BUCKET)
    .upload(path, await file.arrayBuffer(), {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    return Response.json(
      {
        error: `Upload gagal: ${uploadError.message}. Pastikan bucket "${BUCKET}" sudah dibuat di Supabase Storage (lihat supabase/storage-setup.sql).`,
      },
      { status: 500 }
    );
  }

  const { data } = admin.storage.from(BUCKET).getPublicUrl(path);
  return Response.json({ url: data.publicUrl, path });
}
