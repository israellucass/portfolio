import fs from "fs";
import path from "path";
import type { Category } from "@/data/site";
import type { Project, ProjectBlock } from "@/types/project";

export type { Project, ProjectBlock } from "@/types/project";

type ProjectsIndex = {
  source: string;
  count: number;
  spotlightSlug?: string;
  homepageOrder: string[];
  slugs: string[];
};

type ProjectMeta = {
  title: string;
  subtitle?: string;
  year?: string;
  tags?: string;
  cover?: string;
  categories?: Category[];
  featured?: boolean;
};

export type FeatureSideCount = 2 | 3;

type HomepageConfig = {
  spotlightSlug: string | null;
  homepageOrder: string[];
  featureSideCount: FeatureSideCount;
};

const CONTENT_DIR = path.join(process.cwd(), "src/content");
const PROJECTS_DIR = path.join(CONTENT_DIR, "projects");
const META_DIR = path.join(CONTENT_DIR, "project-meta");
const HOMEPAGE_PATH = path.join(CONTENT_DIR, "homepage.json");

function readIndex(): ProjectsIndex {
  const raw = fs.readFileSync(path.join(PROJECTS_DIR, "index.json"), "utf-8");
  return JSON.parse(raw) as ProjectsIndex;
}

function parseFeatureSideCount(value: unknown): FeatureSideCount {
  if (value === 3 || value === "3") {
    return 3;
  }

  return 2;
}

function readHomepage(): HomepageConfig {
  if (fs.existsSync(HOMEPAGE_PATH)) {
    const raw = fs.readFileSync(HOMEPAGE_PATH, "utf-8");
    const data = JSON.parse(raw) as HomepageConfig;
    return {
      spotlightSlug: data.spotlightSlug ?? null,
      homepageOrder: data.homepageOrder ?? [],
      featureSideCount: parseFeatureSideCount(data.featureSideCount),
    };
  }

  const index = readIndex();
  return {
    spotlightSlug: index.spotlightSlug ?? null,
    homepageOrder: index.homepageOrder,
    featureSideCount: 2,
  };
}

function readMeta(slug: string): ProjectMeta | null {
  const metaPath = path.join(META_DIR, `${slug}.json`);
  if (!fs.existsSync(metaPath)) {
    return null;
  }

  const raw = fs.readFileSync(metaPath, "utf-8");
  return JSON.parse(raw) as ProjectMeta;
}

function resolveMetaTitle(title: ProjectMeta["title"]): string {
  if (typeof title === "string") {
    return title;
  }

  return "";
}

function readProject(slug: string): Project {
  const raw = fs.readFileSync(path.join(PROJECTS_DIR, `${slug}.json`), "utf-8");
  const base = JSON.parse(raw) as Project;
  const meta = readMeta(slug);

  if (!meta) {
    return base;
  }

  return {
    ...base,
    title: resolveMetaTitle(meta.title) || base.title,
    subtitle: meta.subtitle ?? base.subtitle,
    year: meta.year ?? base.year,
    tags: meta.tags ?? base.tags,
    cover: meta.cover ?? base.cover,
    categories: meta.categories ?? base.categories,
    featured: meta.featured ?? base.featured,
  };
}

function loadProjects(): Project[] {
  const index = readIndex();
  return index.slugs.map(readProject);
}

export function getAllProjects(): Project[] {
  return loadProjects();
}

export function getFeaturedProjects(): Project[] {
  const homepage = readHomepage();
  const featured = loadProjects().filter((project) => project.featured);
  const order = new Map(
    homepage.homepageOrder.map((slug, position) => [slug, position]),
  );

  return featured.sort(
    (a, b) => (order.get(a.slug) ?? 999) - (order.get(b.slug) ?? 999),
  );
}

/** Homepage hero project; falls back to the first homepage-ordered featured slug. */
export function getHomepageSpotlightSlug(): string | null {
  const homepage = readHomepage();
  const featured = getFeaturedProjects();

  if (featured.length === 0) {
    return null;
  }

  if (
    homepage.spotlightSlug &&
    featured.some((project) => project.slug === homepage.spotlightSlug)
  ) {
    return homepage.spotlightSlug;
  }

  return featured[0]?.slug ?? null;
}

export function getHomepageFeatureSideCount(): FeatureSideCount {
  return readHomepage().featureSideCount;
}

export function getProjectsByCategory(
  category: Exclude<Category, "featured">,
): Project[] {
  return loadProjects().filter((project) =>
    project.categories.includes(category),
  );
}

export function getProjectBySlug(slug: string): Project | undefined {
  const slugs = readIndex().slugs;
  if (!slugs.includes(slug)) {
    return undefined;
  }

  return readProject(slug);
}

export function getAllProjectSlugs(): string[] {
  return readIndex().slugs;
}

export function getDisplayBlocks(blocks: ProjectBlock[]): ProjectBlock[] {
  return blocks;
}
