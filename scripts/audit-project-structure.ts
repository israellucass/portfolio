/**
 * Audit project pages against tiered consistency checklists.
 * Run: npm run audit:projects
 */
import fs from "fs";
import path from "path";
import { splitProjectFold } from "../src/lib/project-fold";
import type { Project, ProjectBlock } from "../src/types/project";

type PageTier = "caseStudy" | "creativeShowcase" | "gallery";

type ProjectMeta = {
  description?: string;
  categories?: string[];
  subtitle?: string;
};

type AuditResult = {
  slug: string;
  tier: PageTier;
  passed: string[];
  failed: string[];
  warnings: string[];
};

const ROOT = process.cwd();
const PROJECTS_DIR = path.join(ROOT, "src/content/projects");
const META_DIR = path.join(ROOT, "src/content/project-meta");
const INDEX_PATH = path.join(PROJECTS_DIR, "index.json");

function loadProject(slug: string): Project {
  return JSON.parse(
    fs.readFileSync(path.join(PROJECTS_DIR, `${slug}.json`), "utf-8"),
  ) as Project;
}

function loadMeta(slug: string): ProjectMeta {
  const metaPath = path.join(META_DIR, `${slug}.json`);
  if (!fs.existsSync(metaPath)) {
    return {};
  }
  return JSON.parse(fs.readFileSync(metaPath, "utf-8")) as ProjectMeta;
}

function allText(blocks: ProjectBlock[]): string[] {
  const texts: string[] = [];
  for (const block of blocks) {
    if (block.type === "richtext") {
      for (const paragraph of block.paragraphs) {
        const text = paragraph.inlines.map((inline) => inline.text).join("").trim();
        if (text) {
          texts.push(text);
        }
      }
    } else if (block.type === "tree") {
      for (const column of block.columns) {
        texts.push(...allText(column.blocks));
      }
    }
  }
  return texts;
}

function countRichtextBlocks(blocks: ProjectBlock[]): number {
  let count = 0;
  for (const block of blocks) {
    if (block.type === "richtext") {
      count += 1;
    } else if (block.type === "tree") {
      for (const column of block.columns) {
        count += countRichtextBlocks(column.blocks);
      }
    }
  }
  return count;
}

function hasPlaceholderIntro(blocks: ProjectBlock[]): boolean {
  const first = blocks[0];
  if (first?.type === "tree") {
    for (const column of first.columns) {
      for (const child of column.blocks) {
        if (child.type === "richtext") {
          const text = child.paragraphs
            .flatMap((p) => p.inlines.map((i) => i.text))
            .join("")
            .replace(/\s+/g, "")
            .trim();
          if (text.length < 3 || text === "." || text === "..") {
            return true;
          }
        }
      }
    }
  }
  if (first?.type === "richtext") {
    const text = first.paragraphs
      .flatMap((p) => p.inlines.map((i) => i.text))
      .join("")
      .replace(/\s+/g, "")
      .trim();
    if (text.length < 3 || text === "." || text === "..") {
      return true;
    }
  }
  return false;
}

function bodyContains(blocks: ProjectBlock[], pattern: RegExp): boolean {
  return allText(blocks).some((text) => pattern.test(text));
}

function detectTier(project: Project, meta: ProjectMeta): PageTier {
  const categories = meta.categories ?? project.categories ?? [];
  const texts = allText(project.blocks);
  const joined = texts.join("\n");

  if (categories.includes("ux")) {
    return "caseStudy";
  }

  if (/how might we/i.test(joined) && /problem framing/i.test(joined)) {
    return "caseStudy";
  }

  const richtextCount = countRichtextBlocks(project.blocks);
  if (
    richtextCount <= 3 ||
    hasPlaceholderIntro(project.blocks) ||
    (categories.includes("motion") && richtextCount <= 5 && !/client:/i.test(joined))
  ) {
    return "gallery";
  }

  if (
    categories.includes("graphic") ||
    categories.includes("motion") ||
    categories.includes("games")
  ) {
    return "creativeShowcase";
  }

  return "creativeShowcase";
}

function auditProject(slug: string): AuditResult {
  const project = loadProject(slug);
  const meta = loadMeta(slug);
  const tier = detectTier(project, meta);
  const passed: string[] = [];
  const failed: string[] = [];
  const warnings: string[] = [];

  const description = (meta.description ?? meta.subtitle ?? project.subtitle ?? "").trim();
  if (description) {
    passed.push("description");
  } else {
    failed.push("description missing in project-meta");
  }

  const categories = meta.categories ?? project.categories ?? [];
  if (categories.length > 0) {
    passed.push("categories");
  } else {
    failed.push("categories empty in project-meta");
  }

  const { fold, remainingBlocks } = splitProjectFold(project);

  if (fold.hero) {
    passed.push("fold.hero");
  } else {
    warnings.push("fold: no hero image (using cover fallback)");
  }

  if (fold.intro || fold.details) {
    passed.push("fold.details");
  } else {
    failed.push("fold: missing intro/metadata");
  }

  const firstBlock = project.blocks[0];
  if (firstBlock?.type === "image") {
    const heroSrc = fold.hero?.src;
    const heroLightbox = fold.hero?.lightboxSrc;
    const heroDuplicated =
      Boolean(heroSrc) &&
      remainingBlocks.some(
        (block) =>
          block.type === "image" &&
          (block.src === heroSrc || block.lightboxSrc === heroLightbox),
      );
    if (!heroDuplicated) {
      passed.push("fold.split");
    } else {
      failed.push("fold: hero image duplicated in body");
    }
  } else if (firstBlock?.type === "tree" && isMetadataTree(firstBlock)) {
    passed.push("fold.split");
  } else {
    warnings.push("fold: non-standard first block order");
  }

  if (tier === "caseStudy") {
    auditCaseStudy(project, fold, remainingBlocks, passed, failed, warnings);
  } else if (tier === "creativeShowcase") {
    auditCreative(project, passed, failed, warnings);
  } else {
    auditGallery(project, fold, passed, failed, warnings);
  }

  return { slug, tier, passed, failed, warnings };
}

function isMetadataTree(
  block: ProjectBlock,
): block is Extract<ProjectBlock, { type: "tree" }> {
  if (block.type !== "tree") {
    return false;
  }
  const labels = ["Timeframe", "Role", "Team", "Client", "Tools"];
  return block.columns.some((column) =>
    column.blocks.some(
      (child) =>
        child.type === "richtext" &&
        child.paragraphs.some((p) =>
          p.inlines.some((i) => labels.includes(i.text.trim().replace(/:$/, ""))),
        ),
    ),
  );
}

function auditCaseStudy(
  project: Project,
  fold: ReturnType<typeof splitProjectFold>["fold"],
  remainingBlocks: ProjectBlock[],
  passed: string[],
  failed: string[],
  warnings: string[],
): void {
  const bodyText = allText(remainingBlocks).join("\n");
  const introText = fold.intro
    ? allText([fold.intro]).join(" ")
    : "";

  if (/how might we/i.test(bodyText)) {
    passed.push("hmw");
  } else if (project.slug === "olhe-e-aprenda") {
    warnings.push("caseStudy hybrid: no HMW (uses GAME DESIGN sections)");
  } else {
    failed.push("caseStudy: no HMW question in body");
  }

  if (/problem framing/i.test(bodyText)) {
    passed.push("problemFraming");
  } else {
    failed.push("caseStudy: no PROBLEM FRAMING section");
  }

  if (/research/i.test(bodyText)) {
    passed.push("research");
  } else {
    warnings.push("caseStudy: no RESEARCH section");
  }

  if (
    /ideation|validation|results|solution|game design/i.test(bodyText)
  ) {
    passed.push("processOrOutcome");
  } else {
    warnings.push("caseStudy: no IDEATION/VALIDATION/RESULTS/SOLUTION section");
  }

  if (project.title && introText.toLowerCase().includes(project.title.toLowerCase().slice(0, 8))) {
    passed.push("intro.title");
  } else if (introText.includes("CUBO") && project.slug !== "cubo") {
    failed.push("caseStudy: intro references wrong project (CUBO)");
  } else {
    warnings.push("caseStudy: intro may not mention project name");
  }

  const archivePath = path.join(ROOT, "archive/html", `${project.slug}.html`);
  if (fs.existsSync(archivePath)) {
    passed.push("archive");
  } else {
    warnings.push("caseStudy: no archive/html reference file");
  }
}

function auditCreative(
  project: Project,
  passed: string[],
  failed: string[],
  warnings: string[],
): void {
  const texts = allText(project.blocks);
  const hasSection =
    texts.some((t) => t.length <= 40 && /^[A-Z0-9\s&]+$/.test(t.trim())) ||
    project.blocks.some(
      (b) =>
        b.type === "richtext" &&
        b.paragraphs.some((p) => p.kind === "subheading"),
    );

  if (hasSection) {
    passed.push("sectionHeadings");
  } else {
    warnings.push("creative: no detectable section headings");
  }

  if (/client:/i.test(texts.join(" ")) || project.blocks[0]?.type === "tree") {
    passed.push("fold.pattern");
  } else {
    warnings.push("creative: no Client/metadata fold pattern");
  }
}

function auditGallery(
  project: Project,
  fold: ReturnType<typeof splitProjectFold>["fold"],
  passed: string[],
  failed: string[],
  warnings: string[],
): void {
  if (hasPlaceholderIntro(project.blocks)) {
    failed.push("gallery: placeholder intro (`.` or `..`)");
  } else {
    passed.push("intro");
  }

  if (fold.description || fold.hero) {
    passed.push("fold.minimal");
  } else {
    failed.push("gallery: missing fold description or hero");
  }
}

function main(): void {
  const index = JSON.parse(fs.readFileSync(INDEX_PATH, "utf-8")) as {
    slugs: string[];
  };

  const results = index.slugs.map(auditProject);
  let failCount = 0;

  console.log("\n# Project structure audit\n");
  console.log("| Slug | Tier | Pass | Fail | Warn |");
  console.log("|------|------|------|------|------|");

  for (const result of results) {
    if (result.failed.length > 0) {
      failCount += 1;
    }
    console.log(
      `| ${result.slug} | ${result.tier} | ${result.passed.length} | ${result.failed.length} | ${result.warnings.length} |`,
    );
  }

  console.log("\n## Failures\n");
  for (const result of results) {
    if (result.failed.length === 0) {
      continue;
    }
    console.log(`### ${result.slug} (${result.tier})`);
    for (const item of result.failed) {
      console.log(`- FAIL: ${item}`);
    }
    console.log("");
  }

  console.log("## Warnings\n");
  for (const result of results) {
    if (result.warnings.length === 0) {
      continue;
    }
    console.log(`### ${result.slug}`);
    for (const item of result.warnings) {
      console.log(`- WARN: ${item}`);
    }
    console.log("");
  }

  console.log(`\n${results.length} projects · ${failCount} with failures\n`);

  if (failCount > 0) {
    process.exitCode = 1;
  }
}

main();
