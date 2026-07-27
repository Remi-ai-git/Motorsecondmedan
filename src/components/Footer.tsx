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
            className="text-rose-600 hover:underline"
          >
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
