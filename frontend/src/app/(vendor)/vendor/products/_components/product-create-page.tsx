"use client";

import { useEffect, useState, useCallback } from "react";
import { flushSync } from "react-dom";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { Checkbox } from "@/components/ui/checkbox";

type FormData = {
  title: string;
  description: string;
  price: number;
  category_id: string;
  is_active: boolean;
  parent_id?: string;
  brand?: string;
  season?: string;
  weight?: number;
  initial_quantity?: number;
  low_stock_threshold?: number;
  attribute_value_ids?: string[]; 
};

export const ProductCreatePage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const duplicateFromId = searchParams.get("duplicate");
  const updateProductId = searchParams.get("update");
  const [parentId] = useQueryState("parent_id", parseAsString);  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  
  const isVariant = !!parentId;
  const isUpdate = !!updateProductId;
    // Handle image changes with proper cleanup
  const handleImageChange = useCallback((files: File[] | File | null) => {
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
      category_id: "",
      is_active: true,
      parent_id: parentId || "",
      brand: "",
      season: "",
      weight: 0,
      initial_quantity: 0,
      low_stock_threshold: 0,
      attribute_value_ids: [],
    },
  });// Fetch categories
  const { data: updateProductData, isLoading: isLoadingUpdate } = useQuery({
    queryKey: ["update-product", updateProductId],
    queryFn: async () => {
      if (!updateProductId) return null;
      return await ProductActions.getProductById(updateProductId, {
        include_attributes: true,
        include_category: true,
      });
    },
    enabled: !!updateProductId && mounted,
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
        include_category: true,
      });
    },
    enabled: !!parentId && mounted,
  });

  // Fetch category attributes when category is selected
  const { data: categoryAttributesData, isLoading: isLoadingAttributes } = useQuery({
    queryKey: ["category-attributes", selectedCategoryId],
    queryFn: async () => {
      if (!selectedCategoryId) return null;
      return await CategoryActions.getCategoryById(selectedCategoryId, false, true);
    },
    enabled: !!selectedCategoryId && mounted,
  });// Create/Update product mutation
  const { mutate: createProduct, isPending } = useMutation({
    mutationFn: (data: FormData) => {
      if (isUpdate && updateProductId) {
        return ProductActions.updateProduct(updateProductId, {
          ...data,
          images: selectedImages,
        });
      } else {
        return ProductActions.createProduct({
          ...data,
          images: selectedImages,
        });
      }
    },     
    onSuccess: (data) => {
      queryClient.invalidateQueries()
        
      if (isUpdate) {
        toast.success("Product updated successfully");
        router.push(`/vendor/products/${updateProductId}`);
      } else if (isVariant) {
        toast.success("Product variant created successfully");
        // Navigate back to parent product
        router.push(`/vendor/products/${parentId}`);
      } else {
        toast.success("Product created successfully");
        // Navigate to the newly created product
        if (data?.data?.id) {
          router.push(`/vendor/products/${data.data.id}`);
        }
      }
    },
    onError: (error) => {
      toast.error(isUpdate ? "Failed to update product" : "Failed to create product");
    },
  });  // Pre-fill form with product data for updating
  useEffect(() => {
    if (updateProductData?.data && !isPending) {
      const updateProduct = updateProductData.data;
      form.reset({
        title: updateProduct.title || "",
        description: updateProduct.description || "",
        price: updateProduct.price || 0,
        category_id: updateProduct.category?.id || "",
        is_active: updateProduct.is_active ?? true,
        parent_id: updateProduct.parent_id || "",
        brand: updateProduct.brand || "",
        season: updateProduct.season || "",
        weight: updateProduct.weight || 0,
        initial_quantity: updateProduct.inventory?.quantity || 0,
        low_stock_threshold: updateProduct.inventory?.low_stock_threshold || 0,
        attribute_value_ids: updateProduct.attributes?.map(attr => attr.id) || [],
      });

      // Set selected category for attributes
      if (updateProduct.category?.id) {
        setSelectedCategoryId(updateProduct.category.id);
      }

      // Set existing images if available
      if (updateProduct.images && updateProduct.images.length > 0) {
        setImagePreviews(updateProduct.images);
        // Note: For existing images, we don't set selectedImages as they're already uploaded
      }
    }
  }, [updateProductData, form, isPending]);  // Pre-fill form with source product data for duplication
  useEffect(() => {
    if (sourceProductData?.data && !isPending) {
      const sourceProduct = sourceProductData.data;
      form.reset({
        title: `Copy of ${sourceProduct.title}`,
        description: sourceProduct.description || "",
        price: sourceProduct.price || 0,
        category_id: sourceProduct.category?.id || "",
        is_active: sourceProduct.is_active ?? true,
        brand: sourceProduct.brand || "",
        season: sourceProduct.season || "",
        weight: sourceProduct.weight || 0,
        initial_quantity: sourceProduct.inventory?.quantity || 0,
        low_stock_threshold: sourceProduct.inventory?.low_stock_threshold || 0,
        attribute_value_ids: [],
      });

      // Set selected category for attributes
      if (sourceProduct.category?.id) {
        setSelectedCategoryId(sourceProduct.category.id);
      }
    }
  }, [sourceProductData, form, isPending]);  // Pre-fill form with parent product data for variant creation
  useEffect(() => {
    if (parentProductData?.data && !isPending) {
      const parentProduct = parentProductData.data;
      console.log("Parent Product Data:", parentProduct);
      form.reset({
        title: (parentProduct.title || "") + " Variant",
        description: parentProduct.description || "",
        price: parentProduct.price || 0,
        category_id: parentProduct.category?.id || "",
        is_active: true,
        parent_id: parentId || "",
        brand: parentProduct.brand || "",
        season: parentProduct.season || "",
        weight: parentProduct.weight || 0,
        initial_quantity: parentProduct.inventory?.quantity || 0,
        low_stock_threshold: parentProduct.inventory?.low_stock_threshold || 0,        // For variants, pre-populate with parent's attribute values for easy modification
        attribute_value_ids: parentProduct.attributes?.map(attr => attr.id) || [],
      });

      // Set selected category for attributes
      if (parentProduct.category?.id) {
        setSelectedCategoryId(parentProduct.category.id);
      }
    }
  }, [parentProductData, form, isPending, parentId]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const onSubmit = (data: FormData) => {
    createProduct(data);
  };

  const parentProduct = parentProductData?.data;


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
        </Button>          <PageHeader
          title={
            isUpdate
              ? `Update Product`
              : isVariant 
                ? `Create Variant for ${parentProduct?.title || "Product"}` 
                : duplicateFromId 
                  ? "Duplicate Product" 
                  : "Create New Product"
          }
          description={
            isUpdate
              ? "Update product information and settings"
              : isVariant
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
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input
                            disabled={isPending || isLoadingSource || isLoadingUpdate || isLoadingParent}
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
                    name="brand"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            disabled={isPending || isLoadingSource || isLoadingUpdate || isLoadingParent}
                            placeholder="Brand name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          disabled={isPending || isLoadingSource || isLoadingUpdate || isLoadingParent}
                          placeholder="Product description"
                          className="resize-none min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <FormField
                    control={form.control}
                    name="season"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Season (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            disabled={isPending || isLoadingSource || isLoadingUpdate || isLoadingParent}
                            placeholder="e.g., Summer, Winter, All Season"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />                  <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weight (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            disabled={isPending || isLoadingSource || isLoadingUpdate || isLoadingParent}
                            placeholder="Weight in grams"
                            value={field.value || ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === '') {
                                field.onChange(0);
                              } else {
                                const numValue = parseFloat(value);
                                field.onChange(isNaN(numValue) ? 0 : numValue);
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>                {/* Category Selection - Full width on its own row */}
                {!isUpdate && !isVariant && !duplicateFromId && (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="category_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <FormControl>
                            <HierarchicalCategorySelect
                              value={field.value}
                              onChange={(categoryId) => {
                                field.onChange(categoryId || "");
                                setSelectedCategoryId(categoryId || "");
                              }}
                              disabled={isPending || isLoadingSource || isLoadingUpdate || isLoadingParent}
                              placeholder="Select a category"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Price and Status - 2 column layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            disabled={isPending || isLoadingSource || isLoadingUpdate || isLoadingParent}
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value;
                              // Allow empty string for deletion, otherwise parse the number
                              if (value === '') {
                                field.onChange(0);
                              } else {
                                const numValue = parseFloat(value);
                                field.onChange(isNaN(numValue) ? 0 : numValue);
                              }
                            }}
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
                            disabled={isPending || isLoadingSource || isLoadingUpdate || isLoadingParent}
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
                  </div>                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <FormField
                    control={form.control}
                    name="initial_quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Initial Quantity (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            disabled={isPending || isLoadingSource || isLoadingUpdate || isLoadingParent}
                            placeholder="Initial inventory quantity"
                            value={field.value || ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === '') {
                                field.onChange(0);
                              } else {
                                const numValue = parseInt(value);
                                field.onChange(isNaN(numValue) ? 0 : numValue);
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="low_stock_threshold"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Low Stock Threshold (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            disabled={isPending || isLoadingSource || isLoadingUpdate || isLoadingParent}
                            placeholder="Threshold for low stock alerts"
                            value={field.value || ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === '') {
                                field.onChange(0);
                              } else {
                                const numValue = parseInt(value);
                                field.onChange(isNaN(numValue) ? 0 : numValue);
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />                </div>

                {/* Category Attributes */}
                {selectedCategoryId && categoryAttributesData?.data?.attributes && (
                  <div className="space-y-4">
                    <div>
                      <FormLabel className="text-base font-semibold">Product Attributes</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Select attribute values for this product category
                      </p>
                    </div>
                    {isLoadingAttributes ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Loading attributes...</span>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {categoryAttributesData.data.attributes.map((categoryAttribute: any) => (
                          <FormField
                            key={categoryAttribute.attribute.id}
                            control={form.control}
                            name="attribute_value_ids"
                            render={({ field }) => (
                              <FormItem>
                                <div className="mb-4">
                                  <FormLabel className="text-base">
                                    {categoryAttribute.attribute.name}
                                    {categoryAttribute.required && (
                                      <span className="text-red-500 ml-1">*</span>
                                    )}
                                  </FormLabel>
                                  {categoryAttribute.attribute.description && (
                                    <p className="text-sm text-muted-foreground">
                                      {categoryAttribute.attribute.description}
                                    </p>
                                  )}
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                  {categoryAttribute.attribute.values.map((value: any) => (
                                    <div key={value.id} className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`attr-${value.id}`}
                                        checked={field.value?.includes(value.id) || false}
                                        onCheckedChange={(checked) => {
                                          if (checked) {
                                            field.onChange([...(field.value || []), value.id]);
                                          } else {
                                            field.onChange(
                                              field.value?.filter((id) => id !== value.id) || []
                                            );
                                          }
                                        }}
                                        disabled={isPending || isLoadingSource || isLoadingUpdate || isLoadingParent}
                                      />
                                      <label
                                        htmlFor={`attr-${value.id}`}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                      >
                                        {value.display_value}
                                      </label>
                                    </div>
                                  ))}
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

              <div>
                <FormLabel>Images</FormLabel>                    
                <CustomImageUpload
                      value={imagePreviews}
                      disabled={isPending || isLoadingSource || isLoadingUpdate || isLoadingParent}
                      multiple={true}
                      onChange={handleImageChange}
                    />
                </div>

                <div className="flex justify-end gap-2">                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    disabled={isPending || isLoadingSource || isLoadingUpdate || isLoadingParent}
                    onClick={() => router.back()}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isPending || isLoadingSource || isLoadingParent || isLoadingUpdate}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isUpdate 
                      ? "Update Product" 
                      : isVariant 
                        ? "Create Variant" 
                        : duplicateFromId 
                          ? "Create Duplicate" 
                          : "Create Product"}
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
