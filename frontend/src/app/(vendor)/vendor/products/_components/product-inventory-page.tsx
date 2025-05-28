"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ProductActions } from "@/api-actions/product-actions";
import { InventoryActions } from "@/api-actions/inventory-actions";
import { SingleProductInventory } from "./single-product-inventory";
import { VariantsInventory } from "./variants-inventory";
import { LoadingPage } from "@/components/common/loading";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface ProductInventoryPageProps {
  productId: string;
}

export const ProductInventoryPage = ({ productId }: ProductInventoryPageProps) => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Fetch product data
  const { data: productData, isLoading: isLoadingProduct, error: productError } = useQuery({
    queryKey: ["product-for-inventory", productId],
    queryFn: async () => {
      return await ProductActions.getProductById(
        productId,
        {
          include_children: true,
        }
      );
    },
    enabled: !!productId && mounted,
  });
  // Fetch inventory data
  const { data: inventoryData, isLoading: isLoadingInventory, error: inventoryError } = useQuery({
    queryKey: ["inventory", productId],
    queryFn: async () => {
      return await InventoryActions.getProductInventory(productId);
    },
    enabled: !!productId && mounted,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (productError || inventoryError) {
      toast.error("Failed to load product or inventory data");
      router.push("/vendor/dashboard/products");
    }
  }, [productError, inventoryError, router]);

  const isLoading = isLoadingProduct || isLoadingInventory || !mounted;

  if (isLoading) {
    return <LoadingPage />;
  }
  const product = productData?.data;
  const inventoryData2 = inventoryData?.data;

  if (!product) {
    toast.error("Product not found");
    router.push("/vendor/dashboard/products");
    return null;
  }

  const hasVariants = product.children && product.children.length > 0;
  
  // Format the inventory data as needed
  let inventory: { [key: string]: Inventory } | Inventory | null = null;
  
  if (hasVariants && inventoryData2) {
    // Convert to dictionary format for variants
    const inventoryMap: { [key: string]: Inventory } = {};
    
    // If we have a parent inventory, we still need to format it as a map
    if (Array.isArray(inventoryData2)) {
      inventoryData2.forEach((inv: Inventory) => {
        inventoryMap[inv.product_id] = inv;
      });
    } else if (inventoryData2) {
      // Single inventory as a record
      inventoryMap[inventoryData2.product_id] = inventoryData2;
    }
    
    inventory = inventoryMap;
  } else {
    // Single product inventory
    inventory = inventoryData2 || null;
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-4 pt-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Button 
              variant="ghost" 
              className="flex items-center mb-2 text-muted-foreground"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <h2 className="text-2xl font-bold tracking-tight">Inventory Management</h2>
            <p className="text-muted-foreground">
              {hasVariants 
                ? "Manage inventory for this product and its variants"
                : "Manage inventory for this product"
              }
            </p>
          </div>
        </div>        {hasVariants ? (
          <VariantsInventory 
            product={product} 
          />
        ) : (
          <SingleProductInventory 
            product={product} 
            inventory={inventory as Inventory | null} 
          />
        )}
      </div>
    </div>
  );
};
