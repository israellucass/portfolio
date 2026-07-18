import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageLayout } from "@/components/layout/PageLayout";
import { ProjectBlocks } from "@/components/project/ProjectBlocks";
import { createProjectMetadata } from "@/lib/metadata";
import {
  getAllProjectSlugs,
  getDisplayBlocks,
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

  const blocks = getDisplayBlocks(project.blocks);

  return (
    <PageLayout as="article" title={project.title} showBackToTop>
      <ProjectBlocks blocks={blocks} title={project.title} />
    </PageLayout>
  );
}
