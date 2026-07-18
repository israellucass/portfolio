import type { LightboxImage, ProjectBlock } from "@/types/project";

export function collectLightboxImages(blocks: ProjectBlock[]): LightboxImage[] {
  const images: LightboxImage[] = [];

  for (const block of blocks) {
    if (block.type === "image") {
      images.push({
        src: block.src,
        lightboxSrc: block.lightboxSrc ?? block.src,
      });
    }

    if (block.type === "tree") {
      for (const column of block.columns) {
        images.push(...collectLightboxImages(column.blocks));
      }
    }
  }

  return images;
}
