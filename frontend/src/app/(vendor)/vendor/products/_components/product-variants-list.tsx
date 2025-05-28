"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ProductActions } from "@/api-actions/product-actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Plus, ImageOff } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Image from "next/image";
import { ProductActions as ProductActionsDropdown } from "./product-actions";

interface ProductVariantsListProps {
  productId: string;
}

export const ProductVariantsList = ({ productId }: ProductVariantsListProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Fetch product with its variants
  const { data, isLoading } = useQuery({
    queryKey: ["product-variants", productId],
    queryFn: async () => {
      return await ProductActions.getProductById(
        productId,
        {
          include_children: true,
        }
      );
    },
  });

  const product = data?.data;
  const variants = product?.children || [];
  // Delete variant mutation


  if (isLoading) {
    return (
      <div className="w-full flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!product) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>
            Could not load product details
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Product Variants</CardTitle>
            <CardDescription>
              Manage variants for {product.title}
            </CardDescription>
          </div>
          <Button onClick={() => router.push(`/vendor/products/new?parent_id=${productId}`)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Variant
          </Button>
        </CardHeader>
        <CardContent>
          {variants.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-4 text-center">
              <div className="p-4 rounded-full bg-muted">
                <ImageOff className="h-12 w-12 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-medium">No variants created yet</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Create variants based on attributes like color, size, or material to give your customers options.
                </p>
              </div>              
              <Button onClick={() => router.push(`/vendor/products/new?parent_id=${productId}`)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Variant
              </Button>
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Variant</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {variants.map((variant) => (
                    <TableRow key={variant.id}>
                      <TableCell>
                        {variant.images && variant.images.length > 0 ? (
                          <div className="h-10 w-10 relative overflow-hidden rounded">
                            <Image 
                              src={variant.images[0]} 
                              alt={variant.title} 
                              fill 
                              sizes="40px"
                              className="object-cover" 
                            />
                          </div>
                        ) : (                          
                        <div className="h-10 w-10 bg-gray-100 rounded flex items-center justify-center text-gray-500 text-xs">
                            No image
                          </div>
                        )}
                      </TableCell>                        
                      <TableCell>
                        <div 
                          className="font-medium text-blue-600 hover:text-blue-800 cursor-pointer hover:underline transition-colors"
                          onClick={() => router.push(`/vendor/products/${variant.id}`)}
                        >
                          {variant.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {/* Show category instead of attributes */}
                          {variant.category && (
                            <span>Category: {variant.category.name}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{variant.sku || "-"}</TableCell>
                      <TableCell>{formatCurrency(variant.price)}</TableCell>
                      <TableCell>
                        <Badge variant={variant.is_active ? "default" : "secondary"}>
                          {variant.is_active ? "Active" : "Draft"}
                        </Badge>
                      </TableCell>                        
                      <TableCell className="text-right">
                        <ProductActionsDropdown product={variant} isVariant={true} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t px-6 py-4 bg-muted/50">
          <p className="text-xs text-muted-foreground">
            Product variants allow you to offer different versions of the same product, such as different sizes or colors.
          </p>
        </CardFooter>
      </Card>
    </>
  );
};
