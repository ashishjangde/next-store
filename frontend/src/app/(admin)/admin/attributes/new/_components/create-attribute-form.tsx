"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { attributeCreateSchema } from "@/schema/attributes-schema";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { AttributeActions } from "@/api-actions/attributes-actions";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type FormValues = z.infer<typeof attributeCreateSchema>;

export const CreateAttributeForm = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [isAddingValues, setIsAddingValues] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(attributeCreateSchema) as any,
    defaultValues: {
      name: "",
      description: "",
      type: "string",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: FormValues) => {
      return AttributeActions.createAttribute(data);
    },
    onSuccess: (response) => {
      toast({
        title: "Success",
        description: "Attribute created successfully",
      });
      
      if (isAddingValues && response.data) {
        // Navigate to the attribute detail page to add values
        router.push(`/admin/attributes/${response.data.id}`);
      } else {
        // Navigate back to the attributes list
        router.push("/admin/attributes");
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to create attribute",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    createMutation.mutate(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attribute Information</CardTitle>
        <CardDescription>
          Define a new attribute for your products. Attributes can be used to specify product characteristics.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-8">
            <FormField
              control={form.control as any}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Color, Size, Material" {...field} />
                  </FormControl>
                  <FormDescription>
                    The name of the attribute as it will appear to administrators
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control as any}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe the purpose of this attribute"
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Provide additional context about this attribute
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control as any}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    The data type determines what kind of values can be assigned
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setIsAddingValues(true);
                  form.handleSubmit(onSubmit as any)();
                }}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending && isAddingValues && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create & Add Values
              </Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending}
              >
                {createMutation.isPending && !isAddingValues && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Attribute
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
