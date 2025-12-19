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
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Filter,
  X,
  Upload,
  Eye
} from "lucide-react"
import { useToast } from "@/components/ui/toast"
import { 
  createPincode, 
  getPincodes, 
  updatePincode, 
  deletePincode,
  bulkDeletePincodes,
  getPincodeById,
  getPincodeMetadata,
  type Pincode,
  type PincodeListResponse,
  type PincodeFilters,
  type PincodeMetadata
} from "@/service/pincodeServices"
import { PincodeModal } from "./popups/pincode-modal"
import { BulkUploadModal } from "./popups/pincodebulkupload"
import { PincodeViewModal } from "./popups/pincodeviewmodal"

export function PincodeManagement() {
  const { showToast } = useToast()
  const [pincodes, setPincodes] = useState<Pincode[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPincode, setEditingPincode] = useState<Pincode | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(true)
  const [selectedPincodes, setSelectedPincodes] = useState<string[]>([])
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false)
  const [deletingPincode, setDeletingPincode] = useState<Pincode | null>(null)
  const [bulkDeleting, setBulkDeleting] = useState(false)
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [viewingPincode, setViewingPincode] = useState<Pincode | null>(null)
  const [loadingView, setLoadingView] = useState(false)
  
  const itemsPerPage = 20

  // Comprehensive filter state
  const [filters, setFilters] = useState<PincodeFilters>({
    search: "",
    city: "",
    state: "",
    district: "",
    area: "",
    shipRocket_availability: "",
    borzo_standard: "",
    borzo_endOfDay: "",
    status: "",
    estimated_delivery_days: "",
    sortBy: "created_at",
    sortOrder: "desc",
    page: 1,
    limit: 20
  })

  // Metadata for filter dropdowns
  const [metadata, setMetadata] = useState<PincodeMetadata>({
    states: [],
    districts: [],
    cities: [],
    areas: []
  })

  // Filtered options based on current selections
  const [filteredDistricts, setFilteredDistricts] = useState<string[]>([])
  const [filteredCities, setFilteredCities] = useState<string[]>([])
  const [filteredAreas, setFilteredAreas] = useState<string[]>([])

  const fetchPincodes = async () => {
    setLoading(true)
    try {
      const response: PincodeListResponse = await getPincodes(filters)
      const fetchedPincodes = response.data.pincodes || []
      setPincodes(fetchedPincodes)
      setTotalCount(response.data.pagination.totalItems || 0)
      setTotalPages(response.data.pagination.totalPages || 1)
      
      // Update filtered dropdown options based on current selections
      updateFilteredOptions(fetchedPincodes)
      
      // Clear selection after fetch
      setSelectedPincodes([])
    } catch (error) {
      console.error("Error fetching pincodes:", error)
      showToast("Failed to load pincodes. Please refresh the page.", "error")
    } finally {
      setLoading(false)
    }
  }

  const updateFilteredOptions = (fetchedPincodes: Pincode[]) => {
    // Filter districts based on selected state
    if (filters.state) {
      const districts = [...new Set(
        fetchedPincodes
          .filter(p => p.state === filters.state)
          .map(p => p.district)
      )].filter(Boolean).sort()
      setFilteredDistricts(districts)
    } else {
      setFilteredDistricts(metadata.districts)
    }

    // Filter cities based on selected district
    if (filters.district) {
      const cities = [...new Set(
        fetchedPincodes
          .filter(p => (!filters.state || p.state === filters.state) && p.district === filters.district)
          .map(p => p.city)
      )].filter(Boolean).sort()
      setFilteredCities(cities)
    } else if (filters.state) {
      const cities = [...new Set(
        fetchedPincodes
          .filter(p => p.state === filters.state)
          .map(p => p.city)
      )].filter(Boolean).sort()
      setFilteredCities(cities)
    } else {
      setFilteredCities(metadata.cities)
    }

    // Filter areas based on selected city
    if (filters.city) {
      const areas = [...new Set(
        fetchedPincodes
          .filter(p => 
            (!filters.state || p.state === filters.state) && 
            (!filters.district || p.district === filters.district) && 
            p.city === filters.city
          )
          .map(p => p.area)
      )].filter(Boolean).sort()
      setFilteredAreas(areas)
    } else if (filters.district) {
      const areas = [...new Set(
        fetchedPincodes
          .filter(p => 
            (!filters.state || p.state === filters.state) && 
            p.district === filters.district
          )
          .map(p => p.area)
      )].filter(Boolean).sort()
      setFilteredAreas(areas)
    } else if (filters.state) {
      const areas = [...new Set(
        fetchedPincodes
          .filter(p => p.state === filters.state)
          .map(p => p.area)
      )].filter(Boolean).sort()
      setFilteredAreas(areas)
    } else {
      setFilteredAreas(metadata.areas)
    }
  }

  useEffect(() => {
    fetchPincodes()
  }, [filters])

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const response = await getPincodeMetadata()
        setMetadata(response.data)
        // Initialize filtered options with all metadata
        setFilteredDistricts(response.data.districts)
        setFilteredCities(response.data.cities)
        setFilteredAreas(response.data.areas)
      } catch (error) {
        console.error("Error fetching pincode metadata:", error)
        showToast("Failed to load filter options. Please refresh the page.", "error")
      }
    }
    fetchMetadata()
  }, [])

  const handleFilterChange = (key: keyof PincodeFilters, value: string) => {
    // Convert "all" or empty values to empty string for the filter state
    const filterValue = value === "all" ? "" : value
    
    // Clear dependent filters when parent filter changes
    setFilters(prev => {
      const newFilters = {
        ...prev,
        [key]: filterValue,
        page: 1 // Reset to first page on filter change
      }
      
      // If state changes, clear district, city, and area
      if (key === 'state') {
        newFilters.district = ""
        newFilters.city = ""
        newFilters.area = ""
      }
      // If district changes, clear city and area
      else if (key === 'district') {
        newFilters.city = ""
        newFilters.area = ""
      }
      // If city changes, clear area
      else if (key === 'city') {
        newFilters.area = ""
      }
      
      return newFilters
    })
    setCurrentPage(1)
  }

  const handleSearch = (query: string) => {
    handleFilterChange('search', query)
  }

  const handleClearFilters = () => {
    setFilters({
      search: "",
      city: "",
      state: "",
      district: "",
      area: "",
      shipRocket_availability: "",
      borzo_standard: "",
      borzo_endOfDay: "",
      status: "",
      estimated_delivery_days: "",
      sortBy: "created_at",
      sortOrder: "desc",
      page: 1,
      limit: 20
    })
    setCurrentPage(1)
    // Reset filtered options to full metadata
    setFilteredDistricts(metadata.districts)
    setFilteredCities(metadata.cities)
    setFilteredAreas(metadata.areas)
  }

  const handleSort = (column: string) => {
    setFilters(prev => {
      if (prev.sortBy === column) {
        // Toggle sort order
        const newOrder = prev.sortOrder === "asc" ? "desc" : "asc"
        return { ...prev, sortOrder: newOrder }
      } else {
        // New column, default to ascending
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

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPincodes(pincodes.map(p => p._id!))
    } else {
      setSelectedPincodes([])
    }
  }

  const handleSelectPincode = (pincodeId: string, checked: boolean) => {
    if (checked) {
      setSelectedPincodes(prev => [...prev, pincodeId])
    } else {
      setSelectedPincodes(prev => prev.filter(id => id !== pincodeId))
    }
  }

  const handleBulkDeleteClick = () => {
    if (selectedPincodes.length === 0) return
    setBulkDeleteConfirmOpen(true)
  }

  const confirmBulkDelete = async () => {
    if (selectedPincodes.length === 0) return

    setBulkDeleting(true)
    try {
      await bulkDeletePincodes(selectedPincodes)
      showToast(`Successfully deleted ${selectedPincodes.length} pincode(s)`, "success")
      setSelectedPincodes([])
      setBulkDeleteConfirmOpen(false)
      fetchPincodes()
    } catch (error) {
      console.error("Error bulk deleting pincodes:", error)
      showToast("Failed to delete pincodes. Please try again.", "error")
    } finally {
      setBulkDeleting(false)
    }
  }

  const handleViewClick = async (pincodeId: string) => {
    setLoadingView(true)
    setIsViewModalOpen(true)
    setViewingPincode(null)
    
    try {
      const response = await getPincodeById(pincodeId)
      // Ensure we're setting a single Pincode object
      const pincodeData: Pincode = Array.isArray(response.data) ? response.data[0] : response.data
      setViewingPincode(pincodeData)
    } catch (error) {
      console.error("Error fetching pincode:", error)
      showToast("Failed to fetch pincode details. Please try again.", "error")
      setIsViewModalOpen(false)
    } finally {
      setLoadingView(false)
    }
  }

  const handleCreatePincode = async (pincodeData: Omit<Pincode, '_id' | 'created_at' | 'updated_at'>) => {
    try {
      await createPincode(pincodeData)
      showToast("Pincode created successfully!", "success")
      setIsModalOpen(false)
      fetchPincodes()
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
      fetchPincodes()
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
      fetchPincodes()
    } catch (error) {
      console.error("Error deleting pincode:", error)
      showToast("Failed to delete pincode. Please try again.", "error")
    } finally {
      setDeletingId(null)
    }
  }

  const handleDeleteClick = (pincode: Pincode) => {
    setDeletingPincode(pincode)
    setDeleteConfirmOpen(true)
  }

  const confirmDeletePincode = async () => {
    if (!deletingPincode?._id) return

    await handleDeletePincode(deletingPincode._id)
    setDeleteConfirmOpen(false)
    setDeletingPincode(null)
  }

  const handleEditClick = (pincode: Pincode) => {
    setEditingPincode(pincode)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingPincode(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Pincode Management</h2>
          <p className="text-gray-600">Manage delivery areas and pincode settings</p>
        </div>
        
        <div className="flex items-center gap-2">
          {selectedPincodes.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDeleteClick}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Selected ({selectedPincodes.length})
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsBulkUploadOpen(true)}
            className="border-[#C72920] text-[#C72920] hover:bg-[#C72920] hover:text-white"
          >
            <Upload className="w-4 h-4 mr-2" />
            Bulk Upload
          </Button>
          
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

          {/* Single Delete Confirmation */}
          <Dialog
            open={deleteConfirmOpen}
            onOpenChange={(open) => {
              setDeleteConfirmOpen(open)
              if (!open) setDeletingPincode(null)
            }}
          >
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-red-600">
                  <Trash2 className="w-5 h-5" />
                  Delete Pincode
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <p className="text-sm text-gray-600">Are you sure you want to delete this pincode?</p>

                {deletingPincode && (
                  <div className="bg-gray-50 p-3 rounded-md space-y-1">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="font-semibold">{deletingPincode.pincode}</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {deletingPincode.city}, {deletingPincode.state}
                    </p>
                  </div>
                )}

                <p className="text-sm text-gray-500">This action cannot be undone.</p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setDeleteConfirmOpen(false)
                    setDeletingPincode(null)
                  }}
                  disabled={deletingId !== null}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmDeletePincode}
                  disabled={deletingId !== null || !deletingPincode?._id}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {deletingId === deletingPincode?._id ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Deleting...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </div>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Bulk Delete Confirmation */}
          <Dialog open={bulkDeleteConfirmOpen} onOpenChange={setBulkDeleteConfirmOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-red-600">
                  <Trash2 className="w-5 h-5" />
                  Bulk Delete Pincodes
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold">{selectedPincodes.length}</span> pincode(s)?
                </p>
                <div className="bg-red-50 border border-red-200 p-3 rounded-md">
                  <p className="text-sm text-red-800 font-medium">
                    Warning: This will permanently delete {selectedPincodes.length} pincode(s).
                  </p>
                </div>
                <p className="text-sm text-gray-500">This action cannot be undone.</p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setBulkDeleteConfirmOpen(false)}
                  disabled={bulkDeleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmBulkDelete}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={bulkDeleting || selectedPincodes.length === 0}
                >
                  {bulkDeleting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Deleting...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Trash2 className="w-4 h-4" />
                      Delete {selectedPincodes.length}
                    </div>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Stats */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search by pincode, city, state, or area..."
            value={filters.search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </Button>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>{totalCount} pincodes</span>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      {showFilters && (
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-5">
            <div className="space-y-5">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-700" />
                  <h3 className="text-sm font-semibold text-gray-900">Filter Pincodes</h3>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearFilters}
                  className="h-8 text-xs border-gray-300 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                >
                  <X className="w-3 h-3 mr-1" />
                  Clear All Filters
                </Button>
              </div>

              {/* Location Section */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Location</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="filter-state" className="text-sm font-medium text-gray-700 block">
                      State
                    </label>
                    <Select
                      value={filters.state || "all"}
                      onValueChange={(value) => handleFilterChange('state', value)}
                    >
                      <SelectTrigger id="filter-state" className="h-10 text-sm w-full focus:ring-2 focus:ring-[#C72920] focus:ring-offset-0">
                        <SelectValue placeholder="Select State" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All States</SelectItem>
                        {metadata.states.sort().map((state) => (
                          <SelectItem key={state} value={state}>{state}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="filter-district" className="text-sm font-medium text-gray-700 block">
                      District
                    </label>
                    <Select
                      value={filters.district || "all"}
                      onValueChange={(value) => handleFilterChange('district', value)}
                      disabled={!filters.state}
                    >
                      <SelectTrigger 
                        id="filter-district" 
                        className="h-10 text-sm w-full focus:ring-2 focus:ring-[#C72920] focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <SelectValue placeholder={filters.state ? "Select District" : "Select State first"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Districts</SelectItem>
                        {filteredDistricts.map((district) => (
                          <SelectItem key={district} value={district}>{district}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="filter-city" className="text-sm font-medium text-gray-700 block">
                      City
                    </label>
                    <Select
                      value={filters.city || "all"}
                      onValueChange={(value) => handleFilterChange('city', value)}
                      disabled={!filters.district}
                    >
                      <SelectTrigger 
                        id="filter-city" 
                        className="h-10 text-sm w-full focus:ring-2 focus:ring-[#C72920] focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <SelectValue placeholder={filters.district ? "Select City" : "Select District first"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Cities</SelectItem>
                        {filteredCities.map((city) => (
                          <SelectItem key={city} value={city}>{city}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="filter-area" className="text-sm font-medium text-gray-700 block">
                      Area
                    </label>
                    <Select
                      value={filters.area || "all"}
                      onValueChange={(value) => handleFilterChange('area', value)}
                      disabled={!filters.city}
                    >
                      <SelectTrigger 
                        id="filter-area" 
                        className="h-10 text-sm w-full focus:ring-2 focus:ring-[#C72920] focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <SelectValue placeholder={filters.city ? "Select Area" : "Select City first"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Areas</SelectItem>
                        {filteredAreas.map((area) => (
                          <SelectItem key={area} value={area}>{area}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Order Settings Section */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Order Settings</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="filter-borzo-standard" className="text-sm font-medium text-gray-700 block">
                      Borzo Standard
                    </label>
                    <Select
                      value={filters.borzo_standard || "all"}
                      onValueChange={(value) => handleFilterChange('borzo_standard', value)}
                    >
                      <SelectTrigger id="filter-borzo-standard" className="h-10 text-sm w-full focus:ring-2 focus:ring-[#C72920] focus:ring-offset-0">
                        <SelectValue placeholder="Select Option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="true">Available</SelectItem>
                        <SelectItem value="false">Not Available</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="filter-borzo-eod" className="text-sm font-medium text-gray-700 block">
                      Borzo End of Day
                    </label>
                    <Select
                      value={filters.borzo_endOfDay || "all"}
                      onValueChange={(value) => handleFilterChange('borzo_endOfDay', value)}
                    >
                      <SelectTrigger id="filter-borzo-eod" className="h-10 text-sm w-full focus:ring-2 focus:ring-[#C72920] focus:ring-offset-0">
                        <SelectValue placeholder="Select Option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="true">Available</SelectItem>
                        <SelectItem value="false">Not Available</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
                {filters.search || filters.city || filters.state ? "Try adjusting your search or filter criteria." : "Get started by adding your first pincode."}
              </p>
              {!filters.search && !filters.city && (
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
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedPincodes.length === pincodes.length && pincodes.length > 0}
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all"
                      />
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('pincode')}
                    >
                      <div className="flex items-center">
                        Pincode
                        {getSortIcon('pincode')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('city')}
                    >
                      <div className="flex items-center">
                        City
                        {getSortIcon('city')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('state')}
                    >
                      <div className="flex items-center">
                        State
                        {getSortIcon('state')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('district')}
                    >
                      <div className="flex items-center">
                        District
                        {getSortIcon('district')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('area')}
                    >
                      <div className="flex items-center">
                        Area
                        {getSortIcon('area')}
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pincodes.map((pincode) => (
                    <TableRow key={pincode._id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedPincodes.includes(pincode._id!)}
                          onCheckedChange={(checked) => handleSelectPincode(pincode._id!, checked as boolean)}
                          aria-label={`Select pincode ${pincode.pincode}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          {pincode.pincode}
                        </div>
                      </TableCell>
                      <TableCell>{pincode.city}</TableCell>
                      <TableCell>{pincode.state}</TableCell>
                      <TableCell>{pincode.district}</TableCell>
                      <TableCell>{pincode.area}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewClick(pincode._id!)}
                            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditClick(pincode)}
                            className="h-8 w-8 p-0"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(pincode)}
                            disabled={deletingId === pincode._id}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Delete"
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
              onClick={() => {
                const newPage = Math.max(1, currentPage - 1)
                setCurrentPage(newPage)
                setFilters(prev => ({ ...prev, page: newPage }))
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
                setFilters(prev => ({ ...prev, page: newPage }))
              }}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Single Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-5 h-5" />
              Delete Pincode
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to delete this pincode?
            </p>
            {deletingPincode && (
              <div className="bg-gray-50 p-3 rounded-md space-y-1">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="font-semibold">{deletingPincode.pincode}</span>
                </div>
                <p className="text-sm text-gray-600">
                  {deletingPincode.city}, {deletingPincode.state}
                </p>
              </div>
            )}
            <p className="text-sm text-gray-500">
              This action cannot be undone.
            </p>
          </div>
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteConfirmOpen(false)
                setDeletingPincode(null)
              }}
              disabled={deletingId !== null}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeletePincode}
              disabled={deletingId !== null}
              className="bg-red-600 hover:bg-red-700"
            >
              {deletingId === deletingPincode?._id ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Deleting...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  Delete Pincode
                </div>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog open={bulkDeleteConfirmOpen} onOpenChange={setBulkDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-5 h-5" />
              Bulk Delete Pincodes
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to delete <span className="font-semibold">{selectedPincodes.length}</span> pincode(s)?
            </p>
            <div className="bg-red-50 border border-red-200 p-3 rounded-md">
              <p className="text-sm text-red-800 font-medium">
                ⚠️ Warning: This will permanently delete {selectedPincodes.length} pincode(s)
              </p>
            </div>
            <p className="text-sm text-gray-500">
              This action cannot be undone.
            </p>
          </div>
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setBulkDeleteConfirmOpen(false)}
              disabled={bulkDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmBulkDelete}
              disabled={bulkDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {bulkDeleting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Deleting...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  Delete {selectedPincodes.length} Pincode(s)
                </div>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Upload Dialog */}
      <Dialog open={isBulkUploadOpen} onOpenChange={setIsBulkUploadOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-[#C72920]" />
              Bulk Upload Pincodes
            </DialogTitle>
          </DialogHeader>
          <BulkUploadModal
            onSuccess={() => {
              setIsBulkUploadOpen(false)
              fetchPincodes()
              showToast("Pincodes uploaded successfully!", "success")
            }}
            onCancel={() => {
              setIsBulkUploadOpen(false)
              fetchPincodes() // Refresh list even if there were errors
            }}
          />
        </DialogContent>
      </Dialog>

      {/* View Pincode Dialog */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#C72920]" />
              Pincode Details
            </DialogTitle>
          </DialogHeader>
          <PincodeViewModal
            pincode={viewingPincode}
            loading={loadingView}
            onClose={() => {
              setIsViewModalOpen(false)
              setViewingPincode(null)
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
