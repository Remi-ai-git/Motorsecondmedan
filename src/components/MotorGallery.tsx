"use client";

import { useState } from "react";
import MotorLightbox from "@/components/MotorLightbox";

export default function MotorGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [active, setActive] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (images.length === 0) return null;

  return (
    <div className="mb-6">
      <button
        type="button"
        onClick={() => setLightboxIndex(active)}
        className="flex h-64 w-full items-center justify-center overflow-hidden rounded-2xl bg-zinc-100 sm:h-80"
        aria-label="Lihat foto full screen"
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
                setLightboxIndex(i);
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
        />
      )}
    </div>
  );
}
