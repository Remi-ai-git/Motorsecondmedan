export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white py-8">
      <div className="mx-auto max-w-6xl px-4 text-sm text-zinc-500">
        <p className="font-semibold text-zinc-700">Arta Motor</p>
        <p>Dealer motor bekas berkualitas — Medan, Sumatera Utara.</p>
        <p className="mt-2">
          Semua unit bersurat lengkap (STNK + BPKB), garansi mesin 1 bulan,
          bisa kredit &amp; tukar tambah.
        </p>
        <p className="mt-4">© {new Date().getFullYear()} Arta Motor</p>
      </div>
    </footer>
  );
}
