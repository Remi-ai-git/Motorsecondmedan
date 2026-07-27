import Link from "next/link";

export default function Navbar() {
  const wa = process.env.NEXT_PUBLIC_WA_NUMBER;
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-3 sm:px-4">
        <Link href="/" className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/artamotor-logo.png"
            alt="Arta Motor Medan"
            className="h-11 w-auto sm:h-12"
          />
          <span className="text-base font-extrabold leading-tight tracking-tight sm:text-lg">
            <span className="text-rose-600">ARTA</span>
            <span className="text-zinc-900">MOTOR</span>
            <br className="sm:hidden" />
            <span className="text-rose-600"> Medan</span>
          </span>
        </Link>
        <nav className="flex items-center gap-2 text-sm sm:gap-4">
          <Link href="/motor" className="text-zinc-600 hover:text-zinc-900">
            Katalog
          </Link>
          <a
            href={`https://wa.me/${wa}`}
            target="_blank"
            rel="noopener noreferrer"
            className="whitespace-nowrap rounded-full bg-green-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-green-700 sm:px-3 sm:text-sm"
          >
            <span className="sm:hidden">WA Sales</span>
            <span className="hidden sm:inline">WhatsApp Sales</span>
          </a>
        </nav>
      </div>
    </header>
  );
}
