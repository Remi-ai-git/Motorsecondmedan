/**
 * Auth admin sederhana: satu password bersama (staff dealer), tanpa
 * database user. Session disimpan sebagai cookie httpOnly berisi
 * "expiry.signature" — signature dihitung pakai HMAC-SHA256 (Web Crypto,
 * aman dipakai di Cloudflare Workers) supaya cookie tidak bisa dipalsukan
 * tanpa tahu ADMIN_SESSION_SECRET.
 *
 * Kalau butuh multi-admin dengan akun terpisah nanti, ganti ke Supabase Auth.
 */

export const ADMIN_COOKIE = "artamotor_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 jam

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "ADMIN_SESSION_SECRET belum di-set. Set di .env.local (dev) atau `wrangler secret put ADMIN_SESSION_SECRET` (produksi)."
    );
  }
  return secret;
}

function bufferToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hmac(data: string, secret: string): Promise<string> {
  // Pakai Web Crypto (bukan Buffer/node:crypto) supaya jalan di mana saja:
  // Next.js middleware (edge runtime) maupun Cloudflare Workers.
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return bufferToHex(sig);
}

export async function createSessionToken(): Promise<string> {
  const expiry = Date.now() + SESSION_TTL_MS;
  const signature = await hmac(String(expiry), getSecret());
  return `${expiry}.${signature}`;
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const [expiryStr, signature] = token.split(".");
  if (!expiryStr || !signature) return false;

  const expiry = Number(expiryStr);
  if (!Number.isFinite(expiry) || expiry < Date.now()) return false;

  const expected = await hmac(expiryStr, getSecret());
  if (expected.length !== signature.length) return false;

  // Perbandingan waktu-konstan sederhana biar tidak bocor lewat timing attack.
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return diff === 0;
}

export function checkAdminPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return input === expected;
}
