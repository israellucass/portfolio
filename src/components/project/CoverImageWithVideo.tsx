"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

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
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [showVideo, setShowVideo] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !showVideo) {
      return;
    }

    const markReady = () => {
      setLoaded(true);
    };

    const handleError = () => {
      setShowVideo(false);
      setLoaded(true);
    };

    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      markReady();
    }

    video.addEventListener("loadeddata", markReady);
    video.addEventListener("canplay", markReady);
    video.addEventListener("playing", markReady);
    video.addEventListener("error", handleError);

    void video.play().catch(() => {
      /* Autoplay may be blocked; poster remains visible. */
    });

    return () => {
      video.removeEventListener("loadeddata", markReady);
      video.removeEventListener("canplay", markReady);
      video.removeEventListener("playing", markReady);
      video.removeEventListener("error", handleError);
    };
  }, [showVideo, videoSrc]);

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
        className={`cover__img cover__img--poster${
          loaded ? " cover__img--poster-hidden" : " cover__img--loaded"
        }`}
        priority={priority}
      />
      {showVideo ? (
        <video
          ref={videoRef}
          src={videoSrc}
          className={`cover__img cover__video${
            loaded ? " cover__img--loaded" : ""
          }`}
          autoPlay
          loop
          muted
          playsInline
          preload={priority ? "auto" : "metadata"}
        />
      ) : null}
    </>
  );
}
