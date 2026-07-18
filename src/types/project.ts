import type { Category } from "@/data/site";
import type { RichTextBlock } from "@/types/richtext";

export type ProjectBlock =
  | { type: "image"; src: string; lightboxSrc?: string }
  | { type: "embed"; src: string; localSrc?: string }
  | RichTextBlock
  | { type: "html"; content: string }
  | { type: "tree"; columns: { flex: number; blocks: ProjectBlock[] }[] };

export type Project = {
  slug: string;
  title: string;
  subtitle: string;
  year: string;
  tags: string;
  cover: string;
  categories: Category[];
  featured: boolean;
  blocks: ProjectBlock[];
};

/** Minimal fields for project grid covers — avoids loading case-study blocks. */
export type ProjectCoverCard = Pick<
  Project,
  "slug" | "title" | "subtitle" | "cover"
>;

export type LightboxImage = {
  src: string;
  lightboxSrc: string;
};
