import { ProductVariantsPage } from "../../_components/product-variants-page";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductVariants({ params }: PageProps) {
  const {id} = await params;
  return (
    <ProductVariantsPage productId={id} />
  );
}
