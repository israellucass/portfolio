"use client";

import { useCallback, useMemo, useState } from "react";
import { BlockRenderer } from "@/components/project/BlockRenderer";
import { Lightbox } from "@/components/project/Lightbox";
import { collectLightboxImages } from "@/lib/blocks";
import type { ProjectBlock } from "@/types/project";

type ProjectBlocksProps = {
  blocks: ProjectBlock[];
  title: string;
};

type LightboxState = {
  index: number;
} | null;

export function ProjectBlocks({ blocks, title }: ProjectBlocksProps) {
  const images = useMemo(() => collectLightboxImages(blocks), [blocks]);
  const [lightbox, setLightbox] = useState<LightboxState>(null);

  const openLightbox = useCallback(
    (src: string, _lightboxSrc?: string) => {
      const index = images.findIndex((image) => image.src === src);
      if (index >= 0) setLightbox({ index });
    },
    [images],
  );

  const closeLightbox = useCallback(() => setLightbox(null), []);

  const navigateLightbox = useCallback(
    (delta: number) => {
      setLightbox((current) => {
        if (!current || images.length === 0) return current;
        const next = (current.index + delta + images.length) % images.length;
        return { index: next };
      });
    },
    [images.length],
  );

  return (
    <>
      <div className="page-content modules content w-full">
        {blocks.map((block, index) => (
          <BlockRenderer
            key={`block-${index}`}
            block={block}
            blockIndex={String(index)}
            title={title}
            onImageClick={openLightbox}
          />
        ))}
      </div>

      {lightbox ? (
        <Lightbox
          images={images}
          index={lightbox.index}
          title={title}
          onClose={closeLightbox}
          onNavigate={navigateLightbox}
        />
      ) : null}
    </>
  );
}
