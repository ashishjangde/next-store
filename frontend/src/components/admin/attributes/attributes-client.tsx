"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { AttributeActions } from "@/api-actions/attributes-actions";
import { LoadingPage } from "@/components/common/loading";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Plus, Search, X, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { DataTable, CustomTableMeta } from "@/components/ui/data-table";
import { AttributeColumns } from "./columns";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function AttributesClient() {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  // Fetch attributes data with search
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["attributes", page, limit, debouncedSearch],
    queryFn: async () => {
      return await AttributeActions.getAllAttributes(page, limit, debouncedSearch);
    },
  });

  // Reset to page 1 when search term changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  // Extract attributes data or default to empty array
  const attributes = data?.data?.data || [];
  const totalItems = data?.data?.total || 0;
  const totalPages = Math.ceil(totalItems / limit);

  const handleAttributeDelete = () => {
    toast({
      title: "Attribute deleted",
      description: "The attribute was deleted successfully",
    });
    refetch();
  };

  // Create meta object with onDelete callback
  const tableMeta: CustomTableMeta<Attribute> = {
    onDelete: handleAttributeDelete,
  };

  if (isLoading && page === 1 && !debouncedSearch) {
    return <LoadingPage />;
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <PageHeader
        title="Attributes"
        description="Manage product attributes in your store"
        actions={
          <Button asChild>
            <Link href="/admin/dashboard/attributes/new">
              <Plus className="mr-2 h-4 w-4" />
              Add New
            </Link>
          </Button>
        }
      />

      {/* Search and filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search attributes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 w-full"
          />
          {search && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-9 px-3"
              onClick={() => setSearch("")}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Clear search</span>
            </Button>
          )}
        </div>
      </div>

      {/* Table with data */}
      <div className=" rounded-md border shadow-sm overflow-hidden">
        <DataTable
          columns={AttributeColumns}
          data={attributes}
          meta={tableMeta}
          totalItems={totalItems}
        />

        {/* Pagination controls */}
        <div className="flex items-center justify-between border-t px-4 py-3">
          <div className="text-sm text-muted-foreground">
            Showing {totalItems > 0 ? (page - 1) * limit + 1 : 0} to{" "}
            {Math.min(page * limit, totalItems)} of {totalItems} attributes
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={limit.toString()}
              onValueChange={(value) => {
                setLimit(parseInt(value));
                setPage(1); // Reset to page 1 when changing items per page
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={limit.toString()} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPage(page - 1)}
              disabled={page === 1 || isLoading}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous page</span>
            </Button>
            <div className="text-sm mx-2">
              Page {page} of {totalPages || 1}
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages || isLoading}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next page</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
