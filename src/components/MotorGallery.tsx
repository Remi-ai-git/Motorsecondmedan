"use client";

import { useEffect, useRef, useState } from "react";
import MotorLightbox from "@/components/MotorLightbox";

// Jendela waktu antar tap/klik supaya dianggap "double tap/click".
const DOUBLE_TAP_MS = 350;
const DOUBLE_TAP_ZOOM = 2.5;

export default function MotorGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [active, setActive] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [startZoomed, setStartZoomed] = useState(false);

  const lastTap = useRef(0);
  const pendingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (pendingTimer.current) clearTimeout(pendingTimer.current);
    };
  }, []);

  if (images.length === 0) return null;

  function openLightbox(i: number, zoomed: boolean) {
    setStartZoomed(zoomed);
    setLightboxIndex(i);
  }

  /**
   * Tap/klik pertama di foto TIDAK langsung buka lightbox — ditunda sebentar
   * (DOUBLE_TAP_MS) dulu. Kalau ada tap kedua yang menyusul cepat sebelum
   * jendela waktu itu habis, dianggap "double tap" dan lightbox langsung
   * dibuka dalam kondisi ZOOM. Ini perlu karena begitu lightbox kebuka,
   * DOM foto lama sudah diganti — tap fisik kedua user tidak akan pernah
   * "mendarat" di elemen yang sama lagi buat dideteksi belakangan, jadi
   * keputusan double-tap harus selesai SEBELUM lightbox di-mount.
   */
  function handleTap(i: number) {
    const now = Date.now();
    if (now - lastTap.current < DOUBLE_TAP_MS) {
      if (pendingTimer.current) clearTimeout(pendingTimer.current);
      lastTap.current = 0;
      openLightbox(i, true);
      return;
    }
    lastTap.current = now;
    pendingTimer.current = setTimeout(() => {
      openLightbox(i, false);
    }, DOUBLE_TAP_MS);
  }

  return (
    <div className="mb-6">
      <button
        type="button"
        onClick={() => handleTap(active)}
        className="flex h-64 w-full items-center justify-center overflow-hidden rounded-2xl bg-zinc-100 sm:h-80"
        aria-label="Lihat foto full screen — tap 2x untuk zoom"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[active]}
          alt={alt}
          className="h-full w-full object-contain"
        />
      </button>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {images.map((url, i) => (
            <button
              key={url}
              onClick={() => {
                setActive(i);
                openLightbox(i, false);
              }}
              className={`flex h-16 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border-2 bg-zinc-100 ${
                i === active ? "border-rose-600" : "border-transparent"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-contain" />
            </button>
          ))}
        </div>
      )}

      {lightboxIndex !== null && (
        <MotorLightbox
          images={images}
          alt={alt}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          initialScale={startZoomed ? DOUBLE_TAP_ZOOM : undefined}
        />
      )}
    </div>
  );
}
