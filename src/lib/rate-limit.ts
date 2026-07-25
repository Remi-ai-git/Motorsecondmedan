/**
 * Rate limiter sederhana (fixed window, in-memory per isolate) untuk
 * endpoint AI publik (/api/chat, /api/search).
 *
 * Catatan: Cloudflare Workers menjalankan banyak isolate paralel, jadi ini
 * bukan rate limit yang presisi/global — tapi cukup untuk meredam bot/abuse
 * kasar tanpa perlu KV/Durable Object tambahan. Untuk proteksi lebih kuat,
 * tambahkan Rate Limiting Rule di Cloudflare Dashboard > Security > WAF
 * (level jaringan, sebelum request sampai ke Worker).
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// Bersihkan bucket lama biar Map tidak bocor memori di isolate yang lama hidup.
function cleanup(now: number) {
  if (buckets.size < 500) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * @param key Identitas pemohon, mis. IP atau sessionId.
 * @param limit Jumlah request maksimum per window.
 * @param windowMs Panjang window dalam milidetik.
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  cleanup(now);

  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, resetAt };
  }

  if (existing.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: limit - existing.count,
    resetAt: existing.resetAt,
  };
}

/** Ambil IP pemohon dari header standar Cloudflare, fallback ke "unknown". */
export function getClientIp(req: Request): string {
  return (
    req.headers.get("cf-connecting-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}
