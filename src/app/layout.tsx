import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";

export const metadata: Metadata = {
  title: "Arta Motor — Jual Beli Motor Bekas Berkualitas di Medan",
  description:
    "Dealer motor bekas terpercaya di Medan. Surat lengkap, garansi mesin, bisa kredit & tukar tambah. Dilengkapi AI Sales Assistant.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <ChatWidget />
      </body>
    </html>
  );
}
