import { isDesignQuestion } from "@/lib/design-question";
import type { ProjectBlock } from "@/types/project";
import type { RichTextParagraph } from "@/types/richtext";
import { isPhaseHeadingParagraph, parsePhaseHeading } from "@/lib/project-phases";

export type TocHeading = {
  id: string;
  label: string;
  level: 1 | 2 | 3;
  blockIndex: number;
  paragraphIndex: number;
  isPhase?: true;
};

export type TocPhaseGroup = {
  phase: TocHeading;
  children: TocHeading[];
};

export type GroupedHeadings = {
  before: TocHeading[];
  phases: TocPhaseGroup[];
  after: TocHeading[];
};

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function makeHeadingId(slug: string, blockIndex: number): string {
  return `${slug}-${blockIndex}`;
}

function isSubsectionHeading(paragraph: RichTextParagraph): boolean {
  return (
    paragraph.kind === "paragraph" &&
    paragraph.inlines.some(
      (inline) =>
        inline.marks?.includes("bold") &&
        inline.marks?.includes("italic") &&
        inline.marks?.includes("display"),
    )
  );
}

function isCreativeSectionHeading(paragraph: RichTextParagraph): boolean {
  if (paragraph.kind !== "paragraph") return false;

  const inlineText = paragraph.inlines
    .map((inline) => inline.text)
    .join("")
    .trim();

  if (inlineText.length === 0 || inlineText.length > 40) return false;
  if (/^client:/i.test(inlineText)) return false;

  return /^[A-Z0-9\s&.–\-/]+$/.test(inlineText);
}

function getHeadingText(paragraph: RichTextParagraph): string {
  return paragraph.inlines.map((inline) => inline.text).join("").trim();
}

function extractHeadingsFromParagraphs(
  paragraphs: RichTextParagraph[],
  blockIndex: number,
): TocHeading[] {
  const headings: TocHeading[] = [];

  for (let pi = 0; pi < paragraphs.length; pi++) {
    const p = paragraphs[pi]!;

    if (isPhaseHeadingParagraph(p)) {
      const { label, subtitle } = parsePhaseHeading(p);
      const text = subtitle ? `${label} - ${subtitle}` : label;
      headings.push({
        id: makeHeadingId(slugifyHeading(text), blockIndex),
        label: text,
        level: 1,
        blockIndex,
        paragraphIndex: pi,
        isPhase: true,
      });
      continue;
    }

    if (p.kind === "subheading") {
      const text = getHeadingText(p);
      if (!text) continue;
      headings.push({
        id: makeHeadingId(slugifyHeading(text), blockIndex),
        label: text,
        level: 2,
        blockIndex,
        paragraphIndex: pi,
      });
      continue;
    }

    if (
      p.kind === "heading" &&
      !isPhaseHeadingParagraph(p) &&
      !isDesignQuestion(p)
    ) {
      const text = getHeadingText(p);
      if (!text) continue;
      headings.push({
        id: makeHeadingId(slugifyHeading(text), blockIndex),
        label: text,
        level: 2,
        blockIndex,
        paragraphIndex: pi,
      });
      continue;
    }

    if (isCreativeSectionHeading(p)) {
      const text = getHeadingText(p);
      if (!text) continue;
      headings.push({
        id: makeHeadingId(slugifyHeading(text), blockIndex),
        label: text,
        level: 2,
        blockIndex,
        paragraphIndex: pi,
      });
      continue;
    }

    // L3 headings (subsection) intentionally excluded from ToC
  }

  return headings;
}

export function extractProjectHeadings(blocks: ProjectBlock[]): TocHeading[] {
  const headings: TocHeading[] = [];

  function walk(b: ProjectBlock[], baseBlockIndex: number) {
    for (let bi = 0; bi < b.length; bi++) {
      const block = b[bi]!;
      const absoluteIndex = baseBlockIndex + bi;

      if (block.type === "richtext") {
        const extracted = extractHeadingsFromParagraphs(
          block.paragraphs,
          absoluteIndex,
        );
        headings.push(...extracted);
      }

      if (block.type === "tree") {
        for (const col of block.columns) {
          walk(col.blocks, absoluteIndex);
        }
      }
    }
  }

  walk(blocks, 0);
  return headings;
}

export function groupHeadingsByPhase(headings: TocHeading[]): GroupedHeadings {
  const phaseIndices: number[] = [];

  for (let i = 0; i < headings.length; i++) {
    if (headings[i]!.isPhase) {
      phaseIndices.push(i);
    }
  }

  if (phaseIndices.length < 2) {
    return { before: headings, phases: [], after: [] };
  }

  const before = headings.slice(0, phaseIndices[0]!);
  const phases: TocPhaseGroup[] = [];

  for (let pi = 0; pi < phaseIndices.length; pi++) {
    const phaseIdx = phaseIndices[pi]!;
    const nextPhaseIdx = phaseIndices[pi + 1];
    const isLast = pi === phaseIndices.length - 1;
    const endIdx = nextPhaseIdx ?? (isLast ? headings.length - 1 : headings.length);
    const phase = headings[phaseIdx]!;
    const children = headings.slice(phaseIdx + 1, endIdx);

    phases.push({ phase, children });
  }

  const lastPhaseIdx = phaseIndices[phaseIndices.length - 1]!;
  const lastPhase = phases[phases.length - 1];
  const afterStartIdx = lastPhaseIdx + 1 + lastPhase.children.length;
  const after = headings.slice(afterStartIdx);

  return { before, phases, after };
}

export function buildProjectTocGroups(
  blocks: ProjectBlock[],
  options?: { includeFold?: boolean },
): GroupedHeadings {
  const headings = extractProjectHeadings(blocks);

  if (options?.includeFold) {
    headings.unshift({
      id: "about-the-project",
      label: "About the Project",
      level: 1,
      blockIndex: -1,
      paragraphIndex: -1,
    });
  }

  return groupHeadingsByPhase(headings);
}

/** Stable heading ID for a given paragraph — must match the slugify logic above. */
export function getHeadingId(
  paragraph: RichTextParagraph,
  blockIndex?: number,
): string | null {
  const makeId = (slug: string): string | null => {
    if (blockIndex !== undefined) {
      return makeHeadingId(slug, blockIndex);
    }
    return slug;
  };

  if (isPhaseHeadingParagraph(paragraph)) {
    const { label, subtitle } = parsePhaseHeading(paragraph);
    const text = subtitle ? `${label} - ${subtitle}` : label;
    return makeId(slugifyHeading(text));
  }

  if (isDesignQuestion(paragraph)) {
    return null;
  }

  if (
    paragraph.kind === "subheading" ||
    paragraph.kind === "heading" ||
    isCreativeSectionHeading(paragraph) ||
    isSubsectionHeading(paragraph)
  ) {
    const text = getHeadingText(paragraph);
    return text ? makeId(slugifyHeading(text)) : null;
  }

  return null;
}
