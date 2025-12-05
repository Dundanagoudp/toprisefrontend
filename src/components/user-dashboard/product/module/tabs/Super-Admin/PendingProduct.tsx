import React, { useEffect, useState, useCallback } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import {
  fetchProductsWithLiveStatus,
  updateProductLiveStatus,
  updateProductQcStatus,
} from "@/store/slice/product/productLiveStatusSlice";
import {
  aproveProduct,
  deactivateProduct,
  getProducts,
  getProductsByPage,
  approveSingleProduct,
  updateProductStatus,
  rejectSingleProduct,
  getProductsByFilterWithIds,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, ChevronUp, Loader2, MoreHorizontal } from "lucide-react";
import { fetchProductsSuccess } from "@/store/slice/product/productSlice";
import { useRouter } from "next/navigation";
import { useToast as useGlobalToast } from "@/components/ui/toast";
import Emptydata from "../../Emptydata";
import { useContext } from "react";
import { useProductSelection } from "@/contexts/ProductSelectionContext";
import { Checkbox } from "@/components/ui/checkbox";
import { DynamicPagination } from "@/components/common/pagination";
import RejectReason from "./dialogue/RejectReason";

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

export default function PendingProduct({
  searchQuery,
  selectedTab,
  categoryFilter,
  subCategoryFilter,
  brandFilter,
  modelFilter,
  variantFilter,
  refreshKey,
  resetSortKey,
}: {
  searchQuery: string;
  selectedTab?: string;
  categoryFilter?: string;
  subCategoryFilter?: string;
  brandFilter?: string;
  modelFilter?: string;
  variantFilter?: string;
  refreshKey?: number;
  resetSortKey?: number;
}) {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);
  const { showToast } = useGlobalToast();
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [paginatedProducts, setPaginatedProducts] = useState<any[]>([]);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewProductLoading, setViewProductLoading] = useState(false);
  const [sortField, setSortField] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [qcRejectTargetId, setQcRejectTargetId] = useState<string | null>(null);
  const {
    selectedProductIds: selectedItems,
    setSelectedProductIds: setSelectedItems,
    toggleProductSelection: handleToggleSelection,
  } = useProductSelection();
  const itemsPerPage = 10;
  const route = useRouter();

  // Extract fetchProducts function so it can be called from multiple places
  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      // Map current sort field/direction to API sort_by values
      let sortByValue: string | undefined;
      if (sortField === "manufacturer_part_name") {
        sortByValue = sortDirection === "asc" ? "A-Z" : "Z-A";
      } else if (sortField === "price" || sortField === "mrp_with_gst") {
        // Component shows price from product.price; other places use mrp_with_gst
        sortByValue = sortDirection === "asc" ? "L-H" : "H-L";
      }
      let response;
      if (brandFilter || modelFilter || variantFilter) {
        response = await getProductsByFilterWithIds(
          "",
          brandFilter || "",
          modelFilter || "",
          variantFilter || "",
          categoryFilter || "",
          subCategoryFilter || "",
          sortByValue,
          undefined,
          undefined,
          undefined,
          undefined,
          searchQuery || ""
        );
      } else {
        response = await getProductsByPage(
          currentPage,
          itemsPerPage,
          "Pending",
          searchQuery,
          categoryFilter,
          subCategoryFilter,
          sortByValue
        );
      }

      // Handle response safely
      if (response && response.data) {
        const products = Array.isArray(response.data.products)
          ? response.data.products
          : [];
        const pagination = response.data.pagination || {};
        setPaginatedProducts(products);
        setTotalProducts(pagination.totalItems || 0);
        setTotalPages(pagination.totalPages || 0);
      } else {
        console.error("Unexpected API response structure:", response);
        setPaginatedProducts([]);
        setTotalProducts(0);
        setTotalPages(0);
        showToast("No products found", "error");
      }
    } catch (error: any) {
      console.error("Failed to fetch products:", error);

      // Set safe fallback values
      setPaginatedProducts([]);
      setTotalProducts(0);
      setTotalPages(0);

      // Show appropriate error message
      const errorMessage = error.message || "Failed to fetch products";
      showToast(errorMessage, "error");
    } finally {
      setLoadingProducts(false);
    }
  }, [
    currentPage,
    itemsPerPage,
    searchQuery,
    categoryFilter,
    subCategoryFilter,
    brandFilter,
    modelFilter,
    variantFilter,
    sortField,
    sortDirection,
    showToast,
  ]);

  // Fetch products when component mounts or when dependencies change
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts, refreshKey]);

  // handle select all checkbox
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allProductIds = filteredProducts.map((product) => product._id);
      setSelectedItems(allProductIds);
    } else {
      setSelectedItems([]);
    }
  };
  // handle individual row checkbox
  const handleRowCheckboxChange = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems((prevSelected) => [...prevSelected, productId]);
    } else {
      setSelectedItems((prevSelected) =>
        prevSelected.filter((id) => id !== productId)
      );
    }
  };

  // Reset to first page when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, subCategoryFilter]);

  // Reset sorting when resetSortKey changes
  useEffect(() => {
    if (resetSortKey !== undefined && resetSortKey > 0) {
      setSortField("");
      setSortDirection("asc");
    }
  }, [resetSortKey]);

  // Server handles search/sort; return products as-is
  const filteredProducts = React.useMemo(() => {
    if (!paginatedProducts) return [];
    return [...paginatedProducts];
  }, [paginatedProducts]);

  const handleSortByName = () => {
    if (sortField === "manufacturer_part_name") {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField("manufacturer_part_name");
      setSortDirection("asc");
    }
  };

  const handleSortByPrice = () => {
    if (sortField === "mrp_with_gst" || sortField === "price") {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField("mrp_with_gst");
      setSortDirection("asc");
    }
  };

  // Empty state
  if (!loadingProducts && filteredProducts.length === 0) {
    return <Emptydata />;
  }

  const handleQcStatusChange = async (productId: string, newStatus: 'Approved' | 'Rejected') => {
    if (newStatus === 'Rejected') {
      setQcRejectTargetId(productId);
      setIsRejectDialogOpen(true);
      return;
    }
    
    try {
      if (newStatus === 'Approved') {
        await aproveProduct(productId);
        showToast('Product approved', "success");
      }
      dispatch(updateProductQcStatus({ id: productId, qcStatus: newStatus }));
      await fetchProducts();
    } catch (error) {
      console.error("Failed to update QC status:", error);
      showToast("Failed to update QC status", "error");
    }
  };

  const handleRejectSubmit = async (data: { reason: string }) => {
    if (!qcRejectTargetId) return;
    try {
      await rejectSingleProduct(qcRejectTargetId, data.reason, auth?.user?._id);
      dispatch(updateProductQcStatus({ id: qcRejectTargetId, qcStatus: 'Rejected' }));
      showToast('Product rejected', 'success');
      await fetchProducts();
    } catch (error: any) {
      console.error('Failed to reject product:', error);
      showToast(error?.message || 'Failed to reject product', 'error');
    } finally {
      setIsRejectDialogOpen(false);
      setQcRejectTargetId(null);
    }
  };

  const handleLiveStatusChange = async (productId: string, newStatus: 'Approved' | 'Rejected') => {
    try {
      await updateProductStatus([productId], newStatus);
      showToast(`Product ${newStatus === 'Approved' ? 'approved for shop' : 'removed from shop'}`, "success");
      dispatch(updateProductLiveStatus({ id: productId, liveStatus: newStatus }));
      await fetchProducts();
    } catch (error) {
      console.error("Failed to update product status:", error);
      showToast("Failed to update product status", "error");
    }
  };

  const handleStatusChange = async (productId: string, newStatus: string) => {
    try {
      if (newStatus === "Active") {
        await approveSingleProduct(productId);
        dispatch(
          updateProductLiveStatus({ id: productId, liveStatus: "Approved" })
        );
        showToast("Product activated successfully", "success");
      } else if (newStatus === "Inactive") {
        await deactivateProduct(productId);
        dispatch(
          updateProductLiveStatus({ id: productId, liveStatus: "Pending" })
        );
        showToast("Product deactivated successfully", "success");
      }

      // Refresh the product list after status change
      await fetchProducts();
    } catch (error) {
      console.error("Failed to update product status:", error);
      showToast("Failed to update product status", "error");
    }
  };

  // Navigation handlers
  const handleEditProduct = (id: string) => {
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

  return (
    <div className="px-4">
      <div className="w-full overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-[#E5E5E5] bg-gray-50/50">
              <TableHead className="px-6 py-4">
                <Checkbox
                  checked={
                    selectedItems.length === filteredProducts.length &&
                    filteredProducts.length > 0
                  }
                  onCheckedChange={handleSelectAll}
                  className="rounded border-gray-300"
                />
              </TableHead>
              <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display]">
                Image
              </TableHead>
              <TableHead
                className="text-gray-700 font-medium px-6 py-4 text-left min-w-[200px] font-[Red Hat Display] cursor-pointer select-none"
                onClick={handleSortByName}
              >
                <div className="flex items-center">
                  Name
                  {sortField === "manufacturer_part_name" && (
                    <span className="ml-1">
                      {sortDirection === "asc" ? (
                        <ChevronUp className="w-4 h-4 text-[#C72920]" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[#C72920]" />
                      )}
                    </span>
                  )}
                </div>
              </TableHead>
              <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left min-w-[120px] hidden md:table-cell font-[Red Hat Display]">
                Category
              </TableHead>
              <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left min-w-[120px] hidden lg:table-cell font-[Red Hat Display]">
                Sub Category
              </TableHead>
              <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left min-w-[100px] hidden md:table-cell font-[Red Hat Display]">
                Brand
              </TableHead>
              <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left min-w-[100px] hidden lg:table-cell font-[Red Hat Display]">
                Type
              </TableHead>
              <TableHead
                className="b2 text-gray-700 font-medium px-6 py-4 text-left min-w-[100px] hidden lg:table-cell font-[Red Hat Display] cursor-pointer select-none"
                onClick={handleSortByPrice}
              >
                <div className="flex items-center">
                  <span>Price</span>
                  <div className="w-4 h-4 ml-1 flex items-center justify-center">
                    {sortField === "mrp_with_gst" ? (
                      sortDirection === "asc" ? (
                        <ChevronUp className="w-4 h-4 text-[#C72920]" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[#C72920]" />
                      )
                    ) : (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </div>
              </TableHead>
              <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left min-w-[100px] font-[Red Hat Display]">
                Product Status
              </TableHead>
              {/* <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left min-w-[100px] font-[Red Hat Display]">
                Product status
              </TableHead> */}
              <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-center min-w-[80px] font-[Red Hat Display]">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loadingProducts
              ? Array.from({ length: 5 }).map((_, index) => (
                  <TableRow
                    key={`skeleton-${index}`}
                    className={`border-b border-gray-100 hover:bg-gray-50/50 transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                    }`}
                  >
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
              : filteredProducts.map((product: any, index: number) => (
                  <TableRow
                    key={product._id}
                    className={`border-b border-gray-100 hover:bg-gray-50/50 transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                    }`}
                  >
                    <TableCell className="px-6 py-4">
                      <Checkbox
                        checked={selectedItems.includes(product._id)}
                        onCheckedChange={() =>
                          handleToggleSelection(product._id)
                        }
                        className="rounded border-gray-300"
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
                        {product.product_name?.length > 8
                          ? `${product.product_name.substring(
                              0,
                              8
                            )}...`
                          : product.product_name}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 md:hidden">
                        {product.category?.category_name} •{" "}
                        {product.brand?.brand_name}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 hidden md:table-cell font-sans">
                      <span className="text-gray-700 b2 font-sans">
                        {product.category?.category_name?.length > 8
                          ? `${product.category.category_name.substring(
                              0,
                              8
                            )}...`
                          : product.category?.category_name}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4 hidden lg:table-cell font-sans">
                      <span className="text-gray-700 b2 font-sans">
                        {product.sub_category?.subcategory_name?.length > 8
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
                    <TableCell className="px-6 py-4 hidden lg:table-cell font-[Red Hat Display]">
                      <span className="text-gray-700 b2 font-[Red Hat Display]">
                        {product.selling_price || "N/A"}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4 font-[Red Hat Display]">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className={`h-auto p-2 justify-between min-w-[120px] ${getStatusColor(product.Qc_status)}`}
                          >
                            <span className="b2">{product.Qc_status}</span>
                            <ChevronDown className="h-4 w-4 ml-2" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="min-w-[120px]">
                          <DropdownMenuItem
                            onClick={() => handleQcStatusChange(product._id, "Approved")}
                            className="text-green-600 focus:text-green-600"
                          >
                            Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleQcStatusChange(product._id, "Rejected")}
                            className="text-yellow-600 focus:text-yellow-600"
                          >
                            Reject
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                    {/* <TableCell className="px-6 py-4 font-sans">
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
                            onClick={() => handleLiveStatusChange(product._id, "Approved")}
                            className="text-green-600 focus:text-green-600"
                          >
                            Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleLiveStatusChange(product._id, "Rejected")}
                            className="text-red-600 focus:text-red-600"
                          >
                            Reject
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell> */}
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
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
       {totalProducts > 0 && totalPages > 1 && (
         <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0 mt-8">
           {/* Left: Showing X-Y of Z products */}
           <div className="text-sm text-gray-600 text-center sm:text-left">
             {`Showing ${(currentPage - 1) * itemsPerPage + 1}-${Math.min(
               currentPage * itemsPerPage,
               totalProducts
             )} of ${totalProducts} products`}
           </div>
           {/* Pagination Controls */}
 
           <div className="flex justify-center sm:justify-end">
            <DynamicPagination
             currentPage={currentPage}
             totalPages={totalPages}
             totalItems={totalProducts}
             itemsPerPage={itemsPerPage}
             onPageChange={setCurrentPage}
           />
           </div>
         </div>
       )}

      {/* Loading spinner for product view */}
      {viewProductLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 flex flex-col items-center justify-center shadow-xl">
            <Loader2 className="h-16 w-16 animate-spin text-[#C72920] mb-4" />
            <p className="text-lg font-medium text-gray-700">
              Loading product details...
            </p>
          </div>
        </div>
      )}

      {/* QC Reject Reason Dialog */}
      <RejectReason
        isOpen={isRejectDialogOpen}
        onClose={() => {
          setIsRejectDialogOpen(false);
          setQcRejectTargetId(null);
        }}
        onSubmit={handleRejectSubmit}
      />
    </div>
  );
}
