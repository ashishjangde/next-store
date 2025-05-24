import { ProductVariantsPage } from "../../_components/product-variants-page";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function ProductVariants({ params }: PageProps) {
  return (
    <ProductVariantsPage productId={params.id} />
  );
}
