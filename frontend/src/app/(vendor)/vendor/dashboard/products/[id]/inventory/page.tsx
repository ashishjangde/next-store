import { ProductInventoryPage } from "../../_components/product-inventory-page";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductInventory({ params }: PageProps) {
  const { id } = await params;
  return (
    <ProductInventoryPage productId={id} />
  );
}
