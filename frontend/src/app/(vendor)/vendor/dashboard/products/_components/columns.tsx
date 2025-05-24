"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { formatDate, formatCurrency } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { ProductActions } from "./product-actions";

export const ProductColumns: ColumnDef<Product>[] = [
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
    accessorKey: "images",
    header: "Image",
    cell: ({ row }) => {
      const images = row.getValue("images") as string[];
      const firstImage = images && images.length > 0 ? images[0] : null;
      
      return (
        <div className="flex items-center">
          {firstImage ? (
            <div className="h-10 w-10 relative overflow-hidden rounded">
              <Image
                src={firstImage}
                alt={row.original.title}
                fill
                sizes="40px"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="h-10 w-10 bg-gray-100 rounded flex items-center justify-center text-gray-500 text-xs">
              No image
            </div>
          )}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Title
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      return (
        <div className="flex flex-col">
          <Link href={`/vendor/dashboard/products/${row.original.id}`} className="font-medium hover:underline">
            {row.original.title}
          </Link>
          {row.original.sku && (
            <span className="text-xs text-muted-foreground">SKU: {row.original.sku}</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "price",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Price
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("price"));
      const formatted = formatCurrency(amount);

      return <div>{formatted}</div>;
    },
  },
  {
    accessorKey: "children",
    header: "Variants",
    cell: ({ row }) => {
      const variants = row.original.children || [];
      return <div>{variants.length}</div>;
    },
    enableSorting: false,
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("is_active") as boolean;
      return (
        <Badge variant={isActive ? "default" : "destructive"}>
          {isActive ? "Active" : "Inactive"}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "created_at",
    header: "Created",
    cell: ({ row }) => formatDate(row.getValue("created_at")),
  },
  {
    id: "actions",
    cell: ({ row }) => <ProductActions product={row.original} />,
  },
];
