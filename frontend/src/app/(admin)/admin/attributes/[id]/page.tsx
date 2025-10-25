import { Metadata } from "next";
import { AttributeActions } from "@/api-actions/attributes-actions";
import { notFound } from "next/navigation";
import { AttributeDetailClient } from "./_components/attribute-detail-client";


export const metadata: Metadata = {
  title: "Attribute Details | Admin Dashboard",
  description: "View and manage attribute details and values",
};

interface AttributeDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function AttributeDetailPage({ params }: AttributeDetailPageProps) {
  const { id } = await params;
  // Fetch the attribute data server-side for initial render
  try {
    const response = await AttributeActions.getAttributeById(id, true);
    // Make sure we have a valid attribute to pass
    if (!response.data) {
      return notFound();
    }
    return <AttributeDetailClient initialAttribute={response.data} />;
  } catch (error) {
    return notFound();
  }
}
