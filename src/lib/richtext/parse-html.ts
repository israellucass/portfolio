import { HTMLElement, NodeType, parse } from "node-html-parser";
import type {
  RichTextInline,
  RichTextMark,
  RichTextParagraph,
  RichTextParagraphKind,
} from "@/types/richtext";

const ZERO_WIDTH = /[\u200B-\u200D\uFEFF]/g;

function repairHtml(html: string): string {
  const opens = (html.match(/<div\b/gi) ?? []).length;
  const closes = (html.match(/<\/div>/gi) ?? []).length;
  return html + "</div>".repeat(Math.max(0, opens - closes));
}

function normalizeText(value: string): string {
  return value.replace(ZERO_WIDTH, "").replace(/\s+/g, " ");
}

function normalizeCompare(value: string): string {
  return normalizeText(value).replace(/\s/g, "").toLowerCase();
}

function mergeMarks(
  base: RichTextMark[] | undefined,
  extra: RichTextMark[] | undefined,
): RichTextMark[] | undefined {
  if (!base?.length && !extra?.length) return undefined;
  return [...new Set([...(base ?? []), ...(extra ?? [])])];
}

function parseColor(style: string | undefined): string | undefined {
  if (!style) return undefined;
  const match = style.match(/color:\s*(#[0-9a-fA-F]{3,8})/i);
  if (!match) return undefined;
  let color = match[1].toLowerCase();
  if (color.length === 4) {
    color = `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`;
  }
  return color;
}

function parseFontSize(style: string | undefined): 16 | 20 | 24 | 32 | undefined {
  if (!style) return undefined;
  const match = style.match(/font-size:\s*(\d+)px/i);
  if (!match) return undefined;
  const size = Number(match[1]);
  if (size === 16 || size === 20 || size === 24 || size === 32) return size;
  if (size >= 30) return 32;
  if (size >= 22) return 24;
  if (size >= 18) return 20;
  return 16;
}

function parseAlign(
  style: string | undefined,
): "left" | "center" | "right" | undefined {
  if (style?.includes("text-align:center")) return "center";
  if (style?.includes("text-align:right")) return "right";
  if (style?.includes("text-align:left")) return "left";
  return undefined;
}

function getMarks(node: HTMLElement): RichTextMark[] {
  const marks: RichTextMark[] = [];
  const style = node.getAttribute("style") ?? "";
  const className = node.getAttribute("class") ?? "";

  if (/font-weight:\s*(700|bold)/i.test(style)) {
    marks.push("bold");
  }

  if (/font-style:\s*italic/i.test(style)) {
    marks.push("italic");
  }

  if (/font-family:\s*qdyr/i.test(style) || node.classList.contains("title")) {
    marks.push("display");
  }

  if (className.includes("sub-title")) {
    marks.push("display");
    marks.push("bold");
  }

  return marks;
}

function hasChildDiv(node: HTMLElement): boolean {
  return node.childNodes.some(
    (child) =>
      child.nodeType === NodeType.ELEMENT_NODE &&
      (child as HTMLElement).tagName === "DIV",
  );
}

function classifyDiv(node: HTMLElement): RichTextParagraphKind | null {
  const className = node.getAttribute("class") ?? "";

  if (className.includes("sub-title")) return "subheading";
  if (className.includes("main-text")) return "paragraph";
  if (className.includes("title")) {
    const style = node.getAttribute("style") ?? "";
    if (/font-style:\s*italic/i.test(style) || parseColor(style) === "#888888") {
      return "quote";
    }
    return "heading";
  }

  return null;
}

function extractInlines(
  node: HTMLElement,
  inherited: { marks?: RichTextMark[]; color?: string } = {},
): RichTextInline[] {
  const inlines: RichTextInline[] = [];

  for (const child of node.childNodes) {
    if (child.nodeType === NodeType.TEXT_NODE) {
      const text = normalizeText(child.textContent ?? "");
      if (text) {
        inlines.push({
          text,
          marks: inherited.marks,
          color: inherited.color,
        });
      }
      continue;
    }

    if (child.nodeType !== NodeType.ELEMENT_NODE) continue;

    const element = child as HTMLElement;

    if (element.tagName === "BR") {
      inlines.push({ text: "\n", marks: inherited.marks, color: inherited.color });
      continue;
    }

    if (element.tagName === "A") {
      const href = element.getAttribute("href") ?? undefined;
      const nested = extractInlines(element, inherited);
      for (const inline of nested) {
        inlines.push({ ...inline, href });
      }
      continue;
    }

    const marks = mergeMarks(inherited.marks, getMarks(element));
    const color = parseColor(element.getAttribute("style") ?? "") ?? inherited.color;
    const nested = extractInlines(element, { marks, color });
    inlines.push(...nested);
  }

  return mergeAdjacentInlines(inlines);
}

function mergeAdjacentInlines(inlines: RichTextInline[]): RichTextInline[] {
  const merged: RichTextInline[] = [];

  for (const inline of inlines) {
    const previous = merged[merged.length - 1];
    if (
      previous &&
      previous.href === inline.href &&
      previous.color === inline.color &&
      JSON.stringify(previous.marks ?? []) === JSON.stringify(inline.marks ?? [])
    ) {
      previous.text += inline.text;
      continue;
    }
    merged.push({ ...inline });
  }

  return merged;
}

function makeParagraph(node: HTMLElement, kind: RichTextParagraphKind): RichTextParagraph {
  const style = node.getAttribute("style") ?? "";

  return {
    kind,
    align: parseAlign(style),
    size: parseFontSize(style),
    color: parseColor(style),
    inlines: extractInlines(node),
  };
}

function hasVisibleText(paragraph: RichTextParagraph): boolean {
  return paragraph.inlines.some(
    (inline) => inline.text.replace(/\n/g, "").trim().length > 0,
  );
}

function walkForParagraphs(node: HTMLElement, out: RichTextParagraph[]): void {
  const kind = node.tagName === "DIV" ? classifyDiv(node) : null;

  if (kind && !hasChildDiv(node)) {
    const paragraph = makeParagraph(node, kind);
    if (hasVisibleText(paragraph)) {
      out.push(paragraph);
    }
    return;
  }

  if (node.tagName === "DIV" && !hasChildDiv(node)) {
    const paragraph = makeParagraph(node, kind ?? "paragraph");
    if (hasVisibleText(paragraph)) {
      out.push(paragraph);
    }
    return;
  }

  for (const child of node.childNodes) {
    if (child.nodeType === NodeType.ELEMENT_NODE) {
      walkForParagraphs(child as HTMLElement, out);
    }
  }
}

function stripHtmlText(html: string): string {
  return normalizeText(parse(repairHtml(html)).textContent ?? "").trim();
}

function stripRichTextText(paragraphs: RichTextParagraph[]): string {
  return normalizeText(
    paragraphs
      .flatMap((paragraph) =>
        paragraph.inlines.map((inline) => inline.text.replace(/\n/g, " ")),
      )
      .join(" "),
  ).trim();
}

export function parseHtmlToRichText(html: string): RichTextParagraph[] {
  const repaired = repairHtml(html);
  const root = parse(`<div data-root="true">${repaired}</div>`);
  const container = root.querySelector("[data-root]");

  if (!container) return [];

  const paragraphs: RichTextParagraph[] = [];
  walkForParagraphs(container, paragraphs);

  return paragraphs.filter((paragraph) => hasVisibleText(paragraph));
}

export function canMigrateHtml(html: string, paragraphs: RichTextParagraph[]): boolean {
  if (paragraphs.length === 0) return false;

  const sourceText = normalizeCompare(stripHtmlText(html));
  const migratedText = normalizeCompare(stripRichTextText(paragraphs));

  if (!sourceText) return false;
  if (!migratedText) return false;

  return sourceText === migratedText;
}
