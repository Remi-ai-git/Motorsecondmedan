import Link from "next/link";
import Image from "next/image";
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
      <section className="overflow-hidden bg-zinc-900 py-16 text-white">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-8 px-4 lg:grid-cols-2">
          <div>
            <h1 className="max-w-2xl text-3xl font-bold leading-tight sm:text-4xl">
              Motor Bekas Berkualitas,{" "}
              <span className="text-rose-500">Surat Lengkap</span>, Harga
              Jujur.
            </h1>
            <p className="mt-3 max-w-xl text-zinc-300">
              Arta Motor Medan — semua unit lolos inspeksi, garansi mesin 1
              bulan, bisa kredit &amp; tukar tambah. Bingung pilih motor?
              Tanya asisten AI kami lewat tombol 💬 di pojok kanan bawah.
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

          {/* Kolase foto unit — pakai foto motor asli dari stok, bukan stok foto */}
          <div className="relative hidden h-72 items-center justify-center lg:flex">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://ugxhbuwgafzdtmhnjguh.supabase.co/storage/v1/object/public/motor-images/motors/4dd2f495-dd72-430c-a263-a785ca0e66c6-whatsapp-image-2026-07-27-at-17.38.10.jpeg"
              alt="Unit motor Arta Motor"
              className="absolute right-4 top-2 h-56 w-44 rotate-2 rounded-2xl border-4 border-zinc-800 object-cover shadow-2xl"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://ugxhbuwgafzdtmhnjguh.supabase.co/storage/v1/object/public/motor-images/motors/5d9d9a74-b1d4-4660-9c66-d8b1480f2afb-whatsapp-image-2026-07-27-at-17.38.13.jpeg"
              alt="Unit motor Arta Motor"
              className="absolute bottom-0 left-0 h-48 w-40 -rotate-3 rounded-2xl border-4 border-zinc-800 object-cover shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* Stok terbaru */}
      <section className="mx-auto max-w-6xl px-4 py-10">
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

      {/* AI Search */}
      <section className="mx-auto max-w-6xl px-4 pb-14">
        <h2 className="mb-1 text-xl font-bold">Cari Motor dengan AI ✨</h2>
        <p className="mb-4 text-sm text-zinc-500">
          Ketik kebutuhan Anda dengan bahasa sehari-hari.
        </p>
        <AISearchBar />
      </section>

      {/* Didukung Oleh (partner leasing) */}
      <section className="border-t border-zinc-100 bg-zinc-50 py-10">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <p className="mb-4 text-xs font-medium uppercase tracking-wide text-zinc-500">
            Didukung Oleh:
          </p>
          <div className="flex items-center justify-center">
            <Image
              src="/partners/oto-summit-finance.png"
              alt="OTO Kredit Motor by PT Summit OTO Finance"
              width={214}
              height={100}
              className="h-16 w-auto object-contain"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
