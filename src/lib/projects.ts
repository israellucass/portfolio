import fs from "fs";
import path from "path";
import { cache } from "react";
import type { Category } from "@/data/site";
import type { Project, ProjectBlock, ProjectCoverCard } from "@/types/project";

export type { Project, ProjectBlock, ProjectCoverCard } from "@/types/project";

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

type ProjectListMeta = ProjectCoverCard & {
  featured: boolean;
  categories: Category[];
};

export type HomepageGridData = {
  projects: ProjectCoverCard[];
  spotlightSlug: string | null;
  featureSideCount: FeatureSideCount;
};

const CONTENT_DIR = path.join(process.cwd(), "src/content");
const PROJECTS_DIR = path.join(CONTENT_DIR, "projects");
const META_DIR = path.join(CONTENT_DIR, "project-meta");
const HOMEPAGE_PATH = path.join(CONTENT_DIR, "homepage.json");

const readIndex = cache((): ProjectsIndex => {
  const raw = fs.readFileSync(path.join(PROJECTS_DIR, "index.json"), "utf-8");
  return JSON.parse(raw) as ProjectsIndex;
});

function parseFeatureSideCount(value: unknown): FeatureSideCount {
  if (value === 3 || value === "3") {
    return 3;
  }

  return 2;
}

const readHomepage = cache((): HomepageConfig => {
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
});

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

function readProjectFile(slug: string): Project {
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

function readProjectListMeta(slug: string): ProjectListMeta {
  const meta = readMeta(slug);

  if (meta) {
    return {
      slug,
      title: resolveMetaTitle(meta.title),
      subtitle: meta.subtitle ?? "",
      cover: meta.cover ?? "",
      featured: meta.featured ?? false,
      categories: meta.categories ?? [],
    };
  }

  const project = readProjectFile(slug);
  return {
    slug: project.slug,
    title: project.title,
    subtitle: project.subtitle,
    cover: project.cover,
    featured: project.featured,
    categories: project.categories,
  };
}

const loadProjectListMeta = cache((): ProjectListMeta[] => {
  const index = readIndex();
  return index.slugs.map(readProjectListMeta);
});

const loadProjects = cache((): Project[] => {
  const index = readIndex();
  return index.slugs.map(readProjectFile);
});

function sortFeaturedProjects(projects: ProjectListMeta[]): ProjectListMeta[] {
  const homepage = readHomepage();
  const order = new Map(
    homepage.homepageOrder.map((slug, position) => [slug, position]),
  );

  return [...projects].sort(
    (a, b) => (order.get(a.slug) ?? 999) - (order.get(b.slug) ?? 999),
  );
}

function toCoverCard(project: ProjectListMeta): ProjectCoverCard {
  return {
    slug: project.slug,
    title: project.title,
    subtitle: project.subtitle,
    cover: project.cover,
  };
}

function resolveSpotlightSlug(
  featured: ProjectListMeta[],
  homepage: HomepageConfig,
): string | null {
  if (featured.length === 0) {
    return null;
  }

  if (
    homepage.spotlightSlug &&
    featured.some((project) => project.slug === homepage.spotlightSlug)
  ) {
    return homepage.spotlightSlug;
  }

  return sortFeaturedProjects(featured)[0]?.slug ?? null;
}

export function getAllProjects(): Project[] {
  return loadProjects();
}

export function getFeaturedProjects(): Project[] {
  return sortFeaturedProjects(
    loadProjectListMeta().filter((project) => project.featured),
  ).map((project) => readProjectFile(project.slug));
}

export function getFeaturedProjectCards(): ProjectCoverCard[] {
  return sortFeaturedProjects(
    loadProjectListMeta().filter((project) => project.featured),
  ).map(toCoverCard);
}

export function getHomepageGridData(): HomepageGridData {
  const homepage = readHomepage();
  const featured = sortFeaturedProjects(
    loadProjectListMeta().filter((project) => project.featured),
  );

  return {
    projects: featured.map(toCoverCard),
    spotlightSlug: resolveSpotlightSlug(featured, homepage),
    featureSideCount: homepage.featureSideCount,
  };
}

/** Homepage hero project; falls back to the first homepage-ordered featured slug. */
export function getHomepageSpotlightSlug(): string | null {
  const homepage = readHomepage();
  const featured = loadProjectListMeta().filter((project) => project.featured);
  return resolveSpotlightSlug(featured, homepage);
}

export function getHomepageFeatureSideCount(): FeatureSideCount {
  return readHomepage().featureSideCount;
}

export function getProjectsByCategory(
  category: Exclude<Category, "featured">,
): Project[] {
  return loadProjectListMeta()
    .filter((project) => project.categories.includes(category))
    .map((project) => readProjectFile(project.slug));
}

export function getProjectCoverCardsByCategory(
  category: Exclude<Category, "featured">,
): ProjectCoverCard[] {
  return loadProjectListMeta()
    .filter((project) => project.categories.includes(category))
    .map(toCoverCard);
}

export const getProjectBySlug = cache(
  (slug: string): Project | undefined => {
    const slugs = readIndex().slugs;
    if (!slugs.includes(slug)) {
      return undefined;
    }

    return readProjectFile(slug);
  },
);

export function getAllProjectSlugs(): string[] {
  return readIndex().slugs;
}

export function getDisplayBlocks(blocks: ProjectBlock[]): ProjectBlock[] {
  return blocks;
}
