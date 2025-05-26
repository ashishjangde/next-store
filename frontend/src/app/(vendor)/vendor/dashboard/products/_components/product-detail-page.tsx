"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ProductActions } from "@/api-actions/product-actions";
import { InventoryActions } from "@/api-actions/inventory-actions";
import { LoadingPage } from "@/components/common/loading";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Edit, Plus } from "lucide-react";
import { ProductForm } from "./product-form";
import { ProductVariantsList } from "./product-variants-list";
import { SingleProductInventory } from "./single-product-inventory";
import { VariantsInventory } from "./variants-inventory";
import { ProductAttributesForm } from "./product-attributes-form";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import Image from "next/image";

interface ProductDetailPageProps {
  productId: string;
}

export const ProductDetailPage = ({ productId }: ProductDetailPageProps) => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Fetch product data with all necessary includes
  const { data: productData, isLoading, error } = useQuery({
    queryKey: ["product", productId],
    queryFn: async () => {
      return await ProductActions.getProductById(
        productId,
        {
          include_category: true,
          include_attributes: true,
          include_children: true
        }
      );
    },
    enabled: !!productId && mounted,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
    staleTime: 0,
    gcTime: 0,
  });

  // Fetch inventory data for both product and variants
  const { data: inventoryData } = useQuery({
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
    if (error) {
      toast.error("Failed to load product");
      router.push("/vendor/dashboard/products");
    }
  }, [error, router]);

  if (isLoading || !mounted) {
    return <LoadingPage />;
  }

  const product = productData?.data;
  const inventory = inventoryData?.data;

  if (!product) {
    toast.error("Product not found");
    router.push("/vendor/dashboard/products");
    return null;
  }

  const hasVariants = product.children && product.children.length > 0;
  
  // Format the inventory data as needed
  let formattedInventory: { [key: string]: Inventory } | null = null;
  
  if (hasVariants && inventory) {
    // Convert to dictionary format for variants
    const inventoryMap: { [key: string]: Inventory } = {};
    
    // Add variant inventories
    if (Array.isArray(inventory)) {
      inventory.forEach((inv: Inventory) => {
        inventoryMap[inv.product_id] = inv;
      });
    } else if (inventory) {
      inventoryMap[inventory.product_id] = inventory;
    }
    
    formattedInventory = inventoryMap;
  }

  // Get parent product inventory
  const parentInventory = Array.isArray(inventory) 
    ? inventory.find(inv => inv.product_id === product.id) || null
    : inventory;

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
            <PageHeader
              title={product.title}
              description={`Manage your product details, variants, and inventory`}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => router.push(`/vendor/dashboard/products/new?update=${productId}`)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Product
            </Button>
            {product.product_type === "PARENT" && (
              <Button
                onClick={() => router.push(`/vendor/dashboard/products/new?parent_id=${productId}`)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Variant
              </Button>
            )}
          </div>
        </div>

        <Separator />

        <Tabs defaultValue="overview" className="mt-6" >
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="variants">Variants</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="attributes">Attributes</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 pt-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground">Title</p>
                      <p>{product.title}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground">SKU</p>
                      <p>{product.sku || "-"}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">Description</p>
                    <p>{product.description || "No description provided"}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground">Price</p>
                      <p>{formatCurrency(product.price)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground">Status</p>
                      <Badge variant={product.is_active ? "default" : "secondary"}>
                        {product.is_active ? "Active" : "Draft"}
                      </Badge>
                    </div>
                  </div>
                  {parentInventory && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-semibold text-muted-foreground">Current Stock</p>
                        <p>{parentInventory.quantity}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-muted-foreground">Low Stock Threshold</p>
                        <p>{parentInventory.low_stock_threshold}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Product Images</CardTitle>
                </CardHeader>
                <CardContent>
                  {product.images && product.images.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                      {product.images.map((image, index) => (
                        <div key={index} className="relative aspect-square">
                          <Image
                            src={image}
                            alt={`${product.title} - Image ${index + 1}`}
                            fill
                            className="object-cover rounded-md"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No images uploaded</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="variants" className="space-y-4 pt-4">
            {product.product_type === "PARENT" ? (
              <ProductVariantsList productId={productId} />
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground">This product doesn't have variants.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="inventory" className="space-y-4 pt-4">
            {hasVariants ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Parent Product Inventory</CardTitle>
                    <CardDescription>
                      Manage inventory for the parent product
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <SingleProductInventory 
                      product={product} 
                      inventory={parentInventory} 
                    />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Variant Inventory</CardTitle>
                    <CardDescription>
                      Manage inventory for all variants
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <VariantsInventory 
                      product={product} 
                    />
                  </CardContent>
                </Card>
              </>
            ) : (
              <SingleProductInventory 
                product={product} 
                inventory={parentInventory} 
              />
            )}
          </TabsContent>

          <TabsContent value="attributes" className="space-y-4 pt-4">
            <ProductAttributesForm product={product} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
