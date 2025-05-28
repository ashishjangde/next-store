import { Metadata } from "next";
import { AttributesClient } from "@/app/(admin)/admin/dashboard/attributes/_components/attributes-client";

export const metadata: Metadata = {
  title: "Attributes Management | Admin Dashboard",
  description: "Manage product attributes including creation, updating, and value assignment",
};

export default async function AttributesPage() {
  return <AttributesClient />;
}
