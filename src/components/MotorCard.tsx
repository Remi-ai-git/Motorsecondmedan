import Link from "next/link";
import { formatRupiah, type Motor } from "@/lib/types";
import { isCashOnlyByAge, isDpOnlyByAge } from "@/lib/credit-calc";

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
  const cashOnly = isCashOnlyByAge(motor.year);
  const dpOnly = isDpOnlyByAge(motor.year);
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
        <div className="space-y-1.5 p-3 pb-0">
          <div className="flex items-center justify-between gap-1.5">
            <h3 className="text-[13.5px] font-semibold leading-snug">
              {motor.brand} {motor.model}
              {motor.variant ? ` ${motor.variant}` : ""}
            </h3>
            <span
              className={`rounded-full px-2 py-0.5 text-[10.5px] font-medium leading-tight ${categoryColors[motor.category] ?? "bg-zinc-100 text-zinc-700"}`}
            >
              {motor.category}
            </span>
          </div>
          <p className="text-base font-bold leading-snug text-rose-600">
            {formatRupiah(motor.price)}
          </p>
          {dpMinimal != null && cicilanMulai != null ? (
            <div className="space-y-0.5 text-sm font-semibold leading-snug text-rose-600">
              <p>DP mulai {formatRupiah(dpMinimal)}</p>
              {!dpOnly && <p>Cicilan mulai {formatRupiah(cicilanMulai)}/bulan</p>}
            </div>
          ) : (
            cashOnly && (
              <p className="text-[12.25px] font-semibold leading-snug text-zinc-500">
                💵 Cash Only — tidak bisa kredit
              </p>
            )
          )}
        </div>
      </Link>
      {!cashOnly && !dpOnly && (
        <div className="px-3 pt-1.5">
          <Link
            href={`/motor/${motor.slug}#kredit`}
            className="block w-full rounded-full border border-rose-600 px-3 py-1.5 text-center text-xs font-medium text-rose-600 transition hover:bg-rose-600 hover:text-white"
          >
            Hitung Kredit
          </Link>
        </div>
      )}
      <Link href={`/motor/${motor.slug}`} className="block">
        <div className="space-y-1 p-3 pt-2">
          <p className="text-[10.5px] leading-snug text-zinc-500">
            {motor.year} · {motor.km.toLocaleString("id-ID")} km · Masa Berlaku Pajak:{" "}
            {motor.tax_expiry || "-"}
          </p>
          {motor.promo && (
            <p className="inline-block rounded bg-amber-50 px-2 py-0.5 text-[10.5px] font-medium leading-tight text-amber-700">
              🎁 {motor.promo}
            </p>
          )}
        </div>
      </Link>
    </div>
  );
}
