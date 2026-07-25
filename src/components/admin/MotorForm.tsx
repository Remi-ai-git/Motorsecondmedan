"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Motor } from "@/lib/types";
import { CATEGORY_OPTIONS, TAX_STATUS_OPTIONS, STATUS_OPTIONS } from "@/lib/motor-schema";

type FormState = {
  slug: string;
  brand: string;
  model: string;
  variant: string;
  category: (typeof CATEGORY_OPTIONS)[number];
  year: string;
  price: string;
  km: string;
  color: string;
  engine_cc: string;
  fuel_consumption_kml: string;
  condition: string;
  condition_note: string;
  tax_status: (typeof TAX_STATUS_OPTIONS)[number];
  tax_expiry: string;
  stnk: boolean;
  bpkb: boolean;
  status: (typeof STATUS_OPTIONS)[number];
  promo: string;
  description: string;
  tags: string;
  images: string[];
  dp_discount: string;
};

function toFormState(m?: Motor): FormState {
  return {
    slug: m?.slug ?? "",
    brand: m?.brand ?? "",
    model: m?.model ?? "",
    variant: m?.variant ?? "",
    category: m?.category ?? "matic",
    year: m ? String(m.year) : String(new Date().getFullYear()),
    price: m ? String(m.price) : "",
    km: m ? String(m.km) : "0",
    color: m?.color ?? "",
    engine_cc: m?.engine_cc ? String(m.engine_cc) : "",
    fuel_consumption_kml: m?.fuel_consumption_kml ? String(m.fuel_consumption_kml) : "",
    condition: m?.condition ?? "baik",
    condition_note: m?.condition_note ?? "",
    tax_status: m?.tax_status ?? "hidup",
    tax_expiry: m?.tax_expiry ?? "",
    stnk: m?.stnk ?? true,
    bpkb: m?.bpkb ?? true,
    status: m?.status ?? "tersedia",
    promo: m?.promo ?? "",
    description: m?.description ?? "",
    tags: m?.tags?.join(", ") ?? "",
    images: m?.images ?? [],
    dp_discount: m ? String(m.dp_discount ?? 0) : "0",
  };
}

export default function MotorForm({ initial, motorId }: { initial?: Motor; motorId?: string }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(() => toFormState(initial));
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError("");
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error ?? "Upload gagal");
        set("images", [...form.images, data.url]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload gagal");
    } finally {
      setUploading(false);
    }
  }

  function removeImage(url: string) {
    set(
      "images",
      form.images.filter((u) => u !== url)
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      slug: form.slug || undefined,
      brand: form.brand,
      model: form.model,
      variant: form.variant || null,
      category: form.category,
      year: Number(form.year),
      price: Number(form.price),
      km: Number(form.km),
      color: form.color,
      engine_cc: form.engine_cc ? Number(form.engine_cc) : null,
      fuel_consumption_kml: form.fuel_consumption_kml
        ? Number(form.fuel_consumption_kml)
        : null,
      condition: form.condition,
      condition_note: form.condition_note || null,
      tax_status: form.tax_status,
      tax_expiry: form.tax_expiry || null,
      stnk: form.stnk,
      bpkb: form.bpkb,
      status: form.status,
      promo: form.promo || null,
      description: form.description || null,
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      images: form.images,
      dp_discount: form.dp_discount ? Number(form.dp_discount) : 0,
    };

    try {
      const url = motorId ? `/api/admin/motors/${motorId}` : "/api/admin/motors";
      const method = motorId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Gagal menyimpan");
      router.push("/admin");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-rose-500";
  const labelClass = "mb-1 block text-xs font-medium text-zinc-600";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-16">
      {error && (
        <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>
      )}

      {/* Foto */}
      <section>
        <label className={labelClass}>Foto motor</label>
        <div className="flex flex-wrap gap-3">
          {form.images.map((url) => (
            <div key={url} className="relative h-24 w-32 overflow-hidden rounded-lg border border-zinc-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(url)}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs text-white"
                aria-label="Hapus foto"
              >
                ✕
              </button>
            </div>
          ))}
          <label className="flex h-24 w-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-300 text-xs text-zinc-500 hover:border-rose-400 hover:text-rose-600">
            {uploading ? "Mengunggah…" : "+ Tambah foto"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              disabled={uploading}
              onChange={(e) => handleFiles(e.target.files)}
            />
          </label>
        </div>
        <p className="mt-1 text-xs text-zinc-400">JPG/PNG/WebP, maks 5MB per foto. Foto pertama jadi foto utama.</p>
      </section>

      {/* Info dasar */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Merek *</label>
          <input required className={inputClass} value={form.brand} onChange={(e) => set("brand", e.target.value)} placeholder="Honda" />
        </div>
        <div>
          <label className={labelClass}>Model *</label>
          <input required className={inputClass} value={form.model} onChange={(e) => set("model", e.target.value)} placeholder="Beat" />
        </div>
        <div>
          <label className={labelClass}>Varian</label>
          <input className={inputClass} value={form.variant} onChange={(e) => set("variant", e.target.value)} placeholder="Street / CBS / dll" />
        </div>
        <div>
          <label className={labelClass}>Kategori *</label>
          <select className={inputClass} value={form.category} onChange={(e) => set("category", e.target.value as FormState["category"])}>
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Tahun *</label>
          <input required type="number" className={inputClass} value={form.year} onChange={(e) => set("year", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Warna *</label>
          <input required className={inputClass} value={form.color} onChange={(e) => set("color", e.target.value)} />
        </div>
      </section>

      {/* Harga & kondisi */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Harga (Rp) *</label>
          <input required type="number" className={inputClass} value={form.price} onChange={(e) => set("price", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Kilometer *</label>
          <input required type="number" className={inputClass} value={form.km} onChange={(e) => set("km", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Kapasitas mesin (cc)</label>
          <input type="number" className={inputClass} value={form.engine_cc} onChange={(e) => set("engine_cc", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Konsumsi BBM (km/liter)</label>
          <input type="number" className={inputClass} value={form.fuel_consumption_kml} onChange={(e) => set("fuel_consumption_kml", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Kondisi *</label>
          <input required className={inputClass} value={form.condition} onChange={(e) => set("condition", e.target.value)} placeholder="Sangat baik" />
        </div>
        <div>
          <label className={labelClass}>Catatan kondisi</label>
          <input className={inputClass} value={form.condition_note} onChange={(e) => set("condition_note", e.target.value)} />
        </div>
      </section>

      {/* Surat & status */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Status pajak *</label>
          <select className={inputClass} value={form.tax_status} onChange={(e) => set("tax_status", e.target.value as FormState["tax_status"])}>
            {TAX_STATUS_OPTIONS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Pajak s/d (opsional)</label>
          <input type="date" className={inputClass} value={form.tax_expiry} onChange={(e) => set("tax_expiry", e.target.value)} />
        </div>
        <div className="flex items-center gap-4 pt-6">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.stnk} onChange={(e) => set("stnk", e.target.checked)} />
            STNK
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.bpkb} onChange={(e) => set("bpkb", e.target.checked)} />
            BPKB
          </label>
        </div>
        <div>
          <label className={labelClass}>Status stok *</label>
          <select className={inputClass} value={form.status} onChange={(e) => set("status", e.target.value as FormState["status"])}>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </section>

      {/* Lainnya */}
      <section className="space-y-4">
        <div>
          <label className={labelClass}>Promo (opsional)</label>
          <input className={inputClass} value={form.promo} onChange={(e) => set("promo", e.target.value)} placeholder="Gratis servis 3x" />
        </div>
        <div>
          <label className={labelClass}>Diskon/subsidi DP (Rp)</label>
          <input
            type="number"
            min={0}
            className={inputClass}
            value={form.dp_discount}
            onChange={(e) => set("dp_discount", e.target.value)}
            placeholder="0"
          />
          <p className="mt-1 text-xs text-zinc-400">
            Ditambahkan otomatis ke DP yang diinput pembeli di simulasi kredit
            (contoh: pembeli input DP 5jt, diskon 2jt → dihitung seolah DP 7jt).
          </p>
        </div>
        <div>
          <label className={labelClass}>Deskripsi</label>
          <textarea rows={3} className={inputClass} value={form.description} onChange={(e) => set("description", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Tags (pisahkan koma — dipakai AI untuk cocokkan kebutuhan)</label>
          <input className={inputClass} value={form.tags} onChange={(e) => set("tags", e.target.value)} placeholder="irit, mahasiswa, ojol, km rendah" />
        </div>
        <div>
          <label className={labelClass}>Slug URL (opsional, otomatis kalau kosong)</label>
          <input className={inputClass} value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="honda-beat-2022-hitam" />
        </div>
      </section>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving || uploading}
          className="rounded-full bg-rose-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50"
        >
          {saving ? "Menyimpan…" : "Simpan"}
        </button>
      </div>
    </form>
  );
}
