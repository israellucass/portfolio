import { Skeleton } from "@/components/skeleton/Skeleton";

export function ProjectPageSkeleton() {
  return (
    <section
      className="site-content w-full py-0"
      aria-busy="true"
      aria-label="Loading project"
    >
      <div className="px-gutter py-8 md:py-10">
        <Skeleton className="h-8 w-full max-w-[420px] rounded md:h-10" />
        <Skeleton className="mt-3 h-4 w-full max-w-[640px] rounded" />
        <Skeleton className="mt-2 h-4 w-[82%] max-w-[560px] rounded" />
      </div>
      <Skeleton className="aspect-[16/10] w-full rounded-none" />
      <div className="flex flex-col gap-8 px-gutter py-10 lg:flex-row">
        <div className="flex flex-1 flex-col gap-3">
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-[92%] rounded" />
          <Skeleton className="h-4 w-[78%] rounded" />
        </div>
        <div className="flex w-full max-w-sm flex-col gap-3">
          <Skeleton className="h-4 w-24 rounded" />
          <Skeleton className="h-4 w-32 rounded" />
          <Skeleton className="h-4 w-24 rounded" />
          <Skeleton className="h-4 w-40 rounded" />
        </div>
      </div>
      <div className="px-gutter pb-16">
        <Skeleton className="aspect-video w-full rounded-2xl" />
      </div>
    </section>
  );
}
