import type { Project, ProjectBlock } from "@/types/project";
import type { RichTextBlock, RichTextParagraph } from "@/types/richtext";

const DETAIL_LABELS = new Set([
  "Timeframe",
  "Role",
  "Team",
  "Tools",
  "Members",
  "Member",
  "Client",
]);

export type ProjectFoldHero = {
  src: string;
  lightboxSrc: string;
};

export type ProjectFold = {
  description: string;
  hero: ProjectFoldHero | null;
  intro: RichTextBlock | null;
  details: RichTextBlock;
};

export type SplitProjectFoldResult = {
  fold: ProjectFold;
  remainingBlocks: ProjectBlock[];
};

function normalizeDetailLabel(text: string): string {
  return text.trim().replace(/:$/, "");
}

export function isFoldDetailLabel(text: string): boolean {
  return DETAIL_LABELS.has(normalizeDetailLabel(text));
}

function richtextHasDetailLabel(block: RichTextBlock): boolean {
  return block.paragraphs.some((paragraph) =>
    paragraph.inlines.some((inline) =>
      DETAIL_LABELS.has(normalizeDetailLabel(inline.text)),
    ),
  );
}

function isPlaceholderIntro(block: RichTextBlock): boolean {
  const text = block.paragraphs
    .flatMap((paragraph) => paragraph.inlines.map((inline) => inline.text))
    .join("")
    .replace(/\s+/g, "")
    .trim();

  return text.length < 3 || text === "." || text === "..";
}

function isMetadataTree(
  block: ProjectBlock,
): block is Extract<ProjectBlock, { type: "tree" }> {
  if (block.type !== "tree") {
    return false;
  }

  return block.columns.some((column) =>
    column.blocks.some(
      (child) =>
        child.type === "richtext" && richtextHasDetailLabel(child),
    ),
  );
}

function splitMetadataTree(
  block: Extract<ProjectBlock, { type: "tree" }>,
): { intro: RichTextBlock | null; details: RichTextBlock | null } {
  let intro: RichTextBlock | null = null;
  let details: RichTextBlock | null = null;

  for (const column of block.columns) {
    for (const child of column.blocks) {
      if (child.type !== "richtext") {
        continue;
      }

      if (richtextHasDetailLabel(child)) {
        details = child;
      } else if (!intro && !isPlaceholderIntro(child)) {
        intro = child;
      }
    }
  }

  return { intro, details };
}

function buildFallbackDetails(project: Project): RichTextBlock {
  const paragraphs: RichTextParagraph[] = [
    {
      kind: "paragraph",
      inlines: [
        { text: "Timeframe", color: "#888888" },
        { text: `\n${project.year || "—"}` },
      ],
    },
  ];

  if (project.tags) {
    paragraphs.push({
      kind: "paragraph",
      inlines: [
        { text: "Role", color: "#888888" },
        { text: `\n${project.tags.split(",")[0]?.trim() || "—"}` },
      ],
    });
  }

  return {
    type: "richtext",
    paragraphs,
  };
}

export function splitProjectFold(project: Project): SplitProjectFoldResult {
  const remaining = [...project.blocks];
  let hero: ProjectFoldHero | null = null;
  let intro: RichTextBlock | null = null;
  let details: RichTextBlock | null = null;

  if (remaining[0]?.type === "image") {
    const image = remaining.shift();
    if (image?.type === "image") {
      hero = {
        src: image.src,
        lightboxSrc: image.lightboxSrc ?? image.src,
      };
    }
  }

  if (remaining[0] && isMetadataTree(remaining[0])) {
    const split = splitMetadataTree(remaining[0]);
    intro = split.intro;
    details = split.details;
    remaining.shift();
  } else if (remaining[0]?.type === "richtext") {
    const block = remaining[0];

    if (richtextHasDetailLabel(block)) {
      details = block;
    } else if (!isPlaceholderIntro(block)) {
      intro = block;
    }

    remaining.shift();

    if (remaining[0] && isMetadataTree(remaining[0])) {
      const split = splitMetadataTree(remaining[0]);
      intro = intro ?? split.intro;
      details = details ?? split.details;
      remaining.shift();
    } else if (
      remaining[0]?.type === "richtext" &&
      richtextHasDetailLabel(remaining[0])
    ) {
      details = remaining[0];
      remaining.shift();
    }
  }

  if (!hero && project.cover) {
    hero = {
      src: project.cover,
      lightboxSrc: project.cover,
    };
  }

  const description =
    project.description?.trim() || project.subtitle?.trim() || "";

  return {
    fold: {
      description,
      hero,
      intro,
      details: details ?? buildFallbackDetails(project),
    },
    remainingBlocks: remaining,
  };
}
