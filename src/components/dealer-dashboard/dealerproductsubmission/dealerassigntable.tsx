"use client"
import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Plus, Loader2, Send } from "lucide-react"
import { useToast as useGlobalToast } from "@/components/ui/toast"
import { Badge } from "@/components/ui/badge"
import { useEffect } from "react"
import Image from "next/image"
import React from "react"
import { useRouter } from "next/navigation"
import uploadFile from "../../../../public/assets/uploadFile.svg"
import useDebounce from "@/utils/useDebounce"
import SearchInput from "@/components/common/search/SearchInput"
import DynamicButton from "@/components/common/button/button"
import { DataTable } from "@/components/common/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import Emptydata from "@/components/user-dashboard/product/module/Emptydata"
import DynamicPagination from "@/components/common/pagination/DynamicPagination"

// Product type for table
type Product = {
  id: string
  image: string
  name: string
  categories: string
  subCategories: string
  brand: string
  productType: string
  status: string
}

// Mock data for products
const mockProducts: Product[] = [
  {
    id: "1",
    image: "/placeholder.svg?height=64&width=80",
    name: "Front Brake Pad - Swift 2016 Petrol",
    categories: "Braking System",
    subCategories: "Brake Pads",
    brand: "Bosch",
    productType: "Aftermarket",
    status: "Active",
  },
  {
    id: "2",
    image: "/placeholder.svg?height=64&width=80",
    name: "Front Brake Pad - Swift 2016 Petrol",
    categories: "Braking System",
    subCategories: "Brake Pads",
    brand: "Bosch",
    productType: "Aftermarket",
    status: "Disable",
  },
  {
    id: "3",
    image: "/placeholder.svg?height=64&width=80",
    name: "Front Brake Pad - Swift 2016 Petrol",
    categories: "Braking System",
    subCategories: "Brake Pads",
    brand: "Bosch",
    productType: "Aftermarket",
    status: "Active",
  },
  {
    id: "4",
    image: "/placeholder.svg?height=64&width=80",
    name: "Front Brake Pad - Swift 2016 Petrol",
    categories: "Braking System",
    subCategories: "Brake Pads",
    brand: "Bosch",
    productType: "Aftermarket",
    status: "Pending",
  },
  {
    id: "5",
    image: "/placeholder.svg?height=64&width=80",
    name: "Front Brake Pad - Swift 2016 Petrol",
    categories: "Braking System",
    subCategories: "Brake Pads",
    brand: "Bosch",
    productType: "Aftermarket",
    status: "Active",
  },
  {
    id: "6",
    image: "/placeholder.svg?height=64&width=80",
    name: "Front Brake Pad - Swift 2016 Petrol",
    categories: "Braking System",
    subCategories: "Brake Pads",
    brand: "Bosch",
    productType: "Aftermarket",
    status: "Active",
  },
  {
    id: "7",
    image: "/placeholder.svg?height=64&width=80",
    name: "Front Brake Pad - Swift 2016 Petrol",
    categories: "Braking System",
    subCategories: "Brake Pads",
    brand: "Bosch",
    productType: "Aftermarket",
    status: "Pending",
  },
  {
    id: "8",
    image: "/placeholder.svg?height=64&width=80",
    name: "Front Brake Pad - Swift 2016 Petrol",
    categories: "Braking System",
    subCategories: "Brake Pads",
    brand: "Bosch",
    productType: "Aftermarket",
    status: "Active",
  },
  {
    id: "9",
    image: "/placeholder.svg?height=64&width=80",
    name: "Front Brake Pad - Swift 2016 Petrol",
    categories: "Braking System",
    subCategories: "Brake Pads",
    brand: "Bosch",
    productType: "Aftermarket",
    status: "Pending",
  },
  {
    id: "10",
    image: "/placeholder.svg?height=64&width=80",
    name: "Front Brake Pad - Swift 2016 Petrol",
    categories: "Braking System",
    subCategories: "Brake Pads",
    brand: "Bosch",
    productType: "Aftermarket",
    status: "Active",
  },
  {
    id: "11",
    image: "/placeholder.svg?height=64&width=80",
    name: "Front Brake Pad - Swift 2016 Petrol",
    categories: "Braking System",
    subCategories: "Brake Pads",
    brand: "Bosch",
    productType: "Aftermarket",
    status: "Pending",
  },
  {
    id: "12",
    image: "/placeholder.svg?height=64&width=80",
    name: "Front Brake Pad - Swift 2016 Petrol",
    categories: "Braking System",
    subCategories: "Brake Pads",
    brand: "Bosch",
    productType: "Aftermarket",
    status: "Active",
  },
  {
    id: "13",
    image: "/placeholder.svg?height=64&width=80",
    name: "Front Brake Pad - Swift 2016 Petrol",
    categories: "Braking System",
    subCategories: "Brake Pads",
    brand: "Bosch",
    productType: "Aftermarket",
    status: "Pending",
  },
  {
    id: "14",
    image: "/placeholder.svg?height=64&width=80",
    name: "Front Brake Pad - Swift 2016 Petrol",
    categories: "Braking System",
    subCategories: "Brake Pads",
    brand: "Bosch",
    productType: "Aftermarket",
    status: "Active",
  },
  {
    id: "15",
    image: "/placeholder.svg?height=64&width=80",
    name: "Front Brake Pad - Swift 2016 Petrol",
    categories: "Braking System",
    subCategories: "Brake Pads",
    brand: "Bosch",
    productType: "Aftermarket",
    status: "Pending",
  },
]

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Active":
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">{status}</Badge>
    case "Disable":
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">{status}</Badge>
    case "Pending":
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">{status}</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

export default function DealerAssignTable() {
  const route = useRouter()
  const { showToast } = useGlobalToast()
  const [searchInput, setSearchInput] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [selectedTab, setSelectedTab] = useState("All")
  const [currentPage, setCurrentPage] = useState(1)
  const [loadingTab, setLoadingTab] = useState(false)
  const [addProductLoading, setAddProductLoading] = useState(false)
  const [uploadBulkLoading, setUploadBulkLoading] = useState(false)
  const [editBulkLoading, setEditBulkLoading] = useState(false)
  const [assignBulkLoading, setAssignBulkLoading] = useState(false)
  const [viewProductLoading, setViewProductLoading] = useState<string | null>(null)
  const [sendApprovalLoading, setSendApprovalLoading] = useState(false)
  const cardsPerPage = 10

  // Debounced search functionality
  const performSearch = useCallback((query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
    setIsSearching(false)
  }, [])
  const { debouncedCallback: debouncedSearch, cleanup: cleanupDebounce } = useDebounce(performSearch, 500)

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchInput(value)
    setIsSearching(value.trim() !== "")
    debouncedSearch(value)
  }

  // Clear search
  const handleClearSearch = () => {
    setSearchInput("")
    setSearchQuery("")
    setIsSearching(false)
    setCurrentPage(1)
  }

  const filteredProducts = React.useMemo(() => {
    // First, filter by tab
    let tabFiltered = mockProducts
    if (selectedTab === "Active") tabFiltered = mockProducts.filter((product) => product.status === "Active")
    else if (selectedTab === "Disable") tabFiltered = mockProducts.filter((product) => product.status === "Disable")
    else if (selectedTab === "Pending") tabFiltered = mockProducts.filter((product) => product.status === "Pending")

    // Now, filter by search query
    if (searchQuery.trim() !== "") {
      const q = searchQuery.trim().toLowerCase()
      tabFiltered = tabFiltered.filter(
        (product) =>
          product.name?.toLowerCase().includes(q) ||
          product.categories?.toLowerCase().includes(q) ||
          product.subCategories?.toLowerCase().includes(q) ||
          product.brand?.toLowerCase().includes(q) ||
          product.productType?.toLowerCase().includes(q),
      )
    }
    return tabFiltered
  }, [selectedTab, searchQuery])

  // Handlers for bulk actions
  const handleBulkEdit = () => {
    setEditBulkLoading(true)
    setTimeout(() => setEditBulkLoading(false), 1000)
  }
  const handleBulkAssign = () => {
    setAssignBulkLoading(true)
    setTimeout(() => setAssignBulkLoading(false), 1000)
  }

  // Handlers for Bulk Assign and Deactivate
  const handleBulkAssignProducts = async () => {
    if (selectedProducts.length === 0) return
    try {
      showToast("Products assigned successfully", "success")
      setSelectedProducts([])
    } catch (error) {
      console.error("Bulk assign failed:", error)
    }
  }

  // Handler for bulk deactivation
  const handleBulkDeactivate = async () => {
    if (selectedProducts.length === 0) return
    try {
      showToast("Products deactivated successfully", "success")
      setSelectedProducts([])
    } catch (error) {
      console.error("Bulk deactivate failed:", error)
    }
  }

  // Handler for Send Approval
  const handleSendApproval = () => {
    setSendApprovalLoading(true)
    setTimeout(() => {
      setSendApprovalLoading(false)
      showToast("Approval sent successfully", "success")
    }, 1000)
  }

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      cleanupDebounce()
    }
  }, [cleanupDebounce])

  // Handle shimmer effect on tab change
  useEffect(() => {
    if (loadingTab) return
    setLoadingTab(true)
    const timer = setTimeout(() => setLoadingTab(false), 700)
    return () => clearTimeout(timer)
  }, [selectedTab])

  const totalPages = Math.ceil(filteredProducts.length / cardsPerPage)
  const paginatedData = filteredProducts.slice((currentPage - 1) * cardsPerPage, currentPage * cardsPerPage)

  // Selection state and handlers
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const allSelected = paginatedData.length > 0 && paginatedData.every((p) => selectedProducts.includes(p.id))

  // Handler for selecting a single product
  const handleSelectOne = (id: string) => {
    setSelectedProducts((prev) => {
      let newSelected
      if (prev.includes(id)) {
        newSelected = prev.filter((pid) => pid !== id)
      } else {
        newSelected = [...prev, id]
      }
      return newSelected
    })
  }

  // Handler for selecting all products on the current page
  const handleSelectAll = () => {
    let newSelected: string[]
    if (allSelected) {
      newSelected = []
    } else {
      newSelected = filteredProducts.map((p) => p.id)
    }
    setSelectedProducts(newSelected)
  }

  useEffect(() => {
    setSelectedProducts([])
  }, [selectedTab, currentPage])

  // Handlers for Add product
  const handleAddProduct = () => {
    setAddProductLoading(true)
    route.push(`/dealer/dashboard/product/addproduct`)
    setTimeout(() => setAddProductLoading(false), 1000)
  }
  
  const handleViewProduct = (id: string) => {
    setViewProductLoading(id)
    route.push(`/dealer/dashboard/product/productdetails/${id}`)
    setTimeout(() => setViewProductLoading(null), 1000)
  }

  // Handlers for Bulk upload
  const handleUploadBulk = () => {
    setUploadBulkLoading(true)
    setTimeout(() => setUploadBulkLoading(false), 1000)
  }

  return (
    <div className="w-full">
      <Card className="shadow-sm rounded-none">
        {/* Header */}
        <CardHeader className="space-y-4 sm:space-y-6">
          {/* Top Row: Search/Filters/Requests (left), Upload/Add Product (right) */}
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0 gap-4 w-full">
            {/* Left: Search, Filters, Requests */}
            <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:gap-3 w-full lg:w-auto">
              {/* Search Bar */}
              <SearchInput
                value={searchInput}
                onChange={handleSearchChange}
                onClear={handleClearSearch}
                isLoading={isSearching}
                placeholder="Search Spare parts"
              />
              {/* Filter Buttons */}
              <div className="flex gap-2 sm:gap-3">
                <DynamicButton
                  variant="outline"
                  customClassName="bg-transparent border-gray-300 hover:bg-gray-50 min-w-[100px]"
                  text="Filters"
                />
              </div>
            </div>
            {/* Right: Add Product, Send Approval */}
            <div className="flex items-center gap-3 w-full lg:w-auto justify-start grid-ro-2 sm:justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="flex items-center gap-2 bg-[#FDEAEA] text-[#C72920] rounded-[8px] px-4 py-2 min-w-[140px] justify-center font-[Poppins] font-medium border border-[#FDEAEA] hover:bg-[#f8d2d2] transition "
                    disabled={addProductLoading}
                  >
                    Add Product
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-35 shadow-lg">
                  <DropdownMenuItem className="cursor-pointer flex items-center gap-2" onClick={handleAddProduct}>
                    <div className="w-4 h-4 bg-red-500 rounded flex items-center justify-center">
                      <Plus className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-red-600">Manually</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer flex items-center gap-2" onClick={handleUploadBulk}>
                    <div className="w-4 h-4 rounded flex items-center justify-center">
                      <Image src={uploadFile || "/placeholder.svg"} alt="Upload" className="w-5 h-5" />
                    </div>
                    <span className="text-blue-600">Upload</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DynamicButton
                variant="default"
                customClassName="flex items-center gap-3 bg-green-50 border-green-600 hover:bg-green-50 text-green-600 rounded-[8px] px-4 py-2 min-w-[140px] justify-center font-[Poppins] font-regular"
                disabled={sendApprovalLoading}
                loading={sendApprovalLoading}
                loadingText="Sending..."
                icon={<Send />}
                text="Send Approval"
              />
            </div>
          </div>
        </CardHeader>
        {/* Product Table */}
        <CardContent className="p-0">
          {!loadingTab && filteredProducts.length === 0 ? (
            <Emptydata />
          ) : (
            <div className="overflow-x-auto">
              {" "}
              {/* Added overflow-x-auto here */}
              <DataTable
                data={paginatedData} // Use paginatedData here
                loading={loadingTab}
                currentPage={currentPage}
                itemsPerPage={cardsPerPage}
                onPageChange={setCurrentPage}
                selectedItems={selectedProducts}
                onSelectItem={handleSelectOne}
                onSelectAll={handleSelectAll}
                allSelected={allSelected}
                columns={[
                  {
                    key: "image",
                    header: "Image",
                    render: (product) => (
                      <div className="w-12 h-10 sm:w-16 sm:h-12 lg:w-20 lg:h-16 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                        <Image
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          width={80}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ),
                  },
                  {
                    key: "name",
                    header: "Name",
                    render: (product) => (
                      <div className="cursor-pointer" onClick={() => handleViewProduct(product.id)}>
                        <div className="font-medium text-gray-900 b2 font-sans">{product.name}</div>
                      </div>
                    ),
                  },
                  {
                    key: "categories",
                    header: "Categories",
                  },
                  {
                    key: "subCategories",
                    header: "Sub Categories",
                  },
                  {
                    key: "brand",
                    header: "Brand",
                  },
                  {
                    key: "productType",
                    header: "Product type",
                  },
                  {
                    key: "status",
                    header: "Status",
                    render: (product) => getStatusBadge(product.status),
                  },
                ]}
                actions={[
                  {
                    label: "View Details",
                    onClick: (product) => handleViewProduct(product.id),
                  },
                ]}
                mobileCard={(product) => (
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-12 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                      <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        width={64}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 text-sm truncate">{product.name}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {product.categories} • {product.subCategories}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">{product.brand}</span>
                        <span className="text-xs text-gray-500">{product.status}</span>
                      </div>
                    </div>
                  </div>
                )}
              />
              <DynamicPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={filteredProducts.length}
                itemsPerPage={cardsPerPage}
              />
            </div>
          )}
        </CardContent>
      </Card>
      {/* Centered Loading Overlay */}
      {viewProductLoading && (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 flex flex-col items-center justify-center shadow-xl">
            <Loader2 className="h-16 w-16 animate-spin text-[#C72920] mb-4" />
            <p className="text-lg font-medium text-gray-700">Loading product details...</p>
          </div>
        </div>
      )}
    </div>
  )
}
