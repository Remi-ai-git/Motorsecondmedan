import Link from "next/link";
import { formatRupiah, type Motor } from "@/lib/types";

const categoryColors: Record<string, string> = {
  matic: "bg-sky-100 text-sky-700",
  bebek: "bg-amber-100 text-amber-700",
  sport: "bg-rose-100 text-rose-700",
  trail: "bg-emerald-100 text-emerald-700",
  touring: "bg-violet-100 text-violet-700",
};

export default function MotorCard({
  motor,
  dpMinimal,
  cicilanMulai,
}: {
  motor: Motor;
  dpMinimal?: number | null;
  cicilanMulai?: number | null;
}) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white transition hover:shadow-lg">
      <Link href={`/motor/${motor.slug}`} className="block">
        <div className="relative flex h-36 items-center justify-center overflow-hidden bg-gradient-to-br from-zinc-800 to-zinc-600 text-white">
          {motor.images?.[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={motor.images[0]}
              alt={`${motor.brand} ${motor.model} ${motor.year}`}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="text-center">
              <p className="text-2xl font-bold">{motor.model}</p>
              <p className="text-sm opacity-70">
                {motor.brand} · {motor.year}
              </p>
            </div>
          )}
        </div>
        <div className="space-y-2 p-4 pb-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold">
              {motor.brand} {motor.model}
              {motor.variant ? ` ${motor.variant}` : ""}
            </h3>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${categoryColors[motor.category] ?? "bg-zinc-100 text-zinc-700"}`}
            >
              {motor.category}
            </span>
          </div>
          <p className="text-lg font-bold text-rose-600">
            {formatRupiah(motor.price)}
          </p>
          {dpMinimal != null && cicilanMulai != null && (
            <div className="text-base font-semibold text-rose-600">
              <p>DP mulai {formatRupiah(dpMinimal)}</p>
              <p>Cicilan mulai {formatRupiah(cicilanMulai)}/bulan</p>
            </div>
          )}
        </div>
      </Link>
      <div className="px-4 pt-2">
        <Link
          href={`/motor/${motor.slug}#kredit`}
          className="block w-full rounded-full border border-rose-600 px-4 py-2 text-center text-sm font-medium text-rose-600 transition hover:bg-rose-600 hover:text-white"
        >
          Hitung Kredit
        </Link>
      </div>
      <Link href={`/motor/${motor.slug}`} className="block">
        <div className="space-y-2 p-4 pt-3">
          <p className="text-xs text-zinc-500">
            {motor.year} · {motor.km.toLocaleString("id-ID")} km · Masa Berlaku Pajak:{" "}
            {motor.tax_expiry
              ? new Date(motor.tax_expiry).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : motor.tax_status === "hidup"
                ? "Hidup"
                : "Mati"}
          </p>
          {motor.promo && (
            <p className="inline-block rounded bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
              🎁 {motor.promo}
            </p>
          )}
        </div>
      </Link>
    </div>
  );
}
