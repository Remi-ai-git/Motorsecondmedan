import { getSupabase } from "@/lib/supabase";
import MotorCard from "@/components/MotorCard";
import AISearchBar from "@/components/AISearchBar";
import type { CreditSettings, Motor } from "@/lib/types";
import { computeMotorCreditSummary } from "@/lib/credit-calc";
import Link from "next/link";

export const revalidate = 60;

const CATEGORIES = ["semua", "matic", "bebek", "sport", "trail"] as const;

export default async function KatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ kategori?: string }>;
}) {
  const { kategori } = await searchParams;
  const supabase = getSupabase();

  let q = supabase
    .from("motors")
    .select("*")
    .eq("status", "tersedia")
    .order("price");
  if (kategori && kategori !== "semua") q = q.eq("category", kategori);

  const [{ data }, { data: settingsData }] = await Promise.all([
    q,
    supabase.from("credit_settings").select("*").eq("id", true).single(),
  ]);
  const motors = (data as Motor[]) ?? [];
  const settings = settingsData as CreditSettings | null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold">Katalog Motor</h1>
      <p className="mb-6 text-sm text-zinc-500">
        Semua unit tersedia, surat lengkap, siap dicek langsung.
      </p>

      <div className="mb-8">
        <AISearchBar />
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <Link
            key={c}
            href={c === "semua" ? "/motor" : `/motor?kategori=${c}`}
            className={`rounded-full px-4 py-1.5 text-sm capitalize ${
              (kategori ?? "semua") === c
                ? "bg-rose-600 text-white"
                : "border border-zinc-200 bg-white text-zinc-600 hover:border-rose-300"
            }`}
          >
            {c}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
          Belum ada unit di kategori ini.
        </p>
      )}
    </div>
  );
}
