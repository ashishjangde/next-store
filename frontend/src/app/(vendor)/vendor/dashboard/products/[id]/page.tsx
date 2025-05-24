import { ProductDetailPage } from "../_components/product-detail-page";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function ProductDetail({ params }: PageProps) {
  return (
    <ProductDetailPage productId={params.id} />
  );
}
