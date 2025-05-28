
import { VendorDashboard } from "@/app/(admin)/admin/vendors/_components/vendor-dashboard"

export default function VendorsPage() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-2">Vendor Management</h1>
        <p className="text-muted-foreground mb-4">Manage and monitor all your vendor relationships</p>
        <VendorDashboard />
      </div>
    </div>
  )
}
