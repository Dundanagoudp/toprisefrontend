"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  MapPin, 
  Truck, 
  Clock,
  DollarSign,
  CheckCircle,
  XCircle
} from "lucide-react"
import { useToast } from "@/components/ui/toast"
import { 
  createPincode, 
  getPincodes, 
  updatePincode, 
  deletePincode,
  type Pincode,
  type PincodeListResponse 
} from "@/service/pincodeServices"
import { PincodeModal } from "./popups/pincode-modal"

export function PincodeManagement() {
  const { showToast } = useToast()
  const [pincodes, setPincodes] = useState<Pincode[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPincode, setEditingPincode] = useState<Pincode | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  
  const itemsPerPage = 10

  const fetchPincodes = async (page: number = 1, search: string = "") => {
    setLoading(true)
    try {
      const response: PincodeListResponse = await getPincodes(page, itemsPerPage, search)
      setPincodes(response.data.pincodes || [])
      setTotalCount(response.data.pagination.totalPincodes || 0)
      setTotalPages(response.data.pagination.totalPages || 1)
    } catch (error) {
      console.error("Error fetching pincodes:", error)
      showToast("Failed to load pincodes. Please refresh the page.", "error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPincodes(currentPage, searchQuery)
  }, [currentPage])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
    fetchPincodes(1, query)
  }

  const handleCreatePincode = async (pincodeData: Omit<Pincode, '_id' | 'created_at' | 'updated_at'>) => {
    try {
      await createPincode(pincodeData)
      showToast("Pincode created successfully!", "success")
      setIsModalOpen(false)
      fetchPincodes(currentPage, searchQuery)
    } catch (error) {
      console.error("Error creating pincode:", error)
      showToast("Failed to create pincode. Please try again.", "error")
    }
  }

  const handleUpdatePincode = async (pincodeId: string, pincodeData: Partial<Pincode>) => {
    try {
      await updatePincode(pincodeId, pincodeData)
      showToast("Pincode updated successfully!", "success")
      setIsModalOpen(false)
      setEditingPincode(null)
      fetchPincodes(currentPage, searchQuery)
    } catch (error) {
      console.error("Error updating pincode:", error)
      showToast("Failed to update pincode. Please try again.", "error")
    }
  }

  const handleDeletePincode = async (pincodeId: string) => {
    setDeletingId(pincodeId)
    try {
      await deletePincode(pincodeId)
      showToast("Pincode deleted successfully!", "success")
      fetchPincodes(currentPage, searchQuery)
    } catch (error) {
      console.error("Error deleting pincode:", error)
      showToast("Failed to delete pincode. Please try again.", "error")
    } finally {
      setDeletingId(null)
    }
  }

  const handleEditClick = (pincode: Pincode) => {
    setEditingPincode(pincode)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingPincode(null)
  }

  const getStatusBadge = (status: string) => {
    return status === "active" ? (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
        <CheckCircle className="w-3 h-3 mr-1" />
        Active
      </Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
        <XCircle className="w-3 h-3 mr-1" />
        Inactive
      </Badge>
    )
  }

  const getDeliveryBadge = (available: boolean) => {
    return available ? (
      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
        <Truck className="w-3 h-3 mr-1" />
        Available
      </Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
        <XCircle className="w-3 h-3 mr-1" />
        Not Available
      </Badge>
    )
  }

  const getCODBadge = (available: boolean) => {
    return available ? (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
        <CheckCircle className="w-3 h-3 mr-1" />
        Available
      </Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
        <XCircle className="w-3 h-3 mr-1" />
        Not Available
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Pincode Management</h2>
          <p className="text-gray-600">Manage delivery areas and pincode settings</p>
        </div>
        
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#C72920] hover:bg-[#C72920]/90 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Pincode
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPincode ? "Edit Pincode" : "Add New Pincode"}
              </DialogTitle>
            </DialogHeader>
            <PincodeModal
              pincode={editingPincode}
              onSubmit={editingPincode ? 
                (data) => handleUpdatePincode(editingPincode._id!, data) : 
                handleCreatePincode
              }
              onCancel={handleModalClose}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Stats */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search by pincode, city, state, or area..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4" />
          <span>{totalCount} pincodes</span>
        </div>
      </div>

      {/* Pincodes Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Pincodes ({totalCount})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-6 w-20" />
                </div>
              ))}
            </div>
          ) : pincodes.length === 0 ? (
            <div className="text-center py-8">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No pincodes found</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery ? "Try adjusting your search criteria." : "Get started by adding your first pincode."}
              </p>
              {!searchQuery && (
                <Button onClick={() => setIsModalOpen(true)} className="bg-[#C72920] hover:bg-[#C72920]/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Pincode
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pincode</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Delivery</TableHead>
                    <TableHead>Charges</TableHead>
                    <TableHead>Days</TableHead>
                    <TableHead>COD</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pincodes.map((pincode) => (
                    <TableRow key={pincode._id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          {pincode.pincode}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{pincode.city}</div>
                          <div className="text-sm text-gray-500">
                            {pincode.area}, {pincode.district}, {pincode.state}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getDeliveryBadge(pincode.delivery_available)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3 text-gray-400" />
                          ₹{pincode.delivery_charges}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-gray-400" />
                          {pincode.estimated_delivery_days} days
                        </div>
                      </TableCell>
                      <TableCell>
                        {getCODBadge(pincode.cod_available)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(pincode.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditClick(pincode)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeletePincode(pincode._id!)}
                            disabled={deletingId === pincode._id}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            {deletingId === pincode._id ? (
                              <div className="w-4 h-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
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
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} pincodes
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
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
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
