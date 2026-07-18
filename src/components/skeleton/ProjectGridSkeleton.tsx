import { ProjectCoverSkeleton } from "@/components/skeleton/ProjectCoverSkeleton";
import type { FeatureSideCount } from "@/lib/projects";

type ProjectGridSkeletonProps = {
  withFeature?: boolean;
  featureSideCount?: FeatureSideCount;
  gridCount?: number;
};

export function ProjectGridSkeleton({
  withFeature = false,
  featureSideCount = 2,
  gridCount = 6,
}: ProjectGridSkeletonProps) {
  return (
    <section
      className={`project-covers project-covers-skeleton${
        withFeature ? " project-covers--with-feature" : ""
      }`}
      aria-busy="true"
      aria-label="Loading projects"
    >
      {withFeature ? (
        <div
          className={`project-covers-feature project-covers-feature--side-${featureSideCount}`}
        >
          <div className="project-covers-feature__main">
            <ProjectCoverSkeleton variant="spotlight" />
          </div>
          <div className="project-covers-feature__stack">
            {Array.from({ length: featureSideCount }, (_, index) => (
              <ProjectCoverSkeleton key={index} variant="feature-sidebar" />
            ))}
          </div>
        </div>
      ) : null}
      {Array.from({ length: gridCount }, (_, index) => (
        <ProjectCoverSkeleton key={index} />
      ))}
    </section>
  );
}
