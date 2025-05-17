import React from "react"
import { format, parseISO } from "date-fns"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building2, Mail, Phone, Calendar, Tag, FileText, CheckCircle, XCircle, AlertTriangle, Trash, MapPin, CreditCard } from "lucide-react"
import { VendorDeleteDialog } from "./vendor-delete-dialog"
import { VendorStatusChangeDialog } from "./vendor-status-change-dialog"

// Utility function to format dates with date-fns for Indian Standard Time
const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  try {
    const date = parseISO(dateString);
    // Format: 15 Jan 2023, 2:30 PM (Indian format with time)
    return format(date, 'd MMM yyyy, h:mm a');
  } catch (error) {
    return "Invalid Date";
  }
}

interface InlineVendorDetailsDialogProps {
  vendor: IVendor
  children: React.ReactNode
  onAccept?: (id: string) => void
  onReject?: (id: string) => void
  onDelete?: (id: string) => void
  onStatusChange?: (id: string, status: string) => void
  isLoading?: boolean
}

export function InlineVendorDetailsDialog({ 
  vendor, 
  children, 
  onAccept, 
  onReject, 
  onDelete, 
  onStatusChange,
  isLoading = false 
}: InlineVendorDetailsDialogProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader className="mb-6">
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-xl">{vendor.User?.name || 'Vendor'}</DialogTitle>
              <DialogDescription className="text-base font-medium mt-1">
                {vendor.shop_name}
              </DialogDescription>
            </div>            <div className="flex gap-2">
              {(onStatusChange || onAccept || onReject) && (
                <VendorStatusChangeDialog
                  vendor={vendor}
                  onAction={(id, status) => {
                    if (onStatusChange) {
                      onStatusChange(id, status);
                    } else if (status === "APPROVED" && onAccept) {
                      onAccept(id);
                    } else if ((status === "REJECTED" || status === "SUSPENDED") && onReject) {
                      onReject(id);
                    }
                    setOpen(false);
                  }}
                  isLoading={isLoading}
                >
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="border-primary text-primary hover:bg-primary/10" 
                  >
                    Change Status
                  </Button>
                </VendorStatusChangeDialog>
              )}
              
              {onDelete && (
                <VendorDeleteDialog vendor={vendor} onDelete={onDelete} isLoading={isLoading || false}>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-red-600 hover:bg-red-50 hover:text-red-700 mr-5"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </VendorDeleteDialog>
              )}
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">          {/* Status Banner */}
          <div className="flex items-center px-4 py-3 rounded-md bg-muted">
            <div className={`h-3 w-3 rounded-full mr-3 flex-shrink-0 ${
              vendor.status === "APPROVED" ? "bg-green-500" : 
              vendor.status === "PENDING" ? "bg-amber-500" : 
              vendor.status === "REJECTED" ? "bg-red-500" : "bg-orange-500"
            }`}>
            </div>
            <div className="font-medium">Status:</div>
            <div className="ml-2">
              {vendor.status === "APPROVED" && <Badge variant="success">Active</Badge>}
              {vendor.status === "PENDING" && <Badge variant="warning">Pending</Badge>}
              {vendor.status === "REJECTED" && <Badge variant="destructive">Rejected</Badge>}
              {vendor.status === "SUSPENDED" && <Badge variant="suspended">Suspended</Badge>}
            </div>
          </div>
          
          {/* General Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Vendor Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-2">
                <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Company</p>
                  <p className="text-sm text-muted-foreground">{vendor.shop_name}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{vendor.User?.email || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Contact</p>
                  <p className="text-sm text-muted-foreground">{vendor.phone_number || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Date Joined</p>
                  <p className="text-sm text-muted-foreground">{formatDate(vendor.created_at)}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">GST Number</p>
                  <p className="text-sm text-muted-foreground">{vendor.gst_number}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Tag className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">PAN Number</p>
                  <p className="text-sm text-muted-foreground">{vendor.pan_number}</p>
                </div>
              </div>

              <div className="flex items-start gap-2 col-span-2">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Shop Address</p>
                  <p className="text-sm text-muted-foreground">{vendor.shop_address || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>


          
        </div>
      </DialogContent>
    </Dialog>
  )
}
