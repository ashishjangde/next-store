"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { attributeUpdateSchema } from "@/schema/attributes-schema";
import { AttributeActions } from "@/api-actions/attributes-actions";
import { z } from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EditAttributeModalProps {
  children?: React.ReactNode;
  attribute: Attribute;
  onUpdate: () => void;
}

// Define valid attribute types
type AttributeType = "string" | "number" | "boolean" | "date";

export const EditAttributeModal = ({
  children,
  attribute,
  onUpdate,
}: EditAttributeModalProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  
  type UpdateFormValues = z.infer<typeof attributeUpdateSchema>;
  
  const form = useForm<UpdateFormValues>({
    resolver: zodResolver(attributeUpdateSchema),
    defaultValues: {
      name: "",
      description: "",
      type: "string" as AttributeType,
    },
  });

  // Reset form when attribute changes and dialog opens
  useEffect(() => {
    if (open && attribute) {
      form.reset({
        name: attribute.name,
        description: attribute.description || "",
        // Ensure attribute.type is cast to one of the valid types
        type: (attribute.type as AttributeType) || "string",
      });
    }
  }, [attribute, form, open]);

  const updateMutation = useMutation({
    mutationFn: (data: UpdateFormValues) => {
      return AttributeActions.updateAttribute(attribute.id, data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Attribute updated successfully",
      });
      setOpen(false);
      onUpdate();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to update attribute",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: UpdateFormValues) => {
    updateMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Attribute: {attribute?.name}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Attribute name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Attribute description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data Type</FormLabel>
                  <Select
                    onValueChange={(value: AttributeType) => field.onChange(value)}
                    value={field.value as AttributeType || "string"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a data type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="string">Text (string)</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="boolean">Yes/No (boolean)</SelectItem>
                      <SelectItem value="date">Date</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Changing the data type may affect existing values
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
