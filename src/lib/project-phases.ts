import type { ProjectBlock } from "@/types/project";
import type { RichTextParagraph } from "@/types/richtext";

export { isPhaseHeadingParagraph, parsePhaseHeading };

export type ProjectPhase = {
  id: string;
  label: string;
  subtitle: string;
  blockIndex: number;
};

export type ProjectPhaseStickyConfig = {
  phases: ProjectPhase[];
  /** Block index where sticky nav turns off (RESULTS and everything after). */
  endBeforeBlockIndex: number | null;
};

function isResultsSectionBlock(block: ProjectBlock): boolean {
  if (block.type !== "richtext") {
    return false;
  }

  return block.paragraphs.some((paragraph) => {
    if (paragraph.kind !== "subheading" && paragraph.kind !== "heading") {
      return false;
    }

    const inlineText = paragraph.inlines.map((inline) => inline.text).join("");
    return /^RESULTS\s*$/i.test(inlineText.trim());
  });
}

function isPhaseHeadingParagraph(paragraph: RichTextParagraph): boolean {
  if (paragraph.align !== "center") {
    return false;
  }
  if (paragraph.kind !== "paragraph" && paragraph.kind !== "heading") {
    return false;
  }
  const inlineText = paragraph.inlines.map((inline) => inline.text).join("");
  return /PHASE\s+[IVXLCDM]+/i.test(inlineText);
}

function parsePhaseHeading(paragraph: RichTextParagraph): {
  label: string;
  subtitle: string;
} {
  const labelParts: string[] = [];
  const subtitleParts: string[] = [];
  let foundLabel = false;

  for (const inline of paragraph.inlines) {
    const trimmed = inline.text.trim();
    if (!foundLabel && /PHASE\s+[IVXLCDM]+/i.test(trimmed)) {
      const match = trimmed.match(/^(PHASE\s+[IVXLCDM]+)(.*)$/i);
      if (match) {
        labelParts.push(match[1] ?? trimmed);
        const remainder = (match[2] ?? "").replace(/^[\s–\-—]+/, "").trim();
        if (remainder) {
          subtitleParts.push(remainder);
        }
        foundLabel = true;
      }
      continue;
    }

    if (!foundLabel) {
      if (trimmed) {
        labelParts.push(inline.text);
      }
      continue;
    }

    const cleaned = inline.text.replace(/^[\s–\-—]+/, "");
    if (!cleaned.trim() && subtitleParts.length === 0) {
      continue;
    }
    if (cleaned === "\n" || cleaned.trim() === "") {
      continue;
    }
    subtitleParts.push(cleaned);
  }

  const label = labelParts.join("").trim();
  const subtitle = subtitleParts.join("").trim();
  if (label) {
    return { label, subtitle };
  }

  const inlineText = paragraph.inlines.map((part) => part.text).join("").trim();
  return { label: inlineText, subtitle: "" };
}

function slugifyPhase(label: string): string {
  return label.toLowerCase().replace(/\s+/g, "-");
}

/** Top-level blocks that begin a PHASE I / PHASE II section (CUBO-style case studies). */
export function extractProjectPhases(blocks: ProjectBlock[]): ProjectPhase[] {
  const phases: ProjectPhase[] = [];

  blocks.forEach((block, blockIndex) => {
    if (block.type !== "richtext") {
      return;
    }

    for (const paragraph of block.paragraphs) {
      if (!isPhaseHeadingParagraph(paragraph)) {
        continue;
      }

      const { label, subtitle } = parsePhaseHeading(paragraph);
      phases.push({
        id: slugifyPhase(label),
        label,
        subtitle,
        blockIndex,
      });
      break;
    }
  });

  return phases;
}

/** Phase sticky bar range for multi-phase UX case studies (CUBO, atendimento-mateus). */
export function extractProjectPhaseStickyConfig(
  blocks: ProjectBlock[],
): ProjectPhaseStickyConfig {
  const phases = extractProjectPhases(blocks);
  let endBeforeBlockIndex: number | null = null;

  if (phases.length >= 2) {
    const lastPhaseStart = phases[phases.length - 1]!.blockIndex;
    for (let index = lastPhaseStart + 1; index < blocks.length; index += 1) {
      if (isResultsSectionBlock(blocks[index]!)) {
        endBeforeBlockIndex = index;
        break;
      }
    }
  }

  return { phases, endBeforeBlockIndex };
}
