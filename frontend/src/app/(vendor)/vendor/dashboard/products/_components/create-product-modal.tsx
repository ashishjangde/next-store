"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CategoryActions } from "@/api-actions/categories-actions";
import { ProductActions } from "@/api-actions/product-actions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import ImageUpload from "@/components/ui/image-upload";
import { HierarchicalCategorySelect } from "@/components/common/hierarchical-category-select";

interface CreateProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

type FormData = {
  title: string;
  description: string;
  price: number;
  sku?: string;
  category_id: string;
  is_active: boolean;
};

export const CreateProductModal = ({
  open,
  onOpenChange,
  onSuccess,
}: CreateProductModalProps) => {
  const queryClient = useQueryClient();
  const [images, setImages] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string>("");

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      return await CategoryActions.getRootCategories();
    },
    staleTime: 60000, // 1 minute
  });

  const categories = categoriesData?.data || [];
  const form = useForm<FormData>({
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      sku: "",
      category_id: "",
      is_active: true,
    },
  });

  const { mutate: createProduct, isPending } = useMutation({
    mutationFn: (data: FormData & { images?: File[] }) => {
      return ProductActions.createProduct({
        ...data,
        images: images,
      });
    },    onSuccess: () => {
      toast.success("Product created successfully");
      form.reset();
      setImages([]);
      setImagePreview("");
      queryClient.invalidateQueries({ queryKey: ["vendor-products"] });
      onSuccess?.();
    },
    onError: (error) => {
      console.error("Error creating product:", error);
      toast.error("Failed to create product");
    },
  });

  const onSubmit = (data: FormData) => {
    createProduct({
      ...data,
      images,
    });
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2 pb-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isPending}
                        placeholder="Product name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        disabled={isPending}
                        placeholder="Product description"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          disabled={isPending}
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>SKU (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          disabled={isPending}
                          placeholder="SKU123"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <FormControl>
                      <HierarchicalCategorySelect
                        value={field.value}
                        onChange={(categoryId) => {
                          // Only update if we have a valid category ID (Level 2 selection)
                          if (categoryId) {
                            field.onChange(categoryId);
                          }
                          // Don't clear the field for intermediate selections (null)
                        }}
                        disabled={isPending}
                        placeholder="Select a category"
                        error={form.formState.errors.category_id?.message}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <Select
                        disabled={isPending}
                        value={field.value ? "true" : "false"}
                        onValueChange={(value) => field.onChange(value === "true")}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Active</SelectItem>
                          <SelectItem value="false">Draft</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />              <div>
                <FormLabel>Images</FormLabel>
                <ImageUpload
                  value={imagePreview}
                  disabled={isPending}
                  onChange={(file) => {
                    if (file) {
                      setImages([file]);
                      setImagePreview(URL.createObjectURL(file));
                    } else {
                      setImages([]);
                      setImagePreview("");
                    }
                  }}
                />
              </div>

              <div className="pt-6 space-x-2 flex items-center justify-end w-full">
                <Button
                  type="button"
                  disabled={isPending}
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Product
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
