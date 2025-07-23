"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { getTokenPayload } from "@/utils/cookies"
import { fetchProductsWithLiveStatus, updateProductLiveStatus } from "@/store/slice/product/productLiveStatusSlice"
import { Search, Plus, MoreHorizontal, FileUp, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
} from "@/components/ui/pagination"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useEffect } from "react"
import Image from "next/image"
import { getProducts } from "@/service/product-Service"
import React from "react"
import UploadBulkCard from "./uploadBulk"
import { useRouter } from "next/navigation"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { aproveProduct, deactivateProduct } from "@/service/product-Service"
import { Skeleton } from "@/components/ui/skeleton"
import uploadFile from "../../../../../public/assets/uploadFile.svg";

// Product type for table
type Product = {
  id: string
  image: string
  name: string
  category: string
  subCategory: string
  brand: string
  productType: string
  qcStatus: string
  liveStatus: string
}

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

// Helper to get color classes for status
const getStatusColor = (status: string) => {
  switch (status) {
    case "Approved":
      return "text-green-500"
    case "Rejected":
      return "text-red-500"
    case "Created":
      return "text-gray-700"
    case "Pending":
      return "text-yellow-600"
    case "Active":
      return "text-green-500"
    case "Inactive":
      return "text-gray-500"
    default:
      return "text-gray-700"
  }
}

export default function ProductManagement() {
  const payload = getTokenPayload()
  const auth = useAppSelector((state) => state.auth.user)
  const products = useAppSelector((state) => state.productLiveStatus.products)
  const loading = useAppSelector((state) => state.productLiveStatus.loading)
  const error = useAppSelector((state) => state.productLiveStatus.error)
  const dispatch = useAppDispatch()
  const route = useRouter()

  const isAllowed = payload?.role === "Inventory-admin" || payload?.role === "Super-admin"

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTab, setSelectedTab] = useState("Created")
  const [currentPage, setCurrentPage] = useState(1)
  const [productsPerPage] = useState(10)
  const [totalProducts, setTotalProducts] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [bulkMode, setBulkMode] = useState<'upload' | 'edit'>('upload')
  const [loadingTab, setLoadingTab] = useState(false)
  const [addProductLoading, setAddProductLoading] = useState(false)
  const [uploadBulkLoading, setUploadBulkLoading] = useState(false)

  const cardsPerPage = 10

  const filteredProducts = React.useMemo(() => {
    // First, filter by tab
    let tabFiltered = products;
    if (selectedTab === "Pending") tabFiltered = products.filter((product) => product.liveStatus === "Pending");
    else if (selectedTab === "Approved") tabFiltered = products.filter((product) => product.liveStatus === "Approved");
    else if (selectedTab === "Rejected") tabFiltered = products.filter((product) => product.liveStatus === "Rejected");
    // Now, filter by search query
    if (searchQuery.trim() !== "") {
      const q = searchQuery.trim().toLowerCase();
      tabFiltered = tabFiltered.filter((product) =>
        product.name?.toLowerCase().includes(q) ||
        product.category?.toLowerCase().includes(q) ||
        product.brand?.toLowerCase().includes(q) ||
        product.subCategory?.toLowerCase().includes(q) ||
        product.productType?.toLowerCase().includes(q)
      );
    }
    return tabFiltered;
  }, [selectedTab, products, searchQuery]);


  const handleBulkEdit = () => {
    setBulkMode('edit');
    setIsModalOpen(true);
  };

 
  const handleBulkApprove = async () => {
    if (selectedProducts.length === 0) return;
    try {
  
      await Promise.all(selectedProducts.map(async (id) => {
        await aproveProduct(id);
        dispatch(updateProductLiveStatus({ id, liveStatus: "Approved" }));
      }));

      setSelectedProducts([]);
    } catch (error) {
      console.error("Bulk approve failed:", error);
    }
  };
    const handleBulkDeactivate = async () => {
    if (selectedProducts.length === 0) return;
    try {
    
      await Promise.all(selectedProducts.map(async (id) => {
        await deactivateProduct(id);
        dispatch(updateProductLiveStatus({ id, liveStatus: "Pending" }));
      }));
 
      setSelectedProducts([]);
    } catch (error) {
      console.error("Bulk approve failed:", error);
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await getProducts()
        console.log("API Response:", response)
        const data = response.data
        if (Array.isArray(data)) {
          const mapped = data.map((item) => ({
            id: item._id,
            image: item.images[0] || item.model.model_image,
            name: item.product_name || item.manufacturer_part_name || "-",
            category: item.category?.category_name || "-",
            subCategory: item.sub_category?.subcategory_name || "-",
            brand: item.brand?.brand_name || "-",
            productType: item.product_type || "-",
            qcStatus: item.Qc_status || "Pending",
            liveStatus: item.live_status || "Pending",
          }))
          dispatch(fetchProductsWithLiveStatus(mapped))
          setTotalProducts(response.data.length || 0)
        } else {
          setTotalProducts(0)
        }
      } catch (error) {
        console.error("Failed to fetch products:", error)
        setTotalProducts(0)
      }
    }

    fetchProducts()
  }, [currentPage, productsPerPage, dispatch])

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
  const [bulkAction, setBulkAction] = useState("")

  const allSelected = paginatedData.length > 0 && paginatedData.every((p) => selectedProducts.includes(p.id))
  const someSelected = selectedProducts.length > 0

  const handleSelectOne = (id: string) => {
    setSelectedProducts((prev) => {
      let newSelected
      if (prev.includes(id)) {
        newSelected = prev.filter((pid) => pid !== id)
      } else {
        newSelected = [...prev, id]
      }
      if (newSelected.length === 1) {
        return []
      }
      return newSelected
    })
  }

  const handleSelectAll = () => {
    let newSelected: string[];
    if (allSelected) {
    
      newSelected = [];
    } else {
     
      newSelected = filteredProducts.map((p) => p.id);
      console.log("Selecting all products:", newSelected);
    }
    setSelectedProducts(newSelected);
  };

  useEffect(() => {
    setSelectedProducts([])
  }, [selectedTab, currentPage])

  const handleAddProduct = () => {
    setAddProductLoading(true)
    route.push(`/user/dashboard/product/Addproduct`)
    setTimeout(() => setAddProductLoading(false), 1000) // Simulate loading
  }
  const handleEditProduct = (id: string) => {
    route.push(`/user/dashboard/product/productedit/${id}`)
  }
    const handleViewProduct = (id: string) => {
    route.push(`/user/dashboard/product/product-details/${id}`)
  }

  const handleUploadBulk = () => {
    setBulkMode('upload');
    setUploadBulkLoading(true);
    setIsModalOpen(true);
    setTimeout(() => setUploadBulkLoading(false), 1000);// Simulate loading
  }

  const handleQCStatusChange = (id: string, newStatus: string) => {
    const updatedProducts = products.map((product) =>
      product.id === id ? { ...product, qcStatus: newStatus } : product,
    )
    dispatch(fetchProductsWithLiveStatus(updatedProducts))
  }

  const handleLiveStatusChange = (id: string, newStatus: string) => {
    dispatch(updateProductLiveStatus({ id, liveStatus: newStatus }))
  }

  // Add approve and deactivate handlers
  const handleApproveProduct = async (productId: string) => {
    try {
      if (selectedTab === "Pending") {
        await aproveProduct(productId)
        dispatch(updateProductLiveStatus({ id: productId, liveStatus: "Approved" }))
        setTimeout(() => {
          const approvedProducts = products.filter((p) => p.liveStatus === "Pending" && p.id !== productId)
          const newTotal = approvedProducts.length
          const newTotalPages = Math.ceil(newTotal / cardsPerPage)
          if (currentPage > newTotalPages && newTotalPages > 0) {
            setCurrentPage(newTotalPages)
          }
        }, 0)
      }
    } catch (error) {
      console.error("Failed to approve product:", error)
    }
  }

  const handleDeactivateProduct = async (productId: string) => {
    try {
      if (selectedTab === "Approved") {
        await deactivateProduct(productId)
        dispatch(updateProductLiveStatus({ id: productId, liveStatus: "Pending" }))
        setTimeout(() => {
          const approvedProducts = products.filter((p) => p.liveStatus === "Approved" && p.id !== productId)
          const newTotal = approvedProducts.length
          const newTotalPages = Math.ceil(newTotal / cardsPerPage)
          if (currentPage > newTotalPages && newTotalPages > 0) {
            setCurrentPage(newTotalPages)
          }
        }, 0)
      }
    } catch (error) {
      console.error("Failed to deactivate product:", error)
    }
  }

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1))
  }

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
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
              <div className="relative w-full sm:w-80 lg:w-96">
                <div className="flex items-center gap-2 h-10 rounded-lg bg-[#EBEBEB] px-4 py-0">
                  <Search className="h-5 w-5 text-[#A3A3A3] flex-shrink-0" />
                  <Input
                    placeholder="Search Spare parts"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent font-[Poppins] border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-[#737373] placeholder:text-[#A3A3A3] h-10 p-0 flex-1 outline-none shadow-none"
                  />
                </div>
              </div>
              {/* Filter Buttons */}
              <div className="flex gap-2 sm:gap-3">
                <Button
                  variant="outline"
                  className="flex items-center gap-2 bg-transparent border-gray-300 hover:bg-gray-50 min-w-[100px]"
                >
                  <span className="b3 font-[Poppins] ">Filters</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 border-[#C72920] text-[#C72920] bg-white hover:bg-[#c728203a] min-w-[100px]"
                >
                  <span className="b3 font-[Poppins] ">Requests</span>
                </Button>
              </div>
            </div>
            {/* Right: Upload, Add Product */}
            <div className="flex items-center gap-3 w-full lg:w-auto justify-start sm:justify-end">
              {(auth?.role === "Super-admin" || auth?.role === "Inventory-admin") && (
                <>
                  <Button
                    variant="default"
                    className="flex items-center gap-3 bg-[#408EFD1A] border-[#408EFD] hover:bg-[#408ffd3a] rounded-[8px] px-4 py-2 min-w-[120px] justify-center"
                    onClick={handleUploadBulk}
                    disabled={uploadBulkLoading}
                  >
                    {uploadBulkLoading ? (
                      <svg className="animate-spin h-5 w-5 text-[#408EFD]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                    ) : (
                      <Image src={uploadFile} alt="Add" className="h-4 w-4" />
                    )}
                    <span className="text-[#408EFD] b3 font-[Poppins]">Upload</span>
                  </Button>
                  <Button
                    className="flex items-center gap-3 bg-[#C729201A] border border-[#C72920] hover:bg-[#c728203a] text-[#C72920] rounded-[8px] px-4 py-2 min-w-[140px] justify-center"
                    variant="default"
                    onClick={handleAddProduct}
                    disabled={addProductLoading}
                  >
                    {addProductLoading ? (
                      <svg className="animate-spin h-5 w-5 text-[#C72920]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                    ) : <Plus className="h-4 w-4" />}
                    <span className="b3 font-[Poppins]">Add Product</span>
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Second Row: Tabs (left), Bulk Edit + Created dropdown (right) */}
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 w-full">
            {/* Tab Bar */}
            <div className="flex border-b border-gray-200 overflow-x-auto" aria-label="Product status tabs">
              <div className="flex min-w-max font-[Poppins]">
                {["Created", "Approved", "Pending", "Rejected"].map((tab) => (
                  <button
                    key={tab}
                    className={`px-4 py-2 text-sm font-medium focus:outline-none whitespace-nowrap ${
                      selectedTab === tab ? "text-[#C72920] border-b-2 border-[#C72920]" : "text-gray-500"
                    }`}
                    onClick={() => setSelectedTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            {/* Bulk Edit & Created dropdown */}
            {selectedProducts.length > 1 && (
              <div className="flex items-center gap-2 justify-start sm:justify-end">
                <Button className="bg-gray-200 text-black flex items-center gap-2" variant="outline" onClick={handleBulkEdit}>
                  <Pencil className="w-4 h-4" />
                  <span className="hidden sm:inline">Bulk Edit</span>
                </Button>
                <Select
                  value={selectedTab}
                  onValueChange={async (val) => {
                    setSelectedTab(val);
                    if (val === "Approved" && selectedProducts.length > 0) {
                      await handleBulkApprove();
                    }
                    if (val === "Pending" && selectedProducts.length > 0) {
                      await handleBulkDeactivate();
                    }
                  }}
                >
                  <SelectTrigger className="min-w-[120px]">
                    <SelectValue placeholder="Created" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Created">Created</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardHeader>

        {/* Product Table */}
        <CardContent className="p-0">
          {/* Mobile Card View for small screens */}
          <div className="block sm:hidden">
            <div className="space-y-4 p-4">
              {loadingTab
                ? Array.from({ length: 3 }).map((_, idx) => (
                    <Card key={idx} className="p-4">
                      <div className="flex items-start space-x-4">
                        <Skeleton className="w-5 h-5 rounded" />
                        <Skeleton className="w-16 h-12 rounded-md" />
                        <div className="flex-1 min-w-0 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                          <Skeleton className="h-3 w-1/3" />
                        </div>
                        <Skeleton className="w-8 h-8 rounded" />
                      </div>
                    </Card>
                  ))
                : paginatedData.map((product, index) => (
                    <Card key={product.id} className="p-4">
                      <div className="flex items-start space-x-4">
                        <Checkbox
                          checked={selectedProducts.includes(product.id)}
                          onCheckedChange={() => handleSelectOne(product.id)}
                          aria-label="Select row"
                        />
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
                            {product.category} • {product.brand}
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <span className={`text-xs ${getStatusColor(product.qcStatus)}`}>QC: {product.qcStatus}</span>
                            {selectedTab !== "Created" && (
                              <span className={`text-xs ${getStatusColor(product.liveStatus)}`}>{product.liveStatus}</span>
                            )}
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Edit Product</DropdownMenuItem>
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Duplicate</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </Card>
                  ))}
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow className="border-b border-[#E5E5E5] bg-gray-50/50">
                  <TableHead className="px-4 py-4 w-8 font-[Red Hat Display]">
                    <Checkbox checked={allSelected} onCheckedChange={handleSelectAll} aria-label="Select all" />
                  </TableHead>
                  <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display]">Image</TableHead>
                  <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left min-w-[200px] font-[Red Hat Display]">Name</TableHead>
                  <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left min-w-[120px] hidden md:table-cell font-[Red Hat Display]">Category</TableHead>
                  <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left min-w-[120px] hidden lg:table-cell font-[Red Hat Display]">Sub Category</TableHead>
                  <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left min-w-[100px] hidden md:table-cell font-[Red Hat Display]">Brand</TableHead>
                  <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left min-w-[100px] hidden lg:table-cell font-[Red Hat Display]">Type</TableHead>
                  <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left min-w-[100px] font-[Red Hat Display]">QC Status</TableHead>
                  {selectedTab !== "Created" && (
                    <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left min-w-[100px] font-[Red Hat Display]">Product Status</TableHead>
                  )}
                  <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-center min-w-[80px] font-[Red Hat Display]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((product, index) => (
                  <TableRow
                    key={product.id}
                    className={`border-b border-gray-100 hover:bg-gray-50/50 transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                    }`}
                  >
                    <TableCell className="px-4 py-4 w-8 font-[Poppins]">
                      <Checkbox
                        checked={selectedProducts.includes(product.id)}
                        onCheckedChange={() => handleSelectOne(product.id)}
                        aria-label="Select row"
                      />
                    </TableCell>
                    <TableCell className="px-6 py-4 font-[Poppins]">
                      <div className="w-12 h-10 sm:w-16 sm:h-12 lg:w-20 lg:h-16 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                        <Image
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          width={80}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 cursor-pointer font-[Red Hat Display]" onClick={() => handleViewProduct(product.id)}>
                      <div className="font-medium text-gray-900 b2 font-[Red Hat Display]">{product.name}</div>
                      {/* Show category and brand on smaller screens */}
                      <div className="text-xs text-gray-500 mt-1 md:hidden">
                        {product.category} • {product.brand}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 hidden md:table-cell font-[Red Hat Display]">
                      <span className="text-gray-700 b2 font-[Red Hat Display]">{product.category}</span>
                    </TableCell>
                    <TableCell className="px-6 py-4 hidden lg:table-cell font-[Red Hat Display]">
                      <span className="text-gray-700 b2 font-[Red Hat Display]">{product.subCategory}</span>
                    </TableCell>
                    <TableCell className="px-6 py-4 hidden md:table-cell font-[Red Hat Display]">
                      <span className="text-gray-700 b2 font-[Red Hat Display]">{product.brand}</span>
                    </TableCell>
                    <TableCell className="px-6 py-4 hidden lg:table-cell font-[Red Hat Display]">
                      <span className="text-gray-700 b2 font-[Red Hat Display]">{product.productType}</span>
                    </TableCell>
                    <TableCell className="px-6 py-4 font-[Red Hat Display]">
                      <span className={`b2 ${getStatusColor(product.qcStatus)}`}>{product.qcStatus}</span>
                    </TableCell>
                    {selectedTab !== "Created" && (
                      <TableCell className="px-6 py-4 font-[Red Hat Display]">
                        {selectedTab === "Rejected" ? (
                          <span className={`b2 ${getStatusColor(product.liveStatus)}`}>{product.liveStatus}</span>
                        ) : (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 px-3 hover:bg-gray-100">
                                <span className={`b2 ${getStatusColor(product.liveStatus)}`}>{product.liveStatus}</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              {selectedTab === "Approved" && (
                                <DropdownMenuItem className="cursor-pointer" onClick={() => handleDeactivateProduct(product.id)}>
                                  Deactivate Product
                                </DropdownMenuItem>
                              )}
                              {selectedTab === "Pending" && (
                                <DropdownMenuItem className="cursor-pointer" onClick={() => handleApproveProduct(product.id)}>
                                  Activate Product
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    )}
                    <TableCell className="px-6 py-4 text-center font-[Red Hat Display]">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem className="cursor-pointer">Edit Product</DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer">View Details</DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer">Duplicate</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600 cursor-pointer hover:text-red-700">
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Footer - Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0 mt-8 px-4 sm:px-6 pb-6">
              {/* Left: Showing X-Y of Z products */}
              <div className="text-sm text-gray-600 text-center sm:text-left">
                {`Showing ${(currentPage - 1) * cardsPerPage + 1}-${Math.min(currentPage * cardsPerPage, filteredProducts.length)} of ${filteredProducts.length} products`}
              </div>
              {/* Pagination Controls */}
              <div className="flex justify-center sm:justify-end">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    {Array.from({ length: Math.min(totalPages, 5) }).map((_, idx) => {
                      let pageNum
                      if (totalPages <= 5) {
                        pageNum = idx + 1
                      } else if (currentPage <= 3) {
                        pageNum = idx + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + idx
                      } else {
                        pageNum = currentPage - 2 + idx
                      }

                      return (
                        <PaginationItem key={pageNum} className="hidden sm:block">
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
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <UploadBulkCard isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} mode={bulkMode} />
    </div>
  )
}
