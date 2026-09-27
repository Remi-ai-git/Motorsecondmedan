import { getCloudflareContext } from "@opennextjs/cloudflare";

// Endpoint SEKALI PAKAI untuk migrasi foto dari Supabase Storage ke R2.
// Di luar /api/admin supaya tidak kena middleware auth (butuh cookie admin);
// diproteksi sendiri pakai secret di bawah. HAPUS route ini setelah migrasi
// selesai — jangan dibiarkan hidup di production.
const MIGRATE_SECRET = "am-r2-migrate-8f2c9a1e7d4b0f6a3c5e8d1b2f9a0c7e";

const SUPABASE_STORAGE_PREFIX =
  "https://zipkoxltnwojyphroocj.supabase.co/storage/v1/object/public/motor-images/";

export async function POST(req: Request) {
  const secret = req.headers.get("x-migrate-secret");
  if (secret !== MIGRATE_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { env } = await getCloudflareContext({ async: true });
  const bucket = env.MOTOR_IMAGES;
  if (!bucket) {
    return Response.json({ error: "R2 binding MOTOR_IMAGES tidak ditemukan" }, { status: 500 });
  }

  const body = await req.json().catch(() => ({}));
  const urls: string[] = Array.isArray(body?.urls) ? body.urls : [];
  if (urls.length === 0) {
    return Response.json({ error: "Body harus berisi { urls: string[] }" }, { status: 400 });
  }

  const publicBaseUrl = (process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? "").replace(/\/$/, "");

  const results: { oldUrl: string; newUrl?: string; error?: string }[] = [];

  for (const oldUrl of urls) {
    if (!oldUrl.startsWith(SUPABASE_STORAGE_PREFIX)) {
      results.push({ oldUrl, error: "Bukan URL Supabase Storage motor-images, dilewati" });
      continue;
    }
    const path = oldUrl.slice(SUPABASE_STORAGE_PREFIX.length);
    try {
      const res = await fetch(oldUrl);
      if (!res.ok) {
        results.push({ oldUrl, error: `Fetch gagal: HTTP ${res.status}` });
        continue;
      }
      const contentType = res.headers.get("content-type") ?? "image/jpeg";
      const buf = await res.arrayBuffer();
      await bucket.put(path, buf, { httpMetadata: { contentType } });
      results.push({ oldUrl, newUrl: `${publicBaseUrl}/${path}` });
    } catch (e) {
      results.push({ oldUrl, error: e instanceof Error ? e.message : "Unknown error" });
    }
  }

  const migrated = results.filter((r) => r.newUrl).length;
  const failed = results.filter((r) => r.error).length;
  return Response.json({ migrated, failed, results });
}
