export default function Footer() {
  const wa = process.env.NEXT_PUBLIC_WA_NUMBER;
  return (
    <footer className="border-t border-zinc-200 bg-white py-8">
      <div className="mx-auto max-w-6xl px-4 text-sm text-zinc-500">
        <p className="font-semibold text-zinc-700">Arta Motor</p>
        <p>Dealer motor bekas berkualitas — Medan, Sumatera Utara.</p>
        <p className="mt-2">
          Semua unit bersurat lengkap (STNK + BPKB), garansi mesin 1 bulan,
          bisa kredit &amp; tukar tambah.
        </p>
        <p className="mt-4">
          <a
            href="https://maps.app.goo.gl/GVAX4Cp4jdmzZPq8A?g_st=aw"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-start gap-1 text-rose-600 hover:underline"
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="mt-0.5 h-4 w-4 flex-shrink-0"
              aria-hidden="true"
            >
              <path d="M12 2C7.58 2 4 5.58 4 10c0 5.25 6.19 11.19 7.14 12.07a1.2 1.2 0 0 0 1.72 0C13.81 21.19 20 15.25 20 10c0-4.42-3.58-8-8-8zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" />
            </svg>
            Jl. Brig Jend. Zein Hamid No.1, Titi Kuning, Medan Johor, Medan
            City, North Sumatra 20147
          </a>
        </p>
        {wa && (
          <p className="mt-1">
            WhatsApp:{" "}
            <a
              href={`https://wa.me/${wa}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-rose-600 hover:underline"
            >
              0{wa.slice(2)}
            </a>
          </p>
        )}
        <p className="mt-4">© {new Date().getFullYear()} Arta Motor</p>
      </div>
    </footer>
  );
}
