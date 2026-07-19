"use client";

import { useCallback, useMemo, useState } from "react";
import { ProjectReveal } from "@/components/project/ProjectReveal";
import { BlockRenderer } from "@/components/project/BlockRenderer";
import { Lightbox } from "@/components/project/Lightbox";
import { ProjectPhaseStickyNav } from "@/components/project/ProjectPhaseStickyNav";
import { collectLightboxImages } from "@/lib/blocks";
import { extractProjectPhaseStickyConfig, type ProjectPhase } from "@/lib/project-phases";
import type { ProjectBlock } from "@/types/project";

type ProjectBlocksProps = {
  blocks: ProjectBlock[];
  title: string;
};

type LightboxState = {
  index: number;
} | null;

type BlockGroup =
  | { kind: "single"; block: ProjectBlock; index: number }
  | { kind: "media-copy"; blocks: { block: ProjectBlock; index: number }[] };

/** Image + richtext trees (CUBO feature demos) — group consecutive ones into a row. */
function isMediaCopyTree(block: ProjectBlock): boolean {
  if (block.type !== "tree") {
    return false;
  }

  const hasImage = block.columns.some((column) =>
    column.blocks.some((child) => child.type === "image"),
  );
  const hasText = block.columns.some((column) =>
    column.blocks.some(
      (child) => child.type === "richtext" || child.type === "html",
    ),
  );

  return hasImage && hasText;
}

function groupBlocks(blocks: ProjectBlock[]): BlockGroup[] {
  const groups: BlockGroup[] = [];
  let index = 0;

  while (index < blocks.length) {
    const block = blocks[index];

    if (block && isMediaCopyTree(block)) {
      const run: { block: ProjectBlock; index: number }[] = [];
      while (index < blocks.length && isMediaCopyTree(blocks[index]!)) {
        run.push({ block: blocks[index]!, index });
        index += 1;
      }
      groups.push({ kind: "media-copy", blocks: run });
      continue;
    }

    groups.push({ kind: "single", block: block!, index });
    index += 1;
  }

  return groups;
}

function getPhaseMarkerProps(
  blockIndex: number,
  phaseByBlockIndex: Map<number, ProjectPhase>,
): { id?: string; phaseId?: string } {
  const phase = phaseByBlockIndex.get(blockIndex);
  if (!phase) {
    return {};
  }

  return {
    id: `project-phase-${phase.id}`,
    phaseId: phase.id,
  };
}

function getStickyEndMarkerProps(
  blockIndex: number,
  endBeforeBlockIndex: number | null,
): { id?: string } {
  if (endBeforeBlockIndex === blockIndex) {
    return { id: "project-phase-sticky-end" };
  }

  return {};
}

export function ProjectBlocks({ blocks, title }: ProjectBlocksProps) {
  const images = useMemo(() => collectLightboxImages(blocks), [blocks]);
  const groups = useMemo(() => groupBlocks(blocks), [blocks]);
  const { phases, endBeforeBlockIndex } = useMemo(
    () => extractProjectPhaseStickyConfig(blocks),
    [blocks],
  );
  const phaseByBlockIndex = useMemo(() => {
    const map = new Map<number, ProjectPhase>();
    for (const phase of phases) {
      map.set(phase.blockIndex, phase);
    }
    return map;
  }, [phases]);
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
      {phases.length >= 2 ? (
        <ProjectPhaseStickyNav
          phases={phases}
          endBeforeBlockIndex={endBeforeBlockIndex}
        />
      ) : null}

      <div className="page-content modules content w-full">
        {groups.map((group, groupIndex) => {
          if (group.kind === "media-copy" && group.blocks.length > 1) {
            return (
              <div
                key={`media-copy-${group.blocks[0]!.index}`}
                className="project-feature-gallery"
              >
                {group.blocks.map(({ block, index }, itemIndex) => (
                  <ProjectReveal
                    key={`block-${index}`}
                    delay={Math.min(itemIndex * 90, 270)}
                    className="project-feature-gallery__item"
                    {...getPhaseMarkerProps(index, phaseByBlockIndex)}
                  >
                    <BlockRenderer
                      block={block}
                      blockIndex={String(index)}
                      title={title}
                      onImageClick={openLightbox}
                    />
                  </ProjectReveal>
                ))}
              </div>
            );
          }

          if (group.kind === "media-copy") {
            const { block, index } = group.blocks[0]!;
            return (
              <ProjectReveal
                key={`block-${index}`}
                delay={Math.min(groupIndex * 70, 350)}
                {...getPhaseMarkerProps(index, phaseByBlockIndex)}
              >
                <BlockRenderer
                  block={block}
                  blockIndex={String(index)}
                  title={title}
                  onImageClick={openLightbox}
                />
              </ProjectReveal>
            );
          }

          if (group.block.type === "embed") {
            return (
              <BlockRenderer
                key={`block-${group.index}`}
                block={group.block}
                blockIndex={String(group.index)}
                title={title}
                onImageClick={openLightbox}
              />
            );
          }

          return (
            <ProjectReveal
              key={`block-${group.index}`}
              delay={Math.min(groupIndex * 70, 350)}
              {...getPhaseMarkerProps(group.index, phaseByBlockIndex)}
              {...getStickyEndMarkerProps(group.index, endBeforeBlockIndex)}
            >
              <BlockRenderer
                block={group.block}
                blockIndex={String(group.index)}
                title={title}
                onImageClick={openLightbox}
              />
            </ProjectReveal>
          );
        })}
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
