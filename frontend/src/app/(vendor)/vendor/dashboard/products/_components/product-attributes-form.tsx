"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ProductActions } from "@/api-actions/product-actions";
import { CategoryActions } from "@/api-actions/categories-actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { X, Loader2 } from "lucide-react";
import { Product } from "@/types/product";

interface ProductAttributesFormProps {
  product: Product;
}

export const ProductAttributesForm = ({ product }: ProductAttributesFormProps) => {
  const queryClient = useQueryClient();
  const [selectedAttribute, setSelectedAttribute] = useState("");
  const [selectedAttributeValue, setSelectedAttributeValue] = useState("");
  const [loading, setLoading] = useState(false);

  // Group existing product attribute values by attribute name
  const existingAttributes = product.attributes || [];
  const groupedAttributes: Record<string, { attribute_id: string; values: any[] }> = {};
  
  existingAttributes.forEach((attr: any) => {
    if (attr.name) {
      const attrName = attr.name;
      
      if (!groupedAttributes[attrName]) {
        groupedAttributes[attrName] = {
          attribute_id: attr.id,
          values: [],
        };
      }
      
      // Add the attribute value to the group
      groupedAttributes[attrName].values.push({
        id: attr.id,
        value: attr.value,
        display_value: attr.display_value || attr.value,
      });
    }
  });

  // Fetch category attributes
  const { data: categoryData, isLoading: isLoadingCategory } = useQuery({
    queryKey: ["category", product.category?.id],
    queryFn: async () => {
      const response = await CategoryActions.getCategoryById(
        product.category?.id!,
        false,
        true // includeAttributes
      );
      return response.data;
    },
    enabled: !!product.category?.id, // Only run if category ID is available
  });

  // Get category attributes
  const categoryAttributes = categoryData?.attributes || [];
  
  // Add attribute to product
  const { mutate: addAttribute } = useMutation({
    mutationFn: ({ productId, attributeValueId }: { productId: string, attributeValueId: string }) => {
      return ProductActions.addAttributeToProduct(productId, attributeValueId);
    },    
    onSuccess: () => {
      toast.success("Attribute added successfully");
      // Invalidate and refetch the product query immediately
      queryClient.invalidateQueries({ 
        queryKey: ["product", product.id],
        refetchType: 'active'
      });
      // Also refetch to ensure immediate update
      queryClient.refetchQueries({ 
        queryKey: ["product", product.id]
      });
      setSelectedAttributeValue("");
      setSelectedAttribute("");
    },
    onError: (error) => {
      console.error("Error adding attribute:", error);
      toast.error("Failed to add attribute");
    },
  });

  // Remove attribute from product
  const { mutate: removeAttribute } = useMutation({
    mutationFn: ({ productId, attributeValueId }: { productId: string, attributeValueId: string }) => {
      return ProductActions.removeAttributeFromProduct(productId, attributeValueId);
    },
    onSuccess: () => {
      toast.success("Attribute removed successfully");
      // Invalidate and refetch the product query immediately
      queryClient.invalidateQueries({ 
        queryKey: ["product", product.id],
        refetchType: 'active'
      });
      // Also refetch to ensure immediate update
      queryClient.refetchQueries({ 
        queryKey: ["product", product.id]
      });
    },
    onError: (error) => {
      console.error("Error removing attribute:", error);
      toast.error("Failed to remove attribute");
    },
  });

  const handleAddAttribute = () => {
    if (!selectedAttributeValue) return;
    addAttribute({ productId: product.id, attributeValueId: selectedAttributeValue });
  };

  const handleRemoveAttribute = (attributeValueId: string) => {
    removeAttribute({ productId: product.id, attributeValueId });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Attributes</CardTitle>
        <CardDescription>
          Add attributes to your product to define variants and specifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4">
          {/* First Select: Choose Attribute Type */}
          <Select 
            value={selectedAttribute} 
            onValueChange={(value) => {
              setSelectedAttribute(value);
              setSelectedAttributeValue(""); // Reset value selection when attribute changes
            }}
            disabled={isLoadingCategory}
          >
            <SelectTrigger>
              <SelectValue placeholder={isLoadingCategory ? "Loading attributes..." : "Select attribute type"} />
            </SelectTrigger>
            <SelectContent>
              {isLoadingCategory ? (
                <div className="flex items-center justify-center py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="ml-2">Loading attributes...</span>
                </div>
              ) : categoryAttributes.length === 0 ? (
                <div className="py-2 px-4 text-sm text-muted-foreground">
                  No attributes available for this category
                </div>
              ) : (
                categoryAttributes.map((categoryAttr) => (
                  <SelectItem key={categoryAttr.attribute_id} value={categoryAttr.attribute_id}>
                    {categoryAttr.attribute?.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          
          {/* Second Select: Choose Attribute Value */}
          <Select
            value={selectedAttributeValue} 
            onValueChange={setSelectedAttributeValue}
            disabled={!selectedAttribute || isLoadingCategory}
          >
            <SelectTrigger>
              <SelectValue placeholder={!selectedAttribute ? "Select attribute type first" : "Select value"} />
            </SelectTrigger>
            <SelectContent>
              {!selectedAttribute ? (
                <div className="py-2 px-4 text-sm text-muted-foreground">
                  Please select an attribute type first
                </div>
              ) : (
                (() => {
                  const selectedCategoryAttr = categoryAttributes.find(
                    attr => attr.attribute_id === selectedAttribute
                  );
                  const selectedAttr = selectedCategoryAttr?.attribute;
                  
                  if (!selectedAttr || !selectedAttr.values || selectedAttr.values.length === 0) {
                    return (
                      <div className="py-2 px-4 text-sm text-muted-foreground">
                        No values available for this attribute
                      </div>
                    );
                  }
                  return selectedAttr.values.map((value) => (
                    <SelectItem key={value.id} value={value.id}>
                      {value.display_value || value.value}
                    </SelectItem>
                  ));
                })()
              )}
            </SelectContent>
          </Select>
          
          <Button onClick={handleAddAttribute} disabled={!selectedAttributeValue || loading || isLoadingCategory}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Add Attribute
          </Button>
        </div>
        
        <Separator />
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Current Attributes</h3>
          {Object.entries(groupedAttributes).length === 0 && (
            <p className="text-sm text-muted-foreground">This product has no attributes yet.</p>
          )}
          
          {Object.entries(groupedAttributes).map(([name, { values }]) => (
            <div key={name} className="space-y-2">
              <h4 className="text-sm font-medium">{name}</h4>
              <div className="flex flex-wrap gap-2">
                {values.map((value) => (
                  <Badge key={value.id} variant="secondary" className="flex items-center gap-1 pl-2">
                    {value.value}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0 rounded-full"
                      onClick={() => handleRemoveAttribute(value.id)}
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove {value.value}</span>
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="border-t px-6 py-4">
        <p className="text-xs text-muted-foreground">
          Attributes are used to create product variants and can be displayed as specifications in the product page.
        </p>
      </CardFooter>
    </Card>
  );
};
