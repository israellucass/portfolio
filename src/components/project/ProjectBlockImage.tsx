"use client";

import Image from "next/image";
import { useState } from "react";

type ProjectBlockImageProps = {
  src: string;
  videoSrc?: string;
  title: string;
  onImageClick: (src: string, lightboxSrc: string) => void;
  lightboxSrc: string;
};

export function ProjectBlockImage({
  src,
  videoSrc,
  title,
  onImageClick,
  lightboxSrc,
}: ProjectBlockImageProps) {
  const [useVideoFallback, setUseVideoFallback] = useState(Boolean(videoSrc));

  return (
    <figure className="project-module-image mb-0 pb-10">
      <button
        type="button"
        onClick={() => onImageClick(src, lightboxSrc)}
        className="js-lightbox block w-full cursor-zoom-in text-left"
        aria-label={`Open ${title} image in lightbox`}
      >
        {videoSrc && useVideoFallback ? (
          <video
            src={videoSrc}
            poster={src}
            className="project-module-video h-auto w-full"
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            onError={() => setUseVideoFallback(false)}
          />
        ) : (
          <Image
            src={src}
            alt={`${title} — project image`}
            width={1920}
            height={1080}
            className="h-auto w-full"
            sizes="100vw"
          />
        )}
      </button>
    </figure>
  );
}
