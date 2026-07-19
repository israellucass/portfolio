import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PageLayout } from "@/components/layout/PageLayout";
import { ProjectBlocks } from "@/components/project/ProjectBlocks";
import { ProjectHeroFold } from "@/components/project/ProjectHeroFold";
import { createProjectMetadata } from "@/lib/metadata";
import { splitProjectFold } from "@/lib/project-fold";
import {
  getAllProjectSlugs,
  getProjectBySlug,
} from "@/lib/projects";
import { site } from "@/data/site";

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getAllProjectSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return { title: site.title };

  return createProjectMetadata(project);
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) notFound();

  const { fold, remainingBlocks } = splitProjectFold(project);
  const blocks = remainingBlocks;

  return (
    <PageLayout as="article" showBackToTop>
      <ProjectHeroFold title={project.title} fold={fold} />
      <ErrorBoundary>
        <ProjectBlocks blocks={blocks} title={project.title} />
      </ErrorBoundary>
    </PageLayout>
  );
}
