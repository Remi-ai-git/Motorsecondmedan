"use client";

import { useState } from "react";
import { formatRupiah } from "@/lib/types";
import type { PublicCreditSimulationResult } from "@/lib/types";

export default function CreditSimulatorWidget({
  motorId,
  price,
  defaultDp,
}: {
  motorId: string;
  price: number;
  /** DP minimal riil (dari credit_settings admin) — dipakai sebagai nilai awal
   * input supaya perhitungan pertama tidak langsung gagal karena di bawah DP
   * minimum. Kalau belum tersedia (settings/tarif belum ada), fallback ke
   * taksiran kasar 15%. */
  defaultDp?: number | null;
}) {
  const minDpGuess = defaultDp ?? Math.ceil((price * 0.15) / 100000) * 100000;
  const [dp, setDp] = useState(String(minDpGuess));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<PublicCreditSimulationResult | null>(null);

  async function hitung() {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/credit/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ motorId, dp: Number(dp) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Gagal menghitung simulasi.");
      setResult(data.result as PublicCreditSimulationResult);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menghitung simulasi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div id="kredit" className="mt-4 rounded-2xl border border-zinc-200 bg-white p-5">
      <h2 className="text-[13.5px] font-bold sm:text-lg">📊 Taksasi Perhitungan Kredit</h2>

      <div className="mt-4 flex flex-wrap items-end gap-3">
        <div className="flex-1">
          <label className="mb-1 block text-[9px] font-medium text-zinc-600 sm:text-xs">
            DP (Rp)
          </label>
          <input
            type="number"
            min={defaultDp ?? 0}
            step={100000}
            value={dp}
            onChange={(e) => setDp(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-[10.5px] outline-none focus:border-rose-500 sm:text-sm"
            placeholder="Contoh: 5000000"
          />
          {defaultDp != null && (
            <p className="mt-1 text-[9px] text-zinc-400 sm:text-xs">
              DP minimal: {formatRupiah(defaultDp)}
            </p>
          )}
        </div>
        <button
          onClick={hitung}
          disabled={loading || !dp}
          className="rounded-full bg-rose-600 px-6 py-2.5 text-[10.5px] font-medium text-white hover:bg-rose-700 disabled:opacity-50 sm:text-sm"
        >
          {loading ? "Menghitung…" : "Hitung"}
        </button>
      </div>

      {error && (
        <p className="mt-3 rounded-lg bg-amber-50 p-3 text-[10.5px] text-amber-800 sm:text-sm">
          {error}
        </p>
      )}

      {result && (
        <div className="mt-5">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[280px] text-[10.5px] sm:text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-left text-zinc-500">
                  <th className="py-2 pr-3">Tenor</th>
                  <th className="py-2 pr-3">Angsuran/bulan</th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={row.tenor} className="border-b border-zinc-100 last:border-0">
                    <td className="py-2 pr-3 font-medium">{row.tenor} bulan</td>
                    <td className="py-2 pr-3 font-semibold text-rose-600">
                      {formatRupiah(row.monthly_installment)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <details className="mt-3 text-[9px] text-zinc-500 sm:text-xs">
            <summary className="cursor-pointer select-none">
              Rincian komponen biaya (tenor {result.rows[0]?.tenor} bulan)
            </summary>
            {result.rows[0] && (
              <ul className="mt-2 space-y-1">
                <li>Pokok pencairan: {formatRupiah(result.financed_principal)}</li>
                <li>Premi asuransi kendaraan: {formatRupiah(result.rows[0].vehicle_insurance)}</li>
                <li>Premi asuransi jiwa: {formatRupiah(result.rows[0].life_insurance)}</li>
                <li>Premi PGI: {formatRupiah(result.rows[0].pgi)}</li>
                <li>Premi Oona: {formatRupiah(result.rows[0].oona)}</li>
                <li>Biaya admin: {formatRupiah(result.rows[0].admin_fee)}</li>
              </ul>
            )}
          </details>

          <p className="mt-3 text-[9px] text-zinc-400 sm:text-xs">
            *Taksiran ini belum termasuk biaya notaris/survey yang mungkin
            berlaku sesuai kebijakan leasing.
          </p>
        </div>
      )}
    </div>
  );
}
