import { ProductInventoryPage } from "../../_components/product-inventory-page";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function ProductInventory({ params }: PageProps) {
  return (
    <ProductInventoryPage productId={params.id} />
  );
}
