"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Trash } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

import { ProductActions } from "@/api-actions/product-actions";
import { CategoryActions } from "@/api-actions/categories-actions";
import { productUpdateSchema } from "@/schema/product-schema";
import { AlertModal } from "@/components/common/alert-modal";
import { HierarchicalCategorySelect } from "@/components/common/hierarchical-category-select";
import { PageHeader } from "@/components/common/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductAttributesForm } from "./product-attributes-form";
import { ProductVariantsList } from "./product-variants-list";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import CustomImageUpload from "@/components/common/custom-image-upload";
import { Product, ProductCreateInput } from "@/types/product";

interface ProductFormProps {
  initialData?: Product;
}

type FormData = Zod.infer<typeof productUpdateSchema>;

export const ProductForm = ({ initialData }: ProductFormProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  
  // Get product ID from query parameter
  const productId = searchParams.get("update");
  
  // Fetch product data if in update mode
  const { data: productData } = useQuery({
    queryKey: ["product", productId],
    queryFn: async () => {
      if (!productId) return null;
      return await ProductActions.getProductById(productId);
    },
    enabled: !!productId,
  });
  
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
      title: productData?.data?.title || "",
      description: productData?.data?.description || "",
      price: productData?.data?.price || 0,
      sku: productData?.data?.sku || "",
      category_id: productData?.data?.category?.id || "",
      is_active: productData?.data?.is_active ?? true,
    },
  });

  // Update form when product data is loaded
  useEffect(() => {
    if (productData?.data) {
      form.reset({
        title: productData.data.title,
        description: productData.data.description || "",
        price: productData.data.price,
        sku: productData.data.sku || "",
        category_id: productData.data.category?.id,
        is_active: productData.data.is_active,
      });
      setImagePreviews(productData.data.images || []);
      setExistingImages(productData.data.images || []);
    }
  }, [productData, form]);

  const { mutate: updateProduct, isPending: isUpdating } = useMutation({
    mutationFn: (data: FormData & { images?: File[] }) => {
      if (productId) {
        return ProductActions.updateProduct(productId, data);
      } else {
        // Ensure required fields are present for create
        const createData: ProductCreateInput = {
          title: data.title || "",
          description: data.description || "",
          price: data.price || 0,
          category_id: data.category_id || "",
          images: data.images as File[],
          is_active: data.is_active ?? true,
          sku: data.sku,
          slug: data.slug,
          brand: data.brand,
          season: data.season,
          weight: data.weight,
          parent_id: data.parent_id,
          initial_quantity: data.initial_quantity,
          low_stock_threshold: data.low_stock_threshold,
          attribute_value_ids: data.attribute_value_ids,
        };
        return ProductActions.createProduct(createData);
      }
    },
    onSuccess: (response) => {
      toast.success(productId ? "Product updated successfully" : "Product created successfully");
      if (productId) {
        queryClient.invalidateQueries({ queryKey: ["product", productId] });
      }
      queryClient.invalidateQueries({ queryKey: ["vendor-products"] });
      if (!productId && response?.data?.id) {
        router.push(`/vendor/dashboard/products/new?update=${response.data.id}`);
      }
      router.refresh();
    },
    onError: (error) => {
      console.error("Error saving product:", error);
      toast.error(productId ? "Failed to update product" : "Failed to create product");
    },
  });

  const { mutate: deleteProduct, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => ProductActions.deleteProduct(id),
    onSuccess: () => {
      toast.success("Product deleted successfully");
      router.push("/vendor/dashboard/products");
    },
    onError: (error) => {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
      setLoading(false);
    },
  });

  const onSubmit = (data: FormData) => {
    updateProduct(data);
  };

  const onDelete = async () => {
    if (!productId) return;
    setLoading(true);
    try {
      await deleteProduct(productId);
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const handleImageChange = (files: File[] | File | string[] | null) => {
    if (!files) return;
    
    if (Array.isArray(files)) {
      if (files.length === 0) return;
      
      // Handle string array (reordering)
      if (typeof files[0] === 'string') {
        const stringArray = files as string[];
        setImagePreviews(stringArray);
        if (productId) {
          // Update backend with new order
          ProductActions.updateProduct(productId, {
            images: stringArray,
          }).then((result) => {
            if (result.data) {
              toast.success("Image order updated successfully");
              queryClient.invalidateQueries({ queryKey: ["product", productId] });
              setExistingImages(stringArray);
            } else {
              toast.error("Failed to update image order");
              // Revert on failure
              setImagePreviews([...existingImages, ...selectedImages.map(file => URL.createObjectURL(file))]);
            }
          }).catch((error) => {
            console.error("Error updating image order:", error);
            toast.error("Failed to update image order");
            // Revert on error
            setImagePreviews([...existingImages, ...selectedImages.map(file => URL.createObjectURL(file))]);
          });
        } else {
          setExistingImages(stringArray);
        }
        return;
      }
      
      // Handle File array (new uploads)
      const fileArray = files as File[];
      const newPreviews = fileArray.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
      setSelectedImages(fileArray);
      
      if (productId) {
        // Update backend with new images
        ProductActions.updateProduct(productId, {
          images: [...existingImages, ...newPreviews],
        }).then((result) => {
          if (result.data) {
            toast.success("Images updated successfully");
            queryClient.invalidateQueries({ queryKey: ["product", productId] });
            setExistingImages([...existingImages, ...newPreviews]);
          } else {
            toast.error("Failed to update images");
            // Revert on failure
            setImagePreviews(existingImages);
          }
        }).catch((error) => {
          console.error("Error updating images:", error);
          toast.error("Failed to update images");
          // Revert on error
          setImagePreviews(existingImages);
        });
      } else {
        // For new products, just update the previews
        setExistingImages([...existingImages, ...newPreviews]);
      }
    } else {
      // Handle single File
      const file = files as File;
      const preview = URL.createObjectURL(file);
      setImagePreviews([preview]);
      setSelectedImages([file]);
      
      if (productId) {
        // Update backend with new image
        ProductActions.updateProduct(productId, {
          images: [preview],
        }).then((result) => {
          if (result.data) {
            toast.success("Image updated successfully");
            queryClient.invalidateQueries({ queryKey: ["product", productId] });
            setExistingImages([preview]);
          } else {
            toast.error("Failed to update image");
            // Revert on failure
            setImagePreviews(existingImages);
          }
        }).catch((error) => {
          console.error("Error updating image:", error);
          toast.error("Failed to update image");
          // Revert on error
          setImagePreviews(existingImages);
        });
      } else {
        // For new products, just update the previews
        setExistingImages([preview]);
      }
    }
  };

  // Cleanup object URLs when component unmounts or previews change
  useEffect(() => {
    return () => {
      selectedImages.forEach(file => {
        URL.revokeObjectURL(URL.createObjectURL(file));
      });
    };
  }, [selectedImages]);

  return (
    <>
      {productId && (
        <AlertModal
          isOpen={open}
          onClose={() => setOpen(false)}
          onConfirm={onDelete}
          loading={loading}
          title="Delete Product"
          description="Are you sure you want to delete this product? This action cannot be undone."
        />
      )}
      <div className="flex items-center justify-between">
        <PageHeader
          title={productId ? "Edit Product" : "Create Product"}
          description={productData?.data?.title || "Add a new product to your store"}
        />
        {productId && (
          <Button
            disabled={loading}
            variant="destructive"
            size="sm"
            onClick={() => setOpen(true)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Separator />
      
      <Tabs defaultValue="general" className="mt-6" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="attributes">Attributes</TabsTrigger>
          {productData?.data?.product_type === "PARENT" && (
            <TabsTrigger value="variants">Variants</TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="general" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                {productId ? "Update your product details" : "Add your product details"}
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                              disabled={isUpdating}
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
                          <FormLabel>SKU</FormLabel>
                          <FormControl>
                            <Input
                              disabled={isUpdating}
                              placeholder="Stock keeping unit"
                              {...field}
                              value={field.value || ""}
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
                            disabled={isUpdating}
                            placeholder="Product description"
                            className="resize-none min-h-[120px]"
                            {...field}
                            value={field.value || ""}
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
                              disabled={isUpdating}
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
                      name="category_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <FormControl>
                            <HierarchicalCategorySelect
                              value={field.value || ""}
                              onChange={(categoryId) => field.onChange(categoryId || "")}
                              disabled={isUpdating || !!productId}
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
                              disabled={isUpdating}
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
                  </div>

                  <Button
                    type="submit"
                    disabled={isUpdating}
                    className="w-full"
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {productId ? "Updating..." : "Creating..."}
                      </>
                    ) : (
                      productId ? "Update Product" : "Create Product"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="images" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
              <CardDescription>
                Add and manage product images
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Upload images for your product. The first image will be used as the featured image.
                </p>
                <CustomImageUpload
                  value={imagePreviews}
                  disabled={loading}
                  multiple={true}
                  onChange={handleImageChange}
                  onReorder={(newOrder) => {
                    setImagePreviews(newOrder);
                    if (productId) {
                      // Update backend with new order
                      ProductActions.updateProduct(productId, {
                        images: newOrder,
                      }).then((result) => {
                        if (result.data) {
                          toast.success("Image order updated successfully");
                          queryClient.invalidateQueries({ queryKey: ["product", productId] });
                          setExistingImages(newOrder);
                        } else {
                          toast.error("Failed to update image order");
                          // Revert on failure
                          setImagePreviews([...existingImages, ...selectedImages.map(file => URL.createObjectURL(file))]);
                        }
                      }).catch((error) => {
                        console.error("Error updating image order:", error);
                        toast.error("Failed to update image order");
                        // Revert on error
                        setImagePreviews([...existingImages, ...selectedImages.map(file => URL.createObjectURL(file))]);
                      });
                    } else {
                      setExistingImages(newOrder);
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {productId && productData?.data && (
          <>
            <TabsContent value="attributes" className="space-y-4 pt-4">
              <ProductAttributesForm product={productData.data} />
            </TabsContent>
            
            {productData.data.product_type === "PARENT" && (
              <TabsContent value="variants" className="space-y-4 pt-4">
                <ProductVariantsList productId={productId} />
              </TabsContent>
            )}
          </>
        )}
      </Tabs>
    </>
  );
};
