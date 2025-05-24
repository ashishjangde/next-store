import { Metadata } from "next";
import { ProductsClient } from "./_components/products-client";

export const metadata: Metadata = {
  title: "Products Management | Vendor Dashboard",
  description: "Manage your product catalog, including creation, updating, and inventory management",
};

export default async function ProductsPage() {
  return <ProductsClient />;
}
