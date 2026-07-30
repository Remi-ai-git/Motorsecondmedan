"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Motor } from "@/lib/types";
import { CATEGORY_OPTIONS, TAX_STATUS_OPTIONS, STATUS_OPTIONS } from "@/lib/motor-schema";
import {
  BRAND_OPTIONS,
  SUPPORTED_CREDIT_BRANDS,
  OTHER_BRAND_OPTION,
  modelsForBrand,
} from "@/lib/motor-model-catalog";
import { typesForModel } from "@/lib/motor-type-catalog";

/** Brand yang tersimpan di DB -> pilihan dropdown ("Lainnya" kalau tidak dikenal). */
function brandToChoice(brand: string): string {
  const upper = brand.trim().toUpperCase();
  return SUPPORTED_CREDIT_BRANDS.includes(upper) ? upper : OTHER_BRAND_OPTION;
}

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
  stnk_expiry: string;
  bpkb: boolean;
  plat_expiry: string;
  faktur: boolean;
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
    stnk_expiry: m?.stnk_expiry ?? "",
    bpkb: m?.bpkb ?? true,
    plat_expiry: m?.plat_expiry ?? "",
    faktur: m?.faktur ?? false,
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
  const [brandChoice, setBrandChoice] = useState<string>(() => brandToChoice(initial?.brand ?? ""));
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isOtherBrand = brandChoice === OTHER_BRAND_OPTION;
  const modelOptions = isOtherBrand ? [] : modelsForBrand(brandChoice);
  // Kalau nilai model saat ini (data lama) tidak ada di daftar resmi, tetap
  // tampilkan sebagai opsi supaya tidak hilang diam-diam — admin akan lihat
  // dan bisa pilih ulang model yang benar.
  const currentModelUnknown =
    !isOtherBrand &&
    form.model.trim() !== "" &&
    !modelOptions.some((m) => m.toUpperCase() === form.model.trim().toUpperCase());

  // Daftar Type tergantung Brand+Model yang dipilih. Kalau kombinasinya
  // belum terdaftar (model baru/brand "Lainnya"), fallback ke input bebas.
  const typeOptions =
    !isOtherBrand && form.model.trim() !== "" ? typesForModel(brandChoice, form.model) : [];
  const hasTypeOptions = typeOptions.length > 0;
  const currentTypeUnknown =
    hasTypeOptions &&
    form.variant.trim() !== "" &&
    !typeOptions.some((t) => t.toUpperCase() === form.variant.trim().toUpperCase());

  function handleBrandChoice(choice: string) {
    setBrandChoice(choice);
    if (choice === OTHER_BRAND_OPTION) {
      set("brand", "");
    } else {
      set("brand", choice);
    }
    set("model", ""); // reset model tiap ganti brand supaya tidak nyangkut model brand lama
  }

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const MAX_PHOTOS = 6;

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const remaining = MAX_PHOTOS - form.images.length;
    if (remaining <= 0) {
      setError(`Maksimal ${MAX_PHOTOS} foto per motor. Hapus foto lain dulu untuk menambah.`);
      return;
    }
    const toUpload = Array.from(files).slice(0, remaining);
    if (files.length > remaining) {
      setError(
        `Hanya ${remaining} foto yang diunggah — sisanya dilewati karena batas maksimal ${MAX_PHOTOS} foto tercapai.`
      );
    } else {
      setError("");
    }
    setUploading(true);
    try {
      for (const file of toUpload) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error ?? "Upload gagal");
        setForm((f) => ({ ...f, images: [...f.images, data.url] }));
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
      stnk_expiry: form.stnk_expiry || null,
      bpkb: form.bpkb,
      plat_expiry: form.plat_expiry || null,
      faktur: form.faktur,
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
        <div className="mb-1 flex items-baseline justify-between">
          <label className={labelClass}>Foto motor</label>
          <span className="text-xs text-zinc-400">
            {form.images.length}/{MAX_PHOTOS} foto
          </span>
        </div>
        <div className="flex flex-wrap gap-3">
          {form.images.map((url, i) => (
            <div key={url} className="relative h-24 w-32 overflow-hidden rounded-lg border border-zinc-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
              {i === 0 && (
                <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
                  Utama
                </span>
              )}
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
          {form.images.length < MAX_PHOTOS && (
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
          )}
        </div>
        <p className="mt-1 text-xs text-zinc-400">
          JPG/PNG/WebP, maks 5MB per foto, maksimal {MAX_PHOTOS} foto per motor.
          Foto pertama jadi foto utama yang tampil di katalog — klik foto ini di
          halaman detail untuk melihat semua foto lainnya.
        </p>
      </section>

      {/* Info dasar */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Merek *</label>
          <select
            required
            className={inputClass}
            value={brandChoice}
            onChange={(e) => handleBrandChoice(e.target.value)}
          >
            <option value="" disabled>
              -- Pilih merek --
            </option>
            {BRAND_OPTIONS.map((b) => (
              <option key={b} value={b}>
                {b === OTHER_BRAND_OPTION ? b : b.charAt(0) + b.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
          {isOtherBrand && (
            <input
              required
              className={`${inputClass} mt-2`}
              value={form.brand}
              onChange={(e) => set("brand", e.target.value)}
              placeholder="Nama merek (contoh: Suzuki)"
            />
          )}
        </div>
        <div>
          <label className={labelClass}>Model *</label>
          {isOtherBrand ? (
            <input
              required
              className={inputClass}
              value={form.model}
              onChange={(e) => set("model", e.target.value)}
              placeholder="Contoh: Address"
            />
          ) : (
            <select
              required
              className={inputClass}
              value={form.model}
              onChange={(e) => {
                set("model", e.target.value);
                set("variant", ""); // reset Type tiap ganti model supaya tidak nyangkut Type model lama
              }}
            >
              <option value="" disabled>
                -- Pilih model --
              </option>
              {currentModelUnknown && (
                <option value={form.model}>{form.model} (data lama — pilih ulang)</option>
              )}
              {modelOptions.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          )}
          <p className="mt-1 text-xs text-zinc-400">
            Daftar model sesuai tabel resmi leasing — supaya perhitungan kredit
            (PGI) akurat. Detail trim diisi di kolom Type.
          </p>
        </div>
        <div>
          <label className={labelClass}>Type</label>
          {hasTypeOptions ? (
            <select
              className={inputClass}
              value={form.variant}
              onChange={(e) => set("variant", e.target.value)}
            >
              <option value="">-- Pilih type (opsional) --</option>
              {currentTypeUnknown && (
                <option value={form.variant}>{form.variant} (data lama — pilih ulang)</option>
              )}
              {typeOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          ) : (
            <input
              className={inputClass}
              value={form.variant}
              onChange={(e) => set("variant", e.target.value)}
              placeholder={
                form.model.trim() === ""
                  ? "Pilih Model dulu, atau ketik bebas"
                  : "Belum ada daftar Type untuk model ini — ketik bebas"
              }
            />
          )}
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
        <div>
          <label className={labelClass}>STNK s/d (opsional)</label>
          <input type="date" className={inputClass} value={form.stnk_expiry} onChange={(e) => set("stnk_expiry", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Plat s/d (opsional)</label>
          <input type="date" className={inputClass} value={form.plat_expiry} onChange={(e) => set("plat_expiry", e.target.value)} />
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
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.faktur} onChange={(e) => set("faktur", e.target.checked)} />
            Faktur
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
          <label className={labelClass}>Subsidi/potongan DP (Rp)</label>
          <input
            type="number"
            className={inputClass}
            value={form.dp_discount}
            onChange={(e) => set("dp_discount", e.target.value)}
            placeholder="0"
          />
          <p className="mt-1 text-xs text-zinc-400">
            Ditambahkan ke DP yang diinput pembeli sebelum dihitung di simulasi
            kredit. Isi positif untuk subsidi (contoh: DP input 5jt + subsidi 2jt
            → dihitung seolah DP 7jt, angsuran lebih ringan). Isi negatif untuk
            surcharge (mengurangi DP efektif, angsuran lebih berat).
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
          <p className="mt-1 text-xs text-zinc-400">
            Boleh diketik bebas (misal &quot;NMAX Keren&quot;) — sistem otomatis
            merapikan jadi format URL (huruf kecil, spasi jadi tanda hubung).
          </p>
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
