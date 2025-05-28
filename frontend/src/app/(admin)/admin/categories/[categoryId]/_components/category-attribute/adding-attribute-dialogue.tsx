"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, X, AlertCircle, Search, Check } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Label } from "@/components/ui/label";

interface AddingAttributeDialogueProps {
  isAddDialogOpen: boolean;
  setIsAddDialogOpen: (open: boolean) => void;
  selectedAttributes: {id: string, name: string, required: boolean}[];
  setSelectedAttributes: (attributes: {id: string, name: string, required: boolean}[]) => void;
  availableAttributes: Attribute[];
  isLoadingAttributes: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  page: number;
  setPage: (page: number) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  debouncedSearch: string;
  scrollAreaRef: React.RefObject<HTMLDivElement>;
  handleScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  addAttributeMutation: {
    isPending: boolean;
  };
  toggleAttributeSelection: (attribute: Attribute, isSelected: boolean) => void;
  toggleRequired: (attributeId: string) => void;
  isFetching: boolean;
  handleAddSelectedAttributes: () => void;
}

export default function AddingAttributeDialogue({
  isAddDialogOpen,
  setIsAddDialogOpen,
  selectedAttributes,
  setSelectedAttributes,
  availableAttributes,
  isLoadingAttributes,
  isLoadingMore,
  hasMore,
  page,
  setPage,
  searchTerm,
  setSearchTerm,
  debouncedSearch,
  scrollAreaRef,
  handleScroll,
  addAttributeMutation,
  toggleAttributeSelection,
  toggleRequired,
  isFetching,
  handleAddSelectedAttributes,
}: AddingAttributeDialogueProps) {
  return (
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
                        className={`p-3 hover:bg-muted/50 cursor-pointer ${isSelected ? 'bg-primary/5' : ''}`}
                        onClick={() => toggleAttributeSelection(attribute, isSelected)}
                      >
                        <div className="flex items-center justify-between">
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
                          
                          {isSelected && (
                            <div 
                              className="flex items-center space-x-2 bg-white dark:bg-slate-800 p-2 rounded-md shadow-sm"
                              onClick={(e) => { 
                                e.stopPropagation();
                                toggleRequired(attribute.id);
                              }}
                            >
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
  );
}
