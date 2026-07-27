"use client";

import { useState } from "react";

export default function MotorGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [active, setActive] = useState(0);

  if (images.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex h-64 items-center justify-center overflow-hidden rounded-2xl bg-zinc-100 sm:h-80">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[active]}
          alt={alt}
          className="h-full w-full object-contain"
        />
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {images.map((url, i) => (
            <button
              key={url}
              onClick={() => setActive(i)}
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
    </div>
  );
}
