import type { RichTextParagraph } from "@/types/richtext";

export function isDesignQuestion(paragraph: RichTextParagraph): boolean {
  const inlineText = paragraph.inlines.map((inline) => inline.text).join("");
  return (
    (paragraph.kind === "paragraph" || paragraph.kind === "heading") &&
    /how might we/i.test(inlineText)
  );
}
