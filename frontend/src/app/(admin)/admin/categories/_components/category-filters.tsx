"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useDebounce } from "@/hooks/use-debounce";
import { useQuery } from "@tanstack/react-query";
import { CategoryActions } from "@/api-actions/categories-actions";

interface CategoryFiltersProps {
  search: string;
  setSearch: (value: string) => void;
  parentId: string;
  setParentId: (value: string) => void;
  includeInactive: boolean;
  setIncludeInactive: (value: boolean) => void;
}

export const CategoryFilters = ({
  search,
  setSearch,
  parentId,
  setParentId,
  includeInactive,
  setIncludeInactive,
}: CategoryFiltersProps) => {
  const [searchValue, setSearchValue] = useState(search);
  const debouncedSearch = useDebounce(searchValue, 500);

  // Get root categories for parent filter dropdown using TanStack Query
  const { data, isLoading } = useQuery({
    queryKey: ["categoryParents", includeInactive],
    queryFn: async () => {
      const response = await CategoryActions.getRootCategories();
      return response.data || [];
    },
  });

  const parentCategories = data || [];

  // Update search query parameter when debounced search changes
  useEffect(() => {
    setSearch(debouncedSearch);
  }, [debouncedSearch, setSearch]);

  const handleClearFilters = () => {
    setSearchValue("");
    setSearch("");
    setParentId("");
    setIncludeInactive(false);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {/* Search filter */}
        <div className="flex w-full items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="h-9"
          />
          {searchValue && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchValue("")}
              className="h-9 w-9"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Clear search</span>
            </Button>
          )}
        </div>

        {/* Parent category filter */}
        <div>
          <Select value={parentId} onValueChange={setParentId}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Filter by parent" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="null">Root Categories Only</SelectItem>
              {isLoading ? (
                <div className="flex items-center justify-center py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : (
                parentCategories.map((category: Category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Include inactive filter */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="includeInactive"
            checked={includeInactive}
            onCheckedChange={(checked) =>
              setIncludeInactive(checked === true)
            }
          />
          <Label htmlFor="includeInactive">Include inactive categories</Label>
        </div>

        {/* Clear filters button */}
        <div className="flex justify-end items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearFilters}
            className="h-9"
          >
            Reset Filters
          </Button>
        </div>
      </div>
    </div>
  );
};
