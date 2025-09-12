"use client";
import React, { useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  fetchProductsWithLiveStatus,
  updateProductLiveStatus,
} from "@/store/slice/product/productLiveStatusSlice";
import {
  aproveProduct,
  deactivateProduct,
  getProducts,
  getProductsByPage,
} from "@/service/product-Service";

import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { getCategories, getBrand } from "@/service/product-Service";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, ChevronUp, Loader2, MoreHorizontal } from "lucide-react";
import { fetchProductsSuccess } from "@/store/slice/product/productSlice";
import { useToast as useGlobalToast } from "@/components/ui/toast";
import { fetchProductIdForBulkActionSuccess } from "@/store/slice/product/productIdForBulkAction";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { set } from "zod";
import Addmodel from "../../popUpForm/Addmodel";
import AddCategory from "../../popUpForm/AddCategory";
import StockManagementModal from "../../StockManagementModal";
import DealerAssignmentModal from "../../DealerAssignmentModal";
import { 
  updateProductStock, 
  assignProductToDealers, 
  unassignProductFromDealers, 
  getAllDealers,
  getProductDealerAssignments 
} from "@/service/inventory-staff-service";
import Emptydata from "../../Emptydata";

export default function CreatedProduct({
  searchQuery,
  selectedTab,
  categoryFilter,
  subCategoryFilter,
}: {
  searchQuery: string;
  selectedTab?: string;
  categoryFilter?: string;
  subCategoryFilter?: string;
}) {
  const dispatch = useAppDispatch();
  const [paginatedproducts, setPaginatedProducts] = useState<any[]>([]);
  const auth = useAppSelector((state) => state.auth.user);
  const selectedProducts = useAppSelector((state) => state.productIdForBulkAction.products || []);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const { showToast } = useGlobalToast();
  const route = useRouter();
  const [viewProductLoading, setViewProductLoading] = useState(false);
  const [sortField, setSortField] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const allowedRoles = ["Super-admin", "Inventory-Admin", "Inventory-Staff"];
  const itemsPerPage = 10;
  const [isAddModelOpen, setIsAddModelOpen] = useState(false);
  const [activeProductId, setActiveProductId] = useState<string | null>(null);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [isDealerModalOpen, setIsDealerModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [dealers, setDealers] = useState<any[]>([]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "text-green-600 font-medium";
      case "Rejected":
        return "text-red-600 font-medium";
      case "Pending":
        return "text-yellow-600 font-medium";
      default:
        return "text-gray-700";
    }
  };

  // Fetch products on mount and when page changes
  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        console.log("CreatedProduct: Fetching products with status:", "Created", "searchQuery:", searchQuery, "categoryFilter:", categoryFilter, "subCategoryFilter:", subCategoryFilter);
        const res = await getProductsByPage(
          currentPage, 
          itemsPerPage, 
          "Created", // status - reverted back to "Created"
          searchQuery, 
          categoryFilter, 
          subCategoryFilter
        );
        
        console.log("CreatedProduct: API response:", res);
        
        if (res && res.data) {
          const data = res.data;
          
          // Handle products array
          if (Array.isArray(data.products)) {
            setPaginatedProducts(data.products);
          } else {
            console.warn("CreatedProduct: products is not an array:", data.products);
            setPaginatedProducts([]);
          }
          
          // Handle pagination data
          if (data.pagination) {
            setTotalProducts(data.pagination.totalItems || 0);
            setTotalPages(data.pagination.totalPages || 0);
          } else {
            console.warn("CreatedProduct: pagination data missing:", data.pagination);
            setTotalProducts(0);
            setTotalPages(0);
          }
        } else {
          console.warn("CreatedProduct: Invalid response structure:", res);
          setPaginatedProducts([]);
          setTotalProducts(0);
          setTotalPages(0);
        }
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setPaginatedProducts([]);
        setTotalProducts(0);
        setTotalPages(0);
        showToast("Failed to load products. Please try again.", "error");
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, [currentPage, searchQuery, categoryFilter, subCategoryFilter, showToast]);

  // Reset to first page when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, subCategoryFilter]);

  //sorting products by name
  const handleSortByName = () => {
    if (sortField === "product_name") {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField("product_name");
      setSortDirection("asc");
    }
  };
  // Sort handlers for different fields
  const handleSortByPrice = () => {
    if (sortField === "mrp_with_gst") {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField("mrp_with_gst");
      setSortDirection("asc");
    }
  };

  const handleSortByBrand = () => {
    if (sortField === "brand") {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField("brand");
      setSortDirection("asc");
    }
  };

  const handleSortByType = () => {
    if (sortField === "product_type") {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField("product_type");
      setSortDirection("asc");
    }
  };

  // Generic sort handler
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Get sort icon for a field
  const getSortIcon = (field: string) => {
    if (sortField !== field) {
      return <ChevronUp className="w-4 h-4 text-gray-400" />;
    }
    return sortDirection === "asc" ? 
      <ChevronUp className="w-4 h-4 text-[#C72920]" /> : 
      <ChevronDown className="w-4 h-4 text-[#C72920]" />;
  };

  // Sort products based on sortField (server-side filtering is handled by API)
  const sortedProducts = React.useMemo(() => {
    if (!paginatedproducts || !Array.isArray(paginatedproducts)) return [];
    
    // If no sorting is applied, return products as-is
    if (!sortField) return paginatedproducts;

    // Sort products based on sortField
    return [...paginatedproducts].sort((a: any, b: any) => {
      let aValue: any;
      let bValue: any;
      
      switch (sortField) {
        case "product_name":
          aValue = a.product_name?.toLowerCase() || "";
          bValue = b.product_name?.toLowerCase() || "";
          break;
        case "mrp_with_gst":
          aValue = Number(a.mrp_with_gst) || 0;
          bValue = Number(b.mrp_with_gst) || 0;
          break;
        case "brand":
          aValue = a.brand?.brand_name?.toLowerCase() || "";
          bValue = b.brand?.brand_name?.toLowerCase() || "";
          break;
        case "product_type":
          aValue = a.product_type?.toLowerCase() || "";
          bValue = b.product_type?.toLowerCase() || "";
          break;
        case "category":
          aValue = a.category?.category_name?.toLowerCase() || "";
          bValue = b.category?.category_name?.toLowerCase() || "";
          break;
        case "sub_category":
          aValue = a.sub_category?.subcategory_name?.toLowerCase() || "";
          bValue = b.sub_category?.subcategory_name?.toLowerCase() || "";
          break;
        default:
          return 0;
      }
      
      if (sortDirection === "asc") {
        return aValue.localeCompare ? aValue.localeCompare(bValue) : aValue - bValue;
      } else {
        return bValue.localeCompare ? bValue.localeCompare(aValue) : bValue - aValue;
      }
    });
  }, [paginatedproducts, sortField, sortDirection]);

  // Clear selections when sorted products change (e.g., search query changes)
  useEffect(() => {
    if (selectedProducts.length > 0) {
      const validSelections = selectedProducts.filter((id) =>
        sortedProducts.some((product) => product._id === id)
      );
      if (validSelections.length !== selectedProducts.length) {
        // Only dispatch to Redux store
        dispatch(fetchProductIdForBulkActionSuccess(validSelections));
      }
    }
  }, [sortedProducts, selectedProducts, dispatch]);

  // Clear selections when component unmounts
  useEffect(() => {
    return () => {
      if (selectedProducts.length > 0) {
        dispatch(fetchProductIdForBulkActionSuccess([]));
      }
    };
  }, []);

  // Selection handlers
  const handleSelectOne = (id: string) => {
    const newSelectedProducts = selectedProducts.includes(id)
      ? selectedProducts.filter((pid) => pid !== id)
      : [...selectedProducts, id];
    // Only dispatch to Redux store
    dispatch(fetchProductIdForBulkActionSuccess([...newSelectedProducts]));
  };

  const allSelected =
    sortedProducts.length > 0 &&
    sortedProducts.every((p: any) => selectedProducts.includes(p._id));

  const handleSelectAll = () => {
    const newSelectedProducts = allSelected
      ? []
      : sortedProducts.map((p: any) => p._id);
    // Only dispatch to Redux store
    dispatch(fetchProductIdForBulkActionSuccess([...newSelectedProducts]));
  };

  // Dummy handlers for edit/view (replace with navigation if needed)
  const handleEditProduct = (id: string) => {
    // Implement navigation or modal logic here
    route.push(`/user/dashboard/product/productedit/${id}`);
  };
  const handleViewProduct = (id: string) => {
    setViewProductLoading(true);
    try {
      route.push(`/user/dashboard/product/product-details/${id}`);
      dispatch(fetchProductIdForBulkActionSuccess([id]));
    } catch (e) {
      console.log(e);
    } finally {
      setViewProductLoading(false);
    }
  };
  const handleAddModel = (id: string) => {
    setActiveProductId(id);
    setIsAddModelOpen(true);
  };

  const handleAddCategory = (id: string) => {
    setActiveProductId(id);
    setIsAddCategoryOpen(true);
  };

  const handleStockManagement = (product: any) => {
    setSelectedProduct(product);
    setIsStockModalOpen(true);
  };

  const handleDealerAssignment = async (product: any) => {
    setSelectedProduct(product);
    try {
      // Fetch dealers and current assignments
      const [dealersResponse, assignmentsResponse] = await Promise.all([
        getAllDealers(),
        getProductDealerAssignments(product._id)
      ]);
      
      // Merge dealer data with assignment status
      const dealersWithAssignments = dealersResponse.data.map((dealer: any) => ({
        ...dealer,
        assignedProducts: assignmentsResponse.data
          .filter((assignment: any) => assignment.dealerId === dealer._id)
          .map((assignment: any) => assignment.productId)
      }));
      
      setDealers(dealersWithAssignments);
      setIsDealerModalOpen(true);
    } catch (error) {
      console.error("Failed to fetch dealers:", error);
      showToast("Failed to load dealers", "error");
    }
  };

  const handleStockUpdate = async (productId: string, newStock: number, reason: string) => {
    try {
      await updateProductStock(productId, newStock, reason);
      showToast("Stock updated successfully", "success");
      // Refresh products list
     
    } catch (error) {
      console.error("Failed to update stock:", error);
      showToast("Failed to update stock", "error");
    }
  };

  const handleDealerAssignmentUpdate = async (productId: string, dealerIds: string[], action: 'assign' | 'unassign') => {
    try {
      if (action === 'assign') {
        await assignProductToDealers(productId, dealerIds);
      } else {
        await unassignProductFromDealers(productId, dealerIds);
      }
      showToast(`Dealers ${action === 'assign' ? 'assigned' : 'unassigned'} successfully`, "success");
      // Refresh products list
    
    } catch (error) {
      console.error("Failed to update dealer assignment:", error);
      showToast("Failed to update dealer assignment", "error");
    }
  };

  // Empty state
  if (!loadingProducts && (sortedProducts.length === 0)) {
    return <Emptydata />;
  }

  return (
    <div className=" w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-[#E5E5E5] bg-gray-50/50">
            <TableHead className="px-4 py-4 w-8 font-[Red Hat Display]">
              <Checkbox
                checked={allSelected}
                onCheckedChange={handleSelectAll}
                aria-label="Select all"
              />
            </TableHead>
            <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display]">
              Image
            </TableHead>
            <TableHead
              className="b2 text-gray-700 font-medium px-6 py-4 text-left min-w-[200px] font-[Red Hat Display] cursor-pointer hover:text-[#C72920] transition-colors"
              onClick={handleSortByName}
            >
              <div className="flex items-center gap-1">
                Name
                {getSortIcon("product_name")}
              </div>
            </TableHead>
            <TableHead 
              className="b2 text-gray-700 font-medium px-6 py-4 text-left min-w-[120px] hidden md:table-cell font-[Red Hat Display] cursor-pointer hover:text-[#C72920] transition-colors"
              onClick={() => handleSort("category")}
            >
              <div className="flex items-center gap-1">
                Category
                {getSortIcon("category")}
              </div>
            </TableHead>
            <TableHead 
              className="b2 text-gray-700 font-medium px-6 py-4 text-left min-w-[120px] hidden lg:table-cell font-[Red Hat Display] cursor-pointer hover:text-[#C72920] transition-colors"
              onClick={() => handleSort("sub_category")}
            >
              <div className="flex items-center gap-1">
                Sub Category
                {getSortIcon("sub_category")}
              </div>
            </TableHead>
            <TableHead 
              className="b2 text-gray-700 font-medium px-6 py-4 text-left min-w-[100px] hidden md:table-cell font-[Red Hat Display] cursor-pointer hover:text-[#C72920] transition-colors"
              onClick={() => handleSortByBrand}
            >
              <div className="flex items-center gap-1">
                Brand
                {getSortIcon("brand")}
              </div>
            </TableHead>
            <TableHead 
              className="b2 text-gray-700 font-medium px-6 py-4 text-left min-w-[100px] hidden lg:table-cell font-[Red Hat Display] cursor-pointer hover:text-[#C72920] transition-colors"
              onClick={() => handleSortByType}
            >
              <div className="flex items-center gap-1">
                Type
                {getSortIcon("product_type")}
              </div>
            </TableHead>
            <TableHead
              className="b2 text-gray-700 font-medium px-6 py-4 text-left min-w-[100px] hidden lg:table-cell font-[Red Hat Display] cursor-pointer hover:text-[#C72920] transition-colors"
              onClick={handleSortByPrice}
            >
              <div className="flex items-center gap-1">
                Price
                {getSortIcon("mrp_with_gst")}
              </div>
            </TableHead>
            <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left min-w-[100px] font-[Red Hat Display]">
              QC Status
            </TableHead>
            <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-center min-w-[80px] font-[Red Hat Display]">
              Action
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loadingProducts
            ? // Show skeleton rows when loading
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow
                  key={`skeleton-${index}`}
                  className={`border-b border-gray-100 hover:bg-gray-50/50 transition-colors ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                  }`}
                >
                  <TableCell className="px-4 py-4 w-8">
                    <Skeleton className="h-4 w-4 rounded" />
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <Skeleton className="w-12 h-10 sm:w-16 sm:h-12 lg:w-20 lg:h-16 rounded-md" />
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[150px]" />
                      <Skeleton className="h-3 w-[100px] md:hidden" />
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 hidden md:table-cell">
                    <Skeleton className="h-4 w-[100px]" />
                  </TableCell>
                  <TableCell className="px-6 py-4 hidden lg:table-cell">
                    <Skeleton className="h-4 w-[120px]" />
                  </TableCell>
                  <TableCell className="px-6 py-4 hidden md:table-cell">
                    <Skeleton className="h-4 w-[80px]" />
                  </TableCell>
                  <TableCell className="px-6 py-4 hidden lg:table-cell">
                    <Skeleton className="h-4 w-[80px]" />
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <Skeleton className="h-4 w-[60px]" />
                  </TableCell>
                  <TableCell className="px-6 py-4 text-center">
                    <Skeleton className="h-8 w-8 rounded-full mx-auto" />
                  </TableCell>
                </TableRow>
              ))
            : sortedProducts.map((product, index) => (
                <TableRow
                  key={product._id}
                  className={`border-b border-gray-100 hover:bg-gray-50/50 transition-colors ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                  }`}
                >
                  <TableCell className="px-4 py-4 w-8 font-[Poppins]">
                    <Checkbox
                      checked={selectedProducts.includes(product._id)}
                      onCheckedChange={() => handleSelectOne(product._id)}
                      aria-label="Select row"
                    />
                  </TableCell>
                  <TableCell className="px-6 py-4 font-[Poppins]">
                    <div className="w-12 h-10 sm:w-16 sm:h-12 lg:w-20 lg:h-16 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                      <Image
                        src={
                          Array.isArray(product.images) &&
                          product.images.length > 0
                            ? product.images[0]?.url ||
                              product.images[0] ||
                              product.model?.model_image
                            : product.model?.model_image || "/placeholder.svg"
                        }
                        alt={product.product_name}
                        width={80}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell
                    className="px-6 py-4 cursor-pointer font-[Red Hat Display]"
                    onClick={() => handleViewProduct(product._id)}
                  >
                    <div className="font-medium text-gray-900 b2 font-sans">
                      {product.product_name.length > 8
                        ? product.product_name.slice(0, 8) + "..."
                        : product.product_name}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 md:hidden">
                      {product.category?.category_name || "N/A"} •{" "}
                      {product.brand?.brand_name || "N/A"}
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 hidden md:table-cell font-[Red Hat Display]">
                    <span className="text-gray-700 b2 font-sans">
                      {product.category?.category_name?.length > 8
                        ? product.category.category_name.slice(0, 8) + "..."
                        : product.category.category_name || "N/A"}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4 hidden lg:table-cell font-[Red Hat Display]">
                    <span className="text-gray-700 b2 font-[Red Hat Display]">
                      {product.sub_category?.subcategory_name?.length > 8
                        ? product.sub_category.subcategory_name.slice(0, 8) +
                          "..."
                        : product.sub_category.subcategory_name || "N/A"}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4 hidden md:table-cell font-[Red Hat Display]">
                    <span className="text-gray-700 b2 font-[Red Hat Display]">
                      {product.brand?.brand_name || "N/A"}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4 hidden lg:table-cell font-[Red Hat Display]">
                    <span className="text-gray-700 b2 font-[Red Hat Display]">
                      {product.product_type || "N/A"}
                    </span>
                  </TableCell>
                  {/* //price */}
                  <TableCell className="px-6 py-4 font-[Red Hat Display]">
                    <span className="text-gray-700 b2 font-[Red Hat Display]">
                      {product.mrp_with_gst || "N/A"}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4 font-[Red Hat Display]">
                    <span className={`b2 ${getStatusColor(product.Qc_status)}`}>
                      {product.Qc_status || "N/A"}
                    </span>
                  </TableCell>

                  <TableCell className="px-6 py-4 text-center font-[Red Hat Display]">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-gray-100"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        {allowedRoles.includes(auth.role) && (
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => handleEditProduct(product._id)}
                          >
                            Edit Product
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => handleViewProduct(product._id)}
                        >
                          View Details
                        </DropdownMenuItem>
                        {allowedRoles.includes(auth.role) && (
                          <>
                            <DropdownMenuItem
                              className="cursor-pointer"
                              onClick={() => handleStockManagement(product)}
                            >
                              Manage Stock
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="cursor-pointer"
                              onClick={() => handleDealerAssignment(product)}
                            >
                              Assign Dealer
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="cursor-pointer"
                              onClick={() => handleAddModel(product._id)}
                            >
                              Add model
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="cursor-pointer"
                               onClick={() => handleAddCategory(product._id)}
                            >
                              Add Category
                            </DropdownMenuItem>
                       
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
        </TableBody>
      </Table>
      {/* Pagination - moved outside of table */}
      {totalProducts > 0 && (
        <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0 mt-8">
          {/* Left: Showing X-Y of Z products */}
          <div className="text-sm text-gray-600 text-center sm:text-left">
            {totalProducts > 0 ? (
              `Showing ${(currentPage - 1) * itemsPerPage + 1}-${Math.min(
                currentPage * itemsPerPage,
                totalProducts
              )} of ${totalProducts} products`
            ) : (
              "No products found"
            )}
          </div>
          
          {/* Pagination Controls - only show if more than 1 page */}
          {totalPages > 1 && (
            <div className="flex justify-center sm:justify-end">
              <Pagination>
                <PaginationContent>
                  {/* Previous Button */}
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer hover:bg-gray-100"
                      }
                    />
                  </PaginationItem>

                  {/* First page if not in range */}
                  {currentPage > 3 && totalPages > 5 && (
                    <>
                      <PaginationItem>
                        <PaginationLink
                          onClick={() => setCurrentPage(1)}
                          className="cursor-pointer hover:bg-gray-100"
                        >
                          1
                        </PaginationLink>
                      </PaginationItem>
                      {currentPage > 4 && (
                        <PaginationItem>
                          <span className="px-3 py-2 text-gray-500">...</span>
                        </PaginationItem>
                      )}
                    </>
                  )}

                  {/* Numbered Page Buttons */}
                  {(() => {
                    let pages = [];
                    const maxVisiblePages = 5;
                    
                    if (totalPages <= maxVisiblePages) {
                      // Show all pages if total is small
                      pages = Array.from({ length: totalPages }, (_, i) => i + 1);
                    } else {
                      // Calculate range of pages to show
                      let startPage = Math.max(1, currentPage - 2);
                      let endPage = Math.min(totalPages, currentPage + 2);
                      
                      // Adjust if we're near the beginning or end
                      if (currentPage <= 3) {
                        endPage = Math.min(totalPages, 5);
                      } else if (currentPage >= totalPages - 2) {
                        startPage = Math.max(1, totalPages - 4);
                      }
                      
                      pages = Array.from(
                        { length: endPage - startPage + 1 },
                        (_, i) => startPage + i
                      );
                    }

                    return pages.map((pageNum) => (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          isActive={currentPage === pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className="cursor-pointer hover:bg-gray-100"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    ));
                  })()}

                  {/* Last page if not in range */}
                  {currentPage < totalPages - 2 && totalPages > 5 && (
                    <>
                      {currentPage < totalPages - 3 && (
                        <PaginationItem>
                          <span className="px-3 py-2 text-gray-500">...</span>
                        </PaginationItem>
                      )}
                      <PaginationItem>
                        <PaginationLink
                          onClick={() => setCurrentPage(totalPages)}
                          className="cursor-pointer hover:bg-gray-100"
                        >
                          {totalPages}
                        </PaginationLink>
                      </PaginationItem>
                    </>
                  )}

                  {/* Next Button */}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      className={
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer hover:bg-gray-100"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      )}
      {viewProductLoading && (
        <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 flex flex-col items-center justify-center shadow-xl">
            <Loader2 className="h-16 w-16 animate-spin text-[#C72920] mb-4" />
            <p className="text-lg font-medium text-gray-700">
              Loading product details...
            </p>
          </div>
        </div>
      )}

      {isAddModelOpen && activeProductId && (
        <Addmodel
          isOpen={isAddModelOpen}
          onClose={() => {
            setIsAddModelOpen(false);
            setActiveProductId(null);
          }}
          productId={activeProductId}
        />
      )}

      {isAddCategoryOpen && typeof activeProductId === "string" && (
        <AddCategory
          isOpen={isAddCategoryOpen}
          onClose={() => setIsAddCategoryOpen(false)}
          productId={activeProductId}
        />
      )}

      {/* Stock Management Modal */}
      <StockManagementModal
        isOpen={isStockModalOpen}
        onClose={() => {
          setIsStockModalOpen(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        onStockUpdate={handleStockUpdate}
      />

      {/* Dealer Assignment Modal */}
      <DealerAssignmentModal
        isOpen={isDealerModalOpen}
        onClose={() => {
          setIsDealerModalOpen(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        dealers={dealers}
        onDealerAssignment={handleDealerAssignmentUpdate}
      />
    </div>
  );
}
