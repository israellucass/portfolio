import { MetricTooltip } from "@/components/project/MetricTooltip";
import { getMetricTooltip } from "@/lib/project-metric-tooltips";
import { isFoldDetailLabel } from "@/lib/project-fold";
import {
  isPhaseHeadingParagraph,
  parsePhaseHeading,
} from "@/lib/project-phases";
import { isDesignQuestion } from "@/lib/design-question";
import { getHeadingId } from "@/lib/project-headings";
import type { RichTextInline, RichTextParagraph } from "@/types/richtext";

const SIZE_CLASS: Record<16 | 20 | 24 | 32, string> = {
  16: "project-type-md",
  20: "project-type-lg",
  24: "project-type-xl",
  32: "project-type-2xl",
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

function renderInline(
  inline: RichTextInline,
  key: string,
  extraClassName?: string,
) {
  const marks = inline.marks ?? [];
  const className = [
    marks.includes("bold") ? "font-bold" : "",
    marks.includes("italic") ? "italic" : "",
    marks.includes("display") ? "font-display" : "",
    extraClassName ?? "",
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

type TeamMember = {
  name: RichTextInline;
  role?: RichTextInline;
};

function splitInlinesByNewline(inlines: RichTextInline[]): RichTextInline[][] {
  const rows: RichTextInline[][] = [[]];

  for (const inline of inlines) {
    const parts = inline.text.split("\n");
    parts.forEach((part, partIndex) => {
      if (partIndex > 0) {
        rows.push([]);
      }
      if (!part) {
        return;
      }
      rows[rows.length - 1]!.push({ ...inline, text: part });
    });
  }

  return rows.filter((row) =>
    row.some((inline) => inline.text.replace(/\s|\/+/g, "").length > 0),
  );
}

function parseTeamMemberRow(row: RichTextInline[]): TeamMember | null {
  const cleaned = row
    .map((inline) => ({
      ...inline,
      text: inline.text.replace(/^\s*\/\s*|\s*\/\s*$/g, "").trim(),
    }))
    .filter((inline) => inline.text.length > 0);

  if (cleaned.length === 0) {
    return null;
  }

  const roleIndex = cleaned.findIndex((inline) =>
    (inline.marks ?? []).includes("italic"),
  );

  if (roleIndex > 0) {
    const nameParts = cleaned.slice(0, roleIndex);
    const roleParts = cleaned.slice(roleIndex);
    return {
      name: {
        ...nameParts[0]!,
        text: nameParts.map((part) => part.text).join(" ").trim(),
      },
      role: {
        ...roleParts[0]!,
        text: roleParts.map((part) => part.text).join(" ").trim(),
        marks: ["italic"],
      },
    };
  }

  const joined = cleaned.map((part) => part.text).join(" ");
  const slashMatch = joined.match(/^(.+?)\s*\/\s*(.+)$/);
  if (slashMatch) {
    return {
      name: { ...cleaned[0]!, text: slashMatch[1]!.trim() },
      role: {
        text: slashMatch[2]!.trim(),
        marks: ["italic"],
        color: cleaned[cleaned.length - 1]?.color,
      },
    };
  }

  return { name: { ...cleaned[0]!, text: joined.trim() } };
}

function parseTeamMembers(valueInlines: RichTextInline[]): TeamMember[] {
  return splitInlinesByNewline(valueInlines)
    .map(parseTeamMemberRow)
    .filter((member): member is TeamMember => member !== null);
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
        `font-display font-bold ${size || "project-type-2xl"}`,
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
      return `title font-display italic font-normal text-[var(--text-muted)] ${size || "project-type-2xl"} ${align}`.trim();
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
  blockIndex?: number;
  variant?: RichTextProps["variant"];
};

function RichTextParagraphView({
  paragraph,
  index,
  blockIndex,
  variant,
}: RichTextParagraphViewProps) {
  if (paragraph.kind === "spacer") {
    return <div className="h-4" aria-hidden />;
  }

  const resolved = resolveRichTextColor(paragraph.color);
  const style = resolved ? { color: resolved } : undefined;
  const className = paragraphClassName(paragraph);
  const designQuestion = isDesignQuestion(paragraph);
  const phaseHeading = isPhaseHeading(paragraph);

  const headingId = getHeadingId(paragraph, blockIndex);

  if (phaseHeading) {
    const { labelInlines, subtitleInlines } = splitPhaseHeadingParts(paragraph);
    return (
      <div
        className={`${className}${headingId ? " project-toc-target" : ""}`.trim()}
        style={style}
        id={headingId ?? undefined}
      >
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

  if (
    variant === "fold-meta" &&
    paragraph.kind === "paragraph" &&
    paragraph.inlines.length > 0 &&
    isFoldDetailLabel(paragraph.inlines[0].text)
  ) {
    const [labelInline, ...valueInlines] = paragraph.inlines;
    const normalizedValueInlines = valueInlines.map((inline, inlineIndex) => ({
      ...inline,
      text:
        inlineIndex === 0 ? inline.text.replace(/^\n+/, "") : inline.text,
    }));
    const labelText = labelInline.text.trim().replace(/:$/, "");
    const teamMembers =
      labelText === "Team" || labelText === "Members" || labelText === "Member"
        ? parseTeamMembers(normalizedValueInlines)
        : [];

    return (
      <div className="project-fold__meta-item">
        {renderInline(labelInline, `${index}-label`, "project-fold__meta-label")}
        {teamMembers.length > 0 ? (
          <ul className="project-fold__team">
            {teamMembers.map((member, memberIndex) => (
              <li
                key={`${index}-team-${memberIndex}`}
                className="project-fold__team-member"
              >
                {renderInline(
                  member.name,
                  `${index}-team-name-${memberIndex}`,
                  "project-fold__team-name",
                )}
                {member.role ? (
                  <>
                    <span className="project-fold__team-sep" aria-hidden>
                      /
                    </span>
                    {renderInline(
                      {
                        ...member.role,
                        marks: (member.role.marks ?? []).filter(
                          (mark) => mark !== "italic",
                        ),
                        color: undefined,
                      },
                      `${index}-team-role-${memberIndex}`,
                      "project-fold__team-role",
                    )}
                  </>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <div className="project-fold__meta-value">
            {normalizedValueInlines.map((inline, inlineIndex) =>
              renderInline(inline, `${index}-value-${inlineIndex}`),
            )}
          </div>
        )}
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
    <div
      className={`${className}${headingId ? " project-toc-target" : ""}`.trim()}
      style={style}
      id={headingId ?? undefined}
    >
      {content}
    </div>
  );
}

type RichTextProps = {
  paragraphs: RichTextParagraph[];
  variant?: "default" | "fold" | "fold-meta" | "nested";
  blockIndex?: number;
};

const VARIANT_CLASS: Record<NonNullable<RichTextProps["variant"]>, string> = {
  default:
    "project-module-text project-html project-module-text--reading mb-0 w-full pb-10 text-[var(--text-primary)]",
  fold: "project-module-text project-html project-fold__richtext mb-0 w-full pb-0 text-[var(--text-primary)]",
  "fold-meta":
    "project-module-text project-html project-fold__meta-text mb-0 w-full pb-0 text-[var(--text-primary)]",
  nested:
    "project-module-text project-html project-module-text--nested mb-0 w-full pb-10 text-[var(--text-primary)]",
};

export function RichText({
  paragraphs,
  variant = "default",
  blockIndex,
}: RichTextProps) {
  return (
    <div className={VARIANT_CLASS[variant]}>
      {paragraphs.map((paragraph, index) => (
        <RichTextParagraphView
          key={index}
          paragraph={paragraph}
          index={index}
          blockIndex={blockIndex}
          variant={variant}
        />
      ))}
    </div>
  );
}
