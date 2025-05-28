import React from 'react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function CategoryAttributeDelete(
    { isDeleteDialogOpen, setIsDeleteDialogOpen, deletingAttributeName, handleConfirmDelete }
    : {
        isDeleteDialogOpen: boolean
        setIsDeleteDialogOpen: (open: boolean) => void
        deletingAttributeName: string
        handleConfirmDelete: () => void
    }
) {
  return (
     <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">
              Remove Attribute
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <span className="font-semibold">{deletingAttributeName}</span> from this category? 
              This will not delete the attribute itself, but products in this category will no longer 
              have this attribute available.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete} 
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Remove Attribute
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
  )
}
