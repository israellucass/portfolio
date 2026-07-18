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

    let disposed = false;

    const markReady = () => {
      if (!disposed) {
        setLoaded(true);
      }
    };

    const playVideo = () => {
      if (disposed || document.hidden) {
        return;
      }

      void video.play().catch(() => {
        /* Autoplay may be blocked; poster remains visible. */
      });
    };

    const handleEnded = () => {
      video.currentTime = 0;
      playVideo();
    };

    const handleError = () => {
      if (disposed) {
        return;
      }

      video.currentTime = 0;
      playVideo();

      window.setTimeout(() => {
        if (disposed || !video.error) {
          return;
        }

        setShowVideo(false);
        setLoaded(true);
      }, 400);
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        playVideo();
      }
    };

    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      markReady();
    }

    video.addEventListener("loadeddata", markReady);
    video.addEventListener("canplay", markReady);
    video.addEventListener("playing", markReady);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("error", handleError);
    document.addEventListener("visibilitychange", handleVisibility);

    const wrap = video.closest(".cover-image-wrap");
    const observer =
      wrap &&
      new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              playVideo();
            } else {
              video.pause();
            }
          });
        },
        { threshold: 0.15, rootMargin: "64px 0px" },
      );

    if (wrap && observer) {
      observer.observe(wrap);
    } else {
      playVideo();
    }

    return () => {
      disposed = true;
      video.removeEventListener("loadeddata", markReady);
      video.removeEventListener("canplay", markReady);
      video.removeEventListener("playing", markReady);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("error", handleError);
      document.removeEventListener("visibilitychange", handleVisibility);
      observer?.disconnect();
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
