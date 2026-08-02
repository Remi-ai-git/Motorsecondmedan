import { notFound } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { formatRupiah, type CreditSettings, type Motor } from "@/lib/types";
import { computeMotorCreditSummary } from "@/lib/credit-calc";
import MotorGallery from "@/components/MotorGallery";
import CreditSimulatorWidget from "@/components/CreditSimulatorWidget";

export const revalidate = 60;

export default async function MotorDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = getSupabase();
  const [{ data }, { data: settingsData }] = await Promise.all([
    supabase.from("motors").select("*").eq("slug", slug).single(),
    supabase.from("credit_settings").select("*").eq("id", true).single(),
  ]);

  if (!data) notFound();
  const motor = data as Motor;
  const settings = settingsData as CreditSettings | null;
  const creditSummary = settings ? computeMotorCreditSummary(motor, settings) : null;
  const wa = process.env.NEXT_PUBLIC_WA_NUMBER;
  const waText = encodeURIComponent(
    `Halo Arta Motor, saya tertarik dengan ${motor.brand} ${motor.model} ${motor.year} (${formatRupiah(motor.price)}). Apakah masih tersedia?`
  );

  const specs: [string, string][] = [
    ["Merek", motor.brand],
    ["Model", `${motor.model}${motor.variant ? ` ${motor.variant}` : ""}`],
    ["Kategori", motor.category],
    ["Tahun", String(motor.year)],
    [
      "Konsumsi BBM",
      motor.fuel_consumption_kml ? `±${motor.fuel_consumption_kml} km/liter` : "-",
    ],
    ["Masa Berlaku Pajak", motor.tax_expiry || "-"],
    ["Masa Berlaku STNK", motor.stnk_expiry || "-"],
    [
      "Surat",
      [motor.stnk && "STNK", motor.bpkb && "BPKB", motor.faktur && "Faktur"]
        .filter(Boolean)
        .join(" + ") || "-",
    ],
    ["Status", motor.status],
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      {motor.images && motor.images.length > 0 ? (
        <MotorGallery images={motor.images} alt={`${motor.brand} ${motor.model} ${motor.year}`} />
      ) : (
        <div className="mb-6 flex h-52 items-center justify-center rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-600 text-white">
          <div className="text-center">
            <p className="text-4xl font-bold">{motor.model}</p>
            <p className="opacity-70">
              {motor.brand} · {motor.year}
            </p>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-lg font-bold sm:text-2xl">
          {motor.brand} {motor.model}
          {motor.variant ? ` ${motor.variant}` : ""} {motor.year}
        </h1>
        <p className="mt-1 text-[22.5px] font-bold text-rose-600 sm:text-3xl">
          {formatRupiah(motor.price)}
        </p>
        {creditSummary && (
          <div className="mt-2 text-xs font-semibold text-rose-600 sm:text-base">
            <p>DP mulai {formatRupiah(creditSummary.dp_minimal)}</p>
            <p>Cicilan mulai {formatRupiah(creditSummary.cicilan_mulai)}/bulan</p>
          </div>
        )}

        <CreditSimulatorWidget
          motorId={motor.id}
          price={motor.price}
          defaultDp={creditSummary?.dp_minimal}
        />

        {motor.promo && (
          <p className="mt-4 inline-block rounded bg-amber-50 px-3 py-1 text-[10.5px] font-medium text-amber-700 sm:text-sm">
            🎁 {motor.promo}
          </p>
        )}
      </div>

      <a
        href={`https://wa.me/${wa}?text=${waText}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-block rounded-full bg-green-600 px-6 py-3 text-xs font-medium text-white hover:bg-green-700 sm:text-base"
      >
        Whatsapp
      </a>

      {motor.description && (
        <p className="mt-6 text-xs text-zinc-700 sm:text-base">{motor.description}</p>
      )}

      <h2 className="mb-3 mt-8 text-[13.5px] font-bold sm:text-lg">Spesifikasi</h2>
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        {specs.map(([label, value], i) => (
          <div
            key={label}
            className={`flex justify-between px-4 py-2.5 text-[10.5px] sm:text-sm ${i % 2 ? "bg-zinc-50" : ""}`}
          >
            <span className="text-zinc-500">{label}</span>
            <span className="font-medium capitalize">{value}</span>
          </div>
        ))}
      </div>

      <p className="mt-6 rounded-xl bg-sky-50 p-4 text-[10.5px] text-sky-800 sm:text-sm">
        💬 Mau bandingkan dengan motor lain atau tanya kelengkapan surat? Tanya
        asisten AI kami lewat tombol chat di pojok kanan bawah.
      </p>
    </div>
  );
}
