import { MetricTooltip } from "@/components/project/MetricTooltip";
import { getMetricTooltip } from "@/lib/project-metric-tooltips";
import {
  isPhaseHeadingParagraph,
  parsePhaseHeading,
} from "@/lib/project-phases";
import type { RichTextInline, RichTextParagraph } from "@/types/richtext";

const SIZE_CLASS: Record<16 | 20 | 24 | 32, string> = {
  16: "text-base leading-6",
  20: "text-xl leading-8",
  24: "text-2xl leading-9",
  32: "text-[32px] leading-10",
};

function resolveRichTextColor(color?: string): string | undefined {
  if (!color) return undefined;

  switch (color.toLowerCase()) {
    case "#f0f3f5":
    case "#ffffff":
    case "#fff":
    case "#14191d":
      return "var(--text-primary)";
    case "#888888":
    case "#888":
      return "var(--text-muted)";
    case "#ffc239":
      return "var(--project-phase-label-color)";
    default:
      return color;
  }
}

function renderInline(inline: RichTextInline, key: string) {
  const marks = inline.marks ?? [];
  const className = [
    marks.includes("bold") ? "font-bold" : "",
    marks.includes("italic") ? "italic" : "",
    marks.includes("display") ? "font-display" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const resolved = resolveRichTextColor(inline.color);
  const style = resolved ? { color: resolved } : undefined;
  const chunks = inline.text.split("\n");

  const content = chunks.map((chunk, index) => (
    <span key={`${key}-${index}`}>
      {index > 0 ? <br /> : null}
      {chunk}
    </span>
  ));

  if (inline.href) {
    return (
      <a
        key={key}
        href={inline.href}
        target="_blank"
        rel="noopener noreferrer"
        className={["link-underline", className].filter(Boolean).join(" ")}
        style={style}
      >
        {content}
      </a>
    );
  }

  const metricDescription = getMetricTooltip(inline.text);
  if (metricDescription) {
    return (
      <MetricTooltip
        key={key}
        label={inline.text.trim()}
        description={metricDescription}
        className={className}
        style={style}
      />
    );
  }

  return (
    <span key={key} className={className || undefined} style={style}>
      {content}
    </span>
  );
}

function isDesignQuestion(paragraph: RichTextParagraph): boolean {
  const inlineText = paragraph.inlines.map((inline) => inline.text).join("");
  return (
    (paragraph.kind === "paragraph" || paragraph.kind === "heading") &&
    /how might we/i.test(inlineText)
  );
}

function isPhaseHeading(paragraph: RichTextParagraph): boolean {
  return isPhaseHeadingParagraph(paragraph);
}

function splitPhaseHeadingParts(paragraph: RichTextParagraph): {
  labelInlines: RichTextInline[];
  subtitleInlines: RichTextInline[];
} {
  const { label, subtitle } = parsePhaseHeading(paragraph);
  const labelInlines: RichTextInline[] = [
    { text: label, marks: [], color: undefined },
  ];
  const subtitleInlines: RichTextInline[] = subtitle
    ? [{ text: subtitle, marks: [], color: undefined }]
    : [];

  return { labelInlines, subtitleInlines };
}

function isCreativeSectionHeading(paragraph: RichTextParagraph): boolean {
  if (paragraph.kind !== "paragraph") {
    return false;
  }

  const inlineText = paragraph.inlines
    .map((inline) => inline.text)
    .join("")
    .trim();

  if (inlineText.length === 0 || inlineText.length > 40) {
    return false;
  }

  if (/^client:/i.test(inlineText)) {
    return false;
  }

  return /^[A-Z0-9\s&.–\-/]+$/.test(inlineText);
}

function paragraphClassName(paragraph: RichTextParagraph): string {
  const align =
    paragraph.align === "center"
      ? "text-center"
      : paragraph.align === "right"
        ? "text-right"
        : "text-left";
  const designQuestion = isDesignQuestion(paragraph);
  const textAlign = designQuestion ? "text-left" : align;

  const size = paragraph.size ? SIZE_CLASS[paragraph.size] : "";

  switch (paragraph.kind) {
    case "subheading":
      return `sub-title project-section-label ${align}`.trim();
    case "heading": {
      const classes = [
        `font-display font-bold ${size || "text-[32px] leading-10"}`,
        textAlign,
      ];
      if (designQuestion) {
        classes.push("project-design-question");
      } else if (isPhaseHeading(paragraph)) {
        classes.push("project-phase-heading");
      }
      return classes.filter(Boolean).join(" ");
    }
    case "quote":
      return `title font-display italic font-normal text-[var(--text-muted)] ${size || "text-[32px] leading-10"} ${align}`.trim();
    case "paragraph": {
      const classes = [`main-text`, size, textAlign];

      if (isPhaseHeading(paragraph)) {
        classes.push("project-phase-heading");
      } else if (designQuestion) {
        classes.push("project-design-question");
      } else if (
        paragraph.inlines.some(
          (inline) =>
            inline.marks?.includes("italic") &&
            inline.marks?.includes("bold") &&
            inline.marks?.includes("display"),
        )
      ) {
        classes.push("project-subsection-heading");
      } else if (isCreativeSectionHeading(paragraph)) {
        classes.push("project-section-heading");
      }

      return classes.filter(Boolean).join(" ");
    }
    default:
      return `${align}`.trim();
  }
}

type RichTextParagraphViewProps = {
  paragraph: RichTextParagraph;
  index: number;
};

function RichTextParagraphView({ paragraph, index }: RichTextParagraphViewProps) {
  if (paragraph.kind === "spacer") {
    return <div className="h-4" aria-hidden />;
  }

  const resolved = resolveRichTextColor(paragraph.color);
  const style = resolved ? { color: resolved } : undefined;
  const className = paragraphClassName(paragraph);
  const designQuestion = isDesignQuestion(paragraph);
  const phaseHeading = isPhaseHeading(paragraph);

  if (phaseHeading) {
    const { labelInlines, subtitleInlines } = splitPhaseHeadingParts(paragraph);
    return (
      <div className={className} style={style}>
        <div
          className="project-phase-heading__label"
          style={{ color: "var(--project-phase-label-color)" }}
        >
          {labelInlines.map((inline, inlineIndex) =>
            renderInline(inline, `${index}-phase-label-${inlineIndex}`),
          )}
        </div>
        {subtitleInlines.length > 0 ? (
          <div
            className="project-phase-heading__subtitle"
            style={{ color: "var(--project-phase-subtitle-color)" }}
          >
            {subtitleInlines.map((inline, inlineIndex) =>
              renderInline(
                {
                  ...inline,
                  color:
                    inline.color?.toLowerCase() === "#ffc239"
                      ? undefined
                      : inline.color,
                },
                `${index}-phase-sub-${inlineIndex}`,
              ),
            )}
          </div>
        ) : null}
      </div>
    );
  }

  const content = paragraph.inlines.map((inline, inlineIndex) => {
    const sanitized = designQuestion
      ? {
          ...inline,
          marks: (inline.marks ?? []).filter(
            (mark) => mark !== "italic" && mark !== "display",
          ),
        }
      : inline;
    return renderInline(sanitized, `${index}-${inlineIndex}`);
  });

  if (designQuestion) {
    return (
      <blockquote className={className} style={style}>
        {content}
      </blockquote>
    );
  }

  return (
    <div className={className} style={style}>
      {content}
    </div>
  );
}

type RichTextProps = {
  paragraphs: RichTextParagraph[];
  variant?: "default" | "fold" | "fold-meta" | "nested";
};

const VARIANT_CLASS: Record<NonNullable<RichTextProps["variant"]>, string> = {
  default:
    "project-module-text project-html project-module-text--reading mb-0 w-full px-[8%] pb-10 text-[var(--text-primary)]",
  fold: "project-module-text project-html project-fold__richtext mb-0 w-full pb-0 text-[var(--text-primary)]",
  "fold-meta":
    "project-module-text project-html project-fold__meta-text mb-0 w-full pb-0 text-[var(--text-primary)]",
  nested:
    "project-module-text project-html project-module-text--nested mb-0 w-full pb-10 text-[var(--text-primary)]",
};

export function RichText({ paragraphs, variant = "default" }: RichTextProps) {
  return (
    <div className={VARIANT_CLASS[variant]}>
      {paragraphs.map((paragraph, index) => (
        <RichTextParagraphView key={index} paragraph={paragraph} index={index} />
      ))}
    </div>
  );
}
