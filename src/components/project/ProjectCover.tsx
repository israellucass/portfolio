import { CoverImage } from "@/components/project/CoverImage";
import Link from "next/link";
import { getCoverVideoPath } from "@/lib/media";
import { formatProjectCoverLabel } from "@/lib/project-label";
import type { Project } from "@/types/project";

type ProjectCoverVariant = "default" | "spotlight" | "feature-sidebar";

type ProjectCoverProps = {
  project: Project;
  variant?: ProjectCoverVariant;
};

function CoverChevron() {
  return (
    <svg
      className="cover-chevron"
      viewBox="0 0 16 16"
      width="16"
      height="16"
      aria-hidden
      focusable="false"
    >
      <path
        d="M5.5 3.5L10 8l-4.5 4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function getCoverImageSizes(variant: ProjectCoverVariant): string {
  switch (variant) {
    case "spotlight":
      return "(max-width: 767px) 100vw, 65vw";
    case "feature-sidebar":
      return "(max-width: 767px) 50vw, 35vw";
    default:
      return "(max-width: 1023px) 50vw, 33vw";
  }
}

export function ProjectCover({
  project,
  variant = "default",
}: ProjectCoverProps) {
  const coverLabel = formatProjectCoverLabel(project);
  const coverVideo = getCoverVideoPath(project.cover);
  const isSpotlight = variant === "spotlight";
  const isFeatureSidebar = variant === "feature-sidebar";
  const isFeatureFold = isSpotlight || isFeatureSidebar;

  return (
    <Link
      href={`/${project.slug}`}
      aria-label={coverLabel}
      className={`project-cover focus-ring relative block w-full${
        isSpotlight ? " project-cover--spotlight" : ""
      }${isFeatureSidebar ? " project-cover--feature-sidebar" : ""}${
        isFeatureFold ? " project-cover--feature-fold" : ""
      }`}
    >
      <div className="cover-content-container">
        <div className="cover-image-area">
          <div className="cover-image-wrap relative aspect-[202/158] w-full overflow-hidden">
            <CoverImage
              src={project.cover}
              videoSrc={coverVideo}
              sizes={getCoverImageSizes(variant)}
              priority={isSpotlight}
            />
          </div>
        </div>

        <div className="details-wrap">
          <div className="details">
            <div className="details-inner">
              <div className="cover-meta">
                <h2 className="cover-title">{project.title}</h2>
                {project.subtitle ? (
                  <p className="cover-subtitle">{project.subtitle}</p>
                ) : null}
              </div>
              <CoverChevron />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
