import { Metadata } from "next";
import { CategoriesClient } from "./[categoryId]/_components/categories-client";


export const metadata: Metadata = {
  title: "Categories Management | Admin Dashboard",
  description: "Manage store categories, including creation, updating, and attribute assignment",
};

export default async function CategoriesPage() {
  return <CategoriesClient />;
}
