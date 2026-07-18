import { CategoryPage } from "@/components/project/CategoryPage";
import { createCategoryMetadata } from "@/lib/metadata";

export const metadata = createCategoryMetadata("motion");

export default function MotionPage() {
  return <CategoryPage category="motion" />;
}
