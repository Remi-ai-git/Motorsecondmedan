import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client untuk browser (dipakai di Client Component, misal
 * halaman login & tombol logout). Berbeda dari getSupabase()/getSupabaseAdmin()
 * di "@/lib/supabase" yang dipakai untuk baca/tulis data (motors, dll) —
 * client ini khusus untuk sesi Supabase Auth (login/logout admin).
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
