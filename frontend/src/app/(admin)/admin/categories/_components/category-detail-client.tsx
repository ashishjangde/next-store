"use client";

import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CategoryActions } from "@/api-actions/categories-actions";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { LoadingPage } from "@/components/common/loading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoryDetailsTab } from "./category-details-tab";
import { CategoryAttributeIndex } from "../[categoryId]/_components/category-attribute";
import { CategoryChildrenTab } from "./category-children-tab";
import { ArrowLeft, Edit, Trash2, Plus } from "lucide-react";
import { EditCategoryModal } from "../[categoryId]/_components/edit-category-modal";
import { Badge } from "@/components/ui/badge";
import { CreateCategoryModal } from "./create-category-modal";
import { CategoryDeleteDialog } from "./category-delete-dialog";

interface CategoryDetailClientProps {
  initialCategory: Category;
}

export const CategoryDetailClient = ({ 
  initialCategory 
}: CategoryDetailClientProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  // Ensure we have a valid initialCategory before proceeding
  if (!initialCategory || !initialCategory.id) {
    return <LoadingPage />;
  }
  
  // Fetch the latest category data
  const { data: categoryData, isLoading } = useQuery({
    queryKey: ["category", initialCategory.id],
    queryFn: async () => {
      try {
        return await CategoryActions.adminGetCategoryById(initialCategory.id, false, true);
      } catch (error) {
        console.error("Error fetching category:", error);
        return { data: initialCategory };
      }
    },
    // Add refetch settings for better reactivity
    refetchOnWindowFocus: true,
    staleTime: 10000, // Consider data stale after 10 seconds
  });

  // Use the fetched data or fall back to initialCategory
  const category = categoryData?.data || initialCategory;

  // Improved update handler for better cache management
  const handleUpdateSuccess = () => {
    // Invalidate specific queries
    queryClient.invalidateQueries({ queryKey: ["category", category.id] });
    queryClient.invalidateQueries({ queryKey: ["categories"] });
    
    // If this is a child category, also invalidate parent data
    if (category.parent_id) {
      queryClient.invalidateQueries({ queryKey: ["category", category.parent_id] });
      queryClient.invalidateQueries({ queryKey: ["categoryById", category.parent_id] });
    }

    // If this has children, invalidate children data
    if ((category.children ?? []).length > 0) {
      queryClient.invalidateQueries({ queryKey: ["categoryChildren"] });
    }
  };

  if (isLoading) {
    return <LoadingPage />;
  }

  // Determine if we should show the Children tab based on level (0 or 1 can have children)
  const showChildrenTab = category.level < 2;

  // Determine if we should show the Attributes tab based on level (only level 2 can have attributes)
  const showAttributesTab = category.level === 2;

  // Get the title for the "Add Child" button based on the current category level
  const getAddChildTitle = () => {
    if (category.level === 0) {
      return "Add Subcategory";
    } else if (category.level === 1) {
      return "Add Leaf Category";
    }
    return "Add Child";
  };

  return (
    <>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <PageHeader
          title={
            <div className="flex items-center gap-2">
              {category.name}
              {!category.active && (
                <Badge variant="outline" className="bg-gray-200">
                  Inactive
                </Badge>
              )}
              {category.is_featured && (
                <Badge className="bg-amber-500">Featured</Badge>
              )}
              <Badge variant="outline" className="capitalize">
                Level {category.level}
              </Badge>
            </div>
          }
          description={category.description || "No description provided"}
          actions={
            <div className="flex gap-2">              
            <Button
                variant="outline"
                onClick={() => router.push("/admin/categories")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <EditCategoryModal
                category={category}
                onUpdate={handleUpdateSuccess}
              >
                <Button variant="outline">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </EditCategoryModal>
              <CategoryDeleteDialog category={category} redirectAfterDelete={true}>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </CategoryDeleteDialog>
            </div>
          }
        />

        <Tabs defaultValue="details" className="space-y-4">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            {showAttributesTab && (
              <TabsTrigger value="attributes">Attributes</TabsTrigger>
            )}
            {showChildrenTab && (
              <TabsTrigger value="children">Child Categories</TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="details" className="space-y-4">
            <CategoryDetailsTab category={category} />
          </TabsContent>
          
          {showAttributesTab && (
            <TabsContent value="attributes" className="space-y-4">
              <CategoryAttributeIndex 
                category={category} 
                onUpdate={() => queryClient.invalidateQueries({ 
                  queryKey: ["category", category.id] 
                })}
              />
            </TabsContent>
          )}
          
          {showChildrenTab && (
            <TabsContent value="children" className="space-y-4">
              <div className="flex justify-end mb-4">
                <CreateCategoryModal 
                  onSuccess={handleUpdateSuccess}
                  initialParentId={category.id}
                >
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    {getAddChildTitle()}
                  </Button>
                </CreateCategoryModal>
              </div>
              <CategoryChildrenTab 
                category={category} 
                parentId={category.id}
              />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </>
  );
};
