"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { AttributeActionsDropdown } from "./attribute-actions";

export const AttributeColumns: ColumnDef<Attribute>[] = [
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
					href={`/admin/dashboard/attributes/${row.original.id}`}
					className="hover:underline text-blue-600"
				>
					{row.getValue("name")}
				</Link>
			</div>
		),
	},
	{
		accessorKey: "type",
		header: "Type",
		cell: ({ row }) => {
			const type = row.getValue("type") as string;
			return (
				<Badge variant="outline" className="capitalize">
					{type}
				</Badge>
			);
		},
	},
	{
		accessorKey: "values",
		header: "Values",
		cell: ({ row }) => {
			const values = row.original.values || [];
			return (
				<div>
					<span className="font-medium">{values.length}</span>
					{values.length > 0 && (
						<div className="flex flex-wrap gap-1 mt-1 max-w-[300px]">
							{values.slice(0, 3).map((value) => (
								<Badge key={value.id} variant="outline" className="text-xs">
									{value.display_value || value.value}
								</Badge>
							))}
							{values.length > 3 && (
								<Badge variant="outline" className="text-xs">
									+{values.length - 3} more
								</Badge>
							)}
						</div>
					)}
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
		cell: ({ row }) => <AttributeActionsDropdown attribute={row.original} />,
	},
];
