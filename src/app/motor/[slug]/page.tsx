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

  const formatDate = (value: string | null) =>
    value
      ? new Date(value).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "-";

  const specs: [string, string][] = [
    ["Merek", motor.brand],
    ["Model", `${motor.model}${motor.variant ? ` ${motor.variant}` : ""}`],
    ["Kategori", motor.category],
    ["Tahun", String(motor.year)],
    [
      "Konsumsi BBM",
      motor.fuel_consumption_kml ? `±${motor.fuel_consumption_kml} km/liter` : "-",
    ],
    [
      "Masa Berlaku Pajak",
      motor.tax_expiry
        ? formatDate(motor.tax_expiry)
        : motor.tax_status === "hidup"
          ? "Hidup"
          : "Mati",
    ],
    ["Masa Berlaku STNK", formatDate(motor.stnk_expiry)],
    ["Masa Berlaku Plat", formatDate(motor.plat_expiry)],
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

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            {motor.brand} {motor.model}
            {motor.variant ? ` ${motor.variant}` : ""} {motor.year}
          </h1>
          <p className="mt-1 text-3xl font-bold text-rose-600">
            {formatRupiah(motor.price)}
          </p>
          {creditSummary && (
            <div className="mt-2 inline-block rounded-lg bg-rose-600 px-3 py-2 text-[18.75px] text-white">
              <p>
                DP mulai{" "}
                <span className="font-semibold">{formatRupiah(creditSummary.dp_minimal)}</span>
              </p>
              <p>
                Cicilan mulai{" "}
                <span className="font-semibold">
                  {formatRupiah(creditSummary.cicilan_mulai)}
                </span>
                /bulan
              </p>
            </div>
          )}
          {motor.promo && (
            <p className="mt-2 inline-block rounded bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700">
              🎁 {motor.promo}
            </p>
          )}
        </div>
        <a
          href={`https://wa.me/${wa}?text=${waText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-green-600 px-6 py-3 font-medium text-white hover:bg-green-700"
        >
          Tanya / Nego via WhatsApp
        </a>
      </div>

      {motor.description && (
        <p className="mt-6 text-zinc-700">{motor.description}</p>
      )}

      <CreditSimulatorWidget
        motorId={motor.id}
        price={motor.price}
        defaultDp={creditSummary?.dp_minimal}
      />

      <h2 className="mb-3 mt-8 text-lg font-bold">Spesifikasi</h2>
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        {specs.map(([label, value], i) => (
          <div
            key={label}
            className={`flex justify-between px-4 py-2.5 text-sm ${i % 2 ? "bg-zinc-50" : ""}`}
          >
            <span className="text-zinc-500">{label}</span>
            <span className="font-medium capitalize">{value}</span>
          </div>
        ))}
      </div>

      <p className="mt-6 rounded-xl bg-sky-50 p-4 text-sm text-sky-800">
        💬 Mau bandingkan dengan motor lain atau tanya kelengkapan surat? Tanya
        asisten AI kami lewat tombol chat di pojok kanan bawah.
      </p>
    </div>
  );
}
