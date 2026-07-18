import { ProjectCover } from "@/components/project/ProjectCover";
import type { FeatureSideCount } from "@/lib/projects";
import type { Project } from "@/types/project";

type ProjectGridProps = {
  projects: Project[];
  /** When set, that project is the left-column hero beside stacked sidebar projects. */
  spotlightSlug?: string | null;
  featureSideCount?: FeatureSideCount;
};

export function ProjectGrid({
  projects,
  spotlightSlug,
  featureSideCount = 2,
}: ProjectGridProps) {
  const spotlight = spotlightSlug
    ? projects.find((project) => project.slug === spotlightSlug)
    : undefined;
  const rest = spotlight
    ? projects.filter((project) => project.slug !== spotlight.slug)
    : projects;

  const sidebarProjects = spotlight ? rest.slice(0, featureSideCount) : [];
  const gridProjects = spotlight ? rest.slice(featureSideCount) : rest;

  return (
    <section
      className={`project-covers${spotlight ? " project-covers--with-feature" : ""}`}
      aria-label="Projects"
    >
      {spotlight ? (
        <div
          className={`project-covers-feature project-covers-feature--side-${featureSideCount}`}
        >
          <div className="project-covers-feature__main">
            <ProjectCover project={spotlight} variant="spotlight" />
          </div>
          <div className="project-covers-feature__stack">
            {sidebarProjects.map((project) => (
              <ProjectCover
                key={project.slug}
                project={project}
                variant="feature-sidebar"
              />
            ))}
          </div>
        </div>
      ) : null}
      {gridProjects.map((project) => (
        <ProjectCover key={project.slug} project={project} />
      ))}
    </section>
  );
}
