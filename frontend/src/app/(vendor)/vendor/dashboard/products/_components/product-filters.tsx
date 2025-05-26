"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { CategoryActions } from "@/api-actions/categories-actions";

interface ProductFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  categoryId: string;
  onCategoryChange: (value: string) => void;
  limit: number;
  onLimitChange: (value: number) => void;
  categories?: Array<{ id: string; name: string; }>;
  isSearching?: boolean;
}

export const ProductFilters = ({
  search,
  onSearchChange,
  categoryId,
  onCategoryChange,
  limit,
  onLimitChange,
  categories = [],
  isSearching = false,
}: ProductFiltersProps) => {
  const [mounted, setMounted] = useState(false);
  
  // Only fetch categories if not provided
  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      return await CategoryActions.getRootCategories(false, true);
    },
    staleTime: 60000, // 1 minute
    enabled: categories.length === 0, // Only fetch if categories not provided
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  // Use provided categories or fallback to fetched categories
  const allCategories = categories.length > 0 ? categories : (categoriesData?.data || []);
  return (
    <div className="flex items-center gap-x-4 w-full md:w-auto">
      <div className="relative w-full md:w-[250px]">
        <Search className="h-4 w-4 absolute top-3 left-3 text-muted-foreground" />
        {isSearching && (
          <div className="h-4 w-4 absolute top-3 right-3 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
        )}
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className={`pl-9 ${isSearching ? 'pr-9' : ''}`}
        />
      </div>
      
      <div className="w-full md:w-[200px]">
        <Select
          value={categoryId}
          onValueChange={onCategoryChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              All Categories
            </SelectItem>
            {allCategories
              .filter((category: any) => category.id && category.id.trim() !== "")
              .map((category: any) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="w-full md:w-[120px]">
        <Select
          value={limit.toString()}
          onValueChange={(value) => onLimitChange(Number(value))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Items per page" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5 per page</SelectItem>
            <SelectItem value="10">10 per page</SelectItem>
            <SelectItem value="20">20 per page</SelectItem>
            <SelectItem value="50">50 per page</SelectItem>
            <SelectItem value="100">100 per page</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
