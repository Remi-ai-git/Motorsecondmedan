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
    <Link
      href={`/motor/${motor.slug}`}
      className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white transition hover:shadow-lg"
    >
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
      <div className="space-y-2 p-4">
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
          <div className="rounded-lg bg-emerald-50 px-2.5 py-1.5 text-[15px] text-emerald-800">
            <p>
              DP mulai <span className="font-semibold">{formatRupiah(dpMinimal)}</span>
            </p>
            <p>
              Cicilan mulai{" "}
              <span className="font-semibold">{formatRupiah(cicilanMulai)}</span>/bulan
            </p>
          </div>
        )}
        <p className="text-xs text-zinc-500">
          {motor.year} · Masa Berlaku Pajak:{" "}
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
  );
}
