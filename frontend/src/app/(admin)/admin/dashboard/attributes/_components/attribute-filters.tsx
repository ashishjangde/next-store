"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useDebounce } from "@/hooks/use-debounce";

interface AttributeFiltersProps {
  search: string;
  setSearch: (value: string) => void;
  includeValues: boolean;
  setIncludeValues: (value: boolean) => void;
}

export const AttributeFilters = ({
  search,
  setSearch,
  includeValues,
  setIncludeValues,
}: AttributeFiltersProps) => {
  const [searchValue, setSearchValue] = useState(search);
  const debouncedSearch = useDebounce(searchValue, 500);

  // Update search query parameter when debounced search changes
  useEffect(() => {
    setSearch(debouncedSearch);
  }, [debouncedSearch, setSearch]);

  const handleClearFilters = () => {
    setSearchValue("");
    setSearch("");
    setIncludeValues(true);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Search filter */}
        <div className="flex w-full items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search attributes..."
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

        {/* Include values filter */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="includeValues"
            checked={includeValues}
            onCheckedChange={(checked) =>
              setIncludeValues(checked === true)
            }
          />
          <Label htmlFor="includeValues">Include attribute values (may be slower)</Label>
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
