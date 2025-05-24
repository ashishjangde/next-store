"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import ImageUpload from "@/components/ui/image-upload";
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
import { PageHeader } from "@/components/common/page-header";
import { Card, CardContent } from "@/components/ui/card";

import { ProductActions } from "@/api-actions/product-actions";
import { CategoryActions } from "@/api-actions/categories-actions";
import { ArrowLeft, Loader2 } from "lucide-react";
import { HierarchicalCategorySelect } from "@/components/common/hierarchical-category-select";

type Category = {
  id: string;
  name: string;
};

type FormData = {
  title: string;
  description: string;
  price: number;
  sku?: string;
  category_id: string;
  is_active: boolean;
};

export const ProductCreatePage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const duplicateFromId = searchParams.get("duplicate");
  
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [mounted, setMounted] = useState(false);
  
  const form = useForm<FormData>({
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      sku: "",
      category_id: "",
      is_active: true,
    },
  });  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      return await CategoryActions.getRootCategories();
    },
    staleTime: 60000, // 1 minute
  });

  // If duplicating, fetch source product data
  const { data: sourceProductData, isLoading: isLoadingSource } = useQuery({
    queryKey: ["source-product", duplicateFromId],
    queryFn: async () => {
      if (!duplicateFromId) return null;
      return await ProductActions.getProductById(duplicateFromId);
    },
    enabled: !!duplicateFromId && mounted,
  });
  // Create product mutation
  const { mutate: createProduct, isPending } = useMutation({
    mutationFn: (data: FormData) => {
      return ProductActions.createProduct({
        ...data,
        images: selectedImage ? [selectedImage] : [],
      });
    },
    onSuccess: (data) => {
      toast.success("Product created successfully");
      // Navigate to the newly created product
      if (data?.data?.id) {
        router.push(`/vendor/dashboard/products/${data.data.id}`);
      }
    },
    onError: (error) => {
      console.error("Error creating product:", error);
      toast.error("Failed to create product");
    },
  });
  // Pre-fill form with source product data for duplication
  useEffect(() => {
    if (sourceProductData?.data && !isPending) {
      const sourceProduct = sourceProductData.data;
      form.reset({
        title: `Copy of ${sourceProduct.title}`,
        description: sourceProduct.description || "",
        price: sourceProduct.price,
        sku: `${sourceProduct.sku || ""}-COPY`,
        category_id: sourceProduct.category_id || "",
        is_active: sourceProduct.is_active,
      });
    }
  }, [sourceProductData, form, isPending]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const onSubmit = (data: FormData) => {
    createProduct(data);
  };

  const categories: Category[] = categoriesData?.data || [];

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
          title={duplicateFromId ? "Duplicate Product" : "Create New Product"}
          description={duplicateFromId ? "Create a new product based on an existing one" : "Add a new product to your catalog"}
        />
        <Separator />
        
        <Card>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input
                            disabled={isPending || isLoadingSource}
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
                    name="sku"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SKU (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            disabled={isPending || isLoadingSource}
                            placeholder="Stock keeping unit"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          disabled={isPending || isLoadingSource}
                          placeholder="Product description"
                          className="resize-none min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            disabled={isPending || isLoadingSource}
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />                  <FormField
                    control={form.control}
                    name="category_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <HierarchicalCategorySelect
                            value={field.value}
                            onChange={(categoryId) => field.onChange(categoryId || "")}
                            disabled={isPending || isLoadingSource}
                            placeholder="Select a category"
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
                            disabled={isPending || isLoadingSource}
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
                  />
                </div>                <div>
                  <FormLabel>Images</FormLabel>
                  <ImageUpload
                    value={imagePreview}
                    disabled={isPending || isLoadingSource}
                    onChange={(file) => {
                      setSelectedImage(file);
                      if (file) {
                        const url = URL.createObjectURL(file);
                        setImagePreview(url);
                      } else {
                        setImagePreview("");
                      }
                    }}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    disabled={isPending || isLoadingSource}
                    onClick={() => router.back()}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isPending || isLoadingSource}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {duplicateFromId ? "Create Duplicate" : "Create Product"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
