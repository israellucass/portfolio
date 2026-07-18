import Image from "next/image";
import { ProjectEmbed } from "@/components/project/ProjectEmbed";
import { RichText } from "@/components/project/RichText";
import type { ProjectBlock } from "@/types/project";

type BlockRendererProps = {
  block: ProjectBlock;
  blockIndex: string;
  title: string;
  onImageClick: (src: string) => void;
};

export function BlockRenderer({
  block,
  blockIndex,
  title,
  onImageClick,
}: BlockRendererProps) {
  if (block.type === "tree") {
    return (
      <div
        className={`tree-wrapper tree-${blockIndex} valign-top flex w-full flex-col lg:flex-row lg:items-start`}
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
              />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (block.type === "image") {
    return (
      <figure className="project-module-image mb-0 pb-10">
        <button
          type="button"
          onClick={() => onImageClick(block.src)}
          className="js-lightbox block w-full cursor-zoom-in text-left"
          aria-label={`Open ${title} image in lightbox`}
        >
          <Image
            src={block.src}
            alt={`${title} — project image`}
            width={1920}
            height={1080}
            className="h-auto w-full"
            sizes="100vw"
            unoptimized={block.src.endsWith(".gif")}
          />
        </button>
      </figure>
    );
  }

  if (block.type === "embed") {
    return (
      <ProjectEmbed src={block.src} localSrc={block.localSrc} title={title} />
    );
  }

  if (block.type === "richtext") {
    return <RichText paragraphs={block.paragraphs} />;
  }

  if (block.type === "html") {
    return (
      <div
        className="project-module-text project-html mb-0 w-full px-[8%] pb-10 text-[var(--text-primary)]"
        dangerouslySetInnerHTML={{ __html: block.content }}
      />
    );
  }

  return null;
}
