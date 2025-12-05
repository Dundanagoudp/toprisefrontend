"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { 
  ShoppingCart, 
  Eye, 
  Search,
  Filter,
  Download,
  FileText,
  ExternalLink,
  MoreHorizontal,
  XCircle
} from "lucide-react"
import SearchInput from "@/components/common/search/SearchInput"
import { useAppSelector } from "@/store/hooks"
import apiClient from "@/apiClient"
import { useToast } from "@/components/ui/toast"
import { useRouter, useSearchParams } from "next/navigation"
import DynamicPagination from "@/components/common/pagination/DynamicPagination"
import { SimpleDatePicker } from "@/components/ui/simple-date-picker"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface PurchaseDocument {
  _id: string
  order_id?: string
  document_files: {
    url: string
    file_type: string
    file_name: string
    uploaded_at: string
    _id: string
  }[]
  description: string
  customer_details: {
    user_id: string
    name: string
    email: string
    phone: string
    address: string
    pincode: string
  }
  status: string
  priority: string
  estimated_order_value: number
  admin_notes: any[]
  contact_history: any[]
  items_requested: any[]
  createdAt: string
  updatedAt: string
  document_number: string
  rejection_reason?: string
  rejected_by?: string
  rejected_at?: string
  __v: number
}

interface PaginationData {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export default function PurchaseRequestsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const pageParam = searchParams.get("page")
  const limitParam = searchParams.get("limit")
  const statusParam = searchParams.get("status")
  
  const currentPage = pageParam ? parseInt(pageParam, 10) : 1
  const limit = limitParam ? parseInt(limitParam, 10) : 10
  const statusFilter = statusParam || ""
  
  const [searchQuery, setSearchQuery] = useState("")
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseDocument[]>([])
  const [pagination, setPagination] = useState<PaginationData | null>(null)
  const [loading, setLoading] = useState(false)
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined
  })
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [isOrderCreated , setIsOrderCreated] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [isRejecting, setIsRejecting] = useState(false)
  const [isViewRejectDialogOpen, setIsViewRejectDialogOpen] = useState(false)
  const [selectedRejectRequest, setSelectedRejectRequest] = useState<PurchaseDocument | null>(null)
  const auth = useAppSelector((state) => state.auth.user)
  const { showToast } = useToast()
  
  const updateURL = (updates: { page?: number; status?: string }) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (updates.page !== undefined) {
      if (updates.page === 1) {
        params.delete("page")
      } else {
        params.set("page", updates.page.toString())
      }
    }
    
    if (updates.status !== undefined) {
      if (updates.status === "") {
        params.delete("status")
      } else {
        params.set("status", updates.status)
      }
    }
    
    const queryString = params.toString()
    router.push(`/user/dashboard/purchase-requests${queryString ? `?${queryString}` : ""}`, { scroll: false })
  }

  // Export functionality
  const exportToCSV = async () => {
    if (filteredRequests.length === 0) {
      showToast('No data to export', "warning")
      return
    }

    setIsExporting(true)
    try {
      // Prepare CSV headers
      const headers = [
        'Document Number',
        'Request Date',
        'Customer Name',
        'Customer Email',
        'Customer Phone',
        'Customer Address',
        'Pincode',
        'Description',
        'Estimated Value',
        'Status',
        'Priority',
        'Files Count',
        'Created At',
        'Updated At'
      ]

      // Prepare CSV data with proper escaping
      const csvData = filteredRequests.map(request => [
        request.document_number || 'N/A',
        new Date(request.createdAt).toLocaleDateString('en-IN'),
        request.customer_details?.name || 'N/A',
        request.customer_details?.email || 'N/A',
        request.customer_details?.phone || 'N/A',
        request.customer_details?.address || 'N/A',
        request.customer_details?.pincode || 'N/A',
        request.description || 'N/A',
        request.estimated_order_value || 0,
        request.status || 'N/A',
        request.priority || 'N/A',
        request.document_files?.length || 0,
        new Date(request.createdAt).toLocaleString('en-IN'),
        new Date(request.updatedAt).toLocaleString('en-IN')
      ])

      // Create CSV content with proper escaping
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => 
          row.map(field => {
            const stringField = String(field)
            // Escape quotes and wrap in quotes if contains comma, quote, or newline
            if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
              return `"${stringField.replace(/"/g, '""')}"`
            }
            return stringField
          }).join(',')
        )
      ].join('\n')

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      
      // Generate filename with current date and time
      const now = new Date()
      const dateStr = now.toISOString().split('T')[0]
      const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-')
      const filename = `purchase-requests-${dateStr}-${timeStr}.csv`
      link.setAttribute('download', filename)
      
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Clean up the URL object
      URL.revokeObjectURL(url)
      
      showToast(`Exported ${filteredRequests.length} purchase requests successfully`, "success")
    } catch (error) {
      console.error('Error exporting CSV:', error)
      showToast('Failed to export data. Please try again.', "error")
    } finally {
      setIsExporting(false)
    }
  }

  // Fetch purchase requests from API
  const fetchPurchaseRequests = async (page: number, limit: number, status: string) => {
    setLoading(true)
    try {
      let url = `https://api.toprise.in/api/orders/api/documents/admin/all?page=${page}&limit=${limit}`
      
      if (status && status.trim() !== "") {
        url += `&status=${encodeURIComponent(status)}`
      }
      
      const response = await apiClient.get(url)
      
      if (response.data.success && response.data.data) {
        const sortedData = response.data.data.data.sort((a: PurchaseDocument, b: PurchaseDocument) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        })
        
        setPurchaseRequests(sortedData)
        console.log("Purchase requests:", sortedData)
        setPagination(response.data.data.pagination)
      } else {
        showToast("Failed to fetch purchase requests", "error")
      }
    } catch (error: any) {
      console.error("Error fetching purchase requests:", error)
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          "Failed to fetch purchase requests"
      showToast(errorMessage, "error")
      setPurchaseRequests([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPurchaseRequests(currentPage, limit, statusFilter)
  }, [currentPage, limit, statusFilter])

  const handleRejectOrder = (orderId: string) => {
    setSelectedOrderId(orderId)
    setRejectionReason("")
    setIsRejectDialogOpen(true)
  }

  const handleCloseRejectDialog = () => {
    setIsRejectDialogOpen(false)
    setSelectedOrderId(null)
    setRejectionReason("")
  }

  const handleConfirmReject = async () => {
    if (!rejectionReason.trim()) {
      showToast("Please provide a rejection reason", "warning")
      return
    }

    if (!selectedOrderId || !auth._id) {
      showToast("Missing required information", "error")
      return
    }

    setIsRejecting(true)
    try {
      const response = await apiClient.patch(
        `https://api.toprise.in/api/orders/api/documents/admin/${selectedOrderId}/reject`,
        {
          rejected_by: auth._id,
          rejection_reason: rejectionReason.trim(),
        }
      )

      if (response.data.success) {
        showToast("Order rejected successfully", "success")
        handleCloseRejectDialog()
        fetchPurchaseRequests(currentPage, limit, statusFilter)
      } else {
        showToast(response.data.message || "Failed to reject order", "error")
      }
    } catch (error: any) {
      console.error("Error rejecting order:", error)
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          "Failed to reject order"
      showToast(errorMessage, "error")
    } finally {
      setIsRejecting(false)
    }
  }

  const handleViewRejectReason = (request: PurchaseDocument) => {
    setSelectedRejectRequest(request)
    setIsViewRejectDialogOpen(true)
  }

  const handleCloseViewRejectDialog = () => {
    setIsViewRejectDialogOpen(false)
    setSelectedRejectRequest(null)
  }

  const getStatusBadge = (status: string) => {
    console.log("Getting status badge for:", status)
    const statusLower = status.toLowerCase()
    
    if (statusLower.includes("pending-review")) {
      return <Badge className="bg-yellow-100 text-yellow-800">{status}</Badge>
    }
    
    switch (statusLower) {
      case "approved":
      case "order-created":
        return <Badge className="bg-green-100 text-green-800">{status}</Badge>
      case "rejected":
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">{status}</Badge>
      case "completed":
      case "processed":
        return <Badge className="bg-blue-100 text-blue-800">{status}</Badge>
      case "in-progress":
      case "processing":
        return <Badge className="bg-orange-100 text-orange-800">{status}</Badge>
      default:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return <Badge className="bg-red-100 text-red-800">High</Badge>
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>
      case "low":
        return <Badge className="bg-green-100 text-green-800">Low</Badge>
      default:
        return <Badge variant="secondary">{priority}</Badge>
    }
  }

  const filteredRequests = purchaseRequests.filter((request) => {
    // Search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesSearch = (
        request.document_number?.toLowerCase().includes(query) ||
        request.customer_details?.name?.toLowerCase().includes(query) ||
        request.customer_details?.email?.toLowerCase().includes(query) ||
        request.customer_details?.phone?.toLowerCase().includes(query) ||
        request.description?.toLowerCase().includes(query) ||
        request.status?.toLowerCase().includes(query) ||
        request.priority?.toLowerCase().includes(query)
      )
      if (!matchesSearch) return false
    }

    // Date range filter
    if (dateRange.from || dateRange.to) {
      const requestDate = new Date(request.createdAt)
      const fromDate = dateRange.from ? new Date(dateRange.from) : null
      const toDate = dateRange.to ? new Date(dateRange.to) : null
      
      if (fromDate && toDate) {
        if (requestDate < fromDate || requestDate > toDate) return false
      } else if (fromDate) {
        if (requestDate < fromDate) return false
      } else if (toDate) {
        if (requestDate > toDate) return false
      }
    }

    // Priority filter
    if (priorityFilter !== "all") {
      if (request.priority.toLowerCase() !== priorityFilter.toLowerCase()) return false
    }

    return true
  })

  return (
    <div className="w-full min-w-0 overflow-x-hidden">
      <Card className="shadow-sm rounded-none min-w-0">
        <CardHeader className="border-b bg-white sticky top-0 z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <ShoppingCart className="h-6 w-6 text-[#C72920]" />
                Purchase Requests
              </CardTitle>
              <CardDescription className="mt-1">
                Manage and track all purchase requests
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 min-w-0">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-gray-600">Total Requests</div>
                <div className="text-2xl font-bold text-gray-900">
                  {pagination?.totalItems || purchaseRequests.length}
                </div>Manage and track all purchase requests
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-gray-600">Pending Review</div>
                <div className="text-2xl font-bold text-yellow-600">
                  {purchaseRequests.filter(r => r.status.toLowerCase().includes("pending")).length}
                </div>
              </CardContent>
            </Card>
            {/* <Card>
              <CardContent className="p-4">
                <div className="text-sm text-gray-600">High Priority</div>
                <div className="text-2xl font-bold text-red-600">
                  {purchaseRequests.filter(r => r.priority.toLowerCase() === "high").length}
                </div>
              </CardContent>
            </Card> */}
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-gray-600">Total Est. Value</div>
                <div className="text-2xl font-bold text-blue-600">
                  ₹{purchaseRequests.reduce((sum, r) => sum + (r.estimated_order_value || 0), 0).toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col gap-4 mb-6">
            {/* Search Bar */}
            <div className="w-full">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                onClear={() => setSearchQuery("")}
                placeholder="Search by request ID, customer name, email, or status"
                className="w-full"
              />
            </div>
            
            {/* Advanced Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Date Range */}
              {/* <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-gray-700">Date Range</label>
                <SimpleDatePicker
                  value={dateRange}
                  onChange={setDateRange}
                  placeholder="Select date range"
                />
              </div> */}

              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    updateURL({ page: 1, status: e.target.value })
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C72920] focus:border-transparent"
                >
                  <option value="">All Status</option>
                  <option value="Pending-Review">Pending</option>
                  {/* <option value="Under-Review">Under-Review</option> */}
                  {/* <option value="Contacted">Contacted</option> */}
                  <option value="Order-Created">Order-Created</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {/* Priority Filter */}
              {/* <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Priority</label>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C72920] focus:border-transparent"
                >
                  <option value="all">All Priority</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div> */}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 items-center justify-between">
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  className="gap-2 flex-shrink-0"
                  onClick={() => {
                    setDateRange({ from: undefined, to: undefined })
                    updateURL({ page: 1, status: "" })
                    setPriorityFilter("all")
                    setSearchQuery("")
                  }}
                >
                  <Filter className="h-4 w-4" />
                  <span className="hidden sm:inline">Clear Filters</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="gap-2 flex-shrink-0"
                  onClick={exportToCSV}
                  disabled={filteredRequests.length === 0 || isExporting}
                >
                  <Download className={`h-4 w-4 ${isExporting ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">
                    {isExporting ? 'Exporting...' : 'Export'}
                  </span>
                </Button>
              </div>
              {filteredRequests.length > 0 && (
                <div className="text-sm text-gray-600">
                  {filteredRequests.length} record{filteredRequests.length !== 1 ? 's' : ''} to export
                </div>
              )}
            </div>
          </div>

          {/* Purchase Requests Table */}
          <div className="rounded-lg border bg-white overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  <TableHead className="font-semibold">Document #</TableHead>
                  <TableHead className="font-semibold">Request Date</TableHead>
                  <TableHead className="font-semibold">Customer Name</TableHead>
                  <TableHead className="font-semibold">Contact</TableHead>
                  <TableHead className="font-semibold">Description</TableHead>
                  <TableHead className="font-semibold">Est. Value</TableHead>
                  <TableHead className="font-semibold">Files</TableHead>
                  {/* <TableHead className="font-semibold">Priority</TableHead> */}
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C72920]"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <ShoppingCart className="h-12 w-12 text-gray-300" />
                        <p className="text-sm">
                          {searchQuery ? "No purchase requests match your search" : "No purchase requests found"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRequests.map((request) => (
                    <TableRow key={request._id} className="hover:bg-gray-50/50">
                      <TableCell className="font-medium">{request.document_number}</TableCell>
                      <TableCell>
                        {new Date(request.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{request.customer_details.name}</span>
                          <span className="text-xs text-gray-500">{request.customer_details.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm">{request.customer_details.phone}</span>
                          <span className="text-xs text-gray-500">{request.customer_details.pincode}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate" title={request.description}>
                          {request.description || "No description"}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        ₹{request.estimated_order_value?.toLocaleString() || 0}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{request.document_files.length}</span>
                        </div>
                      </TableCell>
                      {/* <TableCell>{getPriorityBadge(request.priority)}</TableCell> */}
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell className="text-right">
                        {request.status.toLowerCase() === "rejected" ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => router.push(`/user/dashboard/purchase-requests/${request._id}`)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleViewRejectReason(request)}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                View Reject Reason
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : request.status.toLowerCase() === "order-created" ? (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-1"
                            onClick={() => router.push(`/user/dashboard/purchase-requests/${request._id}`)}
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </Button>
                        ) : (
                          //show drop down to create order
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {request.status.toLowerCase() !== "rejected" && 
                               request.status.toLowerCase() !== "order-created" && (
                              <DropdownMenuItem
                                onClick={() => router.push(`/user/dashboard/purchase-requests/create-order/${request._id}`)}
                              >
                                <ShoppingCart className="h-4 w-4 mr-2" />
                                Create Order
                              </DropdownMenuItem>
                              )}
                              {/* reject order - only show if status is not Rejected or Order-Created */}
                              {request.status.toLowerCase() !== "rejected" && 
                               request.status.toLowerCase() !== "order-created" && (
                                <DropdownMenuItem
                                  onClick={() => handleRejectOrder(request._id)}
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Reject Order
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                          // <Button 
                          //   variant="outline" 
                          //   size="sm" 
                          //   className="gap-1 bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800"
                          //   onClick={() => router.push(`/user/dashboard/purchase-requests/create-order/${request._id}`)}
                          // >
                          //   <ShoppingCart className="h-4 w-4" />
                          //   Create Order
                          // </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-4">
              <div className="text-sm text-gray-600 mb-4">
                Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{" "}
                {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{" "}
                {pagination.totalItems} requests
              </div>
              <DynamicPagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={(page) => updateURL({ page })}
                totalItems={pagination.totalItems}
                itemsPerPage={pagination.itemsPerPage}
              />
            </div>
          )}

        </CardContent>
      </Card>

      {/* Reject Order Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={handleCloseRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Order</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this order.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rejection-reason">Rejection Reason</Label>
              <Textarea
                id="rejection-reason"
                placeholder="Enter rejection reason..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                disabled={isRejecting}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseRejectDialog}
              disabled={isRejecting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmReject}
              disabled={!rejectionReason.trim() || isRejecting}
            >
              {isRejecting ? "Rejecting..." : "Reject Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Rejection Reason Dialog */}
      <Dialog open={isViewRejectDialogOpen} onOpenChange={handleCloseViewRejectDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              Rejection Details
            </DialogTitle>
            <DialogDescription>
              This purchase request was rejected by the admin.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Rejection Reason */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Rejection Reason</Label>
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-gray-800 whitespace-pre-wrap">
                  {selectedRejectRequest?.rejection_reason || "No reason provided"}
                </p>
              </div>
            </div>

            {/* Rejected By */}
            {selectedRejectRequest?.rejected_by && (
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">Rejected By</Label>
                <p className="text-sm text-gray-600 px-4 py-2 bg-gray-50 rounded-md">
                  Admin ID: {selectedRejectRequest.rejected_by}
                </p>
              </div>
            )}

            {/* Rejected At */}
            {selectedRejectRequest?.rejected_at && (
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">Rejected On</Label>
                <p className="text-sm text-gray-600 px-4 py-2 bg-gray-50 rounded-md">
                  {new Date(selectedRejectRequest.rejected_at).toLocaleString('en-IN', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  })}
                </p>
              </div>
            )}

            {/* Document Number */}
            {selectedRejectRequest?.document_number && (
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">Document Number</Label>
                <p className="text-sm text-gray-600 px-4 py-2 bg-gray-50 rounded-md font-medium">
                  {selectedRejectRequest.document_number}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button onClick={handleCloseViewRejectDialog} className="w-full">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

