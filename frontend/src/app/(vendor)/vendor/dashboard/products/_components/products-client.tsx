"use client";

import { useState, useMemo, useEffect } from "react";
import { ProductActions } from "@/api-actions/product-actions";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { ProductColumns } from "./columns";
import { PageHeader } from "@/components/common/page-header";
import { ProductFilters } from "./product-filters";
import Link from "next/link";

export const ProductsClient = () => {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>("desc");
  const [isSearching, setIsSearching] = useState(false);

  // Debounce search input with loading state
  useEffect(() => {
    if (search !== debouncedSearch) {
      setIsSearching(true);
    }
    
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to first page when search changes
      setIsSearching(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [search, debouncedSearch]);  // Reset page when category or limit changes
  useEffect(() => {
    setPage(1);
  }, [categoryId, limit]);

  // Reset page when sorting changes
  useEffect(() => {
    setPage(1);
  }, [sortBy, sortOrder]);

  // Handle table sorting changes
  const handleSortingChange = (updater: any) => {
    if (typeof updater === 'function') {
      const newSorting = updater([]);
      if (newSorting.length > 0) {
        const { id, desc } = newSorting[0];
        setSortBy(id);
        setSortOrder(desc ? 'desc' : 'asc');
      } else {
        setSortBy('created_at');
        setSortOrder('desc');
      }
    }
  };  // Use TanStack Query to get products with server-side filtering
  const { data: productsData } = useQuery({
    queryKey: ["vendor-products", page, limit, debouncedSearch, categoryId, sortBy, sortOrder],
    queryFn: async () => {
      return await ProductActions.getVendorParentProducts({
        page,
        limit,
        search: debouncedSearch || undefined,
        category_id: categoryId || undefined,
        include_category: true, // Include category data for display
        include_children: true, // Include children for variant count
        sort_by: sortBy,
        sort_order: sortOrder,
      });
    },
    refetchOnWindowFocus: false, // Disable auto-refetch for better UX
    staleTime: 30000, // Consider data fresh for 30 seconds
  });

  const products = useMemo(() => {
    return productsData?.data?.products || [];
  }, [productsData]);

  const pagination = useMemo(() => {
    return productsData?.data || null;
  }, [productsData]);

  // Extract unique categories from products for filter dropdown
  const categoriesFromProducts = useMemo(() => {
    const uniqueCategories = new Map();
    products.forEach((product: any) => {
      if (product.category) {
        uniqueCategories.set(product.category.id, {
          id: product.category.id,
          name: product.category.name,
        });
      }
    });
    return Array.from(uniqueCategories.values());
  }, [products]);


  return (
    <div className="space-y-4">
      <PageHeader
        title="Products"
        description="Manage your product catalog"
      />
        <div className="flex items-center justify-between">        <ProductFilters 
          search={search}
          onSearchChange={setSearch}
          categoryId={categoryId}
          onCategoryChange={setCategoryId}
          limit={limit}
          onLimitChange={setLimit}
          categories={categoriesFromProducts}
          isSearching={isSearching}
        />
        <Link href="/vendor/dashboard/products/new">
          <Button className="ml-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </Link>
      </div>      
      <DataTable
        columns={ProductColumns}
        data={products}
        onSortingChange={handleSortingChange}
        sorting={[{ id: sortBy, desc: sortOrder === 'desc' }]}
      />        

      {/* Pagination Controls */}
      {pagination && (
        <div className="flex items-center justify-between px-2">
          <div className="flex-1 text-sm text-muted-foreground">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} products
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page <= 1}
            >
              Previous
            </Button>
            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
              Page {pagination.page} of {pagination.totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page >= pagination.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
