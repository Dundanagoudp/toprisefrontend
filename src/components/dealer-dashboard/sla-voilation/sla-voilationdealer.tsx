"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Search,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Eye,
  CheckCircle,
} from "lucide-react"
import { useToast } from "@/components/ui/toast"
import { slaViolationService } from "@/service/sla-violation-service"
import type { SlaViolation, SlaViolationFilters } from "@/types/sla-violation-types"
import { ResolveModal } from "./modules/resolve-modal"
import { ViewViolationModal } from "@/components/user-dashboard/new-SlaVoilations/modules/view-violation-modal"
import { getDealerProfileDetails, getDealerByUserId } from "@/service/dealerServices"
import { getAuthToken, getCookie } from "@/utils/auth"

export default function Slavoilationdealer() {
  const { showToast } = useToast()
  const [violations, setViolations] = useState<SlaViolation[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchingDealerId, setFetchingDealerId] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [dealerId, setDealerId] = useState<string | null>(null)
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedViolation, setSelectedViolation] = useState<SlaViolation | null>(null)

  const itemsPerPage = 10

  const [filters, setFilters] = useState<SlaViolationFilters>({
    search: "",
    sortBy: "created_at",
    sortOrder: "desc",
    page: 1,
    limit: itemsPerPage,
  })

  // Get dealer ID on mount using user ID
  useEffect(() => {
    const fetchDealerId = async () => {
      setFetchingDealerId(true)
      try {
        // First, get user ID from token
        let userId: string | null = null
        const token = getAuthToken()
        if (token) {
          try {
            const payloadBase64 = token.split(".")[1]
            if (payloadBase64) {
              const base64 = payloadBase64.replace(/-/g, "+").replace(/_/g, "/")
              const paddedBase64 = base64.padEnd(
                base64.length + ((4 - (base64.length % 4)) % 4),
                "="
              )
              const payloadJson = atob(paddedBase64)
              const payload = JSON.parse(payloadJson)
              userId = payload.id || payload.userId || payload.user_id
            }
          } catch (err) {
            console.error("Failed to decode token:", err)
          }
        }

        if (!userId) {
          console.error("User ID not found in token")
          showToast("Failed to get user information. Please refresh the page.", "error")
          setLoading(false)
          return
        }

        console.log("User ID found:", userId)

        // Call API to get dealer by user ID
        try {
          const dealerResponse = await getDealerByUserId(userId)
          console.log("Dealer response:", dealerResponse)
          
          // Handle different response structures
          let dealer: any = null
          const response = dealerResponse as any
          
          // Check for dealer property (from API response structure)
          if (response?.dealer) {
            dealer = response.dealer
          } 
          // Check for data property (from ApiResponse structure)
          else if (response?.data) {
            dealer = response.data
          } 
          // Check for nested data structure
          else if (response?.success && response?.data) {
            dealer = response.data
          }

          if (dealer?._id) {
            console.log("Dealer ID found from API:", dealer._id)
            console.log("Dealer user_id:", dealer.user_id)
            setDealerId(dealer._id)
          } else {
            console.error("Dealer ID not found in API response")
            showToast("Failed to get dealer information. Please refresh the page.", "error")
            setLoading(false)
          }
        } catch (apiError) {
          console.error("Failed to get dealer from API:", apiError)
          
          // Fallback: try to get dealer ID from cookie
          let id = getCookie("dealerId")
          
          if (!id) {
            // Try to get dealer ID from token
            if (token) {
              try {
                const payloadBase64 = token.split(".")[1]
                if (payloadBase64) {
                  const base64 = payloadBase64.replace(/-/g, "+").replace(/_/g, "/")
                  const paddedBase64 = base64.padEnd(
                    base64.length + ((4 - (base64.length % 4)) % 4),
                    "="
                  )
                  const payloadJson = atob(paddedBase64)
                  const payload = JSON.parse(payloadJson)
                  id = payload.dealerId || payload.id
                }
              } catch (err) {
                console.error("Failed to decode token:", err)
              }
            }
          }

          // Final fallback: get from dealer profile
          if (!id) {
            try {
              const dealer = await getDealerProfileDetails()
              if (dealer?._id) {
                id = dealer._id
              }
            } catch (profileError) {
              console.error("Failed to get dealer profile:", profileError)
            }
          }

          if (id) {
            console.log("Dealer ID found from fallback:", id)
            setDealerId(id)
          } else {
            console.error("Dealer ID not found in any method")
            showToast("Failed to get dealer information. Please refresh the page.", "error")
            setLoading(false)
          }
        }
      } catch (error) {
        console.error("Error getting dealer ID:", error)
        showToast("Failed to get dealer information. Please refresh the page.", "error")
        setLoading(false)
      } finally {
        setFetchingDealerId(false)
      }
    }
    fetchDealerId()
  }, [showToast])

  const fetchViolations = async () => {
    if (!dealerId) {
      console.log("No dealer ID available, skipping fetch")
      return
    }

    setLoading(true)
    try {
      // Clean filters - remove empty search strings and undefined values
      const cleanFilters: SlaViolationFilters = {
        page: filters.page || 1,
        limit: filters.limit || itemsPerPage,
        sortBy: filters.sortBy || "created_at",
        sortOrder: filters.sortOrder || "desc",
      }
      
      // Only add search if it has a value
      if (filters.search && filters.search.trim() !== "") {
        cleanFilters.search = filters.search.trim()
      }

      console.log("Fetching violations for dealer:", dealerId, "with filters:", cleanFilters)
      const response = await slaViolationService.getSlaViolationsByDealer(dealerId, cleanFilters)
      console.log("Violations response:", response)
      
      // Handle different response structures
      let fetchedViolations: SlaViolation[] = []
      let totalItems = 0
      let totalPagesCount = 1

      if (response && response.data) {
        const responseData = response.data as any
        
        // Check if responseData is an array (direct array response)
        if (Array.isArray(responseData)) {
          fetchedViolations = responseData
          totalItems = responseData.length
          totalPagesCount = 1
        }
        // Check if responseData.data exists (nested structure)
        else if (responseData.data) {
          // Check if responseData.data is an array
          if (Array.isArray(responseData.data)) {
            fetchedViolations = responseData.data
          }
          // Check if responseData.data.data exists (double nested)
          else if (responseData.data.data && Array.isArray(responseData.data.data)) {
            fetchedViolations = responseData.data.data
          }
          
          // Get pagination info
          if (responseData.data.pagination) {
            totalItems = responseData.data.pagination.totalItems || 0
            totalPagesCount = responseData.data.pagination.totalPages || 1
          } else if (responseData.pagination) {
            totalItems = responseData.pagination.totalItems || 0
            totalPagesCount = responseData.pagination.totalPages || 1
          }
        }
        // Check if responseData.violations exists (alternative structure)
        else if (responseData.violations && Array.isArray(responseData.violations)) {
          fetchedViolations = responseData.violations
          if (responseData.pagination) {
            totalItems = responseData.pagination.totalItems || (responseData.pagination as any).totalCount || 0
            totalPagesCount = responseData.pagination.totalPages || 1
          }
        }
      }

      console.log("Parsed violations:", fetchedViolations.length, "Total items:", totalItems)
      setViolations(fetchedViolations)
      setTotalCount(totalItems)
      setTotalPages(totalPagesCount)
    } catch (error) {
      console.error("Error fetching SLA violations:", error)
      showToast("Failed to load SLA violations. Please refresh the page.", "error")
      setViolations([])
      setTotalCount(0)
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (dealerId) {
      fetchViolations()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, dealerId])

  const handleSearch = (query: string) => {
    setFilters((prev) => ({
      ...prev,
      search: query,
      page: 1,
    }))
    setCurrentPage(1)
  }

  const handleSort = (column: string) => {
    setFilters((prev) => {
      if (prev.sortBy === column) {
        const newOrder = prev.sortOrder === "asc" ? "desc" : "asc"
        return { ...prev, sortOrder: newOrder }
      } else {
        return { ...prev, sortBy: column, sortOrder: "asc" }
      }
    })
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
      setFilters((prev) => ({ ...prev, page: newPage }))
    }
  }

  const getSortIcon = (column: string) => {
    if (filters.sortBy !== column) {
      return <ArrowUpDown className="w-3 h-3 ml-1 text-gray-400" />
    }
    return filters.sortOrder === "asc" ? (
      <ArrowUp className="w-3 h-3 ml-1 text-[#C72920]" />
    ) : (
      <ArrowDown className="w-3 h-3 ml-1 text-[#C72920]" />
    )
  }

  const handleResolveViolation = async (data: { notes: string; added_by: string }) => {
    if (!selectedViolation?._id) return

    try {
      await slaViolationService.resolveViolation(selectedViolation._id, data)
      showToast("Violation resolved successfully!", "success")
      setIsResolveModalOpen(false)
      setSelectedViolation(null)
      fetchViolations()
    } catch (error) {
      console.error("Error resolving violation:", error)
      showToast("Failed to resolve violation. Please try again.", "error")
    }
  }

  const handleResolveClick = (violation: SlaViolation) => {
    // Only allow resolving if status is pending
    if (violation.status !== "pending") {
      showToast("Only pending violations can be resolved.", "error")
      return
    }
    setSelectedViolation(violation)
    setIsResolveModalOpen(true)
  }

  const handleViewClick = (violation: SlaViolation) => {
    setSelectedViolation(violation)
    setIsViewModalOpen(true)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      remarked: "bg-blue-100 text-blue-800",
      resolved: "bg-green-100 text-green-800",
      closed: "bg-gray-100 text-gray-800",
    }
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          statusColors[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const getOrderId = (orderId: SlaViolation["order_id"]) => {
    if (typeof orderId === "string") return orderId
    return orderId?.orderId || "N/A"
  }

  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
    <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">SLA Violations</h2>
          <p className="text-gray-600 text-sm">View and resolve your service level agreement violations</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by order ID or SKU..."
              value={filters.search || ""}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 h-10"
            />
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600 px-2">
            <AlertTriangle className="w-4 h-4" />
            <span className="font-medium">{totalCount} violations</span>
          </div>
        </div>
      </div>

      {/* Violations Table */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="w-5 h-5 text-[#C72920]" />
            SLA Violations ({totalCount})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {fetchingDealerId || loading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          ) : !dealerId ? (
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to Load Violations</h3>
              <p className="text-gray-600 mb-4">
                Could not identify your dealer account. Please refresh the page or contact support.
              </p>
              <Button
                onClick={() => window.location.reload()}
                className="bg-[#C72920] hover:bg-[#C72920]/90 text-white"
              >
                Refresh Page
              </Button>
            </div>
          ) : violations.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No violations found</h3>
              <p className="text-gray-600">
                {filters.search
                  ? "Try adjusting your search criteria."
                  : "No SLA violations to display."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead
                      className="cursor-pointer hover:bg-gray-100 py-3 px-4 font-semibold"
                      onClick={() => handleSort("order_id")}
                    >
                      <div className="flex items-center">
                        Order ID
                        {getSortIcon("order_id")}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-100 py-3 px-4 font-semibold"
                      onClick={() => handleSort("sku")}
                    >
                      <div className="flex items-center">
                        SKU
                        {getSortIcon("sku")}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-100 py-3 px-4 font-semibold"
                      onClick={() => handleSort("violation_minutes")}
                    >
                      <div className="flex items-center">
                        Violation Minutes
                        {getSortIcon("violation_minutes")}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-100 py-3 px-4 font-semibold"
                      onClick={() => handleSort("status")}
                    >
                      <div className="flex items-center">
                        Status
                        {getSortIcon("status")}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-100 py-3 px-4 font-semibold"
                      onClick={() => handleSort("created_at")}
                    >
                      <div className="flex items-center">
                        Created At
                        {getSortIcon("created_at")}
                      </div>
                    </TableHead>
                    <TableHead className="py-3 px-4 font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {violations.map((violation) => (
                    <TableRow key={violation._id} className="hover:bg-gray-50">
                      <TableCell className="py-3 px-4 font-medium">
                        {getOrderId(violation.order_id)}
                      </TableCell>
                      <TableCell className="py-3 px-4 font-mono text-sm">
                        {violation.sku}
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        <span className="font-semibold text-red-600">
                          {Math.round(violation.violation_minutes * 100) / 100} min
                        </span>
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        {getStatusBadge(violation.status)}
                      </TableCell>
                      <TableCell className="py-3 px-4 text-sm text-gray-600">
                        {formatDate(violation.created_at)}
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewClick(violation)}
                            className="h-8 px-3 text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {violation.status === "pending" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleResolveClick(violation)}
                              className="h-8 px-3 text-green-700 hover:text-green-900 hover:bg-green-50"
                              title="Resolve Violation"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing page {currentPage} of {totalPages} ({totalCount} total violations)
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                    className={
                      currentPage === pageNum
                        ? "bg-[#C72920] hover:bg-[#C72920]/90 text-white"
                        : ""
                    }
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Resolve Modal */}
      <Dialog open={isResolveModalOpen} onOpenChange={setIsResolveModalOpen}>
        <DialogContent className="max-w-md" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Resolve SLA Violation</DialogTitle>
          </DialogHeader>
          <ResolveModal
            onSubmit={handleResolveViolation}
            onCancel={() => {
              setIsResolveModalOpen(false)
              setSelectedViolation(null)
            }}
          />
        </DialogContent>
      </Dialog>

      {/* View Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Violation Details</DialogTitle>
          </DialogHeader>
          <ViewViolationModal
            violation={selectedViolation}
            onClose={() => {
              setIsViewModalOpen(false)
              setSelectedViolation(null)
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
