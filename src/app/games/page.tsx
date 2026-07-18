import { CategoryPage } from "@/components/project/CategoryPage";
import { createCategoryMetadata } from "@/lib/metadata";

export const metadata = createCategoryMetadata("games");

export default function GamesPage() {
  return <CategoryPage category="games" />;
}
