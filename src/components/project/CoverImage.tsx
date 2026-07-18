"use client";

import Image from "next/image";
import { useState } from "react";

type CoverImageProps = {
  src: string;
  sizes: string;
  priority?: boolean;
};

export function CoverImage({ src, sizes, priority = false }: CoverImageProps) {
  const [loaded, setLoaded] = useState(false);

  const handleComplete = () => {
    setLoaded(true);
  };

  return (
    <>
      <div
        className={`cover-skeleton skeleton-shimmer${
          loaded ? " cover-skeleton--hidden" : ""
        }`}
        aria-hidden
      />
      <Image
        src={src}
        alt=""
        fill
        sizes={sizes}
        className={`cover__img${loaded ? " cover__img--loaded" : ""}`}
        unoptimized={src.endsWith(".gif")}
        priority={priority}
        onLoad={handleComplete}
        onLoadingComplete={handleComplete}
      />
    </>
  );
}
