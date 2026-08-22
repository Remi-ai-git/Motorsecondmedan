"use client";

/**
 * Tombol floating pojok kanan bawah. Sebelumnya membuka panel AI Chat
 * Assistant — atas keputusan pemilik, tombol ini sekarang jadi link
 * langsung ke WhatsApp Marketing (bukan lagi AI chat).
 */
export default function ChatWidget() {
  const wa = process.env.NEXT_PUBLIC_WA_NUMBER;
  const text = encodeURIComponent(
    "Halo Arta Motor, saya ingin tanya soal motor yang tersedia."
  );

  return (
    <a
      href={`https://wa.me/${wa}?text=${text}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp Marketing"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-white shadow-lg transition hover:scale-105 hover:bg-green-700"
    >
      <span className="text-2xl">💬</span>
    </a>
  );
}
