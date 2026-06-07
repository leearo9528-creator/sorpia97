"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PhotoSlot } from "./PhotoSlot";

type Props = {
  photos: string[];
  aspect?: string;
  rounded?: string;
};

export function PhotoCarousel({ photos, aspect = "aspect-[16/10]", rounded = "rounded-[24px]" }: Props) {
  const [idx, setIdx] = useState(0);

  if (photos.length === 0) {
    return (
      <PhotoSlot
        label="사진1"
        hint="카페 메인 전경"
        aspect={aspect}
        rounded={rounded}
      />
    );
  }

  const prev = () => setIdx((i) => (i - 1 + photos.length) % photos.length);
  const next = () => setIdx((i) => (i + 1) % photos.length);

  return (
    <div className={`relative overflow-hidden ${aspect} ${rounded} select-none bg-[var(--surface-2)]`}>
      {photos.map((url, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-300"
          style={{ opacity: i === idx ? 1 : 0, pointerEvents: i === idx ? "auto" : "none" }}
        >
          <Image
            src={url}
            alt={`사진 ${i + 1}`}
            fill
            priority={i === 0}
            sizes="(max-width: 768px) 100vw, 720px"
            className="object-cover"
            draggable={false}
          />
        </div>
      ))}

      {photos.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 text-white flex items-center justify-center hover:bg-black/50 transition-colors z-10"
            aria-label="이전 사진"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 text-white flex items-center justify-center hover:bg-black/50 transition-colors z-10"
            aria-label="다음 사진"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {photos.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${i === idx ? "bg-white" : "bg-white/50"}`}
                aria-label={`${i + 1}번 사진`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
