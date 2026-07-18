import { CategoryPage } from "@/components/project/CategoryPage";
import { createCategoryMetadata } from "@/lib/metadata";

export const metadata = createCategoryMetadata("ux");

export default function UxPage() {
  return <CategoryPage category="ux" />;
}
