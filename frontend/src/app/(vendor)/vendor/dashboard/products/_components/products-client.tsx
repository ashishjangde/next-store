"use client";

import { useState, useMemo } from "react";
import { ProductActions } from "@/api-actions/product-actions";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { ProductColumns } from "./columns";
import { PageHeader } from "@/components/common/page-header";
import { ProductFilters } from "./product-filters";
import { LoadingPage } from "@/components/common/loading";

export const ProductsClient = () => {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Use TanStack Query to get products
  const { data: productsData, isLoading } = useQuery({
    queryKey: ["vendor-products"],
    queryFn: async () => {
      return await ProductActions.getAllProducts({
        product_type: "PARENT" // Only fetch parent products
      });
    },
    refetchOnWindowFocus: true,
    staleTime: 10000, // Consider data stale after 10 seconds
  });

  const products = useMemo(() => {
    return productsData?.data?.products || [];
  }, [productsData]);

  // Apply client-side filtering
  const filteredProducts = useMemo(() => {
    let filtered = [...products];
    
    // Filter by search term
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        product => 
          product.title.toLowerCase().includes(searchLower) || 
          product.description.toLowerCase().includes(searchLower) ||
          product.sku?.toLowerCase().includes(searchLower)
      );
    }
    
    // Filter by category
    if (categoryId) {
      filtered = filtered.filter(product => product.category_id === categoryId);
    }
    
    return filtered;
  }, [products, search, categoryId]);

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Products"
        description="Manage your product catalog"
      />
      
      <div className="flex items-center justify-between">
        <ProductFilters 
          search={search}
          onSearchChange={setSearch}
          categoryId={categoryId}
          onCategoryChange={setCategoryId}
        />
        
        <Button 
          onClick={() => setIsCreateModalOpen(true)} 
          className="ml-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>
        <DataTable
        columns={ProductColumns}
        data={filteredProducts}
      />
      
    </div>
  );
};
