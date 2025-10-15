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
  Plus, 
  Eye, 
  Search,
  Filter,
  Download,
  FileText,
  ExternalLink
} from "lucide-react"
import SearchInput from "@/components/common/search/SearchInput"
import { useAppSelector } from "@/store/hooks"
import apiClient from "@/apiClient"
import { useToast } from "@/components/ui/toast"
import { useRouter } from "next/navigation"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination"

interface PurchaseDocument {
  _id: string
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
  const [searchQuery, setSearchQuery] = useState("")
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseDocument[]>([])
  const [pagination, setPagination] = useState<PaginationData | null>(null)
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const auth = useAppSelector((state) => state.auth.user)
  const { showToast } = useToast()

  // Fetch purchase requests from API
  const fetchPurchaseRequests = async (page: number = 1) => {
    setLoading(true)
    try {
      const response = await apiClient.get(`https://api.toprise.in/api/orders/api/documents/admin/all?page=${page}`)
      
      console.log("Purchase Requests API Response:", response.data)
      
      if (response.data.success && response.data.data) {
        // Sort by newest first (createdAt descending)
        const sortedData = response.data.data.data.sort((a: PurchaseDocument, b: PurchaseDocument) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        })
        
        setPurchaseRequests(sortedData)
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
    fetchPurchaseRequests(currentPage)
  }, [currentPage])

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase()
    
    if (statusLower.includes("pending")) {
      return <Badge className="bg-yellow-100 text-yellow-800">{status}</Badge>
    }
    
    switch (statusLower) {
      case "approved":
      case "confirmed":
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
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      request.document_number?.toLowerCase().includes(query) ||
      request.customer_details?.name?.toLowerCase().includes(query) ||
      request.customer_details?.email?.toLowerCase().includes(query) ||
      request.customer_details?.phone?.toLowerCase().includes(query) ||
      request.description?.toLowerCase().includes(query) ||
      request.status?.toLowerCase().includes(query) ||
      request.priority?.toLowerCase().includes(query)
    )
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
            <Button className="bg-[#C72920] hover:bg-[#A01E1A] text-white">
              <Plus className="h-4 w-4 mr-2" />
              New Purchase Request
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 min-w-0">
          {/* Filters and Search */}
          <div className="flex flex-col gap-3 mb-6">
            <div className="w-full">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                onClear={() => setSearchQuery("")}
                placeholder="Search by request ID, user, department, or status"
                className="w-full"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" className="gap-2 flex-shrink-0">
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Filters</span>
              </Button>
              <Button variant="outline" className="gap-2 flex-shrink-0">
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export</span>
              </Button>
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
                  <TableHead className="font-semibold">Priority</TableHead>
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
                      <TableCell>{getPriorityBadge(request.priority)}</TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-1 bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800"
                            onClick={() => router.push(`/user/dashboard/purchase-requests/create-order/${request._id}`)}
                          >
                            <ShoppingCart className="h-4 w-4" />
                            Create Order
                          </Button>
                          <Button variant="ghost" size="sm" className="gap-1">
                            <Eye className="h-4 w-4" />
                            View
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">
                Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{" "}
                {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{" "}
                {pagination.totalItems} requests
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      className={!pagination.hasPreviousPage ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  {Array.from({ length: Math.min(pagination.totalPages, 5) }).map((_, idx) => {
                    const pageNum = idx + 1
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          isActive={currentPage === pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className="cursor-pointer"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  })}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                      className={!pagination.hasNextPage ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-gray-600">Total Requests</div>
                <div className="text-2xl font-bold text-gray-900">
                  {pagination?.totalItems || purchaseRequests.length}
                </div>
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
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-gray-600">High Priority</div>
                <div className="text-2xl font-bold text-red-600">
                  {purchaseRequests.filter(r => r.priority.toLowerCase() === "high").length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-gray-600">Total Est. Value</div>
                <div className="text-2xl font-bold text-blue-600">
                  ₹{purchaseRequests.reduce((sum, r) => sum + (r.estimated_order_value || 0), 0).toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

