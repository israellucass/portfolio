import { ProjectGrid } from "@/components/project/ProjectGrid";
import { createHomeMetadata } from "@/lib/metadata";
import { getHomepageGridData } from "@/lib/projects";

export const metadata = createHomeMetadata();

export default function HomePage() {
  const { projects, spotlightSlug, featureSideCount } = getHomepageGridData();

  return (
    <ProjectGrid
      projects={projects}
      spotlightSlug={spotlightSlug}
      featureSideCount={featureSideCount}
    />
  );
}
