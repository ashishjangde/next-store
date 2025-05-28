"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye } from "lucide-react";
import Link from "next/link";
import { EditCategoryModal } from "../[categoryId]/_components/edit-category-modal";
import { CategoryDeleteDialog } from "./category-delete-dialog";
import { useQueryClient } from "@tanstack/react-query";

interface CategoryActionsProps {
  category: Category;
}

export function CategoryActions({ category }: CategoryActionsProps) {
  const queryClient = useQueryClient();

  const handleUpdateSuccess = () => {
    // Comprehensive cache invalidation
    queryClient.invalidateQueries({ queryKey: ["categories"] });
    queryClient.invalidateQueries({ queryKey: ["category", category.id] });

    // If this category has a parent, invalidate parent data
    if (category.parent_id) {
      queryClient.invalidateQueries({ queryKey: ["category", category.parent_id] });
      queryClient.invalidateQueries({ queryKey: ["categoryById", category.parent_id] });
    }

    // If this category has children, invalidate their data
    if (category.children && category.children.length > 0) {
      category.children.forEach((child) => {
        queryClient.invalidateQueries({ queryKey: ["category", child.id] });
      });
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Link href={`/admin/categories/${category.id}`} passHref>
        <Button variant="outline" size="sm">
          <Eye className="h-4 w-4" />
          <span className="sr-only">View</span>
        </Button>
      </Link>

      <EditCategoryModal category={category} onUpdate={handleUpdateSuccess}>
        <Button variant="outline" size="sm">
          <Edit className="h-4 w-4" />
          <span className="sr-only">Edit</span>
        </Button>
      </EditCategoryModal>

      <CategoryDeleteDialog category={category}>
        <Button variant="outline" size="sm">
          <Trash2 className="h-4 w-4 text-red-500" />
          <span className="sr-only">Delete</span>
        </Button>
      </CategoryDeleteDialog>
    </div>
  );
}
