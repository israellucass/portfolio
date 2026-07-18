/**
 * One-time (re-runnable) migration: copy editable metadata out of project JSON
 * into Keystatic-owned project-meta/*.json + homepage.json.
 *
 * Leaves src/content/projects/{slug}.json unchanged (blocks stay safe).
 */
import fs from "fs";
import path from "path";

type ProjectSource = {
  slug: string;
  title: string;
  subtitle?: string;
  year: string;
  tags: string;
  cover: string;
  categories: string[];
  featured: boolean;
};

type ProjectsIndex = {
  spotlightSlug?: string;
  homepageOrder: string[];
  slugs: string[];
};

const ROOT = process.cwd();
const PROJECTS_DIR = path.join(ROOT, "src/content/projects");
const META_DIR = path.join(ROOT, "src/content/project-meta");
const HOMEPAGE_PATH = path.join(ROOT, "src/content/homepage.json");
const INDEX_PATH = path.join(PROJECTS_DIR, "index.json");

function main(): void {
  const index = JSON.parse(fs.readFileSync(INDEX_PATH, "utf-8")) as ProjectsIndex;

  fs.mkdirSync(META_DIR, { recursive: true });

  for (const slug of index.slugs) {
    const projectPath = path.join(PROJECTS_DIR, `${slug}.json`);
    const project = JSON.parse(
      fs.readFileSync(projectPath, "utf-8"),
    ) as ProjectSource;

    const meta = {
      title: project.title,
      subtitle: project.subtitle ?? "",
      year: project.year ?? "",
      tags: project.tags ?? "",
      cover: project.cover ?? "",
      featured: Boolean(project.featured),
      categories: project.categories ?? [],
    };

    const metaPath = path.join(META_DIR, `${slug}.json`);
    fs.writeFileSync(metaPath, `${JSON.stringify(meta, null, 2)}\n`, "utf-8");
    console.log(`Wrote ${path.relative(ROOT, metaPath)}`);
  }

  const homepage = {
    spotlightSlug: index.spotlightSlug ?? index.homepageOrder[0] ?? null,
    homepageOrder: index.homepageOrder,
  };

  fs.writeFileSync(
    HOMEPAGE_PATH,
    `${JSON.stringify(homepage, null, 2)}\n`,
    "utf-8",
  );
  console.log(`Wrote ${path.relative(ROOT, HOMEPAGE_PATH)}`);
  console.log(`Done: ${index.slugs.length} project-meta files.`);
}

main();
