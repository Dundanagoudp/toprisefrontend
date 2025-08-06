"use client"
import { useState, useCallback, useEffect, useMemo } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Plus, Loader2, Send } from 'lucide-react'
import { useToast } from "@/components/ui/toast"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { IoMdArrowDropdown } from "react-icons/io"

// Custom components and hooks
import useDebounce from "@/utils/useDebounce"
import SearchInput from "@/components/common/search/SearchInput"
import DynamicButton from "@/components/common/button/button"
import DataTable from "@/components/common/table/DataTable"
import DynamicPagination from "@/components/common/pagination/DynamicPagination"

// API and Types
import { getProductsByDealerId } from "@/service/dealer-product"
import { Product } from "@/types/dealer-productTypes"

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Active":
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">{status}</Badge>
    case "Disable":
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">{status}</Badge>
    case "Pending":
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">{status}</Badge>
    case "Approved":
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">{status}</Badge>
    case "Rejected":
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">{status}</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

export default function DealerAssignTable() {
  const router = useRouter()
  const { showToast } = useToast()

  const [products, setProducts] = useState<Product[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [searchInput, setSearchInput] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [selectedTab, setSelectedTab] = useState("All")
  const [currentPage, setCurrentPage] = useState(1)
  const [addProductLoading, setAddProductLoading] = useState(false)
  const [uploadBulkLoading, setUploadBulkLoading] = useState(false)
  const [sendApprovalLoading, setSendApprovalLoading] = useState(false)
  const [viewProductLoading, setViewProductLoading] = useState<string | null>(null)

  const cardsPerPage = 10

  // Debounced search functionality
  const performSearch = useCallback(
    (query: string) => {
      setSearchQuery(query)
      setCurrentPage(1)
      setIsSearching(false)
    },
    [],
  )
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

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true)
      try {
        const fetchedProducts = await getProductsByDealerId()
        setProducts(fetchedProducts)
      } catch (error: any) {
        console.error("Failed to fetch products:", error)
        if (typeof error?.message === 'string' && error.message.includes('Dealer ID not found')) {
          showToast("Dealer ID missing. Please log out and log in again to refresh your session.", "error")
        } else {
          showToast("Failed to load products.", "error")
        }
        setProducts([])
      } finally {
        setLoadingProducts(false)
      }
    }
    fetchProducts()
  }, [showToast])

  const filteredProducts = useMemo(() => {
    let currentProducts = products

    // Filter by tab
    if (selectedTab === "Active") {
      currentProducts = currentProducts.filter((product) => product.live_status === "Active")
    } else if (selectedTab === "Disable") {
      currentProducts = currentProducts.filter((product) => product.live_status === "Disable")
    } else if (selectedTab === "Pending") {
      currentProducts = currentProducts.filter((product) => product.live_status === "Pending")
    } else if (selectedTab === "Approved") {
      currentProducts = currentProducts.filter((product) => product.live_status === "Approved")
    } else if (selectedTab === "Rejected") {
      currentProducts = currentProducts.filter((product) => product.live_status === "Rejected")
    }

    // Filter by search query
    if (searchQuery.trim() !== "") {
      const q = searchQuery.trim().toLowerCase()
      currentProducts = currentProducts.filter(
        (product) =>
          product.product_name?.toLowerCase().includes(q) ||
          product.category?.category_name?.toLowerCase().includes(q) ||
          product.sub_category?.subcategory_name?.toLowerCase().includes(q) ||
          product.brand?.brand_name?.toLowerCase().includes(q) ||
          product.product_type?.toLowerCase().includes(q),
      )
    }
    return currentProducts
  }, [products, searchQuery, selectedTab])

  const totalPages = Math.ceil(filteredProducts.length / cardsPerPage)
  const paginatedData = filteredProducts.slice((currentPage - 1) * cardsPerPage, currentPage * cardsPerPage)

  // Add id property to each product for DataTable generic constraint
  const paginatedDataWithId = paginatedData.map((p) => ({ ...p, id: p._id as string }))

  // Selection state and handlers
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const allSelected = paginatedData.length > 0 && paginatedData.every((p) => selectedProducts.includes(p._id))

  // Handler for selecting a single product
  const handleSelectOne = (id: string) => {
    setSelectedProducts((prev) => {
      if (prev.includes(id)) {
        return prev.filter((pid) => pid !== id)
      } else {
        return [...prev, id]
      }
    })
  }

  // Handler for selecting all products on the current page
  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(paginatedData.map((p) => p._id))
    }
  }

  // Clear selections when tab or page changes
  useEffect(() => {
    setSelectedProducts([])
  }, [selectedTab, currentPage])

  // Handlers for Add product
  const handleAddProduct = () => {
    setAddProductLoading(true)
    router.push(`/dealer/dashboard/product/addproduct`)
    setTimeout(() => setAddProductLoading(false), 1000)
  }

  const handleViewProduct = (id: string) => {
    setViewProductLoading(id)
    router.push(`/dealer/dashboard/product/productdetails/${id}`)
    setTimeout(() => setViewProductLoading(null), 1000)
  }

  const handleEditProduct = (id: string) => {
    router.push(`/dealer/dashboard/product/productedit/${id}`)
  }

  // Handlers for Bulk upload
  const handleUploadBulk = () => {
    setUploadBulkLoading(true)
    setTimeout(() => setUploadBulkLoading(false), 1000)
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
                    className="flex items-center gap-2 bg-[#FDEAEA] text-[#C72920] rounded-[8px] px-4 py-2 min-w-[140px] h-[40px] justify-center font-[Poppins] font-medium border border-[#FDEAEA] hover:bg-[#f8d2d2] transition"
                    disabled={addProductLoading}
                  >
                    Add Product
                    <IoMdArrowDropdown style={{ fontSize: "20px" }} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-41 shadow-lg">
                  <DropdownMenuItem className="cursor-pointer flex items-center gap-2" onClick={handleAddProduct}>
                    <div className="w-4 h-4 bg-red-500 rounded flex items-center justify-center">
                      <Plus className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-red-600">Manually</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer flex items-center gap-2" onClick={handleUploadBulk}>
                    <div className="w-4 h-4 rounded flex items-center justify-center">
                      <Image src="/assets/uploadFile.svg" alt="Upload" className="w-5 h-5" width={20} height={20} />
                    </div>
                    <span className="text-blue-600">Upload</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DynamicButton
                variant="default"
                customClassName="flex items-center gap-3 bg-green-50 border-green-600 hover:bg-green-50 text-green-600 rounded-[8px] px-4 py-2 min-w-[140px] h-[40px] justify-center font-[Poppins] font-regular"
                disabled={sendApprovalLoading}
                loading={sendApprovalLoading}
                loadingText="Sending..."
                icon={<Send />}
                text="Send Approval"
                onClick={handleSendApproval}
              />
            </div>
          </div>
        </CardHeader>
        {/* Product Table */}
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <DataTable<Product>
              data={paginatedDataWithId}
              loading={loadingProducts}
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
                  render: (product: Product) => (
                    <div className="w-12 h-10 sm:w-16 sm:h-12 lg:w-20 lg:h-16 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                      <Image
                        src={product.images?.[0] || "/placeholder.svg?height=64&width=80"}
                        alt={product.product_name}
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
                  render: (product: Product) => (
                    <div className="cursor-pointer" onClick={() => handleViewProduct(product._id)}>
                      <div className="font-medium text-gray-900 b2 font-sans">{product.product_name}</div>
                    </div>
                  ),
                },
                {
                  key: "categories",
                  header: "Categories",
                  render: (product: Product) => product.category?.category_name || "N/A",
                },
                {
                  key: "subCategories",
                  header: "Sub Categories",
                  render: (product: Product) => product.sub_category?.subcategory_name || "N/A",
                },
                {
                  key: "brand",
                  header: "Brand",
                  render: (product: Product) => product.brand?.brand_name || "N/A",
                },
                {
                  key: "productType",
                  header: "Product type",
                  render: (product: Product) => product.product_type || "N/A",
                },
                {
                  key: "status",
                  header: "Status",
                  render: (product: Product) => getStatusBadge(product.live_status),
                },
              ]}
              actions={[
                {
                  label: "View Details",
                  onClick: (product: Product) => handleViewProduct(product._id),
                },
                {
                  label: "Edit",
                  onClick: (product: Product) => handleEditProduct(product._id),
                },
              ]}
              mobileCard={(product: Product) => (
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-12 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                    <Image
                      src={product.images?.[0] || "/placeholder.svg?height=64&width=80"}
                      alt={product.product_name}
                      width={64}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 text-sm truncate">{product.product_name}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {product.category?.category_name} • {product.sub_category?.subcategory_name}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">{product.brand?.brand_name}</span>
                      <span className="text-xs text-gray-500">{product.live_status}</span>
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
        </CardContent>
      </Card>
      {viewProductLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 flex flex-col items-center justify-center shadow-xl">
            <Loader2 className="h-16 w-16 animate-spin text-[#C72920] mb-4" />
            <p className="text-lg font-medium text-gray-700">Loading product details...</p>
          </div>
        </div>
      )}
    </div>
  )
}
