"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { CategoryActions } from "./category-actions";
export const CategoryColumns: ColumnDef<Category>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "image",
    header: "Image",
    cell: ({ row }) => {
      const image = row.getValue("image") as string | null;
      return (
        <div className="flex items-center">
          {image ? (
            <div className="h-10 w-10 relative overflow-hidden rounded">
              <Image
                src={image}
                alt={row.original.name}
                fill
                sizes="40px"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center text-gray-500 text-xs">
              No image
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="font-medium">
        <Link
          href={`/admin/dashboard/categories/${row.original.id}`}
          className="hover:underline text-blue-600"
        >
          {row.getValue("name")}
        </Link>
      </div>
    ),
  },
  {
    accessorKey: "parent",
    header: "Parent Category",
    cell: ({ row }) => {
      const parent = row.original.parent;
      return parent ? (
        <Link
          href={`/admin/dashboard/categories/${parent.id}`}
          className="hover:underline text-blue-600"
        >
          {parent.name}
        </Link>
      ) : (
        <span className="text-gray-500">-</span>
      );
    },
  },
  {
    accessorKey: "is_featured",
    header: "Featured",
    cell: ({ row }) => (
      row.original.is_featured ? (
        <Badge variant="default">Featured</Badge>
      ) : (
        <Badge variant="outline">No</Badge>
      )
    ),
  },
  {
    accessorKey: "active",
    header: "Status",
    cell: ({ row }) => (
      row.original.active ? (
        <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
      ) : (
        <Badge variant="destructive">Inactive</Badge>
      )
    ),
  },
  {
    accessorKey: "attributes",
    header: "Attributes",
    cell: ({ row }) => {
      const attributes = row.original.attributes || [];
      return (
        <div>
          <span className="font-medium">{attributes.length}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Created
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div>{formatDate(row.original.created_at)}</div>,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <CategoryActions category={row.original} />,
  },
];
