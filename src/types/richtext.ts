export type RichTextMark = "bold" | "italic" | "display";

export type RichTextInline = {
  text: string;
  marks?: RichTextMark[];
  color?: string;
  href?: string;
};

export type RichTextParagraphKind =
  | "paragraph"
  | "subheading"
  | "heading"
  | "quote"
  | "spacer";

export type RichTextParagraph = {
  kind: RichTextParagraphKind;
  align?: "left" | "center" | "right";
  size?: 16 | 20 | 24 | 32;
  color?: string;
  inlines: RichTextInline[];
};

export type RichTextBlock = {
  type: "richtext";
  paragraphs: RichTextParagraph[];
};
