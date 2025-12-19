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
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Plus,
  Search,
  Edit,
  Eye,
  Clock,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
} from "lucide-react"
import { useToast } from "@/components/ui/toast"
import {
  slaTypesService,
  type SlaType,
  type SlaTypeFilters,
  type SlaTypeListResponse,
} from "@/service/slaViolations-Service"
import { CreateSlaModal } from "./popups/slapopup/createsla"
import { UpdateSlaModal } from "./popups/slapopup/updatesla"
import { ViewSlaModal } from "./popups/slapopup/viewsla"

export function SlaTypesTab() {
  const { showToast } = useToast()
  const [slaTypes, setSlaTypes] = useState<SlaType[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [editingSlaType, setEditingSlaType] = useState<SlaType | null>(null)
  const [viewingSlaType, setViewingSlaType] = useState<SlaType | null>(null)
  const [loadingView, setLoadingView] = useState(false)

  const itemsPerPage = 10

  const [filters, setFilters] = useState<SlaTypeFilters>({
    search: "",
    sortBy: "created_at",
    sortOrder: "desc",
    page: 1,
    limit: itemsPerPage,
  })

  const fetchSlaTypes = async () => {
    setLoading(true)
    try {
      const response: SlaTypeListResponse = await slaTypesService.getSlaTypes(filters)
      const fetchedSlaTypes = response.data.data || []
      setSlaTypes(fetchedSlaTypes)
      setTotalCount(response.data.pagination.totalItems || 0)
      setTotalPages(response.data.pagination.totalPages || 1)
    } catch (error) {
      console.error("Error fetching SLA types:", error)
      showToast("Failed to load SLA types. Please refresh the page.", "error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSlaTypes()
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

  const handleCreateSlaType = async (
    slaTypeData: Omit<SlaType, "_id" | "created_at" | "updated_at" | "__v">
  ) => {
    try {
      await slaTypesService.createSlaType(slaTypeData)
      showToast("SLA Type created successfully!", "success")
      setIsCreateModalOpen(false)
      fetchSlaTypes()
    } catch (error) {
      console.error("Error creating SLA type:", error)
      showToast("Failed to create SLA type. Please try again.", "error")
    }
  }

  const handleUpdateSlaType = async (
    slaTypeId: string,
    slaTypeData: Partial<SlaType>
  ) => {
    try {
      await slaTypesService.updateSlaType(slaTypeId, slaTypeData)
      showToast("SLA Type updated successfully!", "success")
      setIsUpdateModalOpen(false)
      setEditingSlaType(null)
      fetchSlaTypes()
    } catch (error) {
      console.error("Error updating SLA type:", error)
      showToast("Failed to update SLA type. Please try again.", "error")
    }
  }

  const handleEditClick = (slaType: SlaType) => {
    setEditingSlaType(slaType)
    setIsUpdateModalOpen(true)
  }

  const handleViewClick = async (slaTypeId: string) => {
    setLoadingView(true)
    setIsViewModalOpen(true)
    setViewingSlaType(null)

    try {
      const response = await slaTypesService.getSlaTypeById(slaTypeId)
      setViewingSlaType(response.data)
    } catch (error) {
      console.error("Error fetching SLA type:", error)
      showToast("Failed to fetch SLA type details. Please try again.", "error")
      setIsViewModalOpen(false)
    } finally {
      setLoadingView(false)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">SLA Types Management</h2>
          <p className="text-gray-600">Manage service level agreement types and expectations</p>
        </div>

        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#C72920] hover:bg-[#C72920]/90 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add SLA Type
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg" aria-describedby={undefined}>
            <DialogHeader>
              <DialogTitle>Add New SLA Type</DialogTitle>
            </DialogHeader>
            <CreateSlaModal
              onSubmit={handleCreateSlaType}
              onCancel={() => setIsCreateModalOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search by name or description..."
            value={filters.search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>{totalCount} SLA types</span>
        </div>
      </div>

      {/* SLA Types Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            SLA Types ({totalCount})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          ) : slaTypes.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No SLA types found</h3>
              <p className="text-gray-600 mb-4">
                {filters.search
                  ? "Try adjusting your search criteria."
                  : "Get started by adding your first SLA type."}
              </p>
              {!filters.search && (
                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-[#C72920] hover:bg-[#C72920]/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First SLA Type
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort("name")}
                    >
                      <div className="flex items-center">
                        Name
                        {getSortIcon("name")}
                      </div>
                    </TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort("expected_hours")}
                    >
                      <div className="flex items-center">
                        Expected Minutes
                        {getSortIcon("expected_hours")}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort("created_at")}
                    >
                      <div className="flex items-center">
                        Created At
                        {getSortIcon("created_at")}
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {slaTypes.map((slaType) => (
                    <TableRow key={slaType._id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          {slaType.name}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {slaType.description}
                      </TableCell>
                      <TableCell>{slaType.expected_hours} minutes</TableCell>
                      <TableCell>{formatDate(slaType.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewClick(slaType._id!)}
                            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditClick(slaType)}
                            className="h-8 w-8 p-0"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
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
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} SLA types
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const newPage = Math.max(1, currentPage - 1)
                setCurrentPage(newPage)
                setFilters((prev) => ({ ...prev, page: newPage }))
              }}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600">
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
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Update Modal */}
      <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
        <DialogContent className="max-w-lg" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Edit SLA Type</DialogTitle>
          </DialogHeader>
          {editingSlaType && (
            <UpdateSlaModal
              slaType={editingSlaType}
              onSubmit={handleUpdateSlaType}
              onCancel={() => {
                setIsUpdateModalOpen(false)
                setEditingSlaType(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-2xl" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#C72920]" />
              SLA Type Details
            </DialogTitle>
          </DialogHeader>
          <ViewSlaModal
            slaType={viewingSlaType}
            loading={loadingView}
            onClose={() => {
              setIsViewModalOpen(false)
              setViewingSlaType(null)
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

