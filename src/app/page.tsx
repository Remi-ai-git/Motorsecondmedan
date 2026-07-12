import Link from "next/link";
import { getSupabase } from "@/lib/supabase";
import MotorCard from "@/components/MotorCard";
import AISearchBar from "@/components/AISearchBar";
import type { Motor } from "@/lib/types";

export const revalidate = 60;

export default async function Home() {
  const supabase = getSupabase();
  const { data } = await supabase
    .from("motors")
    .select("*")
    .eq("status", "tersedia")
    .order("created_at", { ascending: false })
    .limit(6);

  const motors = (data as Motor[]) ?? [];

  return (
    <div>
      {/* Hero */}
      <section className="bg-zinc-900 py-16 text-white">
        <div className="mx-auto max-w-6xl px-4">
          <h1 className="max-w-2xl text-3xl font-bold leading-tight sm:text-4xl">
            Motor Bekas Berkualitas,{" "}
            <span className="text-rose-500">Surat Lengkap</span>, Harga Jujur.
          </h1>
          <p className="mt-3 max-w-xl text-zinc-300">
            Arta Motor Medan — semua unit lolos inspeksi, garansi mesin 1
            bulan, bisa kredit &amp; tukar tambah. Bingung pilih motor? Tanya
            asisten AI kami lewat tombol 💬 di pojok kanan bawah.
          </p>
          <div className="mt-6 flex gap-3">
            <Link
              href="/motor"
              className="rounded-full bg-rose-600 px-5 py-2.5 text-sm font-medium hover:bg-rose-700"
            >
              Lihat Katalog
            </Link>
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WA_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-zinc-600 px-5 py-2.5 text-sm font-medium hover:bg-zinc-800"
            >
              Chat Sales
            </a>
          </div>
        </div>
      </section>

      {/* AI Search */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="mb-1 text-xl font-bold">Cari Motor dengan AI ✨</h2>
        <p className="mb-4 text-sm text-zinc-500">
          Ketik kebutuhan Anda dengan bahasa sehari-hari.
        </p>
        <AISearchBar />
      </section>

      {/* Stok terbaru */}
      <section className="mx-auto max-w-6xl px-4 pb-14">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Stok Terbaru</h2>
          <Link href="/motor" className="text-sm text-rose-600 hover:underline">
            Lihat semua →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {motors.map((m) => (
            <MotorCard key={m.id} motor={m} />
          ))}
        </div>
      </section>
    </div>
  );
}
