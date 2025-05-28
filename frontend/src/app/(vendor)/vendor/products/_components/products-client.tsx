"use client";

import { useState, useMemo, useEffect } from "react";
import { ProductActions } from "@/api-actions/product-actions";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { ProductColumns } from "./columns";
import { PageHeader } from "@/components/common/page-header";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";

export const ProductsClient = () => {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [categoryId, setCategoryId] = useState<string>("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>("desc");


  // Debounce search input with loading state
  useEffect(() => {
    
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to first page when search changes
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
    queryFn: async () => {      return await ProductActions.getVendorParentProducts({
        page,
        limit,
        search: debouncedSearch || undefined,
        category_id: categoryId === "all" ? undefined : categoryId,
        include_category: true, // Include category data for display
        include_attributes: true, // Include attributes for display
        include_children: true, // Include children for variant count
        sort_by: sortBy,
        sort_order: sortOrder,
      });
    },
    refetchOnWindowFocus: true,
  });

  const products = useMemo(() => {
    return productsData?.data?.products || [];
  }, [productsData]);

  const pagination = useMemo(() => {
    return productsData?.data || null;
  }, [productsData]);

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
    <div className="space-y-4">      <PageHeader
        title="Products"
        description="Manage your product catalog"
      />
      
      {/* Filters and Controls */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 flex-col gap-4 md:flex-row md:items-center">
          {/* Search Input */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
            {/* Category Filter */}
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categoriesFromProducts.map((category: any) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Items per page */}
          <Select value={limit.toString()} onValueChange={(value) => setLimit(parseInt(value))}>
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 per page</SelectItem>
              <SelectItem value="10">10 per page</SelectItem>
              <SelectItem value="20">20 per page</SelectItem>
              <SelectItem value="50">50 per page</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Add Product Button */}
        <Link href="/vendor/dashboard/products/new">
          <Button>
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
      />            {/* Pagination Controls */}
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
