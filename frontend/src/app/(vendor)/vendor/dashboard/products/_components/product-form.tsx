"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
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
import ImageUpload from "@/components/ui/image-upload";
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

type Category = {
  id: string;
  name: string;
};

interface ProductFormProps {
  initialData: Product;
}

type FormData = Zod.infer<typeof productUpdateSchema>;

export const ProductForm = ({ initialData }: ProductFormProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(
    initialData.images?.[0] || ""
  );
  
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
      title: initialData.title,
      description: initialData.description || "",
      price: initialData.price,
      sku: initialData.sku || "",
      category_id: initialData.category_id || "",
      is_active: initialData.is_active,
    },
  });

  const { mutate: updateProduct, isPending } = useMutation({
    mutationFn: (data: FormData & { images?: File[] }) => {
      return ProductActions.updateProduct(initialData.id, data);
    },
    onSuccess: () => {
      toast.success("Product updated successfully");
      queryClient.invalidateQueries({ queryKey: ["product", initialData.id] });
      queryClient.invalidateQueries({ queryKey: ["vendor-products"] });
      router.refresh();
    },
    onError: (error) => {
      console.error("Error updating product:", error);
      toast.error("Failed to update product");
    },
  });

  const { mutate: deleteProduct } = useMutation({
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
    setLoading(true);
    try {
      await deleteProduct(initialData.id);
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      setLoading(false);
    }
  };
  const handleImageChange = async (file: File | null) => {
    if (!file) return;
    
    try {
      setLoading(true);
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      
      const result = await ProductActions.updateProduct(initialData.id, {
        images: [file],
      });
      
      if (result.data) {
        toast.success("Image updated successfully");
        queryClient.invalidateQueries({ queryKey: ["product", initialData.id] });
      } else {
        toast.error("Failed to update image");
      }
    } catch (error) {
      console.error("Error updating image:", error);
      toast.error("Failed to update image");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
        title="Delete Product"
        description="Are you sure you want to delete this product? This action cannot be undone."
      />
      <div className="flex items-center justify-between">
        <PageHeader
          title="Edit Product"
          description={initialData.title}
        />
        <Button
          disabled={loading}
          variant="destructive"
          size="sm"
          onClick={() => setOpen(true)}
        >
          <Trash className="h-4 w-4" />
        </Button>
      </div>
      <Separator />
      
      <Tabs defaultValue="general" className="mt-6" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="attributes">Attributes</TabsTrigger>
          {initialData.product_type === "PARENT" && (
            <TabsTrigger value="variants">Variants</TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="general" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Update your product details
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
                      name="sku"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SKU</FormLabel>
                          <FormControl>
                            <Input
                              disabled={isPending}
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
                            disabled={isPending}
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
                              disabled={isPending}
                              placeholder="0.00"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />                    <FormField
                      control={form.control}
                      name="category_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <FormControl>
                            <HierarchicalCategorySelect
                              value={field.value || ""}
                              onChange={(categoryId) => field.onChange(categoryId || "")}
                              disabled={isPending}
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
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      className="ml-auto"
                      disabled={isPending}
                    >
                      {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Changes
                    </Button>
                  </div>
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
                </p>                <ImageUpload
                  value={imagePreview}
                  disabled={loading}
                  onChange={handleImageChange}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="attributes" className="space-y-4 pt-4">
          <ProductAttributesForm product={initialData} />
        </TabsContent>
        
        <TabsContent value="variants" className="space-y-4 pt-4">
          <ProductVariantsList productId={initialData.id} />
        </TabsContent>
      </Tabs>
    </>
  );
};
