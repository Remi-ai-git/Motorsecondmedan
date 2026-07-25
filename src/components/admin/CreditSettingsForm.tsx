"use client";

import { useRef, useState } from "react";
import type { CreditSettings } from "@/lib/types";

type FormState = {
  min_dp_percent: string; // ditampilkan sebagai %, contoh "15"
  vehicle_insurance_rate_12: string; // %
  vehicle_insurance_rate_24: string;
  vehicle_insurance_rate_36: string;
  vehicle_insurance_monthly_below_12: string;
  vehicle_insurance_monthly_12_23: string;
  vehicle_insurance_monthly_24_35: string;
  vehicle_insurance_monthly_36_plus: string;
  life_insurance_base_premium: string;
  pgi_premium: string;
  pgi_excluded_models: string; // dipisah koma
  oona_premium: string;
  admin_fee: string;
  first_installment_discount: string;
  financing_rates: Record<string, string>; // % per tenor
  effective_from: string;
  effective_until: string;
};

function toPercentStr(v: number): string {
  return (v * 100).toString();
}

function toFormState(s: CreditSettings): FormState {
  return {
    min_dp_percent: toPercentStr(s.min_dp_percent),
    vehicle_insurance_rate_12: toPercentStr(s.vehicle_insurance_rate_12),
    vehicle_insurance_rate_24: toPercentStr(s.vehicle_insurance_rate_24),
    vehicle_insurance_rate_36: toPercentStr(s.vehicle_insurance_rate_36),
    vehicle_insurance_monthly_below_12: toPercentStr(s.vehicle_insurance_monthly_below_12),
    vehicle_insurance_monthly_12_23: toPercentStr(s.vehicle_insurance_monthly_12_23),
    vehicle_insurance_monthly_24_35: toPercentStr(s.vehicle_insurance_monthly_24_35),
    vehicle_insurance_monthly_36_plus: toPercentStr(s.vehicle_insurance_monthly_36_plus),
    life_insurance_base_premium: String(s.life_insurance_base_premium),
    pgi_premium: String(s.pgi_premium),
    pgi_excluded_models: s.pgi_excluded_models.join(", "),
    oona_premium: String(s.oona_premium),
    admin_fee: String(s.admin_fee),
    first_installment_discount: String(s.first_installment_discount),
    financing_rates: Object.fromEntries(
      Object.entries(s.financing_rates).map(([k, v]) => [k, String(v)])
    ),
    effective_from: s.effective_from?.slice(0, 10) ?? "",
    effective_until: s.effective_until?.slice(0, 10) ?? "",
  };
}

export default function CreditSettingsForm({ initial }: { initial: CreditSettings }) {
  const [settings, setSettings] = useState(initial);
  const [form, setForm] = useState<FormState>(() => toFormState(initial));
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState("");
  const [warnings, setWarnings] = useState<string[]>([]);
  const [success, setSuccess] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function setRate(tenor: string, value: string) {
    setForm((f) => ({ ...f, financing_rates: { ...f.financing_rates, [tenor]: value } }));
  }

  async function handleImport() {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError("Pilih file Excel dulu.");
      return;
    }
    setImporting(true);
    setError("");
    setSuccess("");
    setWarnings([]);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/credit-settings/import", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Gagal import file.");
      setSettings(data.settings as CreditSettings);
      setForm(toFormState(data.settings as CreditSettings));
      setWarnings(data.warnings ?? []);
      setSuccess("Tarif berhasil diupdate dari file Excel.");
      if (fileRef.current) fileRef.current.value = "";
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal import file.");
    } finally {
      setImporting(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const payload = {
        min_dp_percent: Number(form.min_dp_percent) / 100,
        vehicle_insurance_rate_12: Number(form.vehicle_insurance_rate_12) / 100,
        vehicle_insurance_rate_24: Number(form.vehicle_insurance_rate_24) / 100,
        vehicle_insurance_rate_36: Number(form.vehicle_insurance_rate_36) / 100,
        vehicle_insurance_monthly_below_12: Number(form.vehicle_insurance_monthly_below_12) / 100,
        vehicle_insurance_monthly_12_23: Number(form.vehicle_insurance_monthly_12_23) / 100,
        vehicle_insurance_monthly_24_35: Number(form.vehicle_insurance_monthly_24_35) / 100,
        vehicle_insurance_monthly_36_plus: Number(form.vehicle_insurance_monthly_36_plus) / 100,
        life_insurance_base_premium: Number(form.life_insurance_base_premium),
        pgi_premium: Number(form.pgi_premium),
        pgi_excluded_models: form.pgi_excluded_models
          .split(",")
          .map((m) => m.trim())
          .filter(Boolean),
        oona_premium: Number(form.oona_premium),
        admin_fee: Number(form.admin_fee),
        first_installment_discount: Number(form.first_installment_discount),
        financing_rates: Object.fromEntries(
          Object.entries(form.financing_rates).map(([k, v]) => [k, Number(v)])
        ),
        tenors: settings.tenors,
        effective_from: form.effective_from || null,
        effective_until: form.effective_until || null,
      };
      const res = await fetch("/api/admin/credit-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Gagal menyimpan.");
      setSettings(data.settings as CreditSettings);
      setForm(toFormState(data.settings as CreditSettings));
      setSuccess("Perubahan manual tersimpan.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan.");
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-rose-500";
  const labelClass = "mb-1 block text-xs font-medium text-zinc-600";

  return (
    <div className="space-y-8 pb-16">
      {error && <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
      {success && <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{success}</p>}
      {warnings.length > 0 && (
        <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
          <p className="font-medium">Beberapa nilai tidak terbaca dari file (nilai lama dipertahankan):</p>
          <ul className="ml-4 mt-1 list-disc space-y-0.5">
            {warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Upload Excel — workflow utama tiap ganti periode */}
      <section className="rounded-2xl border border-rose-200 bg-rose-50/40 p-5">
        <h2 className="text-base font-bold">Upload File Excel Tools Terbaru</h2>
        <p className="mt-1 text-sm text-zinc-600">
          Setiap leasing kirim tarif baru (biasanya tiap 3 bulan), cukup upload file
          Excel yang sama strukturnya (sheet &ldquo;Tools&rdquo; + &ldquo;Sheet3&rdquo;) di sini —
          semua rate & premi diupdate otomatis, tidak perlu ubah kode.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls"
            className="text-sm"
          />
          <button
            type="button"
            onClick={handleImport}
            disabled={importing}
            className="rounded-full bg-rose-600 px-5 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50"
          >
            {importing ? "Mengimpor…" : "Import & Update Tarif"}
          </button>
        </div>
        <p className="mt-2 text-xs text-zinc-400">
          Masa berlaku tarif saat ini: {settings.effective_until ?? "-"}. Setelah tanggal
          ini, widget simulasi kredit di halaman motor akan menampilkan pesan
          kedaluwarsa sampai tarif baru diupload.
        </p>
      </section>

      {/* Edit manual / fine-tuning */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <h2 className="text-base font-bold">Edit Manual (opsional)</h2>
        <p className="text-sm text-zinc-500">
          Untuk koreksi kecil tanpa upload ulang file. Nilai persen ditulis
          sebagai angka biasa, misal 15 untuk 15%.
        </p>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className={labelClass}>DP minimum (%)</label>
            <input className={inputClass} value={form.min_dp_percent} onChange={(e) => set("min_dp_percent", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Premi jiwa dasar / tahun (Rp)</label>
            <input className={inputClass} value={form.life_insurance_base_premium} onChange={(e) => set("life_insurance_base_premium", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Potongan angsuran ke-1 (Rp)</label>
            <input className={inputClass} value={form.first_installment_discount} onChange={(e) => set("first_installment_discount", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Premi PGI flat (Rp)</label>
            <input className={inputClass} value={form.pgi_premium} onChange={(e) => set("pgi_premium", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Premi Oona (Rp)</label>
            <input className={inputClass} value={form.oona_premium} onChange={(e) => set("oona_premium", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Biaya admin (Rp)</label>
            <input className={inputClass} value={form.admin_fee} onChange={(e) => set("admin_fee", e.target.value)} />
          </div>
        </section>

        <section>
          <label className={labelClass}>Model dikecualikan dari PGI (pisahkan koma)</label>
          <textarea
            rows={2}
            className={inputClass}
            value={form.pgi_excluded_models}
            onChange={(e) => set("pgi_excluded_models", e.target.value)}
          />
        </section>

        <section>
          <h3 className="mb-2 text-sm font-semibold">Tarif asuransi kendaraan (% dari OTR)</h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <label className={labelClass}>Anchor 12 bulan</label>
              <input className={inputClass} value={form.vehicle_insurance_rate_12} onChange={(e) => set("vehicle_insurance_rate_12", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Anchor 24 bulan</label>
              <input className={inputClass} value={form.vehicle_insurance_rate_24} onChange={(e) => set("vehicle_insurance_rate_24", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Anchor 36 bulan</label>
              <input className={inputClass} value={form.vehicle_insurance_rate_36} onChange={(e) => set("vehicle_insurance_rate_36", e.target.value)} />
            </div>
            <div />
            <div>
              <label className={labelClass}>Kenaikan/bulan (&lt;12 bln)</label>
              <input className={inputClass} value={form.vehicle_insurance_monthly_below_12} onChange={(e) => set("vehicle_insurance_monthly_below_12", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Kenaikan/bulan (12-23 bln)</label>
              <input className={inputClass} value={form.vehicle_insurance_monthly_12_23} onChange={(e) => set("vehicle_insurance_monthly_12_23", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Kenaikan/bulan (24-35 bln)</label>
              <input className={inputClass} value={form.vehicle_insurance_monthly_24_35} onChange={(e) => set("vehicle_insurance_monthly_24_35", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Kenaikan/bulan (36+ bln)</label>
              <input className={inputClass} value={form.vehicle_insurance_monthly_36_plus} onChange={(e) => set("vehicle_insurance_monthly_36_plus", e.target.value)} />
            </div>
          </div>
        </section>

        <section>
          <h3 className="mb-2 text-sm font-semibold">Bunga pembiayaan per tenor (% per tahun)</h3>
          <div className="grid grid-cols-5 gap-3">
            {settings.tenors.map((tenor) => (
              <div key={tenor}>
                <label className={labelClass}>{tenor} bln</label>
                <input
                  className={inputClass}
                  value={form.financing_rates[String(tenor)] ?? ""}
                  onChange={(e) => setRate(String(tenor), e.target.value)}
                />
              </div>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Berlaku dari</label>
            <input type="date" className={inputClass} value={form.effective_from} onChange={(e) => set("effective_from", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Berlaku sampai</label>
            <input type="date" className={inputClass} value={form.effective_until} onChange={(e) => set("effective_until", e.target.value)} />
          </div>
        </section>

        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
        >
          {saving ? "Menyimpan…" : "Simpan Perubahan Manual"}
        </button>
      </form>
    </div>
  );
}
