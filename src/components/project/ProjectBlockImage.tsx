"use client";

import Image from "next/image";
import { useState } from "react";

type ProjectBlockImageProps = {
  src: string;
  videoSrc?: string;
  title: string;
  onImageClick: (src: string, lightboxSrc: string) => void;
  lightboxSrc: string;
  /** Inside a tree column — drop default bottom padding (parent tree owns spacing) */
  compact?: boolean;
};

export function ProjectBlockImage({
  src,
  videoSrc,
  title,
  onImageClick,
  lightboxSrc,
  compact = false,
}: ProjectBlockImageProps) {
  const [useVideoFallback, setUseVideoFallback] = useState(Boolean(videoSrc));

  return (
    <figure
      className={`project-module-image mb-0${compact ? " pb-0" : " pb-10"}`}
    >
      <button
        type="button"
        onClick={() => onImageClick(src, lightboxSrc)}
        className="js-lightbox block w-full cursor-zoom-in border-0 bg-transparent p-0 text-left leading-none"
        aria-label={`Open ${title} image in lightbox`}
      >
        {videoSrc && useVideoFallback ? (
          <video
            src={videoSrc}
            poster={src}
            className="project-module-video block h-auto w-full bg-transparent"
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
            className="block h-auto w-full"
            sizes="(max-width: 960px) 84vw, 960px"
            loading="lazy"
          />
        )}
      </button>
    </figure>
  );
}
