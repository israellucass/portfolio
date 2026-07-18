"use client";

import { useEffect, useState } from "react";

const ALLOWED_EMBED_HOSTS = ["xd.adobe.com", "player.vimeo.com"];

type ProjectEmbedProps = {
  src: string;
  localSrc?: string;
  title: string;
};

function isAllowedEmbedUrl(url: string): boolean {
  try {
    return ALLOWED_EMBED_HOSTS.includes(new URL(url).hostname);
  } catch {
    return false;
  }
}

export function ProjectEmbed({ src, localSrc, title }: ProjectEmbedProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (localSrc || !isAllowedEmbedUrl(src)) return;

    let cancelled = false;
    const cacheKey = `embed-ok:${src}`;

    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached === "0") {
        setVisible(false);
        return;
      }
      if (cached === "1") return;
    } catch {
      // sessionStorage unavailable
    }

    const controller = new AbortController();

    fetch(`/api/embed-health?url=${encodeURIComponent(src)}`, {
      signal: controller.signal,
    })
      .then((response) => response.json())
      .then((data: { ok?: boolean }) => {
        if (cancelled) return;
        const ok = Boolean(data.ok);
        try {
          sessionStorage.setItem(cacheKey, ok ? "1" : "0");
        } catch {
          // ignore
        }
        if (!ok) setVisible(false);
      })
      .catch(() => {
        // Keep embed visible when the health check itself fails.
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [src, localSrc]);

  if (localSrc) {
    return (
      <div className="project-module-embed relative mb-0 aspect-video w-full pb-10">
        <video
          src={localSrc}
          controls
          playsInline
          className="absolute inset-0 h-full w-full bg-black object-contain"
          title={`${title} video`}
        />
      </div>
    );
  }

  if (!visible) return null;

  return (
    <div className="project-module-embed relative mb-0 aspect-video w-full pb-10">
      <iframe
        src={src}
        title={`${title} embed`}
        className="absolute inset-0 h-full w-full border-0"
        allowFullScreen
        sandbox="allow-same-origin allow-scripts allow-pointer-lock allow-forms allow-popups allow-popups-to-escape-sandbox"
      />
    </div>
  );
}
