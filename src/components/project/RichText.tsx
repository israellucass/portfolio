import type { RichTextInline, RichTextParagraph } from "@/types/richtext";

const SIZE_CLASS: Record<16 | 20 | 24 | 32, string> = {
  16: "text-base leading-6",
  20: "text-xl leading-8",
  24: "text-2xl leading-9",
  32: "text-[32px] leading-10",
};

/** Map Adobe dark-theme palette colors onto current CSS tokens. */
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
        className={className || undefined}
        style={style}
      >
        {content}
      </a>
    );
  }

  return (
    <span key={key} className={className || undefined} style={style}>
      {content}
    </span>
  );
}

function paragraphClassName(paragraph: RichTextParagraph): string {
  const align =
    paragraph.align === "center"
      ? "text-center"
      : paragraph.align === "right"
        ? "text-right"
        : "text-left";

  const size = paragraph.size ? SIZE_CLASS[paragraph.size] : "";

  switch (paragraph.kind) {
    case "subheading":
      return `sub-title ${align}`.trim();
    case "heading":
      return `font-display font-bold ${size || "text-[32px] leading-10"} ${align}`.trim();
    case "quote":
      return `title font-display italic font-normal text-[var(--text-muted)] ${size || "text-[32px] leading-10"} ${align}`.trim();
    case "paragraph":
      return `main-text ${size} ${align}`.trim();
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

  return (
    <div className={paragraphClassName(paragraph)} style={style}>
      {paragraph.inlines.map((inline, inlineIndex) =>
        renderInline(inline, `${index}-${inlineIndex}`),
      )}
    </div>
  );
}

type RichTextProps = {
  paragraphs: RichTextParagraph[];
};

export function RichText({ paragraphs }: RichTextProps) {
  return (
    <div className="project-module-text project-html mb-0 w-full px-[8%] pb-10 text-[var(--text-primary)]">
      {paragraphs.map((paragraph, index) => (
        <RichTextParagraphView key={index} paragraph={paragraph} index={index} />
      ))}
    </div>
  );
}
