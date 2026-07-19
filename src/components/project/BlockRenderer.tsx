import Image from "next/image";
import { ProjectBlockImage } from "@/components/project/ProjectBlockImage";
import { ProjectEmbed } from "@/components/project/ProjectEmbed";
import { RichText } from "@/components/project/RichText";
import { getImageVideoPath } from "@/lib/media";
import type { ProjectBlock } from "@/types/project";

type BlockRendererProps = {
  block: ProjectBlock;
  blockIndex: string;
  title: string;
  onImageClick: (src: string, lightboxSrc: string) => void;
  /** Rich text/images inside a tree column — no page-level padding or reading width */
  inTree?: boolean;
  /** Constrain image padding for image+copy feature rows */
  compactImage?: boolean;
};

export function BlockRenderer({
  block,
  blockIndex,
  title,
  onImageClick,
  inTree = false,
  compactImage = false,
}: BlockRendererProps) {
  if (block.type === "tree") {
    const hasImage = block.columns.some((column) =>
      column.blocks.some((child) => child.type === "image"),
    );
    const hasText = block.columns.some((column) =>
      column.blocks.some(
        (child) => child.type === "richtext" || child.type === "html",
      ),
    );
    const mediaCopy = hasImage && hasText;

    return (
      <div
        className={`tree-wrapper tree-${blockIndex} valign-top flex w-full flex-col lg:flex-row lg:items-start${
          mediaCopy ? " tree-wrapper--media-copy" : ""
        }`}
      >
        {block.columns.map((column, columnIndex) => (
          <div
            key={`${blockIndex}-col-${columnIndex}`}
            className="tree-child-wrapper min-w-0 lg:flex-1"
            style={{ flex: column.flex }}
          >
            {column.blocks.map((child, childIndex) => (
              <BlockRenderer
                key={`${blockIndex}-${columnIndex}-${childIndex}`}
                block={child}
                blockIndex={`${blockIndex}-${columnIndex}-${childIndex}`}
                title={title}
                onImageClick={onImageClick}
                inTree
                compactImage={mediaCopy}
              />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (block.type === "image") {
    const lightboxSrc = block.lightboxSrc ?? block.src;
    return (
      <ProjectBlockImage
        src={block.src}
        videoSrc={getImageVideoPath(block.src)}
        title={title}
        lightboxSrc={lightboxSrc}
        onImageClick={onImageClick}
        compact={compactImage}
      />
    );
  }

  if (block.type === "embed") {
    return (
      <ProjectEmbed src={block.src} localSrc={block.localSrc} title={title} />
    );
  }

  if (block.type === "richtext") {
    return (
      <RichText
        paragraphs={block.paragraphs}
        variant={inTree ? "nested" : "default"}
      />
    );
  }

  if (block.type === "html") {
    return (
      <div
        className={`project-module-text project-html mb-0 w-full pb-10 text-[var(--text-primary)]${
          inTree
            ? " project-module-text--nested"
            : " project-module-text--reading px-[8%]"
        }`}
        dangerouslySetInnerHTML={{ __html: block.content }}
      />
    );
  }

  return null;
}
