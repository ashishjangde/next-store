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
import { Loader2 } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { CategoryActions } from "@/api-actions/categories-actions"
import { useRouter } from "next/navigation"

interface CategoryDeleteDialogProps {
  children: React.ReactNode
  category: Category
  redirectAfterDelete?: boolean
}

export function CategoryDeleteDialog({ children, category, redirectAfterDelete = false }: CategoryDeleteDialogProps) {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: () => {
      return CategoryActions.deleteCategory(category.id)
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Category deleted successfully",
      })
      setOpen(false)
      
      queryClient.invalidateQueries()
      
      if (category.parent_id) {
        queryClient.refetchQueries({ queryKey: ["category", category.parent_id] })
        queryClient.refetchQueries({ queryKey: ["categoryById", category.parent_id] })
      }
      
      if (redirectAfterDelete) {
        setTimeout(() => {
          router.push('/admin/dashboard/categories')
        }, 100)
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to delete category",
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
          <DialogTitle>Delete Category</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the category &quot;{category.name}&quot;? This action cannot be undone.
            {category.children && category.children.length > 0 && (
              <div className="mt-2">
                <span className="text-red-500 font-medium">
                  Warning: This category has {category.children.length} child categories that will also be affected.
                </span>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
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
