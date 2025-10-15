import React, { useEffect, useState, useCallback } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { Skeleton } from "@/components/ui/skeleton";
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
import { fetchProductIdForBulkActionSuccess } from "@/store/slice/product/productIdForBulkAction";
import { useRouter } from "next/navigation";
import { useToast as useGlobalToast } from "@/components/ui/toast";
import Emptydata from "../../Emptydata";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAllDealers } from "@/service/dealerServices";
import { assignDealersToProduct } from "@/service/product-Service";

// Helper function to get status color classes
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

export default function ApprovedProduct({
  searchQuery,
  selectedTab,
  categoryFilter,
  subCategoryFilter,
  refreshKey,
}: {
  searchQuery: string;
  selectedTab?: string;
  categoryFilter?: string;
  subCategoryFilter?: string;
  refreshKey?: number;
}) {
  const dispatch = useAppDispatch();
  // Use the correct state for products with live status

  const loading = useAppSelector((state) => state.productLiveStatus.loading);
  const selectedProducts = useAppSelector((state) => state.productIdForBulkAction.products || []);
  const [paginatedProducts, setPaginatedProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const route = useRouter();
  const [viewProductLoading, setViewProductLoading] = useState(false);
  const [sortField, setSortField] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const { showToast } = useGlobalToast();
  const [totalPages, setTotalPages] = useState(0);
  const itemsPerPage = 10;

  // Dealer assignment modal state
  const [isDealerModalOpen, setIsDealerModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [dealers, setDealers] = useState<any[]>([]);
  const [loadingDealers, setLoadingDealers] = useState(false);
  const [dealerAssignments, setDealerAssignments] = useState<Array<{
    dealers_Ref: string;
    quantity_per_dealer: number;
    dealer_margin: number;
    dealer_priority_override: number;
  }>>([]);
  const [assigningDealers, setAssigningDealers] = useState(false);

  // Extract fetchProducts function so it can be called from multiple places
  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      console.log("🔍 ApprovedProduct: Fetching products with status: Approved");
      console.log("🔍 ApprovedProduct: searchQuery received:", searchQuery);
      console.log("🔍 ApprovedProduct: categoryFilter:", categoryFilter);
      console.log("🔍 ApprovedProduct: subCategoryFilter:", subCategoryFilter);
      console.log("🔍 ApprovedProduct: API call params:", {
        currentPage,
        itemsPerPage,
        status: "Approved",
        searchQuery,
        categoryFilter,
        subCategoryFilter
      });
      
      const res = await getProductsByPage(
        currentPage,
        itemsPerPage,
        "Approved",
        searchQuery,
        categoryFilter,
        subCategoryFilter
      );
      
      console.log("🔍 ApprovedProduct: API response received:", res);
      
      const data = res.data;
      console.log("ApprovedProduct: API response received:", res);
      console.log("ApprovedProduct: API response data:", data);
      console.log("ApprovedProduct: Products in response:", data?.products);
      console.log("ApprovedProduct: Number of products returned:", data?.products?.length);
      
      if (data?.products) {
        setPaginatedProducts(data.products);
        setTotalProducts(data.pagination.totalItems);
        setTotalPages(data.pagination.totalPages);
        console.log("ApprovedProduct: Products set successfully, count:", data.products.length);
        console.log("ApprovedProduct: Pagination data:", data.pagination);
        console.log("ApprovedProduct: Total items from API:", data.pagination.totalItems);
        console.log("ApprovedProduct: Total pages from API:", data.pagination.totalPages);
      } else {
        console.error("Unexpected API response structure:", res.data);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoadingProducts(false);
    }
  }, [currentPage, itemsPerPage, searchQuery, categoryFilter, subCategoryFilter]);

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts, refreshKey]);

  // Reset to first page when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, subCategoryFilter]);

  // Filter products by approved live status and search query

  const sortedProducts = React.useMemo(() => {
    console.log("ApprovedProduct: sortedProducts memo - paginatedProducts:", paginatedProducts);
    console.log("ApprovedProduct: sortedProducts memo - paginatedProducts length:", paginatedProducts?.length);
    console.log("ApprovedProduct: sortedProducts memo - isArray:", Array.isArray(paginatedProducts));
    
    if (!paginatedProducts || !Array.isArray(paginatedProducts)) {
      console.log("ApprovedProduct: sortedProducts memo - returning empty array");
      return [];
    }

    // If no sorting is applied, return products as-is
    if (!sortField) {
      console.log("ApprovedProduct: sortedProducts memo - no sorting, returning paginatedProducts:", paginatedProducts.length);
      return paginatedProducts;
    }

    let sorted = [...paginatedProducts];

    // Sort
    if (sortField === "manufacturer_part_name") {
      sorted.sort((a, b) => {
        const nameA = a.manufacturer_part_name?.toLowerCase() || "";
        const nameB = b.manufacturer_part_name?.toLowerCase() || "";
        if (nameA < nameB) return sortDirection === "asc" ? -1 : 1;
        if (nameA > nameB) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    } else if (sortField === "mrp_with_gst") {
      sorted.sort((a, b) => {
        const priceA = Number(a.mrp_with_gst) || 0;
        const priceB = Number(b.mrp_with_gst) || 0;
        if (priceA < priceB) return sortDirection === "asc" ? -1 : 1;
        if (priceA > priceB) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    return sorted;
  }, [paginatedProducts, sortField, sortDirection]);

  // Update total products count when sorted products change
  useEffect(() => {
    setTotalProducts(sortedProducts.length);
  }, [sortedProducts]);

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

  const handleEditProduct = (id: string) => {
    // Implement navigation or modal logic here
    route.push(`/user/dashboard/product/productedit/${id}`);
  };
  const handleViewProduct = (id: string) => {
    setViewProductLoading(true);
    try {
      route.push(`/user/dashboard/product/product-details/${id}`);
    } catch (e) {
      console.log(e);
    } finally {
      setViewProductLoading(false);
    }
  };

  // Dealer assignment handlers
  const handleAssignDealers = async (productId: string) => {
    setSelectedProductId(productId);
    setIsDealerModalOpen(true);
    setLoadingDealers(true);
    
    try {
      const response = await getAllDealers();
      if (response.success && response.data) {
        setDealers(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch dealers:", error);
      showToast("Failed to fetch dealers", "error");
    } finally {
      setLoadingDealers(false);
    }
  };

  const handleDealerToggle = (dealerId: string) => {
    setDealerAssignments(prev => {
      const existingIndex = prev.findIndex(assignment => assignment.dealers_Ref === dealerId);
      
      if (existingIndex >= 0) {
        // Remove dealer if already assigned
        return prev.filter(assignment => assignment.dealers_Ref !== dealerId);
      } else {
        // Add dealer with default values
        return [...prev, {
          dealers_Ref: dealerId,
          quantity_per_dealer: 10,
          dealer_margin: 20,
          dealer_priority_override: 10
        }];
      }
    });
  };

  const updateDealerAssignment = (dealerId: string, field: string, value: number) => {
    setDealerAssignments(prev => 
      prev.map(assignment => 
        assignment.dealers_Ref === dealerId 
          ? { ...assignment, [field]: value }
          : assignment
      )
    );
  };

  const handleAssignDealersToProduct = async () => {
    if (dealerAssignments.length === 0) {
      showToast("Please select at least one dealer", "error");
      return;
    }

    setAssigningDealers(true);
    try {
      await assignDealersToProduct(selectedProductId, { dealerData: dealerAssignments });
      showToast("Dealers assigned successfully", "success");
      setIsDealerModalOpen(false);
      setDealerAssignments([]);
      setSelectedProductId("");
    } catch (error) {
      console.error("Failed to assign dealers:", error);
      showToast("Failed to assign dealers", "error");
    } finally {
      setAssigningDealers(false);
    }
  };

  const handleStatusChange = async (productId: string, newStatus: string) => {
    try {
      if (newStatus === "Active") {
        await aproveProduct(productId);
        showToast("Product activated successfully", "success");
        dispatch(
          updateProductLiveStatus({ id: productId, liveStatus: "Approved" })
        );
      } else if (newStatus === "Inactive") {
        await deactivateProduct(productId);
        showToast("Product deactivated successfully", "success");
        dispatch(
          updateProductLiveStatus({ id: productId, liveStatus: "Pending" })
        );
      }
      
      // Refresh the product list after status change
      await fetchProducts();
    } catch (error) {
      console.error("Failed to update product status:", error);
      showToast("Failed to update product status", "error");
    }
  };
  //sorting products by name
// name sorting
const handleSortByName = () => {
  if (sortField === "manufacturer_part_name") {
    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
  } else {
    setSortField("manufacturer_part_name");
    setSortDirection("asc");
  }
};

  // 1. Update the sort handler to support price
  const handleSortByPrice = () => {
    if (sortField === "mrp_with_gst") {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField("mrp_with_gst");
      setSortDirection("asc");
    }
  };

  // Empty state
  if (!loadingProducts && (sortedProducts.length === 0)) {
    return <Emptydata />;
  }

  return (
    <div className="px-4">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-[#E5E5E5] bg-gray-50/50">
            <TableHead className="px-4 py-4 w-8 font-sans">
              <Checkbox
                checked={allSelected}
                onCheckedChange={handleSelectAll}
                aria-label="Select all"
              />
            </TableHead>
            <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left font-sans">
              Image
            </TableHead>
          <TableHead
                     className="b2 text-gray-700 font-medium px-6 py-4 text-left min-w-[200px] font-[Red Hat Display] cursor-pointer select-none"
                     onClick={handleSortByName}
                   >
                     Name
                     {sortField === "manufacturer_part_name" && (
                       <span className="ml-1">
                         {sortDirection === "asc" ? <ChevronUp className="w-4 h-4 text-[#C72920]" /> : <ChevronDown className="w-4 h-4 text-[#C72920]" />}
                       </span>
                     )}
                   </TableHead>
            <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left min-w-[120px] hidden md:table-cell font-sans">
              Category
            </TableHead>
            <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left min-w-[120px] hidden lg:table-cell font-sans">
              Sub Category
            </TableHead>
            <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left min-w-[100px] hidden md:table-cell font-sans">
              Brand
            </TableHead>
            <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left min-w-[100px] hidden lg:table-cell font-sans">
              Type
            </TableHead>
             <TableHead
                className="b2 text-gray-700 font-medium px-6 py-4 text-left min-w-[100px] hidden lg:table-cell font-[Red Hat Display] cursor-pointer select-none"
                onClick={handleSortByPrice}
              >
                Price
                {sortField === "price" && (
                  <span className="ml-1">
                    {sortDirection === "asc" ? <ChevronUp className="w-4 h-4 text-[#C72920]" /> : <ChevronDown className="w-4 h-4 text-[#C72920]" />}
                  </span>
                )}
              </TableHead>
            <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left min-w-[100px] font-sans">
              QC Status
            </TableHead>
            <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left min-w-[100px] font-sans">
              Product status
            </TableHead>
            <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-center min-w-[80px] font-sans">
              Action
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(() => {
            console.log("ApprovedProduct: Rendering products - sortedProducts:", sortedProducts);
            console.log("ApprovedProduct: Rendering products - sortedProducts length:", sortedProducts?.length);
            console.log("ApprovedProduct: Rendering products - loadingProducts:", loadingProducts);
            return loadingProducts;
          })() ? // Show skeleton rows when loading
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
                  <TableCell className="px-6 py-4">
                    <Skeleton className="h-8 w-[120px]" />
                  </TableCell>
                  <TableCell className="px-6 py-4 text-center">
                    <Skeleton className="h-8 w-8 rounded-full mx-auto" />
                  </TableCell>
                </TableRow>
              ))
            : // Original content when not loading
              sortedProducts.map((product: any, index: number) => {
                console.log(`ApprovedProduct: Rendering product ${index}:`, product.product_name, product._id);
                return (
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
                        src={product.images[0] || "/placeholder.svg"}
                        alt={product.manufacturer_part_name}
                        width={80}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell
                    className="px-6 py-4 cursor-pointer font-sans"
                    onClick={() => handleViewProduct(product._id)}
                  >
                    <div className="font-medium text-gray-900 b2 font-sans">
                      {product.manufacturer_part_name.length > 8
                        ? `${product.manufacturer_part_name.substring(0, 8)}...`
                        : product.manufacturer_part_name}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 md:hidden">
                      {product.category?.category_name} •{" "}
                      {product.brand?.brand_name}
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 hidden md:table-cell font-sans">
                    <span className="text-gray-700 b2 font-sans">
                      {product.category?.category_name.length > 8
                        ? `${product.category.category_name.substring(0, 8)}...`
                        : product.category?.category_name}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4 hidden lg:table-cell font-sans">
                    <span className="text-gray-700 b2 font-sans">
                      {product.sub_category?.subcategory_name.length > 8
                        ? `${product.sub_category.subcategory_name.substring(
                            0,
                            8
                          )}...`
                        : product.sub_category?.subcategory_name}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4 hidden md:table-cell font-sans">
                    <span className="text-gray-700 b2 font-sans">
                      {product.brand?.brand_name}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4 hidden lg:table-cell font-sans">
                    <span className="text-gray-700 b2 font-sans">
                      {product.product_type}
                    </span>
                  </TableCell>
                  {/* //price */}
                  <TableCell className="px-6 py-4 font-[Red Hat Display]">
                    <span className="text-gray-700 b2 font-[Red Hat Display]">
                      {product.mrp_with_gst || "N/A"}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4 font-sans">
                    <span className={`b2 ${getStatusColor(product.Qc_status)}`}>
                      {product.Qc_status}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4 font-sans">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className={`h-auto p-2 justify-between min-w-[120px] ${getStatusColor(
                            product.live_status
                          )}`}
                        >
                          <span className="b2">{product.live_status}</span>
                          <ChevronDown className="h-4 w-4 ml-2" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="start"
                        className="min-w-[120px]"
                      >
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusChange(product._id, "Active")
                          }
                          className="text-green-600 focus:text-green-600"
                        >
                          Activate
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusChange(product._id, "Inactive")
                          }
                          className="text-red-600 focus:text-red-600"
                        >
                          Deactivate
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-center font-sans">
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
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => handleEditProduct(product._id)}
                        >
                          Edit Product
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => handleViewProduct(product._id)}
                        >
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => handleAssignDealers(product._id)}
                        >
                          Assign Dealers
                        </DropdownMenuItem>
                        {/* <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => handleViewProduct(product._id)}
                        >
                          Add Model
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => handleViewProduct(product._id)}
                        >
                          Year
                        </DropdownMenuItem> */}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
                );
              })
          }
        </TableBody>
      </Table>
      {/* Pagination - moved outside of table */}
      {totalProducts > 0 && totalPages > 1 && (
        <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0 mt-8">
          {/* Left: Showing X-Y of Z products */}
          <div className="text-sm text-gray-600 text-center sm:text-left">
            {`Showing ${(currentPage - 1) * itemsPerPage + 1}-${Math.min(
              currentPage * itemsPerPage,
              totalProducts
            )} of ${totalProducts} products`}
            {/* Debug info */}
            <div className="text-xs text-gray-400 mt-1">
              Debug: currentPage={currentPage}, itemsPerPage={itemsPerPage}, totalProducts={totalProducts}
            </div>
          </div>
          {/* Pagination Controls */}
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
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>

                {/* Numbered Page Buttons (max 3) */}
                {(() => {
                  let pages = [];
                  if (totalPages <= 3) {
                    // Case 1: Few pages, just show all
                    pages = Array.from({ length: totalPages }, (_, i) => i + 1);
                  } else if (currentPage <= 2) {
                    // Case 2: Near the start
                    pages = [1, 2, 3];
                  } else if (currentPage >= totalPages - 1) {
                    // Case 3: Near the end
                    pages = [totalPages - 2, totalPages - 1, totalPages];
                  } else {
                    // Case 4: Middle pages
                    pages = [currentPage - 1, currentPage, currentPage + 1];
                  }

                  return pages.map((pageNum) => (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        isActive={currentPage === pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className="cursor-pointer"
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  ));
                })()}

                {/* Next Button */}
                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
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

      {/* Dealer Assignment Modal */}
      <Dialog open={isDealerModalOpen} onOpenChange={setIsDealerModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assign Dealers to Product</DialogTitle>
          </DialogHeader>
          
          {loadingDealers ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-[#C72920] mr-2" />
              <span>Loading dealers...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Dealers grouped by category */}
              {dealers.length > 0 ? (
                <div className="space-y-6">
                  {dealers.map((dealer) => {
                    const isAssigned = dealerAssignments.some(assignment => assignment.dealers_Ref === dealer._id);
                    const assignment = dealerAssignments.find(assignment => assignment.dealers_Ref === dealer._id);
                    
                    return (
                      <div key={dealer._id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              checked={isAssigned}
                              onCheckedChange={() => handleDealerToggle(dealer._id)}
                            />
                            <div>
                              <h3 className="font-medium text-gray-900">{dealer.trade_name}</h3>
                              <p className="text-sm text-gray-500">{dealer.legal_name}</p>
                              <p className="text-xs text-gray-400">Categories: {dealer.categories_allowed?.join(", ") || "N/A"}</p>
                            </div>
                          </div>
                        </div>
                        
                        {isAssigned && assignment && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 p-4 bg-gray-50 rounded-lg">
                            <div>
                              <Label htmlFor={`quantity-${dealer._id}`} className="text-sm font-medium">
                                Quantity per Dealer
                              </Label>
                              <Input
                                id={`quantity-${dealer._id}`}
                                type="number"
                                min="1"
                                value={assignment.quantity_per_dealer}
                                onChange={(e) => updateDealerAssignment(dealer._id, "quantity_per_dealer", parseInt(e.target.value) || 0)}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`margin-${dealer._id}`} className="text-sm font-medium">
                                Dealer Margin (%)
                              </Label>
                              <Input
                                id={`margin-${dealer._id}`}
                                type="number"
                                min="0"
                                max="100"
                                value={assignment.dealer_margin}
                                onChange={(e) => updateDealerAssignment(dealer._id, "dealer_margin", parseInt(e.target.value) || 0)}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`priority-${dealer._id}`} className="text-sm font-medium">
                                Priority Override
                              </Label>
                              <Input
                                id={`priority-${dealer._id}`}
                                type="number"
                                min="1"
                                value={assignment.dealer_priority_override}
                                onChange={(e) => updateDealerAssignment(dealer._id, "dealer_priority_override", parseInt(e.target.value) || 0)}
                                className="mt-1"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No dealers available
                </div>
              )}
              
              {/* Action buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDealerModalOpen(false);
                    setDealerAssignments([]);
                    setSelectedProductId("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAssignDealersToProduct}
                  disabled={assigningDealers || dealerAssignments.length === 0}
                  className="bg-[#C72920] hover:bg-[#A0221A]"
                >
                  {assigningDealers ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Assigning...
                    </>
                  ) : (
                    `Assign ${dealerAssignments.length} Dealer${dealerAssignments.length !== 1 ? 's' : ''}`
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
