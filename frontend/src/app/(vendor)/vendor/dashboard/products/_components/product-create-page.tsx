"use client";

import { useEffect, useState, useCallback } from "react";
import { flushSync } from "react-dom";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { parseAsString, useQueryState } from "nuqs";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

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
import CustomImageUpload from "@/components/common/custom-image-upload";


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
  parent_id?: string; // Add parent_id for variants
  attribute_value_ids?: string[]; // Add attribute values for variants
};

export const ProductCreatePage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const duplicateFromId = searchParams.get("duplicate");
    // Use nuqs for parent_id query parameter
  const [parentId] = useQueryState("parent_id", parseAsString);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  
  const isVariant = !!parentId;
    // Handle image changes with proper cleanup
  const handleImageChange = useCallback((files: File[] | File | null) => {
    // Use flushSync for React 19 compatibility
    flushSync(() => {
      if (Array.isArray(files)) {
        setSelectedImages(files);
        // Don't create new object URLs here - let ImageUpload handle them
        const urls = files.map(file => URL.createObjectURL(file));
        setImagePreviews(urls);
      } else if (files) {
        setSelectedImages([files]);
        setImagePreviews([URL.createObjectURL(files)]);
      } else {
        setSelectedImages([]);
        setImagePreviews([]);
      }
    });
  }, []);
  
  const form = useForm<FormData>({
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      sku: "",
      category_id: "",
      is_active: true,
      parent_id: parentId || undefined,
      attribute_value_ids: [],
    },
  });// Fetch categories
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

  // If creating a variant, fetch parent product data
  const { data: parentProductData, isLoading: isLoadingParent } = useQuery({
    queryKey: ["parent-product", parentId],
    queryFn: async () => {
      if (!parentId) return null;
      return await ProductActions.getProductById(parentId, {
        include_attributes: true,
      });
    },
    enabled: !!parentId && mounted,
  });  // Create product mutation
  const { mutate: createProduct, isPending } = useMutation({
    mutationFn: (data: FormData) => {
      return ProductActions.createProduct({
        ...data,
        images: selectedImages,
      });
    },
    onSuccess: (data) => {
      if (isVariant) {
        toast.success("Product variant created successfully");
        // Navigate back to parent product
        router.push(`/vendor/dashboard/products/${parentId}`);
      } else {
        toast.success("Product created successfully");
        // Navigate to the newly created product
        if (data?.data?.id) {
          router.push(`/vendor/dashboard/products/${data.data.id}`);
        }
      }
    },
    onError: (error) => {
      console.error("Error creating product:", error);
      toast.error("Failed to create product");
    },
  });  // Pre-fill form with source product data for duplication
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

  // Pre-fill form with parent product data for variant creation
  useEffect(() => {
    if (parentProductData?.data && !isPending) {
      const parentProduct = parentProductData.data;
      form.reset({
        title: "",
        description: "",
        price: parentProduct.price,
        sku: "",
        category_id: parentProduct.category_id || "",
        is_active: true,
        parent_id: parentId || undefined,
        attribute_value_ids: [],
      });
    }
  }, [parentProductData, form, isPending, parentId]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const onSubmit = (data: FormData) => {
    createProduct(data);
  };

  const categories: Category[] = categoriesData?.data || [];
  const parentProduct = parentProductData?.data;
  const availableAttributes = parentProduct?.attributes || [];

  // Group attributes by name for variant selection
  const attributeGroups = availableAttributes.reduce((groups, attr) => {
    if (!groups[attr.name]) {
      groups[attr.name] = [];
    }
    groups[attr.name].push(attr);
    return groups;
  }, {} as Record<string, typeof availableAttributes>);

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
          title={
            isVariant 
              ? `Create Variant for ${parentProduct?.title || "Product"}` 
              : duplicateFromId 
                ? "Duplicate Product" 
                : "Create New Product"
          }
          description={
            isVariant
              ? "Create a new variant with different attribute values"
              : duplicateFromId 
                ? "Create a new product based on an existing one" 
                : "Add a new product to your catalog"
          }
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
                    )}                  />
                </div>

                {/* Attribute Selection for Variants */}
                {isVariant && Object.keys(attributeGroups).length > 0 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium">Product Attributes</h3>
                      <p className="text-sm text-muted-foreground">
                        Select attribute values for this variant
                      </p>
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="attribute_value_ids"
                      render={({ field }) => (
                        <div className="space-y-4">
                          {Object.entries(attributeGroups).map(([attributeName, attributes]) => (
                            <div key={attributeName} className="space-y-2">
                              <FormLabel>{attributeName}</FormLabel>
                              <div className="flex flex-wrap gap-2">
                                {attributes.map((attr) => (
                                  <div key={attr.id} className="flex items-center space-x-2">
                                    <input
                                      type="checkbox"
                                      id={attr.id}
                                      checked={field.value?.includes(attr.id) || false}
                                      onChange={(e) => {
                                        const currentValues = field.value || [];
                                        if (e.target.checked) {
                                          // Add the attribute value ID
                                          field.onChange([...currentValues, attr.id]);
                                        } else {
                                          // Remove the attribute value ID
                                          field.onChange(currentValues.filter(id => id !== attr.id));
                                        }
                                      }}
                                      className="rounded border-gray-300"
                                    />
                                    <label htmlFor={attr.id} className="text-sm">
                                      {attr.display_value || attr.value}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    />
                  </div>
                )} 
              <div>
                  <FormLabel>Images</FormLabel>
                    <CustomImageUpload
                      value={imagePreviews}
                      disabled={isPending || isLoadingSource}
                      multiple={true}
                      onChange={handleImageChange}
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
                  </Button>                  <Button type="submit" disabled={isPending || isLoadingSource || isLoadingParent}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isVariant ? "Create Variant" : duplicateFromId ? "Create Duplicate" : "Create Product"}
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
