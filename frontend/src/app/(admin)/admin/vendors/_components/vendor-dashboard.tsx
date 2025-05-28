"use client"

import { useCallback, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, RefreshCw } from "lucide-react"
import { VendorTable } from "@/app/(admin)/admin/vendors/_components/vendor-table"
import { StatisticsCards } from "@/app/(admin)/admin/vendors/_components/statistics-cards"
import { StatusFilter } from "@/app/(admin)/admin/vendors/_components/status-filter"
import { useQuery, useMutation } from "@tanstack/react-query"
import { VendorActions } from "@/api-actions/vendor-actions"
import { useQueryState } from "nuqs"


export function VendorDashboard() {  // URL query parameters using nuqs
  const [page, setPage] = useQueryState('page', { defaultValue: '1' })
  const [limit, setLimit] = useQueryState('limit', { defaultValue: '10' })
  const [search, setSearch] = useQueryState('search', { defaultValue: '' })
  const [status, setStatus] = useQueryState('status', {
    defaultValue: 'all',
    parse: (value: string) => value as VendorStatus | 'all'
  })
  const [sortOrder, setSortOrder] = useQueryState<'desc' | 'asc'>('sortOrder', {
    defaultValue: 'desc',
    parse: (value: string) => (value === 'asc' ? 'asc' : 'desc')
  })
  const [sortBy, setSortBy] = useQueryState('sortBy', { defaultValue: 'created_at' })

  // Fetch vendors data
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['vendors', page, limit, search, sortBy, sortOrder, status !== 'all' ? status : undefined],
    queryFn: () => VendorActions.getAllVendors({
      limit: Number(limit),
      page: Number(page),
      search: search || undefined,
      sortBy: sortBy || undefined,
      sortOrder: sortOrder || undefined,
      status: status !== 'all' ? status as VendorStatus : undefined,
    }),
  })
  // Mutations for vendor actions
  const updateVendorStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: VendorStatus }) => 
      VendorActions.updateVendorStatus(id, status),
    onSuccess: () => refetch(),
  })
  
  const deleteVendorMutation = useMutation({
    mutationFn: (id: string) => VendorActions.deleteVendorById(id),
    onSuccess: () => refetch(),
  })
  // Handler functions
  const handleAcceptVendor = useCallback((id: string) => {
    updateVendorStatusMutation.mutate({ id, status: "APPROVED" })
  }, [updateVendorStatusMutation])

  const handleRejectVendor = useCallback((id: string) => {
    updateVendorStatusMutation.mutate({ id, status: "REJECTED" })
  }, [updateVendorStatusMutation])
  
  const handleVendorStatusChange = useCallback((id: string, newStatus: VendorStatus) => {
    updateVendorStatusMutation.mutate({ id, status: newStatus })
  }, [updateVendorStatusMutation])

  const handleDeleteVendor = useCallback((id: string) => {
    deleteVendorMutation.mutate(id)
  }, [deleteVendorMutation])
  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    setPage('1') // Reset to first page on new search
  }, [setSearch, setPage])

  const handleFilterStatusChange = useCallback((value: string) => {
    setStatus(value as VendorStatus | 'all')
    setPage('1')
  }, [setStatus, setPage])

  const handleSort = useCallback((column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('asc')
    }
  }, [sortBy, sortOrder, setSortBy, setSortOrder])

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage.toString())
  }, [setPage])

  const handleItemsPerPageChange = useCallback((items: number) => {
    setLimit(items.toString())
    setPage('1') // Reset to first page when changing items per page
  }, [setLimit, setPage])

  const refreshData = useCallback(() => {
    refetch()
  }, [refetch])

  // Compute statistics
  const vendors = data?.data?.vendors || []
  const statistics = {
    total: data?.data?.total || 0,
    active: data?.data?.approvedCount || 0,
    suspended : data?.data?.suspendedCount || 0,
    pending: data?.data?.pendingCount || 0,
    rejected: data?.data?.rejectedCount || 0,
  }


  return (
    <div className="mb-4">
      <StatisticsCards statistics={statistics} />

      <div className="rounded-lg shadow-sm border p-6 mt-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
            <div className="relative w-full sm:w-[300px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search vendors..." 
                value={search || ''} 
                onChange={handleSearch} 
                className="pl-8" 
              />
            </div>            <StatusFilter 
              value={status || 'all'} 
              onChange={handleFilterStatusChange} 
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshData} 
              disabled={isLoading}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>        
        <VendorTable
          vendors={vendors}
          onAccept={handleAcceptVendor}
          onReject={handleRejectVendor}
          onDelete={handleDeleteVendor}
          onStatusChange={(id, status) => handleVendorStatusChange(id, status as VendorStatus)}
          sortBy={sortBy || 'created_at'}
          sortOrder={sortOrder as 'asc' | 'desc'}
          onSort={handleSort}
          currentPage={parseInt(page || '1')}
          totalPages={data?.data?.totalPages || 1}
          onPageChange={handlePageChange}
          itemsPerPage={parseInt(limit || '10')}
          onItemsPerPageChange={handleItemsPerPageChange}
          totalItems={data?.data?.total || 0}
          isLoading={isLoading || updateVendorStatusMutation.isPending || deleteVendorMutation.isPending}
        />
      </div>
    </div>
  )
}
