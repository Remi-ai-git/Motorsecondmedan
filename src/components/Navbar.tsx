import Link from "next/link";

export default function Navbar() {
  const wa = process.env.NEXT_PUBLIC_WA_NUMBER;
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-bold tracking-tight">
          Arta<span className="text-rose-600">Motor</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/motor" className="text-zinc-600 hover:text-zinc-900">
            Katalog
          </Link>
          <a
            href={`https://wa.me/${wa}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-green-600 px-3 py-1.5 font-medium text-white hover:bg-green-700"
          >
            WhatsApp Sales
          </a>
        </nav>
      </div>
    </header>
  );
}
