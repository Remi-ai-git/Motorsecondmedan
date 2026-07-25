"use client";

import { useState } from "react";
import { formatRupiah } from "@/lib/types";
import type { CreditSimulationResult } from "@/lib/types";

export default function CreditSimulatorWidget({
  motorId,
  price,
}: {
  motorId: string;
  price: number;
}) {
  const minDpGuess = Math.ceil((price * 0.15) / 100000) * 100000;
  const [dp, setDp] = useState(String(minDpGuess));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<CreditSimulationResult | null>(null);

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
      setResult(data.result as CreditSimulationResult);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menghitung simulasi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-5">
      <h2 className="text-lg font-bold">📊 Taksasi Perhitungan Kredit</h2>
      <p className="mt-1 text-sm text-zinc-500">
        Masukkan DP yang kamu inginkan untuk melihat simulasi angsuran bulanan.
        Ini adalah taksiran, angsuran final ditentukan oleh leasing saat pengajuan.
      </p>

      <div className="mt-4 flex flex-wrap items-end gap-3">
        <div className="flex-1">
          <label className="mb-1 block text-xs font-medium text-zinc-600">
            DP (Rp)
          </label>
          <input
            type="number"
            min={0}
            step={100000}
            value={dp}
            onChange={(e) => setDp(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-rose-500"
            placeholder="Contoh: 5000000"
          />
        </div>
        <button
          onClick={hitung}
          disabled={loading || !dp}
          className="rounded-full bg-rose-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50"
        >
          {loading ? "Menghitung…" : "Hitung"}
        </button>
      </div>

      {error && (
        <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">{error}</p>
      )}

      {result && (
        <div className="mt-5">
          <div className="mb-3 grid grid-cols-2 gap-2 rounded-lg bg-zinc-50 p-3 text-sm sm:grid-cols-4">
            <div>
              <p className="text-xs text-zinc-500">OTR</p>
              <p className="font-medium">{formatRupiah(result.otr)}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">DP Input</p>
              <p className="font-medium">{formatRupiah(result.dp_input)}</p>
            </div>
            {result.dp_discount > 0 && (
              <div>
                <p className="text-xs text-zinc-500">Subsidi DP</p>
                <p className="font-medium text-emerald-600">
                  +{formatRupiah(result.dp_discount)}
                </p>
              </div>
            )}
            <div>
              <p className="text-xs text-zinc-500">DP Efektif ({(result.dp_percent * 100).toFixed(1)}%)</p>
              <p className="font-medium">{formatRupiah(result.dp_effective)}</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-left text-zinc-500">
                  <th className="py-2 pr-3">Tenor</th>
                  <th className="py-2 pr-3">Bunga/th</th>
                  <th className="py-2 pr-3">Angsuran/bln</th>
                  <th className="py-2 pr-3">Angsuran ke-1</th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={row.tenor} className="border-b border-zinc-100 last:border-0">
                    <td className="py-2 pr-3 font-medium">{row.tenor} bln</td>
                    <td className="py-2 pr-3 text-zinc-500">{row.annual_rate_percent}%</td>
                    <td className="py-2 pr-3 font-semibold text-rose-600">
                      {formatRupiah(row.monthly_installment)}
                    </td>
                    <td className="py-2 pr-3 text-zinc-500">
                      {formatRupiah(row.first_installment)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <details className="mt-3 text-xs text-zinc-500">
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

          <p className="mt-3 text-xs text-zinc-400">
            *Angsuran ke-1 sudah dipotong promo. Taksiran ini belum termasuk biaya
            notaris/survey yang mungkin berlaku sesuai kebijakan leasing.
          </p>
        </div>
      )}
    </div>
  );
}
