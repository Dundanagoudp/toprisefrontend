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
  MessageSquare,
  XCircle,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Eye,
} from "lucide-react"
import { useToast } from "@/components/ui/toast"
import { slaViolationService } from "@/service/sla-violation-service"
import type { SlaViolation, SlaViolationFilters } from "@/types/sla-violation-types"
import { RemarkModal } from "./modules/remark-modal"
import { CloseModal } from "./modules/close-modal"
import { ViewViolationModal } from "./modules/view-violation-modal"

export default function SlaVoilationspage() {
  const { showToast } = useToast()
  const [violations, setViolations] = useState<SlaViolation[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [isRemarkModalOpen, setIsRemarkModalOpen] = useState(false)
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false)
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

  const fetchViolations = async () => {
    setLoading(true)
    try {
      const response = await slaViolationService.getSlaViolations(filters)
      const fetchedViolations = response.data.data || []
      setViolations(fetchedViolations)
      setTotalCount(response.data.pagination.totalItems || 0)
      setTotalPages(response.data.pagination.totalPages || 1)
    } catch (error) {
      console.error("Error fetching SLA violations:", error)
      showToast("Failed to load SLA violations. Please refresh the page.", "error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchViolations()
  }, [filters])

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

  const handleAddRemark = async (data: { notes: string; added_by: string }) => {
    if (!selectedViolation?._id) return

    try {
      await slaViolationService.addRemark(selectedViolation._id, data)
      showToast("Remark added successfully!", "success")
      setIsRemarkModalOpen(false)
      setSelectedViolation(null)
      fetchViolations()
    } catch (error) {
      console.error("Error adding remark:", error)
      showToast("Failed to add remark. Please try again.", "error")
    }
  }

  const handleCloseViolation = async (data: { notes: string; added_by: string }) => {
    if (!selectedViolation?._id) return

    try {
      await slaViolationService.closeViolation(selectedViolation._id, data)
      showToast("Violation closed successfully!", "success")
      setIsCloseModalOpen(false)
      setSelectedViolation(null)
      fetchViolations()
    } catch (error) {
      console.error("Error closing violation:", error)
      showToast("Failed to close violation. Please try again.", "error")
    }
  }

  const handleRemarkClick = (violation: SlaViolation) => {
    setSelectedViolation(violation)
    setIsRemarkModalOpen(true)
  }

  const handleCloseClick = (violation: SlaViolation) => {
    setSelectedViolation(violation)
    setIsCloseModalOpen(true)
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
          <p className="text-gray-600 text-sm">Manage and track service level agreement violations</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search by order ID, SKU, or dealer..."
            value={filters.search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 h-10"
          />
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600 px-2">
          <AlertTriangle className="w-4 h-4" />
          <span className="font-medium">{totalCount} violations</span>
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
          {loading ? (
            <div className="space-y-3">
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
                    <TableHead className="py-3 px-4 font-semibold">Dealer ID</TableHead>
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
                    <TableHead className="text-right py-3 px-4 font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {violations.map((violation) => (
                    <TableRow key={violation._id} className="hover:bg-gray-50">
                      <TableCell className="font-medium py-4 px-4">
                        <span className="text-sm">{getOrderId(violation.order_id)}</span>
                      </TableCell>
                      <TableCell className="py-4 px-4">
                        <span className="text-sm font-mono">{violation.sku}</span>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600 py-4 px-4">
                        <span className="font-mono">{violation.dealer_id.substring(0, 8)}...</span>
                      </TableCell>
                      <TableCell className="py-4 px-4">
                        <span className="font-semibold text-red-600 text-sm">
                          {Math.round(violation.violation_minutes * 100) / 100} min
                        </span>
                      </TableCell>
                      <TableCell className="py-4 px-4">{getStatusBadge(violation.status)}</TableCell>
                      <TableCell className="py-4 px-4">
                        <span className="text-sm text-gray-600">{formatDate(violation.created_at)}</span>
                      </TableCell>
                      <TableCell className="text-right py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewClick(violation)}
                            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {violation.status !== "pending" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemarkClick(violation)}
                              className="h-8 px-3 text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-xs font-medium transition-colors"
                              title="Add Remark"
                            >
                              <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                              Remarks
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCloseClick(violation)}
                            disabled={violation.status === "closed"}
                            className="h-8 px-3 text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium transition-colors"
                            title={violation.status === "closed" ? "Already Closed" : "Close Violation"}
                          >
                            <XCircle className="w-3.5 h-3.5 mr-1.5" />
                            Close
                          </Button>
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
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-gray-600">
            Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
            <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalCount)}</span> of{" "}
            <span className="font-medium">{totalCount}</span> violations
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const newPage = Math.max(1, currentPage - 1)
                setCurrentPage(newPage)
                setFilters((prev) => ({ ...prev, page: newPage }))
              }}
              disabled={currentPage === 1}
              className="h-9 px-4"
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600 font-medium min-w-[80px] text-center">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const newPage = Math.min(totalPages, currentPage + 1)
                setCurrentPage(newPage)
                setFilters((prev) => ({ ...prev, page: newPage }))
              }}
              disabled={currentPage === totalPages}
              className="h-9 px-4"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Remark Modal */}
      <Dialog open={isRemarkModalOpen} onOpenChange={setIsRemarkModalOpen}>
        <DialogContent className="max-w-lg" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Add Remark</DialogTitle>
          </DialogHeader>
          <RemarkModal
            onSubmit={handleAddRemark}
            onCancel={() => {
              setIsRemarkModalOpen(false)
              setSelectedViolation(null)
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Close Modal */}
      <Dialog open={isCloseModalOpen} onOpenChange={setIsCloseModalOpen}>
        <DialogContent className="max-w-lg" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Close Violation</DialogTitle>
          </DialogHeader>
          <CloseModal
            onSubmit={handleCloseViolation}
            onCancel={() => {
              setIsCloseModalOpen(false)
              setSelectedViolation(null)
            }}
          />
        </DialogContent>
      </Dialog>

      {/* View Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#C72920]" />
              Violation Details
            </DialogTitle>
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
