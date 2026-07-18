import { ProjectGrid } from "@/components/project/ProjectGrid";
import { getProjectsByCategory } from "@/lib/projects";
import type { Category } from "@/data/site";

type CategoryPageProps = {
  category: Exclude<Category, "featured">;
};

export function CategoryPage({ category }: CategoryPageProps) {
  const projects = getProjectsByCategory(category);
  return <ProjectGrid projects={projects} />;
}
