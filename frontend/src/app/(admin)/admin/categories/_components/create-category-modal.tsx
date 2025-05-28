"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CategoryActions } from "@/api-actions/categories-actions";
import { categoryCreateSchema } from "@/schema/categories-schema";


interface CreateCategoryModalProps {
  children?: React.ReactNode;
  onSuccess: () => void;
  initialParentId?: string;
}

interface ImageUploadProps {
  value: string;
  onChange: (file: File | null) => void;
}

// Image upload component with preview
const ImageUpload = ({ value, onChange }: ImageUploadProps) => {
  const [preview, setPreview] = useState<string>("");

  // Handle file selection and create preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    
    if (file) {
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
      onChange(file);
    } else {
      setPreview("");
      onChange(null);
    }
  };

  // Clean up preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        <p className="mt-2 text-sm text-gray-500">
          Choose an image file (JPG, PNG, GIF)
        </p>
      </div>
      
      {/* Image Preview */}
      {preview && (
        <div className="relative">
          <div className="relative w-full h-48 rounded-lg overflow-hidden border">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              setPreview("");
              onChange(null);
              // Reset the file input
              const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
              if (fileInput) fileInput.value = "";
            }}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
          >
            ×
          </button>
        </div>
      )}
      
      {/* Display existing image URL if available */}
      {value && !preview && (
        <div className="text-sm text-gray-600">
          Current image: {value}
        </div>
      )}
    </div>
  );
};

export const CreateCategoryModal = ({
  children,
  onSuccess,
  initialParentId,
}: CreateCategoryModalProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  // Define the form schema type explicitly
  type FormValues = {
    name: string;
    description?: string;
    image?: File;
    is_featured: boolean;
    active: boolean;
    parent_id?: string;
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(categoryCreateSchema) as any,
    defaultValues: {
      name: "",
      description: "",
      is_featured: false,
      active: true,
      // If initialParentId is provided, use it, otherwise set to "none" (root category)
      parent_id: initialParentId || "none",
    },
  });

  // Reset form when initialParentId changes or modal opens
  useEffect(() => {
    if (open) {
      form.reset({
        name: "",
        description: "",
        is_featured: false,
        active: true,
        parent_id: initialParentId || "none",
      });
    }
  }, [initialParentId, form, open]);

  const createMutation = useMutation({
    mutationFn: (data: FormValues) => {
      try {
        // Create a new FormData object for the request
        const formData = new FormData();
        
        // Add name and description
        formData.append('name', data.name);
        if (data.description) {
          formData.append('description', data.description);
        }
        
        // Add parent_id only if initialParentId is provided (creating a child category)
        if (initialParentId) {
          formData.append('parent_id', initialParentId);
        }
        
        // Add booleans as strings
        formData.append('is_featured', data.is_featured ? 'true' : 'false');
        formData.append('active', data.active ? 'true' : 'false');
        
        // Add image if present
        if (data.image instanceof File) {
          formData.append('image', data.image);
        }
        
        console.log("Creating category with FormData:", formData);
        
        return CategoryActions.createCategory(formData as unknown as FormValues);
      } catch (error) {
        console.error("Error preparing form data:", error);
        throw error;
      }
    },
    onSuccess: (response) => {
      console.log("Category created successfully:", response.data);
      toast({
        title: "Success",
        description: "Category created successfully",
      });
      
      // More aggressive cache invalidation approach
      // 1. Invalidate all category queries
      queryClient.invalidateQueries();
      
      // 2. If this is a child category (has parent), force refetch the parent's data
      if (initialParentId) {
        queryClient.refetchQueries({ queryKey: ["category", initialParentId] });
        queryClient.refetchQueries({ queryKey: ["categoryById", initialParentId] });
      }
      
      // Close the modal and reset the form
      form.reset();
      setOpen(false);
      
      // Call the success callback with a short delay to ensure React Query has time to update
      setTimeout(() => {
        onSuccess();
      }, 100);
    },
    onError: (error: any) => {
      console.error("Error creating category:", error);
      toast({
        title: "Error",
        description: error?.response?.data?.apiError?.message || error?.response?.data?.message || "Failed to create category",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    createMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialParentId ? "Create Child Category" : "Create New Category"}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {initialParentId 
              ? "This will be added as a child of the selected category." 
              : "This will be created as a root level category."}
          </p>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Name field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Category name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description field */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Category description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />            {/* Image field */}
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Image</FormLabel>
                  <FormControl>
                    <ImageUpload
                      value={field.value instanceof File ? field.value.name : ""}
                      onChange={(file) => field.onChange(file)}
                    />
                  </FormControl>
                  <FormDescription>
                    Upload a category image (optional). Recommended size: 400x400px
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Hidden field for parent_id */}
            <input type="hidden" name="parent_id" value={initialParentId || "none"} />

            {/* Featured and Active checkboxes */}
            <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
              <FormField
                control={form.control}
                name="is_featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => field.onChange(checked === true)}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Featured</FormLabel>
                      <FormDescription>
                        Show this category in featured sections
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => field.onChange(checked === true)}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Active</FormLabel>
                      <FormDescription>
                        Show this category on the website
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            {/* Action buttons */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {initialParentId ? "Create Child Category" : "Create Category"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
