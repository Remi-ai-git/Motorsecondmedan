import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Login admin sekarang pakai Supabase Auth (email+password) — lihat
// src/lib/supabase-auth/. File src/lib/admin-auth.ts (password tunggal)
// sudah tidak dipakai lagi, dibiarkan ada untuk referensi.
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Halaman login sendiri tidak boleh diproteksi (nanti tidak bisa login).
  if (pathname === "/admin/login") return NextResponse.next();

  let res = NextResponse.next({ request: req });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
          res = NextResponse.next({ request: req });
          cookiesToSet.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
        },
      },
    }
  );

  // getUser() (bukan getSession()) — memvalidasi token ke server Supabase,
  // bukan cuma baca cookie mentah, jadi tidak bisa dipalsukan.
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    if (pathname.startsWith("/api/admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/admin/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return res;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
