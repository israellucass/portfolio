import type { Project } from "@/types/project";

type ProjectLabelFields = Pick<Project, "title" | "subtitle">;

export function formatProjectCoverLabel(project: ProjectLabelFields): string {
  const parts = [project.title];

  if (project.subtitle) {
    parts.push(project.subtitle);
  }

  return parts.join(". ");
}
