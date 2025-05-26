"use client";

import { useState, useEffect } from "react";
import { CategoryActions } from "@/api-actions/categories-actions";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

// Define Category type to match the backend response
interface Category {
  id: string;
  name: string;
  description?: string | null;
  children?: Category[];
}

interface HierarchicalCategorySelectProps {
  value?: string; // The selected category ID (should be level 2)
  onChange: (categoryId: string | null, categoryPath?: { level0?: Category; level1?: Category; level2?: Category }) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
}

export function HierarchicalCategorySelect({
  value,
  onChange,
  placeholder = "Select a category",
  disabled = false,
  error
}: HierarchicalCategorySelectProps) {  const [selectedLevel0, setSelectedLevel0] = useState<string | undefined>(undefined);
  const [selectedLevel1, setSelectedLevel1] = useState<string | undefined>(undefined);
  const [selectedLevel2, setSelectedLevel2] = useState<string | undefined>(undefined);

  // Track category objects for providing path info
  const [level0Categories, setLevel0Categories] = useState<Category[]>([]);
  const [level1Categories, setLevel1Categories] = useState<Category[]>([]);
  const [level2Categories, setLevel2Categories] = useState<Category[]>([]);

  // Get root categories (level 0)
  const { data: rootCategoriesData, isLoading: isLoadingRoot } = useQuery({
    queryKey: ["categories", "root"],
    queryFn: () => CategoryActions.getRootCategories(false, false),
  });
  // Get level 1 categories when level 0 is selected
  const { data: level1Data, isLoading: isLoadingLevel1 } = useQuery({
    queryKey: ["category", selectedLevel0 || "", "children"],
    queryFn: () => CategoryActions.getCategoryById(selectedLevel0!),
    enabled: !!selectedLevel0,
  });

  // Get level 2 categories when level 1 is selected
  const { data: level2Data, isLoading: isLoadingLevel2 } = useQuery({
    queryKey: ["category", selectedLevel1 || "", "children"],
    queryFn: () => CategoryActions.getCategoryById(selectedLevel1!),
    enabled: !!selectedLevel1,
  });

  // Update categories when data changes
  useEffect(() => {
    if (rootCategoriesData?.data) {
      setLevel0Categories(rootCategoriesData.data);
    }
  }, [rootCategoriesData]);

  useEffect(() => {
    if (level1Data?.data?.children) {
      setLevel1Categories(level1Data.data.children);
    } else {
      setLevel1Categories([]);
    }
  }, [level1Data]);

  useEffect(() => {
    if (level2Data?.data?.children) {
      setLevel2Categories(level2Data.data.children);
    } else {
      setLevel2Categories([]);
    }
  }, [level2Data]);
  // Handle level 0 selection
  const handleLevel0Change = (categoryId: string) => {
    setSelectedLevel0(categoryId);
    setSelectedLevel1(undefined); // Reset lower levels
    setSelectedLevel2(undefined);
    setLevel1Categories([]);
    setLevel2Categories([]);
    onChange(null); // Clear selection since we need level 2
  };

  // Handle level 1 selection
  const handleLevel1Change = (categoryId: string) => {
    setSelectedLevel1(categoryId);
    setSelectedLevel2(undefined); // Reset level 2
    setLevel2Categories([]);
    onChange(null); // Clear selection since we need level 2
  };

  // Handle level 2 selection (final selection)
  const handleLevel2Change = (categoryId: string) => {
    setSelectedLevel2(categoryId);
    
    // Find the complete path
    const level0Category = level0Categories.find(cat => cat.id === selectedLevel0);
    const level1Category = level1Categories.find(cat => cat.id === selectedLevel1);
    const level2Category = level2Categories.find(cat => cat.id === categoryId);
    
    onChange(categoryId, {
      level0: level0Category,
      level1: level1Category,
      level2: level2Category
    });
  };

  // Initialize from existing value
  useEffect(() => {
    if (value && !selectedLevel2) {
      // We need to work backwards from the selected value to populate the hierarchy
      // This is complex as we'd need to traverse the tree, so for now we'll just show the value
      // In a real implementation, you might want to store the full path or make additional API calls
      setSelectedLevel2(value);
    }
  }, [value, selectedLevel2]);
  return (
    <div className="space-y-3">
      {/* Horizontal Layout for Category Selects */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Level 0 Categories */}
        <div>
          <Label className="text-sm font-medium">Main Category</Label>
          <Select
            value={selectedLevel0 || undefined}
            onValueChange={handleLevel0Change}
            disabled={disabled || isLoadingRoot}
          >
            <SelectTrigger className={error ? "border-red-500" : ""}>
              <SelectValue placeholder="Select main category" />
            </SelectTrigger>
            <SelectContent>
              {isLoadingRoot ? (
                <div className="flex items-center justify-center p-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="ml-2">Loading...</span>
                </div>
              ) : (
                level0Categories
                  .filter(category => category.id && category.id.trim() !== '')
                  .map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      {category.name}
                      <Badge variant="outline" className="text-xs">
                        L0
                      </Badge>
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Level 1 Categories */}
        <div>
          <Label className="text-sm font-medium">Subcategory</Label>
          <Select
            value={selectedLevel1 || undefined}
            onValueChange={handleLevel1Change}
            disabled={disabled || isLoadingLevel1 || !selectedLevel0}
          >
            <SelectTrigger className={error ? "border-red-500" : ""}>
              <SelectValue placeholder={selectedLevel0 ? "Select subcategory" : "Select main first"} />
            </SelectTrigger>
            <SelectContent>
              {isLoadingLevel1 ? (
                <div className="flex items-center justify-center p-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="ml-2">Loading...</span>
                </div>
              ) : level1Categories.length === 0 ? (
                <div className="p-2 text-sm text-muted-foreground">
                  No subcategories available
                </div>
              ) : (
                level1Categories
                  .filter(category => category.id && category.id.trim() !== '')
                  .map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      {category.name}
                      <Badge variant="outline" className="text-xs">
                        L1
                      </Badge>
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Level 2 Categories */}
        <div>
          <Label className="text-sm font-medium">Final Category *</Label>
          <Select
            value={selectedLevel2 || undefined}
            onValueChange={handleLevel2Change}
            disabled={disabled || isLoadingLevel2 || !selectedLevel1}
          >
            <SelectTrigger className={error ? "border-red-500" : ""}>
              <SelectValue placeholder={selectedLevel1 ? "Select final category" : "Select subcategory first"} />
            </SelectTrigger>
            <SelectContent>
              {isLoadingLevel2 ? (
                <div className="flex items-center justify-center p-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="ml-2">Loading...</span>
                </div>
              ) : level2Categories.length === 0 ? (
                <div className="p-2 text-sm text-muted-foreground">
                  No final categories available
                </div>
              ) : (
                level2Categories
                  .filter(category => category.id && category.id.trim() !== '')
                  .map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      {category.name}
                      <Badge variant="default" className="text-xs bg-green-600">
                        L2
                      </Badge>
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Helper Text */}
      <p className="text-xs text-muted-foreground">
        Only Level 2 categories can be assigned to products
      </p>

      {/* Selection Path Display - Compact */}
      {(selectedLevel0 || selectedLevel1 || selectedLevel2) && (
        <div className="flex items-center gap-2 flex-wrap">
          <Label className="text-xs font-medium text-muted-foreground">Path:</Label>
          {selectedLevel0 && (
            <>
              <Badge variant="outline" className="text-xs">
                {level0Categories.find(cat => cat.id === selectedLevel0)?.name}
              </Badge>
              {selectedLevel1 && <span className="text-muted-foreground">→</span>}
            </>
          )}
          {selectedLevel1 && (
            <>
              <Badge variant="outline" className="text-xs">
                {level1Categories.find(cat => cat.id === selectedLevel1)?.name}
              </Badge>
              {selectedLevel2 && <span className="text-muted-foreground">→</span>}
            </>
          )}
          {selectedLevel2 && (
            <Badge variant="default" className="text-xs bg-green-600">
              {level2Categories.find(cat => cat.id === selectedLevel2)?.name}
            </Badge>
          )}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
