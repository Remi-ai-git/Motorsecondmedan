import Link from "next/link";
import Image from "next/image";
import { getSupabase } from "@/lib/supabase";
import MotorCard from "@/components/MotorCard";
import AISearchBar from "@/components/AISearchBar";
import type { CreditSettings, Motor } from "@/lib/types";
import { computeMotorCreditSummary } from "@/lib/credit-calc";

export const revalidate = 60;

export default async function Home() {
  const supabase = getSupabase();
  const [{ data }, { data: settingsData }] = await Promise.all([
    supabase
      .from("motors")
      .select("*")
      .eq("status", "tersedia")
      .order("created_at", { ascending: false })
      .limit(9),
    supabase.from("credit_settings").select("*").eq("id", true).single(),
  ]);

  const motors = (data as Motor[]) ?? [];
  const settings = settingsData as CreditSettings | null;

  return (
    <div>
      {/* Hero */}
      <section className="overflow-hidden bg-zinc-900 py-6 text-white sm:py-16">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-4 px-4 sm:gap-8 lg:grid-cols-2">
          <div>
            <h1 className="max-w-2xl text-xl font-bold leading-tight sm:text-4xl">
              Motor Bekas Berkualitas,{" "}
              <span className="text-rose-500">Surat Lengkap</span>, Harga
              Jujur dan Bergaransi.
            </h1>
            <p className="mt-1 text-sm font-semibold text-rose-400 sm:mt-2 sm:text-base">
              Cash &amp; Kredit
            </p>
            <p className="mt-2 max-w-xl text-xs text-zinc-300 sm:mt-3 sm:text-base">
              Arta Motor Medan —{" "}
              <a
                href="https://maps.app.goo.gl/GVAX4Cp4jdmzZPq8A?g_st=aw"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-white"
              >
                Jl. Brig Jend. Zein Hamid No.1, Titi Kuning, Medan Johor,
                Medan City, North Sumatra 20147
              </a>
            </p>
            <div className="mt-3 flex gap-2 sm:mt-6 sm:gap-3">
              <Link
                href="/motor"
                className="rounded-full bg-rose-600 px-4 py-2 text-xs font-medium hover:bg-rose-700 sm:px-5 sm:py-2.5 sm:text-sm"
              >
                Lihat Katalog
              </Link>
              <a
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WA_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-green-600 px-4 py-2 text-xs font-medium text-white hover:bg-green-700 sm:px-5 sm:py-2.5 sm:text-sm"
              >
                WhatsApp Marketing
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
        <div className="mt-6 flex justify-center">
          <Link
            href="/motor"
            className="rounded-full border border-rose-600 px-6 py-2.5 text-sm font-medium text-rose-600 transition hover:bg-rose-600 hover:text-white"
          >
            Lihat Semua Produk
          </Link>
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
