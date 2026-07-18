"use client";

import Image from "next/image";
import { useState } from "react";

type CoverImageWithVideoProps = {
  src: string;
  videoSrc: string;
  sizes: string;
  priority?: boolean;
};

export function CoverImageWithVideo({
  src,
  videoSrc,
  sizes,
  priority = false,
}: CoverImageWithVideoProps) {
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
        className="cover__img cover__img--poster cover__img--loaded"
        priority={priority}
      />
      <video
        src={videoSrc}
        className={`cover__img cover__video${
          loaded ? " cover__img--loaded" : ""
        }`}
        autoPlay
        loop
        muted
        playsInline
        preload={priority ? "auto" : "metadata"}
        onLoadedData={handleComplete}
        onError={handleComplete}
      />
    </>
  );
}
