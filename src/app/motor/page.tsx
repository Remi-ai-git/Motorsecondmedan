import { getSupabase } from "@/lib/supabase";
import MotorCard from "@/components/MotorCard";
import type { CreditSettings, Motor } from "@/lib/types";
import { computeMotorCreditSummary } from "@/lib/credit-calc";
import Link from "next/link";

export const revalidate = 60;

const CATEGORIES = ["semua", "matic", "bebek", "sport", "trail"] as const;

// Shortcut Model/Brand — klik shortcut memunculkan semua produk yang
// model, variant, atau brand-nya mengandung kata ini (pencocokan substring).
const SHORTCUTS = [
  "VARIO",
  "SCOOPY",
  "BEAT",
  "PCX",
  "GENIO",
  "ADV",
  "SPORT",
  "YAMAHA",
  "HONDA",
  "SUZUKI",
  "KAWASAKI",
  "VESPA",
] as const;

function buildHref(params: { kategori?: string; cari?: string }) {
  const sp = new URLSearchParams();
  if (params.kategori && params.kategori !== "semua") sp.set("kategori", params.kategori);
  if (params.cari) sp.set("cari", params.cari);
  const qs = sp.toString();
  return qs ? `/motor?${qs}` : "/motor";
}

export default async function KatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ kategori?: string; cari?: string }>;
}) {
  const { kategori, cari } = await searchParams;
  const supabase = getSupabase();

  let q = supabase
    .from("motors")
    .select("*")
    .eq("status", "tersedia")
    .order("price");
  if (kategori && kategori !== "semua") q = q.eq("category", kategori);
  if (cari) {
    const kw = cari.trim().replace(/[%,]/g, "");
    q = q.or(`model.ilike.%${kw}%,variant.ilike.%${kw}%,brand.ilike.%${kw}%`);
  }

  const [{ data }, { data: settingsData }] = await Promise.all([
    q,
    supabase.from("credit_settings").select("*").eq("id", true).single(),
  ]);
  const motors = (data as Motor[]) ?? [];
  const settings = settingsData as CreditSettings | null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-10">
      <h1 className="mb-3 text-xl font-bold sm:mb-6 sm:text-2xl">Katalog Motor</h1>

      <div className="mb-2 flex flex-wrap gap-1.5 sm:mb-3 sm:gap-2">
        {CATEGORIES.map((c) => (
          <Link
            key={c}
            href={buildHref({ kategori: c, cari })}
            className={`rounded-full px-3 py-1 text-xs capitalize sm:px-4 sm:py-1.5 sm:text-sm ${
              (kategori ?? "semua") === c
                ? "bg-rose-600 text-white"
                : "border border-zinc-200 bg-white text-zinc-600 hover:border-rose-300"
            }`}
          >
            {c}
          </Link>
        ))}
      </div>

      <div className="mb-3 flex flex-wrap gap-1.5 sm:mb-6 sm:gap-2">
        <Link
          href={buildHref({ kategori })}
          className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium sm:px-3 sm:py-1 sm:text-xs ${
            !cari
              ? "bg-zinc-800 text-white"
              : "border border-zinc-200 bg-white text-zinc-600 hover:border-rose-300"
          }`}
        >
          Semua Model
        </Link>
        {SHORTCUTS.map((s) => (
          <Link
            key={s}
            href={buildHref({ kategori, cari: s })}
            className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium sm:px-3 sm:py-1 sm:text-xs ${
              cari?.toUpperCase() === s
                ? "bg-rose-600 text-white"
                : "border border-zinc-200 bg-white text-zinc-600 hover:border-rose-300"
            }`}
          >
            {s}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {motors.map((m) => {
          const summary = settings ? computeMotorCreditSummary(m, settings) : null;
          return (
            <MotorCard
              key={m.id}
              motor={m}
              dpMinimal={summary?.dp_minimal}
              cicilanMulai={summary?.cicilan_mulai}
            />
          );
        })}
      </div>

      {motors.length === 0 && (
        <p className="py-10 text-center text-zinc-500">
          Belum ada unit yang cocok dengan filter ini.
        </p>
      )}
    </div>
  );
}
