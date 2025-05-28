import { ProductDetailPage } from "../_components/product-detail-page";

interface PageProps {
  params: Promise< {
    id: string;
  }>;
}

export default async function ProductDetail({ params }: PageProps) {
  const {id} =  await params;
  return (
    <ProductDetailPage productId={id} />
  );
}
