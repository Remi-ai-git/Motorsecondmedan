"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminNav() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="mb-6 flex items-center justify-between border-b border-zinc-200 pb-4">
      <Link href="/admin" className="text-lg font-bold">
        Admin Arta<span className="text-rose-600">Motor</span>
      </Link>
      <div className="flex items-center gap-3 text-sm">
        <Link href="/" target="_blank" className="text-zinc-500 hover:text-zinc-800">
          Lihat situs ↗
        </Link>
        <button
          onClick={logout}
          className="rounded-full border border-zinc-300 px-3 py-1.5 text-zinc-600 hover:border-rose-300 hover:text-rose-600"
        >
          Keluar
        </button>
      </div>
    </div>
  );
}
