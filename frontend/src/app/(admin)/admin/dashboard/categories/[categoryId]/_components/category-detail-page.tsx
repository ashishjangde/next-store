"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CategoryActions } from "@/api-actions/categories-actions";
import { LoadingPage } from "@/components/common/loading";
import { CategoryDetailClient } from "../../_components/category-detail-client";

interface CategoryDetailPageProps {
  categoryId: string;
}

export function CategoryDetailPage({ categoryId }: CategoryDetailPageProps) {
  const router = useRouter();
  const [category, setCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCategory = async () => {
      if (!categoryId) {
        router.push('/admin/dashboard/categories');
        return;
      }
      
      try {
        setIsLoading(true);
        const response = await CategoryActions.adminGetCategoryById(categoryId, true, true);
        
        if (!response?.data) {
          // Handle 404 case
          router.push('/admin/dashboard/categories');
          return;
        }
        
        setCategory(response.data);
      } catch (err) {
        console.error("Error fetching category:", err);
        setError(err instanceof Error ? err : new Error('Failed to fetch category'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategory();
  }, [categoryId, router]);

  // Handle loading state
  if (isLoading) {
    return <LoadingPage />;
  }

  // Handle error state
  if (error || !category) {
    router.push('/admin/dashboard/categories');
    return <LoadingPage />;
  }

  // If we have the category data, render the client component
  return <CategoryDetailClient initialCategory={category} />;
}
