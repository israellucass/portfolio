import { ProjectGrid } from "@/components/project/ProjectGrid";
import { getProjectCoverCardsByCategory } from "@/lib/projects";
import type { Category } from "@/data/site";

type CategoryPageProps = {
  category: Exclude<Category, "featured">;
};

export function CategoryPage({ category }: CategoryPageProps) {
  const projects = getProjectCoverCardsByCategory(category);
  return <ProjectGrid projects={projects} />;
}
