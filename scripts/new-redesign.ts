/**
 * Scaffold a new redesign case study from the reusable template.
 *
 * Usage:
 *   npm run new:redesign -- --slug my-redesign --title "My Redesign"
 *   npm run new:redesign -- --slug my-redesign --title "My Redesign" --year 2025
 *   npm run new:redesign -- --slug my-redesign --title "My Redesign" --dry-run
 */
import fs from "fs";
import path from "path";

type Args = {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  year: string;
  dryRun: boolean;
};

const ROOT = process.cwd();
const TEMPLATE_DIR = path.join(
  ROOT,
  "src/content/templates/redesign",
);
const PROJECTS_DIR = path.join(ROOT, "src/content/projects");
const META_DIR = path.join(ROOT, "src/content/project-meta");
const INDEX_PATH = path.join(PROJECTS_DIR, "index.json");

function parseArgs(argv: string[]): Args {
  const get = (name: string): string | undefined => {
    const index = argv.indexOf(`--${name}`);
    if (index === -1) {
      return undefined;
    }
    return argv[index + 1];
  };

  const slug = get("slug")?.trim();
  const title = get("title")?.trim();

  if (!slug || !title) {
    console.error(`
Usage:
  npm run new:redesign -- --slug <kebab-slug> --title "Project Title"
  [--subtitle "..."] [--description "..."] [--year 2025] [--dry-run]
`);
    process.exit(1);
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    console.error(
      `Invalid slug "${slug}". Use lowercase kebab-case (e.g. redesign-banco-inter).`,
    );
    process.exit(1);
  }

  return {
    slug,
    title,
    subtitle:
      get("subtitle")?.trim() ||
      `${title} — replace with a one-line card summary.`,
    description:
      get("description")?.trim() ||
      `Replace with a one-sentence outcome for ${title}.`,
    year: get("year")?.trim() || String(new Date().getFullYear()),
    dryRun: argv.includes("--dry-run"),
  };
}

function applyTokens(raw: string, args: Args): string {
  const map: Record<string, string> = {
    slug: args.slug,
    title: args.title,
    subtitle: args.subtitle,
    description: args.description,
    year: args.year,
  };

  return raw.replace(/\{\{(\w+)\}\}/g, (match, key: string) => {
    if (key in map) {
      return map[key]!;
    }
    return match;
  });
}

function registerSlug(slug: string, dryRun: boolean): void {
  const index = JSON.parse(fs.readFileSync(INDEX_PATH, "utf-8")) as {
    source?: string;
    count: number;
    spotlightSlug?: string;
    homepageOrder?: string[];
    slugs: string[];
  };

  if (index.slugs.includes(slug)) {
    console.error(`Slug "${slug}" is already in projects/index.json.`);
    process.exit(1);
  }

  index.slugs = [...index.slugs, slug].sort((a, b) => a.localeCompare(b));
  index.count = index.slugs.length;

  if (dryRun) {
    console.log(`[dry-run] would register slug in index.json (count=${index.count})`);
    return;
  }

  fs.writeFileSync(INDEX_PATH, `${JSON.stringify(index, null, 2)}\n`, "utf-8");
}

function main(): void {
  const args = parseArgs(process.argv.slice(2));
  const bodyTemplatePath = path.join(TEMPLATE_DIR, "body.json");
  const metaTemplatePath = path.join(TEMPLATE_DIR, "meta.json");
  const bodyOut = path.join(PROJECTS_DIR, `${args.slug}.json`);
  const metaOut = path.join(META_DIR, `${args.slug}.json`);

  for (const file of [bodyTemplatePath, metaTemplatePath]) {
    if (!fs.existsSync(file)) {
      console.error(`Missing template: ${file}`);
      process.exit(1);
    }
  }

  if (fs.existsSync(bodyOut) || fs.existsSync(metaOut)) {
    console.error(
      `Project files already exist for "${args.slug}". Pick another slug or remove the existing files.`,
    );
    process.exit(1);
  }

  const body = applyTokens(fs.readFileSync(bodyTemplatePath, "utf-8"), args);
  const meta = applyTokens(fs.readFileSync(metaTemplatePath, "utf-8"), args);

  JSON.parse(body);
  JSON.parse(meta);

  if (args.dryRun) {
    console.log("[dry-run] would write:");
    console.log(`  ${bodyOut}`);
    console.log(`  ${metaOut}`);
    registerSlug(args.slug, true);
    console.log("\nRemaining {{placeholders}} must be filled before publish.");
    return;
  }

  fs.writeFileSync(bodyOut, `${body.trim()}\n`, "utf-8");
  fs.writeFileSync(metaOut, `${meta.trim()}\n`, "utf-8");
  registerSlug(args.slug, false);

  console.log(`✓ Created redesign case study "${args.title}" (${args.slug})`);
  console.log(`  body: ${path.relative(ROOT, bodyOut)}`);
  console.log(`  meta: ${path.relative(ROOT, metaOut)}`);
  console.log(`  index: registered in src/content/projects/index.json`);
  console.log(`
Next steps:
  1. Replace remaining {{placeholders}} in the body JSON
  2. Add cover + assets under public/images/ (before, after, audit, etc.)
  3. Optional: register KPI tooltips in src/lib/project-metric-tooltips.ts
  4. Optional: homepage order via /keystatic
  5. npm run audit:projects
  6. Open http://localhost:3000/${args.slug}

Guide: src/content/templates/redesign/GUIDE.md
`);
}

main();
