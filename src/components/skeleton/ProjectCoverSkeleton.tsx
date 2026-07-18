import { Skeleton } from "@/components/skeleton/Skeleton";

type ProjectCoverSkeletonProps = {
  variant?: "default" | "spotlight" | "feature-sidebar";
};

export function ProjectCoverSkeleton({
  variant = "default",
}: ProjectCoverSkeletonProps) {
  const isSpotlight = variant === "spotlight";
  const isFeatureSidebar = variant === "feature-sidebar";
  const isFeatureFold = isSpotlight || isFeatureSidebar;

  return (
    <div
      className={`project-cover project-cover-skeleton block w-full${
        isSpotlight ? " project-cover--spotlight" : ""
      }${isFeatureSidebar ? " project-cover--feature-sidebar" : ""}${
        isFeatureFold ? " project-cover--feature-fold" : ""
      }`}
      aria-hidden
    >
      <div className="cover-content-container">
        <div className="cover-image-area">
          <Skeleton className="cover-image-wrap relative aspect-[202/158] w-full overflow-hidden rounded-2xl" />
        </div>
        <div className="details-wrap">
          <div className="details">
            <div className="details-inner">
              <div className="cover-meta flex min-w-0 flex-1 flex-col gap-2">
                <Skeleton
                  className={`h-4 rounded ${
                    isSpotlight ? "w-3/5 max-w-[220px]" : "w-4/5 max-w-[180px]"
                  }`}
                />
                <Skeleton className="h-3 w-full max-w-[260px] rounded" />
              </div>
              <Skeleton className="h-4 w-4 shrink-0 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
