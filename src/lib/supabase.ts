import { createClient, SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/** Client dengan anon key — aman untuk read publik (motors, faqs). */
export function getSupabase(): SupabaseClient {
  return createClient(url, anonKey);
}

/**
 * Client dengan service role — hanya di server, untuk menulis riwayat chat.
 * Mengembalikan null jika SUPABASE_SERVICE_ROLE_KEY belum di-set.
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return null;
  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}
