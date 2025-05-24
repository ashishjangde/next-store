"use client";

import { useState } from "react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  MoreHorizontal, 
  Edit, 
  Copy, 
  Archive, 
  Trash2,
  PackageOpen,
  Tag
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ProductActions as ProductAPI } from "@/api-actions/product-actions";
import { AlertModal } from "@/components/common/alert-modal";

interface ProductActionsProps {
  product: Product;
}

export const ProductActions = ({ product }: ProductActionsProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const { mutate: deleteProduct } = useMutation({
    mutationFn: (id: string) => ProductAPI.deleteProduct(id),
    onSuccess: () => {
      toast.success("Product deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["vendor-products"] });
    },
    onError: (error) => {
      toast.error("Failed to delete product");
      console.error("Error deleting product:", error);
    }
  });

  const onDelete = async () => {
    setLoading(true);
    try {
      await deleteProduct(product.id);
      setShowDeleteModal(false);
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>      <AlertModal 
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={onDelete}
        loading={loading}
        title="Delete Product"
        description="Are you sure you want to delete this product? This action cannot be undone."
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => router.push(`/vendor/dashboard/products/${product.id}`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push(`/vendor/dashboard/products/${product.id}/variants`)}>
            <PackageOpen className="mr-2 h-4 w-4" />
            Manage Variants
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push(`/vendor/dashboard/products/${product.id}/inventory`)}>
            <Tag className="mr-2 h-4 w-4" />
            Update Inventory
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              toast.success("Product duplicated. Edit the copy now.");
              router.push(`/vendor/dashboard/products/new?duplicate=${product.id}`);
            }}
          >
            <Copy className="mr-2 h-4 w-4" />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => setShowDeleteModal(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
