"use client";

import { useState, useMemo } from "react";
import { CategoryActions } from "@/api-actions/categories-actions";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { CategoryColumns } from "../../_components/columns";
import { PageHeader } from "@/components/common/page-header";
import { CategoryFilters } from "../../_components/category-filters";
import { CreateCategoryModal } from "../../_components/create-category-modal";
import { LoadingPage } from "@/components/common/loading";

export const CategoriesClient = () => {
  const [search, setSearch] = useState("");
  const [parentId, setParentId] = useState("");
  const [includeInactive, setIncludeInactive] = useState(false);
  
  // Use TanStack Query to get all root categories
  const queryClient = useQueryClient();
  const { data: categoriesData, isLoading } = useQuery({
    queryKey: ["categories", includeInactive],
    queryFn: async () => {
      return await CategoryActions.adminGetRootCategories(false, true);
    },
    // Add refetch settings to improve reactivity
    refetchOnWindowFocus: true,
    staleTime: 10000, // Consider data stale after 10 seconds
  });

  const rootCategories = useMemo(() => {
    return categoriesData?.data || [];
  }, [categoriesData]);

  // Apply client-side filtering
  const filteredCategories = useMemo(() => {
    let filtered = [...rootCategories];
    
    // Filter by parent ID if selected
    if (parentId === "null") {
      // Show only root categories with no parent
      filtered = filtered.filter(cat => !cat.parent_id);
    } else if (parentId === "all") {
      // Show all categories (no filtering)
    } else if (parentId) {
      // Show only categories with the selected parent
      filtered = filtered.filter(cat => cat.parent_id === parentId);
    }
    
    // Filter by active status
    if (!includeInactive) {
      filtered = filtered.filter(cat => cat.active);
    }
    
    // Filter by search term
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(cat => 
        cat.name.toLowerCase().includes(searchLower) || 
        (cat.description && cat.description.toLowerCase().includes(searchLower))
      );
    }
    
    return filtered;
  }, [rootCategories, parentId, includeInactive, search]);

  // Updated handleCreateSuccess with invalidation approach
  const handleCreateSuccess = () => {
    // Invalidate the categories query to trigger a refetch
    queryClient.invalidateQueries({ queryKey: ["categories"] });
  };

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <PageHeader
          title="Categories"
          description="Manage your store categories"
          actions={
            <CreateCategoryModal onSuccess={handleCreateSuccess}>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add New
              </Button>
            </CreateCategoryModal>
          }
        />

        <CategoryFilters
          search={search}
          setSearch={setSearch}
          parentId={parentId}
          setParentId={setParentId}
          includeInactive={includeInactive}
          setIncludeInactive={setIncludeInactive}
        />

        <DataTable
          columns={CategoryColumns}
          data={filteredCategories}
          totalItems={filteredCategories.length}
          disablePagination={true}
        />
      </div>
    </>
  );
};
