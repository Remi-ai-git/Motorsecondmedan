import AdminNav from "@/components/admin/AdminNav";
import CreditSettingsForm from "@/components/admin/CreditSettingsForm";
import { getSupabaseAdmin } from "@/lib/supabase";
import type { CreditSettings } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function CreditSettingsPage() {
  const admin = getSupabaseAdmin();

  if (!admin) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <AdminNav />
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <strong>SUPABASE_SERVICE_ROLE_KEY</strong> belum di-set di server.
        </div>
      </div>
    );
  }

  const { data, error } = await admin.from("credit_settings").select("*").eq("id", true).single();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <AdminNav />
      <h1 className="mb-2 text-xl font-bold">Tarif Simulasi Kredit</h1>
      <p className="mb-6 text-sm text-zinc-500">
        Konfigurasi ini dipakai widget &ldquo;Taksasi Perhitungan Kredit&rdquo; di
        setiap halaman detail motor.
      </p>

      {error && (
        <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
          Gagal memuat konfigurasi: {error.message}
        </p>
      )}
      {data && <CreditSettingsForm initial={data as CreditSettings} />}
    </div>
  );
}
