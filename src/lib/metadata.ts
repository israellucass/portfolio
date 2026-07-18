import type { Metadata } from "next";
import { categoryRoutes, site, type Category } from "@/data/site";
import type { Project } from "@/types/project";

const ogImage = "/images/site/og-image.jpg";

function ogImages(url: string, alt: string) {
  return [{ url, alt }];
}

export function createRootMetadata(): Metadata {
  return {
    metadataBase: new URL(site.url),
    title: site.title,
    description: site.description,
    keywords: [...site.keywords],
    icons: {
      icon: "/images/site/favicon.png",
      apple: "/images/site/apple-touch-icon.jpg",
    },
    openGraph: {
      title: site.title,
      description: site.description,
      type: "website",
      url: "/",
      siteName: site.name,
      images: ogImages(ogImage, site.title),
    },
    twitter: {
      card: "summary_large_image",
      title: site.title,
      description: site.description,
      images: [ogImage],
    },
  };
}

export function createHomeMetadata(): Metadata {
  return {
    alternates: { canonical: "/" },
  };
}

export function createAboutMetadata(): Metadata {
  const title = `${site.title} - About me`;
  const description = `${site.description} Portfolio, publications, and background.`;

  return {
    title,
    description,
    alternates: { canonical: "/about" },
    openGraph: {
      title,
      description,
      url: "/about",
      images: ogImages(ogImage, title),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export function createCategoryMetadata(
  category: Exclude<Category, "featured">,
): Metadata {
  const { path, label } = categoryRoutes[category];
  const title = `${site.title} - ${label}`;
  const description = `${label} projects by ${site.name} — product design, case studies, and visual work.`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      images: ogImages(ogImage, title),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export function createProjectMetadata(project: Project): Metadata {
  const title = `${site.title} - ${project.title}`;
  const description = project.tags
    ? `${project.title} (${project.year}). ${project.tags}.`
    : `${project.title} (${project.year}). ${site.description}`;

  return {
    title,
    description,
    alternates: { canonical: `/${project.slug}` },
    openGraph: {
      title,
      description,
      type: "article",
      url: `/${project.slug}`,
      images: ogImages(project.cover, project.title),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [project.cover],
    },
  };
}
