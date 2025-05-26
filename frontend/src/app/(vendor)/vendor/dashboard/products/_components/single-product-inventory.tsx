"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { InventoryActions } from "@/api-actions/inventory-actions";
import { type InventoryUpdateInput } from "@/schema/inventory-schema";
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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { Product } from "@/types/product";

interface SingleProductInventoryProps {
  product: Product;
  inventory: Inventory | null;
}

// Extended interface that includes UI-only fields
interface ExtendedInventoryForm extends InventoryUpdateInput {
  track_inventory?: boolean;
}

export const SingleProductInventory = ({ product, inventory }: SingleProductInventoryProps) => {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const form = useForm<ExtendedInventoryForm>({
    defaultValues: {
      quantity: inventory?.quantity || 0,
      low_stock_threshold: inventory?.low_stock_threshold || 5,
      track_inventory: true, // Default value
    },
  });

  const { mutate: updateInventory, isPending } = useMutation({
    mutationFn: (data: ExtendedInventoryForm) => {
      // Extract API-compatible fields
      const apiData = {
        quantity: data.quantity,
        low_stock_threshold: data.low_stock_threshold,
        reserved_quantity: data.reserved_quantity,
      };
      
      return InventoryActions.updateProductInventory(product.id, apiData);
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

  const onSubmit = (data: ExtendedInventoryForm) => {
    updateInventory(data);
  };

  const lowStock = inventory && inventory.quantity < inventory.low_stock_threshold;
  const outOfStock = inventory && inventory.quantity === 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory for {product.title}</CardTitle>
        <CardDescription>
          Update stock quantity and tracking settings for this product
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {outOfStock && (
          <Alert variant="destructive" className="mb-4">
            <InfoCircledIcon className="h-4 w-4" />
            <AlertTitle>Out of stock</AlertTitle>
            <AlertDescription>
              This product is currently out of stock. Update the quantity to make it available for purchase.
            </AlertDescription>
          </Alert>
        )}
        
        {lowStock && !outOfStock && (
          <Alert className="mb-4 border-amber-500 bg-amber-50 text-amber-700">
            <InfoCircledIcon className="h-4 w-4" />
            <AlertTitle>Low stock</AlertTitle>
            <AlertDescription>
              This product is running low on stock. Consider restocking soon.
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity in Stock</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        disabled={isPending}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      Current available quantity for sale
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="low_stock_threshold"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Low Stock Threshold</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        disabled={isPending}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      Get notified when stock falls below this amount
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="track_inventory"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) => field.onChange(!!checked)}
                      disabled={isPending}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Track inventory</FormLabel>
                    <FormDescription>
                      If enabled, stock quantities will be automatically updated when orders are placed
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="border-t px-6 py-4 bg-muted/50">
        <p className="text-xs text-muted-foreground">
          For products without variants, inventory is tracked at the product level.
        </p>
      </CardFooter>
    </Card>
  );
};
