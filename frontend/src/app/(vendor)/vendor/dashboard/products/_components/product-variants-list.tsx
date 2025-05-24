"use client";

import { useState } from "react";
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
import { CreateVariantModal } from "./create-variant-modal";
import { toast } from "sonner";
import Image from "next/image";

interface ProductVariantsListProps {
  productId: string;
}

export const ProductVariantsList = ({ productId }: ProductVariantsListProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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
    staleTime: 10000, // 10 seconds
  });

  const product = data?.data;
  const variants = product?.children || [];

  // Delete variant mutation
  const { mutate: deleteVariant, isPending: isDeleting } = useMutation({
    mutationFn: (variantId: string) => {
      return ProductActions.deleteProduct(variantId);
    },
    onSuccess: () => {
      toast.success("Variant deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["product-variants", productId] });
    },
    onError: () => {
      toast.error("Failed to delete variant");
    },
  });

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

  const handleDeleteVariant = (variantId: string) => {
    if (window.confirm("Are you sure you want to delete this variant?")) {
      deleteVariant(variantId);
    }
  };

  return (
    <>
      <CreateVariantModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        parentProductId={productId}
        onSuccess={() => {
          setIsCreateModalOpen(false);
          queryClient.invalidateQueries({ queryKey: ["product-variants", productId] });
        }}
      />
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Product Variants</CardTitle>
            <CardDescription>
              Manage variants for {product.title}
            </CardDescription>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
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
              <Button onClick={() => setIsCreateModalOpen(true)}>
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
                        <div className="font-medium">{variant.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {/* Show variant attributes if available */}
                          {variant.ProductAttribute?.map((attr, i, arr) => (
                            <span key={attr.attribute_value_id}>
                              {attr.AttributeValue?.Attribute?.name}: {attr.AttributeValue?.value}
                              {i < arr.length - 1 ? ", " : ""}
                            </span>
                          ))}
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
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/vendor/dashboard/products/${variant.id}`)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteVariant(variant.id)}
                            disabled={isDeleting}
                          >
                            Delete
                          </Button>
                        </div>
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
