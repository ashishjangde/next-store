"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { attributeValueCreateSchema } from "@/schema/attributes-schema";
import { AttributeActions } from "@/api-actions/attributes-actions";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";

interface AttributeValuesTabProps {
  attribute: Attribute;
  onUpdate: () => void;
}

export const AttributeValuesTab = ({
  attribute,
  onUpdate,
}: AttributeValuesTabProps) => {
  const { toast } = useToast();
  const [deleteValueId, setDeleteValueId] = useState<string | null>(null);
  
  // Define the form schema type explicitly
  type FormValues = z.infer<typeof attributeValueCreateSchema>;
  
  const form = useForm<FormValues>({
    resolver: zodResolver(attributeValueCreateSchema),
    defaultValues: {
      value: "",
      display_value: "",
    },
  });

  const addValueMutation = useMutation({
    mutationFn: (data: FormValues) => {
      return AttributeActions.addAttributeValue(attribute.id, data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Value added successfully",
      });
      form.reset();
      onUpdate();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to add value",
        variant: "destructive",
      });
    },
  });

  const deleteValueMutation = useMutation({
    mutationFn: (valueId: string) => {
      return AttributeActions.deleteAttributeValue(valueId);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Value deleted successfully",
      });
      setDeleteValueId(null);
      onUpdate();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to delete value",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    addValueMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Value</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Value</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. red, large, cotton" {...field} />
                      </FormControl>
                      <FormDescription>
                        The internal value used for filtering and queries
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="display_value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Value (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Red, Large, Cotton" {...field} />
                      </FormControl>
                      <FormDescription>
                        How the value should be displayed to customers. If not provided, the value will be used.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={addValueMutation.isPending}
                >
                  {addValueMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  <Plus className="mr-2 h-4 w-4" />
                  Add Value
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Attribute Values</CardTitle>
        </CardHeader>
        <CardContent>
          {attribute.values && attribute.values.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Value</TableHead>
                  <TableHead>Display Value</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attribute.values.map((value) => (
                  <TableRow key={value.id}>
                    <TableCell className="font-medium">{value.value}</TableCell>
                    <TableCell>{value.display_value || value.value}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setDeleteValueId(value.id)}
                        className="h-8 w-8 text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete value</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-6">
              <span className="text-muted-foreground">No values have been added to this attribute yet.</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Value Confirmation Dialog */}
      <Dialog 
        open={!!deleteValueId} 
        onOpenChange={(open) => !open && setDeleteValueId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Value</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this value? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteValueId(null)}
              disabled={deleteValueMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteValueId && deleteValueMutation.mutate(deleteValueId)}
              disabled={deleteValueMutation.isPending}
            >
              {deleteValueMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
