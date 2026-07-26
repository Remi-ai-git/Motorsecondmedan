import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Supabase client untuk server (Server Component & Route Handler) yang
 * paham cookie sesi Supabase Auth. Dipakai di route /api/admin/logout dan
 * halaman admin yang perlu tahu siapa yang login.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Dipanggil dari Server Component (bukan Route Handler/Server
            // Action) — tidak bisa set cookie di sana, aman diabaikan karena
            // middleware yang bertanggung jawab refresh sesi per-request.
          }
        },
      },
    }
  );
}
