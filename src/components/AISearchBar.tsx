"use client";

import { useState } from "react";
import MotorCard from "@/components/MotorCard";
import type { Motor } from "@/lib/types";

const EXAMPLES = [
  "Motor Beat di bawah 18 juta",
  "NMAX tahun 2023",
  "Motor untuk ojol",
  "Matic irit km rendah",
];

export default function AISearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Motor[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function search(q: string) {
    if (!q.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      if (!res.ok) throw new Error("Pencarian gagal");
      const data = await res.json();
      setResults(data.results);
    } catch {
      setError("Pencarian AI gagal. Coba lagi atau gunakan katalog di bawah.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          search(query);
        }}
        className="flex gap-2"
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='Cari dengan bahasa alami, mis. "matic irit di bawah 18 juta"'
          className="flex-1 rounded-full border border-zinc-300 bg-white px-5 py-3 text-sm outline-none focus:border-rose-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-rose-600 px-5 py-3 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50"
        >
          {loading ? "Mencari…" : "✨ Cari AI"}
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            onClick={() => {
              setQuery(ex);
              search(ex);
            }}
            className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs text-zinc-600 hover:border-rose-300 hover:text-rose-600"
          >
            {ex}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-rose-600">{error}</p>}

      {results !== null && (
        <div>
          <p className="mb-3 text-sm text-zinc-600">
            {results.length > 0
              ? `Ditemukan ${results.length} motor:`
              : "Tidak ada motor yang cocok. Coba kata kunci lain atau tanya asisten AI 💬."}
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((m) => (
              <MotorCard key={m.id} motor={m} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
