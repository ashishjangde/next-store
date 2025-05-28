"use client";

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
import { Loader2, AlertTriangle } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { AttributeActions } from "@/api-actions/attributes-actions"
import { useRouter } from "next/navigation"

interface AttributeDeleteDialogProps {
  children: React.ReactNode
  attribute: Attribute
  onSuccess?: () => void
}

export function AttributeDeleteDialog({ 
  children, 
  attribute,
  onSuccess
}: AttributeDeleteDialogProps) {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Use mutation to handle delete operation
  const deleteMutation = useMutation({
    mutationFn: () => AttributeActions.deleteAttribute(attribute.id),
    onSuccess: (response) => {
      // Check if response and response.data exist before accessing deleted property
      const deletedInfo = response?.data?.deleted;

      toast({
        title: "Attribute Deleted",
        description: deletedInfo ? 
          `Successfully deleted "${deletedInfo.attribute}" and removed from ${deletedInfo.categoryCount} categories and ${deletedInfo.productCount} products.` : 
          "Attribute deleted successfully",
      })
      
      // Close the dialog
      setOpen(false)
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["attributes"] })
      
      // Fixed TypeScript errors by checking for property existence with optional chaining and nullish coalescing
      // If attribute was used in categories, invalidate category queries
      if (deletedInfo && (deletedInfo.categoryCount ?? 0) > 0) {
        queryClient.invalidateQueries({ queryKey: ["categories"] })
      }
      
      // If attribute was used in products, invalidate product queries
      if (deletedInfo && (deletedInfo.productCount ?? 0) > 0) {
        queryClient.invalidateQueries({ queryKey: ["products"] })
      }
      
      // Call success callback if provided
      if (onSuccess) onSuccess()
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to delete attribute",
        variant: "destructive",
      })
    },
  })

  const handleDelete = () => {
    deleteMutation.mutate()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Delete Attribute
          </DialogTitle>
        </DialogHeader>
        
        {/* Fix the hydration error by not nesting p tags */}
        <div className="space-y-2">
          <span className="block">
            Are you sure you want to delete the attribute "{attribute.name}"? This action cannot be undone.
          </span>
        </div>
        
        {/* Warning box as a separate div outside of DialogDescription */}
        <div className="mt-2 rounded-md bg-amber-50 p-3 text-amber-800 border border-amber-200">
          <span className="font-medium block">Warning:</span>
          <span className="text-sm mt-1 block">
            This will permanently remove this attribute from all categories and products that use it.
            This might impact product filtering and catalog organization.
          </span>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => setOpen(false)} 
            disabled={deleteMutation.isPending}
          >
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete} 
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
