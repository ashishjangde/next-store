"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { InventoryActions } from "@/api-actions/inventory-actions";
import { variationInventoryUpdateSchema } from "@/schema/inventory-schema";
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
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

interface VariantsInventoryProps {
  product: Product;
  inventory: {
    [key: string]: Inventory;
  };
}

export const VariantsInventory = ({ product, inventory }: VariantsInventoryProps) => {
  const queryClient = useQueryClient();  const [variantInventory, setVariantInventory] = useState<Record<string, {
    quantity: number;
    low_stock_threshold: number;
    track_inventory: boolean;
  }>>(() => {
    const initialValues: Record<string, any> = {};
    
    if (product.children) {
      product.children.forEach((variant) => {
        const variantInv = inventory[variant.id];
        initialValues[variant.id] = {
          quantity: variantInv?.quantity || 0,
          low_stock_threshold: variantInv?.low_stock_threshold || 5,
          track_inventory: true, // Setting default to true as it's not in the API
        };
      });
    }
    
    return initialValues;
  });
    // Handle bulk update of all variant inventory
  const { mutate: updateInventories, isPending } = useMutation({
    mutationFn: async () => {
      // Format the data for the API call
      const variants = Object.entries(variantInventory).map(([variantId, data]) => ({
        variantId,
        inventory: {
          quantity: data.quantity,
          low_stock_threshold: data.low_stock_threshold,
          // Exclude track_inventory as it's not in the API
        }
      }));
      
      return InventoryActions.updateVariantInventories(product.id, { variants });
    },
    onSuccess: () => {
      toast.success("Inventory updated successfully");
      queryClient.invalidateQueries({ queryKey: ["inventory", product.id] });
    },
    onError: (error) => {
      console.error("Error updating inventory:", error);
      toast.error("Failed to update inventory");
    },
  });

  const handleQuantityChange = (variantId: string, value: number) => {
    setVariantInventory(prev => ({
      ...prev,
      [variantId]: {
        ...prev[variantId],
        quantity: value,
      }
    }));
  };

  const handleThresholdChange = (variantId: string, value: number) => {
    setVariantInventory(prev => ({
      ...prev,
      [variantId]: {
        ...prev[variantId],
        low_stock_threshold: value,
      }
    }));
  };

  const handleTrackingChange = (variantId: string, value: boolean) => {
    setVariantInventory(prev => ({
      ...prev,
      [variantId]: {
        ...prev[variantId],
        track_inventory: value,
      }
    }));
  };

  const variants = product.children || [];  // Function to get variant attribute display
  const getVariantAttributes = (variant: Product) => {
    if (!variant.ProductAttribute || variant.ProductAttribute.length === 0) {
      return "-";
    }

    return variant.ProductAttribute
      .map((attr) => {
        if (attr.AttributeValue?.Attribute?.name) {
          return `${attr.AttributeValue.Attribute.name}: ${attr.AttributeValue.value}`;
        }
        return "";
      })
      .filter(Boolean)
      .join(", ");
  };

  // Function to determine stock status
  const getStockStatus = (variantId: string) => {
    const inv = variantInventory[variantId];
    if (!inv) return null;

    if (inv.quantity === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    } else if (inv.quantity < inv.low_stock_threshold) {
      return <Badge variant="warning">Low Stock</Badge>;
    } else {
      return <Badge variant="success">In Stock</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Variant Inventory</CardTitle>
        <CardDescription>
          Manage inventory for all variants of {product.title}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Variant</TableHead>
                <TableHead>Attributes</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Low Stock Threshold</TableHead>
                <TableHead>Track Inventory</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {variants.map((variant) => (
                <TableRow key={variant.id}>
                  <TableCell className="flex items-center gap-2">
                    {variant.images && variant.images.length > 0 ? (
                      <div className="h-8 w-8 relative overflow-hidden rounded">
                        <Image 
                          src={variant.images[0]} 
                          alt={variant.title} 
                          fill
                          sizes="32px"
                          className="object-cover" 
                        />
                      </div>
                    ) : null}
                    <div>
                      <span className="font-medium">{variant.title}</span>
                      {variant.sku && (
                        <div className="text-xs text-muted-foreground">SKU: {variant.sku}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {getVariantAttributes(variant)}
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      value={variantInventory[variant.id]?.quantity || 0}
                      onChange={(e) => handleQuantityChange(variant.id, parseInt(e.target.value) || 0)}
                      className="w-24"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      value={variantInventory[variant.id]?.low_stock_threshold || 5}
                      onChange={(e) => handleThresholdChange(variant.id, parseInt(e.target.value) || 5)}
                      className="w-24"
                    />
                  </TableCell>
                  <TableCell>
                    <Checkbox
                      checked={variantInventory[variant.id]?.track_inventory ?? true}
                      onCheckedChange={(checked) => handleTrackingChange(variant.id, !!checked)}
                    />
                  </TableCell>
                  <TableCell>
                    {getStockStatus(variant.id)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter className="border-t px-6 py-4 flex justify-end">
        <Button onClick={() => updateInventories()} disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Update All Inventory
        </Button>
      </CardFooter>
    </Card>
  );
};
