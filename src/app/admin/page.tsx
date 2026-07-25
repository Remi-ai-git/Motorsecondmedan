import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabase";
import { formatRupiah, type Motor } from "@/lib/types";
import AdminNav from "@/components/admin/AdminNav";
import DeleteMotorButton from "@/components/admin/DeleteMotorButton";

export const dynamic = "force-dynamic";

const statusColors: Record<string, string> = {
  tersedia: "bg-emerald-100 text-emerald-700",
  booking: "bg-amber-100 text-amber-700",
  terjual: "bg-zinc-200 text-zinc-600",
};

export default async function AdminDashboard() {
  const admin = getSupabaseAdmin();

  if (!admin) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <AdminNav />
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <strong>SUPABASE_SERVICE_ROLE_KEY</strong> belum di-set di server, jadi
          panel admin belum bisa membaca/menulis data motor. Set di{" "}
          <code>.env.local</code> (dev) atau{" "}
          <code>npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY</code>{" "}
          (produksi), lalu deploy ulang.
        </div>
      </div>
    );
  }

  const { data, error } = await admin
    .from("motors")
    .select("*")
    .order("created_at", { ascending: false });

  const motors = (data as Motor[]) ?? [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <AdminNav />

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold">Stok Motor ({motors.length})</h1>
        <Link
          href="/admin/motor/new"
          className="rounded-full bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700"
        >
          + Tambah Motor
        </Link>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
          Gagal memuat data: {error.message}
        </p>
      )}

      {motors.length === 0 ? (
        <p className="py-10 text-center text-sm text-zinc-500">
          Belum ada motor. Klik &ldquo;+ Tambah Motor&rdquo; untuk mulai.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
          {motors.map((m) => (
            <div
              key={m.id}
              className="flex items-center gap-4 border-b border-zinc-100 p-3 last:border-0"
            >
              <div className="h-14 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-zinc-800 to-zinc-600">
                {m.images?.[0] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={m.images[0]}
                    alt={m.model}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">
                  {m.brand} {m.model} {m.variant ?? ""} {m.year}
                </p>
                <p className="text-xs text-zinc-500">
                  {formatRupiah(m.price)} · {m.km?.toLocaleString("id-ID")} km ·{" "}
                  {m.images?.length ?? 0} foto
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                  statusColors[m.status] ?? "bg-zinc-100 text-zinc-600"
                }`}
              >
                {m.status}
              </span>
              <div className="flex shrink-0 items-center gap-3">
                <Link
                  href={`/admin/motor/${m.id}/edit`}
                  className="text-xs text-sky-600 hover:underline"
                >
                  Edit
                </Link>
                <DeleteMotorButton id={m.id} name={`${m.brand} ${m.model}`} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
