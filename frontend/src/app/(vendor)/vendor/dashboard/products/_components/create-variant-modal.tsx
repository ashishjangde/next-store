"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ProductActions } from "@/api-actions/product-actions";
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
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import CustomImageUpload from "@/components/common/custom-image-upload";


interface CreateVariantModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentProductId: string;
  onSuccess?: () => void;
}

type FormData = {
  title: string;
  description: string;
  price: number;
  sku?: string;
  category_id: string;
  parent_id: string;
  is_active: boolean;
  attribute_value_ids: string[];
};

export const CreateVariantModal = ({
  open,
  onOpenChange,
  parentProductId,
  onSuccess,
}: CreateVariantModalProps) => {
  const queryClient = useQueryClient();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  // Fetch parent product to get available attributes
  const { data: parentProductData } = useQuery({
    queryKey: ["product-for-variant", parentProductId],
    queryFn: () => ProductActions.getProductById(
      parentProductId,
      { include_attributes: true }
    ),
  enabled: open,
  });

  const parentProduct = parentProductData?.data;
  const availableAttributes = parentProduct?.attributes || [];

  const form = useForm<FormData>({
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      sku: "",
      category_id: parentProduct?.category_id || "",
      parent_id: parentProductId,
      is_active: true,
      attribute_value_ids: [],
    },
  });  const { mutate: createVariant, isPending } = useMutation({
    mutationFn: (data: FormData) => {
      return ProductActions.createProduct({
        ...data,
        images: selectedImage ? [selectedImage] : [],
      });
    },
    onSuccess: () => {
      toast.success("Variant created successfully");
      form.reset();
      setSelectedImage(null);
      setImagePreview("");
      queryClient.invalidateQueries({ queryKey: ["product-variants", parentProductId] });
      onSuccess?.();
    },
    onError: (error) => {
      console.error("Error creating variant:", error);
      toast.error("Failed to create variant");
    },
  });

  const onSubmit = (data: FormData) => {
    if (!data.attribute_value_ids.length) {
      toast.error("You must select at least one attribute for the variant");
      return;
    }

    createVariant(data);
  };  // Group attributes by attribute name
  const groupedAttributes: Record<string, { attribute_id: string; values: any[] }> = {};

  availableAttributes.forEach((attr) => {
    if (attr.name) {
      const attrName = attr.name;
      if (!groupedAttributes[attrName]) {
        groupedAttributes[attrName] = {
          attribute_id: attr.id,
          values: [],
        };
      }
      groupedAttributes[attrName].values.push({
        id: attr.id,
        value: attr.value,
        display_value: attr.display_value || attr.value,
      });
    }
  });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Variant</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2 pb-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Variant Title</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isPending}
                      placeholder="Variant name"
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
                        placeholder="SKU123-VAR1"
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

            <div>
              <FormLabel className="block mb-2">Variant Attributes</FormLabel>
              {Object.entries(groupedAttributes).length === 0 ? (
                <div className="text-sm text-muted-foreground py-2 border rounded-md p-3 bg-muted/50">
                  No attributes available. Add attributes to the parent product first.
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(groupedAttributes).map(([name, { values }]) => (
                    <div key={name} className="space-y-2">
                      <h4 className="text-sm font-medium">{name}</h4>
                      <div className="grid grid-cols-2 gap-2">                        {values.map((value) => (
                          <FormField
                            key={value.id}
                            control={form.control}
                            name="attribute_value_ids"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3">
                                <FormControl>
                                  <Checkbox
                                    checked={Array.isArray(field.value) && field.value.includes(value.id)}
                                    onCheckedChange={(checked) => {
                                      const currentValue = Array.isArray(field.value) ? field.value : [];
                                      const updatedValues = checked
                                        ? [...currentValue, value.id]
                                        : currentValue.filter((v: string) => v !== value.id);
                                      field.onChange(updatedValues);
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="cursor-pointer font-normal text-sm">
                                  {value.value}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <FormMessage />
            </div>            <div>
              <FormLabel>Images (Optional)</FormLabel>
              <CustomImageUpload
                value={imagePreview}
                disabled={isPending}
                onChange={(files) => {
                  // Handle both single file and array of files
                  const file = Array.isArray(files) ? files[0] : files;
                  if (file) {
                    setSelectedImage(file);
                    setImagePreview(URL.createObjectURL(file));
                  } else {
                    setSelectedImage(null);
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
              <Button type="submit" disabled={isPending || Object.entries(groupedAttributes).length === 0}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Variant
              </Button>
            </div>
          </form>
        </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
