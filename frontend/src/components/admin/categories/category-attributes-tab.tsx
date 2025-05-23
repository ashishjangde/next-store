"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryActions } from "@/api-actions/categories-actions";
import { AttributeActions } from "@/api-actions/attributes-actions";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, X, AlertCircle, Tag, Search, Check } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDebounce } from "@/hooks/use-debounce";
import { Label } from "@/components/ui/label";

interface CategoryAttributesTabProps {
  category: Category;
  onUpdate: () => void;
}

export const CategoryAttributesTab = ({
  category,
  onUpdate,
}: CategoryAttributesTabProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [attributeToDelete, setAttributeToDelete] = useState<string | null>(null);
  const [deletingAttributeName, setDeletingAttributeName] = useState<string>("");
  
  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [selectedAttributes, setSelectedAttributes] = useState<{id: string, name: string, required: boolean}[]>([]);

  // Pagination states
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [attributesList, setAttributesList] = useState<Attribute[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const pageSize = 20;
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Get attributes with pagination
  const { data: attributesResponse, isLoading: isLoadingAttributes, isFetching } = useQuery({
    queryKey: ["attributes", page, debouncedSearch],
    queryFn: async () => {
      try {
        return await AttributeActions.getAllAttributes(page, pageSize, debouncedSearch);
      } catch (error) {
        console.error("Error fetching attributes:", error);
        return { data: { data: [], total: 0, current_page: 1, per_page: pageSize } };
      }
    },
  });

  // Update attributesList when data changes
  useEffect(() => {
    if (attributesResponse?.data?.data) {
      if (page === 1) {
        setAttributesList(attributesResponse?.data?.data || []);
      } else {
        setAttributesList(prev => [...prev, ...(attributesResponse?.data?.data || [])]);
      }
      
      // Check if we've reached the end of the data
      const total = attributesResponse?.data?.total || 0;
      const currentLoaded = page * pageSize;
      setHasMore(currentLoaded < total);
      setIsLoadingMore(false);
    }
  }, [attributesResponse, page, pageSize]);

  // Reset pagination when search term changes
  useEffect(() => {
    setPage(1);
    setAttributesList([]);
    setHasMore(true);
    setIsLoadingMore(false);
  }, [debouncedSearch]);

  // Infinite scroll handler
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
    
    // Load more when user scrolls to 90% of the content
    if (scrollPercentage > 0.9 && hasMore && !isFetching && !isLoadingMore) {
      setIsLoadingMore(true);
      setPage(prev => prev + 1);
    }
  }, [hasMore, isFetching, isLoadingMore]);

  // Safe access to attributes array with fallback
  const allAttributes = attributesList || [];
  
  // Filter attributes that are not already assigned to the category
  const categoryAttributeIds = (category.attributes || []).map(attr => attr.attribute_id);
  const availableAttributes = allAttributes.filter(
    attr => !categoryAttributeIds.includes(attr.id)
  );

  // Add attribute mutation
  const addAttributeMutation = useMutation({
    mutationFn: async (data: {attributeId: string, required: boolean}) => {
      return CategoryActions.addAttributeToCategory(
        category.id,
        data.attributeId,
        data.required
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["category", category.id] });
      queryClient.invalidateQueries({ queryKey: ["categoryById", category.id] });
      onUpdate();
    },
    onError: (error: any) => {
      console.error("Error adding attribute:", error);
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to add attribute",
        variant: "destructive",
      });
    },
  });

  // Remove attribute mutation
  const removeAttributeMutation = useMutation({
    mutationFn: (attributeId: string) => {
      return CategoryActions.removeAttributeFromCategory(category.id, attributeId);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Attribute removed from category",
        variant: "default",
      });
      
      queryClient.invalidateQueries({ queryKey: ["category", category.id] });
      queryClient.invalidateQueries({ queryKey: ["categoryById", category.id] });
      
      onUpdate();
      setAttributeToDelete(null);
      setDeletingAttributeName("");
    },
    onError: (error: any) => {
      console.error("Error removing attribute:", error);
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to remove attribute",
        variant: "destructive",
      });
      setAttributeToDelete(null);
      setDeletingAttributeName("");
    },
  });
  
  // Safely get category attributes with null checks
  const categoryAttributes = category.attributes || [];
  
  const handleAddSelectedAttributes = async () => {
    if (selectedAttributes.length === 0) {
      toast({
        title: "No attributes selected",
        description: "Please select at least one attribute",
        variant: "destructive",
      });
      return;
    }

    // Show loading toast
    toast({
      title: "Adding attributes",
      description: `Adding ${selectedAttributes.length} attributes...`,
    });

    // Add attributes one by one
    for (const attr of selectedAttributes) {
      try {
        await addAttributeMutation.mutateAsync({
          attributeId: attr.id,
          required: attr.required
        });
      } catch (error) {
        console.error(`Failed to add attribute ${attr.name}:`, error);
      }
    }

    // Clear selections after adding
    setSelectedAttributes([]);
    setIsAddDialogOpen(false);
    setSearchTerm("");
    toast({
      title: "Success",
      description: `Added ${selectedAttributes.length} attributes to category`,
    });
  };

  const toggleAttributeSelection = (attribute: Attribute, isSelected: boolean) => {
    if (isSelected) {
      setSelectedAttributes(selectedAttributes.filter(a => a.id !== attribute.id));
    } else {
      setSelectedAttributes([...selectedAttributes, {
        id: attribute.id,
        name: attribute.name,
        required: false
      }]);
    }
  };

  const toggleRequired = (attributeId: string) => {
    setSelectedAttributes(selectedAttributes.map(attr => 
      attr.id === attributeId ? {...attr, required: !attr.required} : attr
    ));
  };

  const handleDeleteClick = (attributeId: string, attributeName: string) => {
    setAttributeToDelete(attributeId);
    setDeletingAttributeName(attributeName);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (attributeToDelete) {
      removeAttributeMutation.mutate(attributeToDelete);
    }
    setIsDeleteDialogOpen(false);
  };

  return (
    <div className="space-y-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-medium flex items-center">
            <Tag className="h-5 w-5 mr-2" />
            Category Attributes
          </CardTitle>
          
          <Button 
            className="bg-primary hover:bg-primary/90"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Attributes
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Attributes table */}
          <div className="rounded-md border shadow-sm">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[200px]">Name</TableHead>
                  <TableHead>Display Name</TableHead>
                  <TableHead className="w-[120px]">Type</TableHead>
                  <TableHead className="w-[100px]">Required</TableHead>
                  <TableHead className="w-[100px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categoryAttributes.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-24 text-center"
                    >
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <AlertCircle className="h-10 w-10 text-muted-foreground/50 mb-2" />
                        <span>No attributes assigned to this category.</span>
                        <span className="text-sm">Click the &quot;Add Attributes&quot; button above to assign attributes.</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  categoryAttributes.map((catAttr) => (
                    <TableRow key={catAttr.attribute_id} className="hover:bg-muted/30">
                      <TableCell className="font-medium">
                        {catAttr.attribute?.name || 'Unknown'}
                      </TableCell>
                      <TableCell>
                        {catAttr.attribute?.display_name || catAttr.attribute?.name || 'Unknown'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {catAttr.attribute?.type || 'Unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {catAttr.required ? (
                          <Badge variant="default" className="bg-green-500 hover:bg-green-600">Required</Badge>
                        ) : (
                          <Badge variant="outline">Optional</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <HoverCard>
                          <HoverCardTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleDeleteClick(
                                catAttr.attribute_id, 
                                catAttr.attribute?.name || 'this attribute'
                              )}
                              disabled={removeAttributeMutation.isPending && attributeToDelete === catAttr.attribute_id}
                            >
                              {removeAttributeMutation.isPending && attributeToDelete === catAttr.attribute_id ? (
                                <Loader2 className="h-4 w-4 animate-spin text-red-500" />
                              ) : (
                                <X className="h-4 w-4 text-red-500" />
                              )}
                              <span className="sr-only">Remove</span>
                            </Button>
                          </HoverCardTrigger>
                          <HoverCardContent className="w-auto p-2">
                            <span className="text-xs">Remove attribute</span>
                          </HoverCardContent>
                        </HoverCard>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Attributes Dialog - Moved outside of Card */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px] h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Add Attributes to Category</DialogTitle>
            <DialogDescription>
              Select attributes to add to this category. Products in this category will inherit these attributes.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 flex flex-col min-h-0 space-y-4">
            {/* Search input */}
            <div className="relative flex-shrink-0">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search attributes..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Attributes selection list with ScrollArea and infinite scroll */}
            <div className="flex-1 min-h-0 border rounded-md">
              {isLoadingAttributes && page === 1 ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>Loading attributes...</span>
                </div>
              ) : availableAttributes.length === 0 && !isLoadingAttributes ? (
                <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
                  <AlertCircle className="h-10 w-10 mb-2 text-muted-foreground/50" />
                  {debouncedSearch ? 
                    <span>No attributes matching &quot;{debouncedSearch}&quot;</span> : 
                    <span>All attributes have already been added to this category</span>
                  }
                </div>
              ) : (
                <ScrollArea 
                  className="h-full" 
                  ref={scrollAreaRef}
                  onScrollCapture={handleScroll}
                >
                  <div className="divide-y">
                    {availableAttributes.map((attribute) => {
                      const isSelected = selectedAttributes.some(a => a.id === attribute.id);
                      const isRequired = selectedAttributes.find(a => a.id === attribute.id)?.required || false;
                      
                      return (
                        <div 
                          key={attribute.id} 
                          className={`p-3 hover:bg-muted/50 ${isSelected ? 'bg-primary/5' : ''} flex items-center justify-between`}
                        >
                          <div 
                            className="flex items-center cursor-pointer"
                            onClick={() => toggleAttributeSelection(attribute, isSelected)}
                          >
                            <div className="flex-1">
                              <div className="flex items-center">
                                <span className="font-medium">{attribute.name}</span>
                                {isSelected && (
                                  <Check className="h-4 w-4 text-primary ml-2" />
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {attribute.description || `Type: ${attribute.type}`}
                              </p>
                            </div>
                          </div>
                          
                          {isSelected && (
                            <div className="flex items-center justify-between mr-3 gap-2">
                              <Checkbox
                                id={`required-${attribute.id}`}
                                checked={isRequired}
                                onCheckedChange={() => toggleRequired(attribute.id)}
                                className="cursor-pointer"
                              />
                              <Label
                                htmlFor={`required-${attribute.id}`}
                                className="text-sm font-medium leading-none cursor-pointer"
                              >
                                Required
                              </Label>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    
                    {/* Loading indicator for infinite scroll */}
                    {(isLoadingMore || (isFetching && page > 1)) && (
                      <div className="flex items-center justify-center p-4">
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        <span className="text-sm text-muted-foreground">Loading more attributes...</span>
                      </div>
                    )}
                    
                    {/* End of list indicator */}
                    {!hasMore && availableAttributes.length > 0 && !isLoadingAttributes && (
                      <div className="text-center py-4">
                        <span className="text-sm text-muted-foreground">All attributes loaded</span>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              )}
            </div>
            
            {/* Selected attributes summary */}
            {selectedAttributes.length > 0 && (
              <div className="flex-shrink-0 bg-muted/30 p-3 rounded-md">
                <h4 className="text-sm font-medium mb-2">Selected attributes: {selectedAttributes.length}</h4>
                <ScrollArea className="max-h-20">
                  <div className="flex flex-wrap gap-2">
                    {selectedAttributes.map((attr) => (
                      <Badge 
                        key={attr.id} 
                        variant="outline" 
                        className={`${attr.required ? 'border-green-600 text-green-600' : ''}`}
                      >
                        {attr.name}
                        {attr.required && " (Required)"}
                        <X 
                          className="ml-1 h-3 w-3 cursor-pointer hover:text-destructive" 
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleAttributeSelection({id: attr.id, name: attr.name} as Attribute, true);
                          }}
                        />
                      </Badge>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
          
          <DialogFooter className="flex-shrink-0 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddDialogOpen(false);
                setSelectedAttributes([]);
                setSearchTerm("");
                setPage(1);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddSelectedAttributes}
              disabled={selectedAttributes.length === 0 || addAttributeMutation.isPending}
            >
              {addAttributeMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Add {selectedAttributes.length} {selectedAttributes.length === 1 ? 'Attribute' : 'Attributes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">
              Remove Attribute
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <span className="font-semibold">{deletingAttributeName}</span> from this category? 
              This will not delete the attribute itself, but products in this category will no longer 
              have this attribute available.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete} 
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Remove Attribute
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};