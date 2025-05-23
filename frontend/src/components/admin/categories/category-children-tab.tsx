"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CategoryActions } from "@/api-actions/categories-actions";
import { Loader2 } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { CategoryColumns } from "./columns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect } from "react";

interface CategoryChildrenTabProps {
  category: Category;
  parentId: string;
}

export const CategoryChildrenTab = ({
  category,
  parentId,
}: CategoryChildrenTabProps) => {
  const queryClient = useQueryClient();
  
  // Get child categories with better refetch behavior
  const { data: categoryData, isLoading, refetch } = useQuery({
    queryKey: ["categoryById", parentId],
    queryFn: async () => {
      try {
        return await CategoryActions.adminGetCategoryById(parentId, true, true);
      } catch (error) {
        console.error("Error fetching category by ID:", error);
        return { data: category };
      }
    },
    // Make sure to refetch data regularly
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    staleTime: 0, // Consider data always stale to ensure freshness
  });
  
  // Force refetch when component mounts or parentId changes
  useEffect(() => {
    refetch();
    
    // Set up a polling interval to check for updates
    const intervalId = setInterval(() => {
      refetch();
    }, 3000); // Check every 3 seconds
    
    return () => clearInterval(intervalId);
  }, [parentId, refetch]);

  // Get direct children from the category data, with fallback to initial data
  const children = categoryData?.data?.children || category.children || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-medium">Child Categories</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : children.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <span className="block mb-2">No child categories found.</span>
              <span className="block">You can add new child categories using the button above.</span>
            </div>
          ) : (
            <DataTable
              columns={CategoryColumns}
              data={children}
              totalItems={children.length}
              disablePagination={true}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};
