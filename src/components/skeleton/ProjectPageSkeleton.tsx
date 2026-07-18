import { Skeleton } from "@/components/skeleton/Skeleton";

export function ProjectPageSkeleton() {
  return (
    <section
      className="site-content w-full px-[8%] py-0"
      aria-busy="true"
      aria-label="Loading project"
    >
      <div className="py-8 md:py-10">
        <Skeleton className="h-8 w-full max-w-[420px] rounded md:h-10" />
      </div>
      <div className="flex flex-col gap-6 pb-16 md:gap-8">
        <Skeleton className="aspect-[202/158] w-full rounded-2xl" />
        <div className="mx-auto flex w-full max-w-[768px] flex-col gap-3 py-4">
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-[92%] rounded" />
          <Skeleton className="h-4 w-[78%] rounded" />
        </div>
        <Skeleton className="aspect-video w-full rounded-2xl" />
      </div>
    </section>
  );
}
