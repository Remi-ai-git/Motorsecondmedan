"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteMotorButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(`Hapus "${name}" dari stok? Tindakan ini tidak bisa dibatalkan.`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/motors/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? "Gagal menghapus");
      }
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal menghapus");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-xs text-rose-600 hover:underline disabled:opacity-50"
    >
      {loading ? "Menghapus…" : "Hapus"}
    </button>
  );
}
