"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { Eye, Edit, Trash2 } from "lucide-react";
import { AttributeDeleteDialog } from "./attribute-delete-dialog";

export const AttributeColumns: ColumnDef<Attribute>[] = [
	{
		accessorKey: "name",
		header: "Name",
		cell: ({ row }) => (
			<div className="font-medium">
				<Link
					href={`/admin/attributes/${row.original.id}`}
					className="hover:underline"
				>
					{row.getValue("name")}
				</Link>
			</div>
		),
	},
	{
		accessorKey: "display_name",
		header: "Display Name",
		cell: ({ row }) => (
			<div>{row.original.display_name || row.original.name}</div>
		),
	},
	{
		accessorKey: "type",
		header: "Type",
		cell: ({ row }) => (
			<Badge variant="outline" className="capitalize">
				{row.getValue("type")}
			</Badge>
		),
	},
	{
		accessorKey: "values",
		header: "Values",
		cell: ({ row }) => {
			const values = row.original.values || [];
			return <Badge>{values.length}</Badge>;
		},
	},
	{
		accessorKey: "created_at",
		header: "Created",
		cell: ({ row }) => formatDate(row.original.created_at),
	},
	{
		id: "actions",
		header: "Actions",
		cell: ({ row, table }) => (
			<div className="flex justify-end gap-2">
				<Button variant="outline" size="sm" asChild>
					<Link href={`/admin/attributes/${row.original.id}`}>
						<Eye className="h-4 w-4" />
						<span className="sr-only">View</span>
					</Link>
				</Button>
				<Button variant="outline" size="sm" asChild>
					<Link href={`/admin/attributes/${row.original.id}/edit`}>
						<Edit className="h-4 w-4" />
						<span className="sr-only">Edit</span>
					</Link>
				</Button>
				<AttributeDeleteDialog
					attribute={row.original}
					onSuccess={() => {
						if (table.options.meta && "onDelete" in table.options.meta) {
							const onDelete = table.options.meta.onDelete as () => void;
							onDelete();
						}
					}}
				>
					<Button variant="outline" size="sm">
						<Trash2 className="h-4 w-4 text-red-500" />
						<span className="sr-only">Delete</span>
					</Button>
				</AttributeDeleteDialog>
			</div>
		),
	},
];
