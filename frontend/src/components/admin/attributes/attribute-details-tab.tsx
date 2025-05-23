"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

interface AttributeDetailsTabProps {
  attribute: Attribute;
}

export const AttributeDetailsTab = ({ attribute }: AttributeDetailsTabProps) => {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold text-muted-foreground">Name</p>
              <p>{attribute.name}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-muted-foreground">Data Type</p>
              <p className="capitalize">{attribute.type}</p>
            </div>
          </div>
          
          <div>
            <p className="text-sm font-semibold text-muted-foreground">Description</p>
            <p>{attribute.description || "No description provided."}</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold text-muted-foreground">ID</p>
              <p className="text-xs font-mono">{attribute.id}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-muted-foreground">Values Count</p>
              <p>{attribute.values?.length || 0}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold text-muted-foreground">Created</p>
              <p>{formatDate(attribute.created_at)}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-muted-foreground">Last Updated</p>
              <p>{formatDate(attribute.updated_at)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
