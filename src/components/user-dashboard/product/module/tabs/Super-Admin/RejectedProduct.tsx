import React, { useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { 
  fetchProductsWithLiveStatus,
  updateProductLiveStatus,
  updateProductQcStatus,
} from "@/store/slice/product/productLiveStatusSlice";
import { 
  getProducts, 
  getProductsByPage,
  approveSingleProduct,
  updateProductStatus,
  deactivateProduct,
  aproveProduct,
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
import { MoreHorizontal, ChevronDown, ChevronUp } from "lucide-react";
import { fetchProductsSuccess } from "@/store/slice/product/productSlice";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import Emptydata from "../../Emptydata";
import { DynamicPagination } from "@/components/common/pagination";
import { useToast as useGlobalToast } from "@/components/ui/toast";
import { Checkbox } from "@/components/ui/checkbox";
import { useProductSelection } from "@/contexts/ProductSelectionContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

export default function RejectedProduct({
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
  const loading = useAppSelector((state) => state.productLiveStatus.loading);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginatedProducts, setPaginatedProducts] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [sortField, setSortField] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [sortPriceDirection, setSortPriceDirection] = useState<"L-H" | "H-L">("L-H");
  const route = useRouter();
  const { showToast } = useGlobalToast();
  const itemsPerPage = 10;
  const {
    selectedProductIds: selectedItems,
    setSelectedProductIds,
    toggleProductSelection,
  } = useProductSelection();
  const [isRejectReasonDialogOpen, setIsRejectReasonDialogOpen] = useState(false);
  const [selectedProductForRejectReason, setSelectedProductForRejectReason] = useState<any>(null);

  // Fetch products when component mounts or when pagination changes
  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        // Map current sort field/direction to API sort_by values
        let sortByValue: string | undefined;
        if (sortField === "manufacturer_part_name") {
          sortByValue = sortDirection === "asc" ? "A-Z" : "Z-A";
        } else if (sortField === "selling_price") {
          sortByValue = sortPriceDirection === "L-H" ? "L-H" : "H-L";
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
            "Rejected",
            searchQuery,
            categoryFilter,
            subCategoryFilter,
            sortByValue
          );
        }
        
    
        if (response.data) {
          const rejectedProducts = response.data.products.filter(
            product => product.live_status === "Rejected"
          );
          const paginationData = response.data.pagination;
          setPaginatedProducts(rejectedProducts);
          setTotalProducts(paginationData?.totalItems || 0);
          setTotalPages(paginationData?.totalPages || 0);
        } else {
          console.error("Unexpected API response structure:", response.data);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, [currentPage, itemsPerPage, searchQuery, categoryFilter, subCategoryFilter, brandFilter, sortPriceDirection, modelFilter, variantFilter, sortField, sortDirection, refreshKey]);

  // Reset to first page when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, subCategoryFilter, brandFilter, sortPriceDirection, modelFilter, variantFilter]);

  // Reset sorting when resetSortKey changes
  useEffect(() => {
    if (resetSortKey !== undefined && resetSortKey > 0) {
      setSortField("");
      setSortDirection("asc");
      setSortPriceDirection("L-H");
    }
  }, [resetSortKey]);

  // Server handles search/sort; return products as-is
  const filteredProducts = React.useMemo(() => {
    if (!paginatedProducts || !Array.isArray(paginatedProducts)) return [];
    return [...paginatedProducts];
  }, [paginatedProducts]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProductIds(filteredProducts.map((product) => product._id));
    } else {
      setSelectedProductIds([]);
    }
  };


  const handleEditProduct = (id: string) => {
    route.push(`/user/dashboard/product/productedit/${id}`);
  };

  const handleViewProduct = (id: string) => {
    route.push(`/user/dashboard/product/product-details/${id}`);
  };

  const handleViewRejectReason = (productId: string) => {
    const product = filteredProducts.find((p) => p._id === productId);
    if (product) {
      setSelectedProductForRejectReason(product);
      setIsRejectReasonDialogOpen(true);
    }
  };

  const getRejectReason = (product: any): string => {
    if (product?.rejection_state && Array.isArray(product.rejection_state) && product.rejection_state.length > 0) {
      const latestRejection = product.rejection_state[product.rejection_state.length - 1];
      return latestRejection?.reason || latestRejection || "No reason provided";
    }
    if (product?.reject_reason) {
      return product.reject_reason;
    }
    if (product?.rejectionReason) {
      return product.rejectionReason;
    }
    return "No rejection reason available";
  };

  const handleQcStatusChange = async (productId: string, newStatus: 'Approved' | 'Pending') => {
    try {
      if (newStatus === 'Approved') {
        await aproveProduct(productId);
        showToast('Product approved', "success");
      } 
      dispatch(updateProductQcStatus({ id: productId, qcStatus: newStatus }));
      const response = await getProductsByPage(currentPage, itemsPerPage, "Rejected", searchQuery, categoryFilter, subCategoryFilter);
      if (response.data) {
        const rejectedProducts = response.data.products.filter(product => product.live_status === "Rejected");
        setPaginatedProducts(rejectedProducts);
      }
    } catch (error) {
      console.error("Failed to update QC status:", error);
      showToast("Failed to update QC status", "error");
    }
  };

  const handleLiveStatusChange = async (productId: string, newStatus: 'Approved' | 'Rejected') => {
    try {
      await updateProductStatus([productId], newStatus);
      showToast(`Product ${newStatus === 'Approved' ? 'approved for shop' : 'removed from shop'}`, "success");
      dispatch(updateProductLiveStatus({ id: productId, liveStatus: newStatus }));
      // Refresh products
      const response = await getProductsByPage(currentPage, itemsPerPage, "Rejected", searchQuery, categoryFilter, subCategoryFilter);
      if (response.data) {
        const rejectedProducts = response.data.products.filter(product => product.live_status === "Rejected");
        setPaginatedProducts(rejectedProducts);
      }
    } catch (error) {
      console.error("Failed to update product status:", error);
      showToast("Failed to update product status", "error");
    }
  };

  //sorting products by name
  const handleSortByName = () => {
    if (sortField === "manufacturer_part_name") {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField("manufacturer_part_name");
      setSortDirection("asc");
    }
  };
    const handleSortByPrice = () => {
      if (sortField === "selling_price") {
        setSortPriceDirection(sortPriceDirection === "L-H" ? "H-L" : "L-H");
      } else {
        setSortField("selling_price");
        setSortPriceDirection("L-H");
      }
    };

  // Empty state
  if (!loadingProducts && (filteredProducts.length === 0)) {
    return <Emptydata />;
  }

  return (
    <div className="px-4">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-[#E5E5E5] bg-gray-50/50">
            <TableHead className="px-6 py-4">
              <Checkbox
                checked={
                  filteredProducts.length > 0 &&
                  selectedItems.length === filteredProducts.length
                }
                onCheckedChange={handleSelectAll}
                className="rounded border-gray-300"
              />
            </TableHead>
            <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display]">
              Image
            </TableHead>
            <TableHead
              className="b2 text-gray-700 font-medium px-6 py-4 text-left min-w-[200px] font-[Red Hat Display] cursor-pointer select-none"
              onClick={handleSortByName}
            >
              <div className="flex items-center">
              <span>Name</span>
              <div className="w-4 h-4 ml-1 flex items-center justify-center">
                {sortField === "manufacturer_part_name" ? (
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
                  {sortField === "selling_price" ? (
                    sortPriceDirection === "L-H" ? (
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
            {/* <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left min-w-[100px] font-[Red Hat Display]">
              QC Status
            </TableHead> */}
            <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left min-w-[100px] font-[Red Hat Display]">
              Product status
            </TableHead>
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
                      onCheckedChange={() => toggleProductSelection(product._id)}
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
                    className="px-6 py-4 cursor-pointer font-[Red Hat Display]"
                    onClick={() => handleViewProduct(product._id)}
                  >
                    <div className="font-medium text-gray-900 b2 font-sans">
                      {product.product_name.length > 8
                        ? `${product.product_name.slice(0, 8)}...`
                        : product.product_name}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 md:hidden">
                      {product.category?.category_name} •{" "}
                      {product.brand?.brand_name}
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 hidden md:table-cell font-[Red Hat Display]">
                    <span className="text-gray-700 b2 font-sans">
                      {product.category?.category_name.length > 8
                        ? `${product.category.category_name.slice(0, 8)}...`
                        : product.category?.category_name}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4 hidden lg:table-cell font-[Red Hat Display]">
                    <span className="text-gray-700 b2 font-[Red Hat Display]">
                      {product.sub_category?.subcategory_name.length > 8
                        ? `${product.sub_category.subcategory_name.slice(
                            0,
                            8
                          )}...`
                        : product.sub_category?.subcategory_name}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4 hidden md:table-cell font-[Red Hat Display]">
                    <span className="text-gray-700 b2 font-[Red Hat Display]">
                      {product.brand?.brand_name}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4 hidden lg:table-cell font-[Red Hat Display]">
                    <span className="text-gray-700 b2 font-[Red Hat Display]">
                      {product.product_type}
                    </span>
                  </TableCell>
                  {/* //price */}
                  <TableCell className="px-6 py-4 font-[Red Hat Display]">
                    <span className="text-gray-700 b2 font-[Red Hat Display]">
                        {product.selling_price || "N/A"}
                    </span>
                  </TableCell>
                  {/* <TableCell className="px-6 py-4 font-[Red Hat Display]">
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
                        </DropdownMenuItem> */}
                        {/* <DropdownMenuItem
                          onClick={() => handleQcStatusChange(product._id, "Pending")}
                          className="text-yellow-600 focus:text-yellow-600"
                        >
                          Pending
                        </DropdownMenuItem> */}
                      {/* </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell> */}
                  <TableCell className="px-6 py-4 font-[Red Hat Display]">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className={`h-auto p-2 justify-between min-w-[120px] ${getStatusColor(product.live_status)}`}
                        >
                          <span className="b2">{product.live_status}</span>
                          <ChevronDown className="h-4 w-4 ml-2" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="min-w-[120px]">
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
                          onClick={() => handleViewRejectReason(product._id)}
                        >
                          View Reject Reason
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
        </TableBody>
      </Table>

      {/* Updated Pagination */}
      {totalProducts > 0 && totalPages > 1 && (
        <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0 mt-8">
          <div className="text-sm text-gray-600 text-center sm:text-left">
            {`Showing ${(currentPage - 1) * itemsPerPage + 1}-${Math.min(
              currentPage * itemsPerPage,
              totalProducts
            )} of ${totalProducts} products`}
          </div>
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

      {/* Reject Reason Dialog */}
      <Dialog open={isRejectReasonDialogOpen} onOpenChange={setIsRejectReasonDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Reject Reason</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {selectedProductForRejectReason && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Product:</p>
                  <p className="text-sm text-gray-900">{selectedProductForRejectReason.product_name || selectedProductForRejectReason.manufacturer_part_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Rejection Reason:</p>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md border border-gray-200">
                    {getRejectReason(selectedProductForRejectReason)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
