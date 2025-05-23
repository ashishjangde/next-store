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
import { useQuery, useMutation } from "@tanstack/react-query";
import { categoryUpdateSchema } from "@/schema/categories-schema";
import { CategoryActions } from "@/api-actions/categories-actions";
import { z } from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ImageUploadProps {
  value: string;
  onChange: (file: File | null) => void;
}

// Simple placeholder for the image upload component
const ImageUpload = ({ value, onChange }: ImageUploadProps) => {
  return (
    <div className="border-2 border-dashed rounded-lg p-4">
      <input 
        type="file" 
        accept="image/*" 
        onChange={(e) => {
          const file = e.target.files?.[0] || null;
          onChange(file);
        }} 
      />
      {value && <div className="mt-2">Selected image: {value}</div>}
    </div>
  );
};

interface EditCategoryModalProps {
  children?: React.ReactNode;
  category: Category;
  onUpdate: () => void;
}

export const EditCategoryModal = ({
  children,
  category,
  onUpdate,
}: EditCategoryModalProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  type UpdateFormValues = z.infer<typeof categoryUpdateSchema>;
  
  const form = useForm<UpdateFormValues>({
    resolver: zodResolver(categoryUpdateSchema),
    defaultValues: {
      name: category.name,
      description: category.description || "",
      is_featured: category.is_featured,
      active: category.active,
      parent_id: category.parent_id || "none",
    },
  });

  // Reset form when category changes and dialog opens
  useEffect(() => {
    if (open && category) {
      form.reset({
        name: category.name,
        description: category.description || "",
        is_featured: category.is_featured,
        active: category.active,
        parent_id: category.parent_id || "none",
      });
      setImagePreview(category.image || null);
    }
  }, [category, form, open]);

  const updateMutation = useMutation({
    mutationFn: (data: UpdateFormValues) => {
      // Make sure we're capturing and sending all form data fields
      console.log("Updating category with data:", data);
      
      // Create a new object with all form values plus the parent_id
      const formData = { 
        ...data,
        parent_id: category.parent_id || undefined
      };
      
      // Remove undefined values to avoid issues
      Object.keys(formData).forEach(key => {
        if (formData[key as keyof typeof formData] === undefined) {
          delete formData[key as keyof typeof formData];
        }
      });
      
      return CategoryActions.updateCategory(category.id, formData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Category updated successfully",
      });
      setOpen(false);
      onUpdate();
    },
    onError: (error: any) => {
      console.error("Error updating category:", error);
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to update category",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: UpdateFormValues) => {
    // Log the form data to see what's being submitted
    console.log("Form data being submitted:", data);
    updateMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Category: {category?.name}</DialogTitle>
          <p className="text-sm text-muted-foreground">
            {category.parent_id 
              ? "This is a child category. Parent category can't be changed." 
              : "This is a root level category."}
          </p>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Category name" {...field} />
                  </FormControl>
                  <FormDescription>This will auto-generate a new URL slug</FormDescription>
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
                    <Textarea placeholder="Category description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image</FormLabel>
                  <FormControl>
                    <ImageUpload
                      value={imagePreview || ""}
                      onChange={(file) => {
                        field.onChange(file);
                        if (file) {
                          setImagePreview(URL.createObjectURL(file));
                        }
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Update category image (optional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Hidden field for parent_id */}
            <input type="hidden" name="parent_id" value={category.parent_id || "none"} />
            
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
            
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
