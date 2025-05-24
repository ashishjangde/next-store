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
}

export const ProductFilters = ({
  search,
  onSearchChange,
  categoryId,
  onCategoryChange,
}: ProductFiltersProps) => {
  const [mounted, setMounted] = useState(false);
  
  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],    queryFn: async () => {
      return await CategoryActions.getRootCategories(false, true);
    },
    staleTime: 60000, // 1 minute
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const categories = categoriesData?.data || [];

  return (
    <div className="flex items-center gap-x-4 w-full md:w-auto">
      <div className="relative w-full md:w-[250px]">
        <Search className="h-4 w-4 absolute top-3 left-3 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      <div className="w-full md:w-[200px]">
        <Select
          value={categoryId}
          onValueChange={onCategoryChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>          <SelectContent>            <SelectItem value="all">
              All Categories
            </SelectItem>
            {categories
              .filter((category: any) => category.id && category.id.trim() !== "")
              .map((category: any) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
