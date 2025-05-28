"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ProductActions } from "@/api-actions/product-actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { LoadingPage } from "@/components/common/loading";
import { ProductVariantsList } from "./product-variants-list";
import { PageHeader } from "@/components/common/page-header";
import { Separator } from "@/components/ui/separator";

interface ProductVariantsPageProps {
  productId: string;
}

export const ProductVariantsPage = ({ productId }: ProductVariantsPageProps) => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Fetch product with its variants
  const { data: productData, isLoading, error } = useQuery({
    queryKey: ["product-variants", productId],
    queryFn: async () => {
      return await ProductActions.getProductById(
        productId,
        {
          include_children: true,
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
      router.push("/vendor/products");
    }
  }, [error, router]);

  if (isLoading || !mounted) {
    return <LoadingPage />;
  }

  const product = productData?.data;

  if (!product) {
    toast.error("Product not found");
    router.push("/vendor/products");
    return null;
  }

  if (product.product_type !== "PARENT") {
    toast.error("Variants can only be created for parent products");
    router.push("/vendor/products");
    return null;
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-4 pt-6">
        <Button 
          variant="ghost" 
          className="flex items-center mb-4 text-muted-foreground"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        
        <PageHeader
          title="Product Variants"
          description={`Manage variants for ${product.title}`}
        />
        <Separator />
        
        <ProductVariantsList productId={productId} />
      </div>
    </div>
  );
};
