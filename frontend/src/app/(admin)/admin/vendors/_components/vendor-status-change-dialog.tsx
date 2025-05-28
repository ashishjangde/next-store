"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { AlertTriangle, CheckCircle, Loader2, ShieldAlert, Clock } from "lucide-react"

interface VendorStatusChangeDialogProps {
  children: React.ReactNode
  vendor: IVendor
  onAction: (id: string, status: string) => void
  isLoading: boolean
}

export function VendorStatusChangeDialog({ 
  children, 
  vendor, 
  onAction, 
  isLoading 
}: VendorStatusChangeDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [selectedStatus, setSelectedStatus] = useState<string>(vendor.status)

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "APPROVED":
        return {
          title: "Approve/Activate Vendor",
          description: "The vendor will be active and able to sell products on the platform.",
          actionText: "Activate Vendor",
          icon: <CheckCircle className="mr-2 h-4 w-4" />,
          buttonClass: "bg-green-600 hover:bg-green-700 text-white",
          color: "text-green-600"
        }
      case "REJECTED":
        return {
          title: "Reject Vendor",
          description: "The vendor will be permanently rejected and unable to sell on the platform.",
          actionText: "Reject Vendor",
          icon: <ShieldAlert className="mr-2 h-4 w-4" />,
          buttonClass: "bg-red-600 hover:bg-red-700 text-white",
          color: "text-red-600"
        }
      case "SUSPENDED":
        return {
          title: "Suspend Vendor",
          description: "The vendor will be temporarily suspended from selling on the platform.",
          actionText: "Suspend Vendor",
          icon: <AlertTriangle className="mr-2 h-4 w-4" />,
          buttonClass: "bg-amber-600 hover:bg-amber-700 text-white",
          color: "text-amber-600"
        }
      case "PENDING":
        return {
          title: "Set to Pending Review",
          description: "The vendor will be marked as pending review.",
          actionText: "Set to Pending",
          icon: <Clock className="mr-2 h-4 w-4" />,
          buttonClass: "bg-blue-600 hover:bg-blue-700 text-white",
          color: "text-blue-600"
        }
      default:
        return {
          title: "Change Status",
          description: "Change the vendor's status on the platform.",
          actionText: "Change Status",
          icon: null,
          buttonClass: "",
          color: "text-gray-600"
        }
    }
  }

  const statusInfo = getStatusInfo(selectedStatus)

  const handleAction = () => {
    onAction(vendor.id, selectedStatus)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {statusInfo.icon}
            {statusInfo.title}
          </DialogTitle>
          <DialogDescription>
            Change status for vendor: <span className="font-medium">{vendor.shop_name}</span>
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-medium">
                Select Status
              </Label>
              <Select
                value={selectedStatus}
                onValueChange={setSelectedStatus}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="APPROVED" className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Approved</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="PENDING">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span>Pending</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="REJECTED">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4 text-red-600" />
                      <span>Rejected</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="SUSPENDED">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <span>Suspended</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="p-3 bg-muted rounded-md">
              <p className={`text-sm ${statusInfo.color}`}>{statusInfo.description}</p>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleAction} 
            disabled={isLoading || selectedStatus === vendor.status}
            className={statusInfo.buttonClass}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {statusInfo.actionText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
