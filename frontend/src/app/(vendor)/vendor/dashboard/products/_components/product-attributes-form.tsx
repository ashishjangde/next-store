"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ProductActions } from "@/api-actions/product-actions";
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

interface ProductAttributesFormProps {
  product: Product;
}

export const ProductAttributesForm = ({ product }: ProductAttributesFormProps) => {
  const queryClient = useQueryClient();
  const [selectedAttributeValue, setSelectedAttributeValue] = useState("");
  const [loading, setLoading] = useState(false);
  // Group existing product attribute values by attribute name
  const existingAttributes = product.ProductAttribute || [];
  const groupedAttributes: Record<string, { attribute_id: string; values: AttributeValue[] }> = {};
  
  existingAttributes.forEach((attr) => {
    if (attr.AttributeValue?.Attribute?.name) {
      const attrName = attr.AttributeValue.Attribute.name;
      
      if (!groupedAttributes[attrName]) {
        groupedAttributes[attrName] = {
          attribute_id: attr.AttributeValue.Attribute.id,
          values: [],
        };
      }
      
      // Add the attribute value to the group if it exists
      if (attr.AttributeValue) {
        groupedAttributes[attrName].values.push(attr.AttributeValue);
      }
    }
  });

  // Fetch all available attributes
  const { data: attributesData } = useQuery({
    queryKey: ["attributes"],
    queryFn: async () => {
      // Assuming you have an AttributeActions API service or you can use a general API call here
      const response = await fetch("/api/attributes");
      const data = await response.json();
      return data;
    },
    enabled: false, // Temporarily disabled until we have the actual API
  });
  
  // For now, let's use static data as a placeholder
  const availableAttributes = [
    {
      id: "1",
      name: "Color",
      values: [
        { id: "101", value: "Red" },
        { id: "102", value: "Blue" },
        { id: "103", value: "Green" },
      ]
    },
    {
      id: "2",
      name: "Size",
      values: [
        { id: "201", value: "Small" },
        { id: "202", value: "Medium" },
        { id: "203", value: "Large" },
      ]
    },
    {
      id: "3",
      name: "Material",
      values: [
        { id: "301", value: "Cotton" },
        { id: "302", value: "Polyester" },
        { id: "303", value: "Wool" },
      ]
    }
  ];

  // Add attribute to product
  const { mutate: addAttribute } = useMutation({
    mutationFn: ({ productId, attributeValueId }: { productId: string, attributeValueId: string }) => {
      return ProductActions.addAttributeToProduct(productId, attributeValueId);
    },
    onSuccess: () => {
      toast.success("Attribute added successfully");
      queryClient.invalidateQueries({ queryKey: ["product", product.id] });
      setSelectedAttributeValue("");
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
      queryClient.invalidateQueries({ queryKey: ["product", product.id] });
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
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4">
          <Select 
            value={selectedAttributeValue} 
            onValueChange={setSelectedAttributeValue}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an attribute value" />
            </SelectTrigger>
            <SelectContent>
              {availableAttributes.map((attribute) => (
                <SelectGroup key={attribute.id}>
                  <SelectLabel>{attribute.name}</SelectLabel>
                  {attribute.values.map((value) => (
                    <SelectItem key={value.id} value={value.id}>
                      {value.value}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleAddAttribute} disabled={!selectedAttributeValue || loading}>
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
