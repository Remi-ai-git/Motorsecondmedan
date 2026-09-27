import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * Hapus file foto motor dari bucket R2 berdasarkan URL publiknya
 * (https://foto.artamotormedan.com/motors/xxx.jpg -> key "motors/xxx.jpg").
 * URL yang bukan dari R2 (mis. sisa data lama) dilewati begitu saja —
 * tidak dianggap error, supaya proses hapus/edit produk tetap jalan.
 * Kegagalan hapus file R2 tidak melempar error ke pemanggil (best-effort),
 * supaya operasi utama (hapus/update produk di DB) tidak ikut gagal
 * hanya gara-gara satu file storage bermasalah.
 */
export async function deleteR2ImagesByUrl(urls: string[]): Promise<void> {
  const publicBaseUrl = (process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? "").replace(/\/$/, "");
  if (!publicBaseUrl || urls.length === 0) return;

  const keys = urls
    .filter((u) => u.startsWith(publicBaseUrl + "/"))
    .map((u) => u.slice(publicBaseUrl.length + 1));
  if (keys.length === 0) return;

  try {
    const { env } = await getCloudflareContext({ async: true });
    const bucket = env.MOTOR_IMAGES;
    if (!bucket) return;
    await bucket.delete(keys);
  } catch {
    // Best-effort — biarkan operasi produk (create/update/delete) tetap sukses
    // walau ada file R2 yang gagal dihapus (mis. sudah tidak ada / limit subrequest).
  }
}
