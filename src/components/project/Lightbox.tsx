"use client";

import { useEffect, useState } from "react";
import type { LightboxImage } from "@/types/project";

type LightboxProps = {
  images: LightboxImage[];
  index: number;
  title: string;
  onClose: () => void;
  onNavigate: (delta: number) => void;
};

function getLightboxVideoSrc(lightboxSrc: string): string | undefined {
  if (!lightboxSrc.endsWith(".webp")) {
    return undefined;
  }

  return lightboxSrc.replace(/\.webp$/, ".mp4");
}

export function Lightbox({
  images,
  index,
  title,
  onClose,
  onNavigate,
}: LightboxProps) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") onNavigate(-1);
      if (event.key === "ArrowRight") onNavigate(1);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, onNavigate]);

  const image = images[index];
  const videoSrc = getLightboxVideoSrc(image.lightboxSrc);
  const [useVideo, setUseVideo] = useState(Boolean(videoSrc));
  const imageLabel =
    images.length > 1
      ? `${title} — image ${index + 1} of ${images.length}`
      : `${title} — full size image`;

  useEffect(() => {
    setUseVideo(Boolean(videoSrc));
  }, [videoSrc, index]);

  return (
    <div
      className="lightbox-overlay fixed inset-0 z-[100000] flex items-center justify-center overscroll-contain bg-white/[0.94] p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image lightbox"
    >
      <button
        type="button"
        onClick={onClose}
        className="focus-ring absolute right-5 top-5 z-10 flex h-10 w-10 items-center justify-center text-3xl leading-none text-black/70 transition-colors hover:text-black"
        aria-label="Close lightbox"
      >
        ×
      </button>

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onNavigate(-1);
            }}
            className="focus-ring absolute left-4 top-1/2 z-10 -translate-y-1/2 px-3 py-2 text-4xl text-black/50 transition-colors hover:text-black"
            aria-label="Previous image"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onNavigate(1);
            }}
            className="focus-ring absolute right-4 top-1/2 z-10 -translate-y-1/2 px-3 py-2 text-4xl text-black/50 transition-colors hover:text-black"
            aria-label="Next image"
          >
            ›
          </button>
        </>
      )}

      {videoSrc && useVideo ? (
        <video
          src={videoSrc}
          poster={image.lightboxSrc}
          className="lightbox-video max-h-[92vh] max-w-[92vw] object-contain"
          autoPlay
          loop
          muted
          playsInline
          controls
          onClick={(event) => event.stopPropagation()}
          onError={() => setUseVideo(false)}
        />
      ) : (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={image.lightboxSrc}
          alt={imageLabel}
          className="max-h-[92vh] max-w-[92vw] object-contain"
          onClick={(event) => event.stopPropagation()}
        />
      )}
    </div>
  );
}
