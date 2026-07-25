import { checkAdminPassword, createSessionToken, ADMIN_COOKIE } from "@/lib/admin-auth";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

// Batasi percobaan login biar tidak brute-force password admin.
const LOGIN_LIMIT = 8;
const LOGIN_WINDOW_MS = 5 * 60_000;

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const limit = rateLimit(`admin-login:${ip}`, LOGIN_LIMIT, LOGIN_WINDOW_MS);
  if (!limit.allowed) {
    return Response.json(
      { error: "Terlalu banyak percobaan login. Coba lagi beberapa menit lagi." },
      { status: 429 }
    );
  }

  const { password } = (await req.json().catch(() => ({}))) as {
    password?: string;
  };

  if (!password || !checkAdminPassword(password)) {
    return Response.json({ error: "Password salah." }, { status: 401 });
  }

  const token = await createSessionToken();
  // "Secure" dilewati saat dev lokal (http://localhost) karena browser menolak
  // cookie Secure di koneksi non-HTTPS. Di produksi (Cloudflare, selalu HTTPS) tetap aktif.
  const secure = process.env.NODE_ENV === "production" ? " Secure;" : "";
  const res = Response.json({ ok: true });
  res.headers.set(
    "Set-Cookie",
    `${ADMIN_COOKIE}=${token}; Path=/; HttpOnly;${secure} SameSite=Lax; Max-Age=${60 * 60 * 12}`
  );
  return res;
}
