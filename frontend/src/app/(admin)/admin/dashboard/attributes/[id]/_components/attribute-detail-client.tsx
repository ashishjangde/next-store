"use client";

import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AttributeActions } from "@/api-actions/attributes-actions";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { LoadingPage } from "@/components/common/loading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { EditAttributeModal } from "../../../categories/[categoryId]/_components/edit-attribute-modal";
import { AttributeDeleteDialog } from "../../_components/attribute-delete-dialog";
import { AttributeDetailsTab } from "./attribute-details-tab";
import { AttributeValuesTab } from "./attribute-values-tab";
import { Badge } from "@/components/ui/badge";

interface AttributeDetailClientProps {
  initialAttribute: Attribute;
}

export const AttributeDetailClient = ({ 
  initialAttribute 
}: AttributeDetailClientProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  // Fetch the latest attribute data with proper error handling
  const { data: attributeData, isLoading, isError, error } = useQuery({
    queryKey: ["attribute", initialAttribute.id],
    queryFn: async () => {
      try {
        const response = await AttributeActions.getAttributeById(initialAttribute.id, true);
        return response;
      } catch (error) {
        console.error("Error fetching attribute:", error);
        throw error;
      }
    },
  });

  // Better error and loading handling
  if (isLoading) {
    return <LoadingPage />;
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="text-red-500 text-xl mb-4">Error loading attribute</div>
        <div className="text-muted-foreground">{(error as any)?.message || "Failed to load attribute details"}</div>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => router.push("/admin/dashboard/attributes")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Attributes
        </Button>
      </div>
    );
  }

  const attribute = attributeData?.data || initialAttribute;

  const handleUpdateSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["attribute", attribute.id] });
    queryClient.invalidateQueries({ queryKey: ["attributes"] });
  };

  return (
    <>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <PageHeader
          title={
            <div className="flex items-center gap-2">
              {attribute.name}
              <Badge variant="outline" className="capitalize">
                {attribute.type}
              </Badge>
            </div>
          }
          description={attribute.description || "No description provided"}
          actions={
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => router.push("/admin/dashboard/attributes")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <EditAttributeModal
                attribute={attribute}
                onUpdate={handleUpdateSuccess}
              >
                <Button variant="outline">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </EditAttributeModal>
              <AttributeDeleteDialog 
                attribute={attribute} 
                onSuccess={() => router.push("/admin/dashboard/attributes")}
              >
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </AttributeDeleteDialog>
            </div>
          }
        />

        <Tabs defaultValue="details" className="space-y-4">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="values">Values</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4">
            <AttributeDetailsTab attribute={attribute} />
          </TabsContent>
          
          <TabsContent value="values" className="space-y-4">
            <AttributeValuesTab 
              attribute={attribute} 
              onUpdate={handleUpdateSuccess}
            />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};
