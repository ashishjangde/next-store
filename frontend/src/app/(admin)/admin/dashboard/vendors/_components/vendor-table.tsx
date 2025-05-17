"use client"

import { format, parseISO } from "date-fns"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react"

import { InlineVendorDetailsDialog } from "./inline-vendor-details-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Utility function to format dates with date-fns for Indian Standard Time
const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  try {
    const date = parseISO(dateString);
    // Format: 15 Jan 2023, 2:30 PM (Indian format with time)
    return format(date, 'd MMM yyyy, h:mm a');
  } catch (error) {
    return "Invalid Date";
  }
}

interface VendorTableProps {
  vendors: IVendor[]
  onAccept: (id: string) => void
  onReject: (id: string) => void
  onDelete: (id: string) => void
  onStatusChange?: (id: string, status: string) => void
  sortBy: string
  sortOrder: "asc" | "desc"
  onSort: (column: string) => void
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  itemsPerPage: number
  onItemsPerPageChange: (items: number) => void
  totalItems: number
  isLoading: boolean
}

export function VendorTable({
  vendors,
  onAccept,
  onReject,
  onDelete,
  onStatusChange,
  sortBy,
  sortOrder,
  onSort,
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  onItemsPerPageChange,
  totalItems,
  isLoading,
}: VendorTableProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <Badge variant="success">Active</Badge>
      case "PENDING":
        return <Badge variant="warning">Pending</Badge>
      case "REJECTED":
        return <Badge variant="destructive">Rejected</Badge>
      case "SUSPENDED":
        return <Badge variant="suspended">Suspended</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const renderSortIcon = (column: string) => {
    if (sortBy !== column) return <ArrowUpDown className="ml-1 h-4 w-4" />
    return sortOrder === "asc" ? (
      <ArrowUpDown className="ml-1 h-4 w-4 text-primary" />
    ) : (
      <ArrowUpDown className="ml-1 h-4 w-4 text-primary rotate-180" />
    )
  }

  return (
    <>
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">
                <Button
                  variant="ghost"
                  className="p-0 hover:bg-transparent hover:text-primary"
                  onClick={() => onSort("company")}
                >
                  Vendor Name
                  {renderSortIcon("company")}
                </Button>
              </TableHead>
              <TableHead className="hidden sm:table-cell">
                <Button
                  variant="ghost"
                  className="p-0 hover:bg-transparent hover:text-primary"
                  onClick={() => onSort("email")}
                >
                  Email
                  {renderSortIcon("email")}
                </Button>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">
                <Button
                  variant="ghost"
                  className="p-0 hover:bg-transparent hover:text-primary"
                  onClick={() => onSort("dateJoined")}
                >
                  Date Joined
                  {renderSortIcon("dateJoined")}
                </Button>
              </TableHead>
              <TableHead className="hidden lg:table-cell">GST Number</TableHead>
              <TableHead className="hidden lg:table-cell">PAN Number</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10">
                  <div className="flex justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground mt-2">Loading vendors...</p>
                </TableCell>
              </TableRow>
            ) : vendors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10">
                  <p className="text-muted-foreground">No vendors found.</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Try adjusting your search or filters to find what you're looking for.
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              vendors.map((vendor) => (                
                <TableRow key={vendor.id}>
                  <TableCell className="font-medium">
                    <InlineVendorDetailsDialog 
                      vendor={vendor}
                      onAccept={onAccept}
                      onReject={onReject}
                      onDelete={onDelete}
                      onStatusChange={onStatusChange}
                      isLoading={isLoading}
                    >
                      <Button variant="link" className="p-0 h-auto font-medium">{vendor.shop_name}</Button>
                    </InlineVendorDetailsDialog>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {vendor.User?.email || "N/A"}
                  </TableCell>
                  <TableCell>{getStatusBadge(vendor.status)}</TableCell>
                  <TableCell className="hidden md:table-cell">{formatDate(vendor.created_at)}</TableCell>
                  <TableCell className="hidden lg:table-cell">{vendor.gst_number || "N/A"}</TableCell>
                  <TableCell className="hidden lg:table-cell">{vendor.pan_number || "N/A"}</TableCell>
                  <TableCell className="text-right">
                    <InlineVendorDetailsDialog 
                      vendor={vendor}
                      onAccept={onAccept}
                      onReject={onReject}
                      onDelete={onDelete}
                      onStatusChange={onStatusChange}
                      isLoading={isLoading}
                    >
                      <Button variant="outline" size="sm" className="h-8">
                       View Details
                      </Button>
                    </InlineVendorDetailsDialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
        <div className="text-sm text-muted-foreground">
          Showing {totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{" "}
          {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} vendors
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={itemsPerPage.toString()}
            onValueChange={(value) => onItemsPerPageChange(parseInt(value))}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={itemsPerPage.toString()} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1 || isLoading}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous page</span>
            </Button>
            <div className="text-sm mx-2">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages || isLoading}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next page</span>
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
