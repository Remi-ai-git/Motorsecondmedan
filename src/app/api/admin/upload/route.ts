import { getCloudflareContext } from "@opennextjs/cloudflare";

// Upload foto motor ke Cloudflare R2 (bucket "motor-images", binding
// MOTOR_IMAGES di wrangler.jsonc) — sebelumnya ke Supabase Storage, dipindah
// supaya tidak lagi kena batas egress/kuota Supabase (lihat pembahasan soal
// error 402 Payment Required). R2 tidak kena biaya egress sama sekali.
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

function sanitizeFileName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.\-]+/g, "-")
    .replace(/-+/g, "-");
}

export async function POST(req: Request) {
  const { env } = await getCloudflareContext({ async: true });
  const bucket = env.MOTOR_IMAGES;
  if (!bucket) {
    return Response.json(
      {
        error:
          'Bucket R2 belum tersambung ke Worker (binding "MOTOR_IMAGES" tidak ditemukan). Cek r2_buckets di wrangler.jsonc lalu deploy ulang.',
      },
      { status: 500 }
    );
  }

  const publicBaseUrl = (process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? "").replace(/\/$/, "");
  if (!publicBaseUrl) {
    return Response.json(
      {
        error:
          "NEXT_PUBLIC_R2_PUBLIC_URL belum di-set. Isi dengan domain publik bucket R2, contoh: https://foto.artamotormedan.com",
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

  try {
    await bucket.put(path, await file.arrayBuffer(), {
      httpMetadata: { contentType: file.type },
    });
  } catch (e) {
    return Response.json(
      { error: `Upload gagal: ${e instanceof Error ? e.message : "Unknown error"}` },
      { status: 500 }
    );
  }

  const url = `${publicBaseUrl}/${path}`;
  return Response.json({ url, path });
}
