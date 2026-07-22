"use client";

import { ProjectTableOfContents } from "@/components/project/ProjectTableOfContents";
import type { GroupedHeadings } from "@/lib/project-headings";

type ProjectCaseStudyLayoutProps = {
  grouped: GroupedHeadings;
  children: React.ReactNode;
};

export function ProjectCaseStudyLayout({
  grouped,
  children,
}: ProjectCaseStudyLayoutProps) {
  const hasToc =
    grouped.before.length > 0 ||
    grouped.phases.length > 0 ||
    grouped.after.length > 0;

  if (!hasToc) {
    return <>{children}</>;
  }

  return (
    <div className="project-layout">
      <div className="project-layout__main">{children}</div>
      <ProjectTableOfContents
        grouped={grouped}
        alwaysExpanded
        className="project-layout__toc"
      />
    </div>
  );
}
