import { ProjectGridSkeleton } from "@/components/skeleton/ProjectGridSkeleton";

export default function HomeLoading() {
  return <ProjectGridSkeleton withFeature featureSideCount={2} gridCount={6} />;
}
