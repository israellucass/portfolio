import { ProjectGrid } from "@/components/project/ProjectGrid";
import { createHomeMetadata } from "@/lib/metadata";
import {
  getFeaturedProjects,
  getHomepageFeatureSideCount,
  getHomepageSpotlightSlug,
} from "@/lib/projects";

export const metadata = createHomeMetadata();

export default function HomePage() {
  const projects = getFeaturedProjects();
  const spotlightSlug = getHomepageSpotlightSlug();
  const featureSideCount = getHomepageFeatureSideCount();

  return (
    <ProjectGrid
      projects={projects}
      spotlightSlug={spotlightSlug}
      featureSideCount={featureSideCount}
    />
  );
}
