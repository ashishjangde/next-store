import { Metadata } from "next";
import { PageHeader } from "@/components/common/page-header";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CreateAttributeForm } from "./_components/create-attribute-form";

export const metadata: Metadata = {
  title: "Create New Attribute | Admin Dashboard",
  description: "Create a new product attribute for your store",
};

export default function CreateAttributePage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <PageHeader 
        title="Create New Attribute"
        description="Add a new attribute to your product catalog"
        actions={
          <Button variant="outline" asChild>
            <Link href="/admin/dashboard/attributes">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Attributes
            </Link>
          </Button>
        }
      />
      
      <CreateAttributeForm />
    </div>
  );
}
