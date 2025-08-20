"use client"
import { useState, useEffect, useMemo } from "react"
import { Search, Filter, Edit, Eye, MoreHorizontal, CheckCircle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationPrevious, 
  PaginationNext,
} from "@/components/ui/pagination"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import SearchFiltersModal from "./modules/modalpopus/searchfilters"
import SearchInput from "@/components/common/search/SearchInput"
import { Card } from "@/components/ui/card"
import { getReturnRequests } from "@/service/return-service"
import { ReturnRequest, ReturnRequestsResponse } from "@/types/return-Types"
import ValidateReturnRequest from "./modules/modalpopus/Validate"
import ReturnRequestById from "./modules/modalpopus/ReturnRequestById"
import SchedulePickupDialog from "./modules/modalpopus/SchedulePickupDialog"


export default function ReturnClaims() {
  const [returnRequests, setReturnRequests] = useState<ReturnRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("All")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const itemsPerPage = 10
  const [selectedClaims, setSelectedClaims] = useState<string[]>([])
  

  // Validation dialog state
  const [validationDialog, setValidationDialog] = useState<{
    open: boolean;
    returnId: string | null;
  }>({
    open: false,
    returnId: null
  })

  // View details dialog state
  const [detailsDialog, setDetailsDialog] = useState<{
    open: boolean;
    returnId: string | null;
  }>({
    open: false,
    returnId: null
  })

  // Schedule pickup dialog state
  const [schedulePickupDialog, setSchedulePickupDialog] = useState<{
    open: boolean;
    returnId: string | null;
    returnRequest: ReturnRequest | null;
  }>({
    open: false,
    returnId: null,
    returnRequest: null
  })

  // Fetch return requests from API
  const fetchReturnRequests = async () => {
    try {
      setLoading(true)
      const response: ReturnRequestsResponse = await getReturnRequests()
      if (response.success && response.data) {
        setReturnRequests(response.data.returnRequests)
        setTotalPages(response.data.pagination.pages)
        setTotalItems(response.data.pagination.total)
        console.log("Return requests fetched successfully:", response.data.returnRequests)
      }
    } catch (error) {
      console.error("Failed to fetch return requests:", error)
      setReturnRequests([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReturnRequests()
  }, [])


  // Handle validation dialog open
  const handleOpenValidation = (returnId: string) => {
    setValidationDialog({
      open: true,
      returnId
    })
  }

  // Handle details dialog open
  const handleOpenDetails = (returnId: string) => {
    setDetailsDialog({
      open: true,
      returnId
    })
  }

  // Handle schedule pickup dialog open
  const handleOpenSchedulePickup = (returnId: string) => {
    const returnRequest = returnRequests.find(req => req._id === returnId)
    setSchedulePickupDialog({
      open: true,
      returnId,
      returnRequest: returnRequest || null
    })
  }


  // Handle validation dialog close
  const handleCloseValidation = () => {
    setValidationDialog({
      open: false,
      returnId: null
    })
  }

  // Handle details dialog close
  const handleCloseDetails = () => {
    setDetailsDialog({
      open: false,
      returnId: null
    })
  }

  // Handle schedule pickup dialog close
  const handleCloseSchedulePickup = () => {
    setSchedulePickupDialog({
      open: false,
      returnId: null,
      returnRequest: null
    })
  }

  // Handle schedule pickup completion
  const handleSchedulePickupComplete = (success: boolean) => {
    if (success) {
      // Refresh the return requests to get updated data
      fetchReturnRequests()
    }
  }

  // Handle validation completion
  const handleValidationComplete = (success: boolean) => {
    if (success) {
      // Refresh the return requests to get updated status
      fetchReturnRequests()
    }
  }

  const filteredReturnRequests = useMemo(() => {
    return returnRequests
      .filter((request) => {
        const searchLower = searchTerm.toLowerCase()
        return (
          request._id.toLowerCase().includes(searchLower) ||
          request.sku.toLowerCase().includes(searchLower) ||
          (request.orderId?.orderId || '').toLowerCase().includes(searchLower) ||
          (request.orderId?.customerDetails?.name || '').toLowerCase().includes(searchLower) ||
          request.returnReason.toLowerCase().includes(searchLower)
        )
      })
      .filter((request) => filterStatus === "All" || request.returnStatus === filterStatus)
  }, [returnRequests, searchTerm, filterStatus])

  const paginatedReturnRequests = filteredReturnRequests.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  // Reset selection when page or filters change
  useEffect(() => {
    setSelectedClaims([])
  }, [currentPage, searchTerm, filterStatus])

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-medium border font-[Poppins]"
    switch (status) {
      case "Pending":
        return `${baseClasses} text-yellow-600 bg-yellow-50 border-yellow-200`
      case "Approved":
        return `${baseClasses} text-green-600 bg-green-50 border-green-200`
      case "Rejected":
        return `${baseClasses} text-red-600 bg-red-50 border-red-200`
      case "In_Progress":
        return `${baseClasses} text-blue-600 bg-blue-50 border-blue-200`
      case "Completed":
        return `${baseClasses} text-emerald-600 bg-emerald-50 border-emerald-200`
      case "Cancelled":
        return `${baseClasses} text-gray-600 bg-gray-50 border-gray-200`
      default:
        return `${baseClasses} text-gray-600 bg-gray-50 border-gray-200`
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getRowId = (request: ReturnRequest, index: number) => `${request._id}-${index}`

  const allSelected = paginatedReturnRequests.length > 0 && paginatedReturnRequests.every((r, idx) => selectedClaims.includes(getRowId(r, idx)))

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedClaims([])
    } else {
      const ids = paginatedReturnRequests.map((r, idx) => getRowId(r, idx))
      setSelectedClaims(ids)
    }
  }

  const handleSelectOne = (request: ReturnRequest, index: number) => {
    const id = getRowId(request, index)
    setSelectedClaims((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  return (
    <div className="w-full">
      <Card>
      {/* Header: Search and Filters */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 flex-1">
            <div className="relative flex-1 w-full sm:max-w-md">
              <SearchInput 
                value={searchTerm} 
                onChange={setSearchTerm} 
                onClear={() => setSearchTerm("")}
                placeholder="Search returns..." 
              />
            </div>
            <SearchFiltersModal
              trigger={
                <Button variant="outline" className="h-10 px-4 bg-white border-gray-200 w-full sm:w-auto">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              }
            />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-40 h-10 bg-white border-gray-200">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
                <SelectItem value="In_Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-full sm:w-auto justify-end gap-3">
            {selectedClaims.length > 0 && selectedClaims.some(id => {
              const returnId = id.split('-')[0];
              const request = returnRequests.find(r => r._id === returnId);
              return request?.returnStatus === "Pending";
            }) && (
              <Button 
                onClick={() => {
                  // For now, validate the first selected claim
                  // In the future, you could implement bulk validation
                  const firstSelectedId = selectedClaims[0].split('-')[0];
                  handleOpenValidation(firstSelectedId);
                }}
                className="flex items-center gap-2 border-blue-400 text-blue-600 bg-blue-50 hover:bg-blue-100 hover:border-blue-500 px-6 py-2 rounded-lg font-medium text-base h-10 shadow-none focus:ring-2 focus:ring-blue-100"
              >
                <CheckCircle className="h-4 w-4" />
                Validate Selected ({selectedClaims.length})
              </Button>
            )}
            <Button className="flex items-center gap-2 border-red-400 text-red-600 bg-red-50 hover:bg-red-100 hover:border-red-500 px-6 py-2 rounded-lg font-medium text-base h-10 shadow-none focus:ring-2 focus:ring-red-100">
              Review Return
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-[#E5E5E5] bg-gray-50/50">
              <TableHead className="px-4 py-4 w-8 font-[Red Hat Display]">
                <Checkbox checked={allSelected} onCheckedChange={handleSelectAll} aria-label="Select all" />
              </TableHead>
              <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display]">
                Return ID
              </TableHead>
              <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display]">
                Order ID
              </TableHead>
              <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left min-w-[120px] font-[Red Hat Display]">
                SKU
              </TableHead>
              <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left min-w-[140px] font-[Red Hat Display]">
                Customer
              </TableHead>
              <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left min-w-[120px] font-[Red Hat Display]">
                Request Date
              </TableHead>
              <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left min-w-[100px] font-[Red Hat Display]">
                Quantity
              </TableHead>
              <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left min-w-[140px] font-[Red Hat Display]">
                Return Reason
              </TableHead>
              <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left min-w-[120px] font-[Red Hat Display]">
                Status
              </TableHead>
              <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left min-w-[100px] font-[Red Hat Display]">
                Refund Amount
              </TableHead>
              <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-center min-w-[80px] font-[Red Hat Display]">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <TableRow
                    key={`skeleton-${index}`}
                    className={`border-b border-gray-100 hover:bg-gray-50/50 transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                    }`}
                  >
                    <TableCell className="px-4 py-4 w-8">
                      <Skeleton className="h-4 w-4 rounded" />
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Skeleton className="h-4 w-[100px]" />
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Skeleton className="h-4 w-[100px]" />
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Skeleton className="h-4 w-[160px]" />
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Skeleton className="h-4 w-[140px]" />
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Skeleton className="h-4 w-[120px]" />
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Skeleton className="h-4 w-[140px]" />
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Skeleton className="h-4 w-[80px]" />
                    </TableCell>
                    <TableCell className="px-6 py-4 text-center">
                      <Skeleton className="h-8 w-8 rounded-full mx-auto" />
                    </TableCell>
                  </TableRow>
                ))
              : paginatedReturnRequests.map((request, index) => {
                  const rowId = getRowId(request, index)
                  const zebra = index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                  return (
                    <TableRow key={`${rowId}`} className={`border-b border-gray-100 hover:bg-gray-50/50 transition-colors ${zebra}`}>
                      <TableCell className="px-4 py-4 w-8 font-[Poppins]">
                        <Checkbox
                          checked={selectedClaims.includes(rowId)}
                          onCheckedChange={() => handleSelectOne(request, index)}
                          aria-label="Select row"
                        />
                      </TableCell>
                      <TableCell className="px-6 py-4 font-[Poppins]">
                        <span className="text-gray-900 b2 font-mono text-sm">{request._id.slice(-8)}</span>
                      </TableCell>
                      <TableCell className="px-6 py-4 font-[Poppins]">
                        <span className="text-gray-700 b2">
                          {request.orderId?.orderId || 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell className="px-6 py-4 font-[Poppins]">
                        <span className="text-gray-900 b2 font-mono">{request.sku}</span>
                      </TableCell>
                      <TableCell className="px-6 py-4 font-[Poppins]">
                        <div className="flex flex-col">
                          <span className="text-gray-900 b2">
                            {request.orderId?.customerDetails?.name || 'N/A'}
                          </span>
                          <span className="text-gray-500 text-xs">
                            {request.orderId?.customerDetails?.email || ''}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 font-[Poppins]">
                        <span className="text-gray-700 b2">{formatDate(request.createdAt)}</span>
                      </TableCell>
                      <TableCell className="px-6 py-4 font-[Poppins]">
                        <span className="text-gray-900 b2">{request.quantity}</span>
                      </TableCell>
                      <TableCell className="px-6 py-4 font-[Poppins]">
                        <div className="max-w-[140px]">
                          <span className="text-gray-700 b2 truncate block" title={request.returnReason}>
                            {request.returnReason}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 font-[Poppins]">
                        <span className={getStatusBadge(request.returnStatus)}>{request.returnStatus}</span>
                      </TableCell>
                      <TableCell className="px-6 py-4 font-[Poppins]">
                        <span className="text-gray-900 b2 font-semibold">
                          ₹{request.refund.refundAmount.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-center font-[Poppins]">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem className="cursor-pointer" onClick={() => handleOpenDetails(request._id)}>
                              <Eye className="h-4 w-4 mr-2" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">
                              <Edit className="h-4 w-4 mr-2" /> Update Status
                            </DropdownMenuItem>
                          
                              <DropdownMenuItem className="cursor-pointer" onClick={() => handleOpenSchedulePickup(request._id)}>
                                <Edit className="h-4 w-4 mr-2" /> Schedule Pickup
                              </DropdownMenuItem>
                        
                            <DropdownMenuItem className="cursor-pointer" onClick={() => handleOpenValidation(request._id)}>
                              <CheckCircle className="h-4 w-4 mr-2" /> Validate
                            </DropdownMenuItem>

                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination - consistent with CreatedProduct */}
      {filteredReturnRequests.length > 0 && Math.ceil(filteredReturnRequests.length / itemsPerPage) > 1 && (
        <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0 mt-8">
          <div className="text-sm text-gray-600 text-center sm:text-left">
            {`Showing ${(currentPage - 1) * itemsPerPage + 1}-${Math.min(
              currentPage * itemsPerPage,
              filteredReturnRequests.length
            )} of ${filteredReturnRequests.length} returns`}
          </div>
          <div className="flex justify-center sm:justify-end">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                {(() => {
                  const calculatedTotalPages = Math.ceil(filteredReturnRequests.length / itemsPerPage)
                  let pages: number[] = []
                  if (calculatedTotalPages <= 3) {
                    pages = Array.from({ length: calculatedTotalPages }, (_, i) => i + 1)
                  } else if (currentPage <= 2) {
                    pages = [1, 2, 3]
                  } else if (currentPage >= calculatedTotalPages - 1) {
                    pages = [calculatedTotalPages - 2, calculatedTotalPages - 1, calculatedTotalPages]
                  } else {
                    pages = [currentPage - 1, currentPage, currentPage + 1]
                  }
                  return pages.map((pageNum) => (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        isActive={currentPage === pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className="cursor-pointer"
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  ))
                })()}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage((p) => Math.min(Math.ceil(filteredReturnRequests.length / itemsPerPage), p + 1))}
                    className={currentPage === Math.ceil(filteredReturnRequests.length / itemsPerPage) ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredReturnRequests.length === 0 && !loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center mt-6">
          <p className="text-gray-500 text-lg mb-2">No return requests found</p>
          <p className="text-gray-400 text-sm">Try adjusting your search terms or filters</p>
        </div>
      )}
      <ValidateReturnRequest
        open={validationDialog.open}
        onClose={handleCloseValidation}
        onValidationComplete={handleValidationComplete}
        returnId={validationDialog.returnId}
      />
      <ReturnRequestById
        open={detailsDialog.open}
        onClose={handleCloseDetails}
        returnId={detailsDialog.returnId}
      />
      <SchedulePickupDialog
        open={schedulePickupDialog.open}
        onClose={handleCloseSchedulePickup}
        onScheduleComplete={handleSchedulePickupComplete}
        returnId={schedulePickupDialog.returnId}
        initialPickupAddress={schedulePickupDialog.returnRequest?.pickupRequest?.pickupAddress}
      />
    </Card>
    </div>
  )
}

