"use client";

import { Edit, MoreHorizontal, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQueryClient } from "@tanstack/react-query";

import Link from "next/link";
import { EditAttributeModal } from "../../categories/[categoryId]/_components/edit-attribute-modal";
import { AttributeDeleteDialog } from "./attribute-delete-dialog";

interface AttributeActionsDropdownProps {
  attribute: Attribute;
}

export const AttributeActionsDropdown = ({ attribute }: AttributeActionsDropdownProps) => {
  const queryClient = useQueryClient();

  const handleUpdate = () => {
    queryClient.invalidateQueries({ queryKey: ["attributes"] });
    queryClient.invalidateQueries({ queryKey: ["attribute", attribute.id] });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem asChild>
          <Link href={`/admin/dashboard/attributes/${attribute.id}`}>
            <span className="flex items-center">
              <Edit className="mr-2 h-4 w-4" /> View & Edit
            </span>
          </Link>
        </DropdownMenuItem>
        
        <EditAttributeModal attribute={attribute} onUpdate={handleUpdate}>
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <Edit className="mr-2 h-4 w-4" /> Quick Edit
          </DropdownMenuItem>
        </EditAttributeModal>
        
        <AttributeDeleteDialog attribute={attribute}>
          <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
            <Trash className="mr-2 h-4 w-4" /> Delete
          </DropdownMenuItem>
        </AttributeDeleteDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
