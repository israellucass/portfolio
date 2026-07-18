import { CategoryPage } from "@/components/project/CategoryPage";
import { createCategoryMetadata } from "@/lib/metadata";

export const metadata = createCategoryMetadata("graphic");

export default function GraphicPage() {
  return <CategoryPage category="graphic" />;
}
