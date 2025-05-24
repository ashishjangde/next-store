"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ProductActions } from "@/api-actions/product-actions";
import { ProductForm } from "./product-form";
import { LoadingPage } from "@/components/common/loading";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface ProductDetailPageProps {
  productId: string;
}

export const ProductDetailPage = ({ productId }: ProductDetailPageProps) => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Fetch product data
  const { data: productData, isLoading, error } = useQuery({
    queryKey: ["product", productId],
    queryFn: async () => {
      return await ProductActions.getProductById(
        productId,
        {
          include_category: true,
          include_attributes: true,
        }
      );
    },
    enabled: !!productId && mounted,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (error) {
      toast.error("Failed to load product");
      router.push("/vendor/dashboard/products");
    }
  }, [error, router]);

  if (isLoading || !mounted) {
    return <LoadingPage />;
  }

  const product = productData?.data;

  if (!product) {
    toast.error("Product not found");
    router.push("/vendor/dashboard/products");
    return null;
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-4 pt-6">
        <ProductForm initialData={product} />
      </div>
    </div>
  );
};
