import React, { useEffect, useState } from "react";
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
import { ChevronDown, Loader2, MoreHorizontal } from "lucide-react";
import { fetchProductsSuccess } from "@/store/slice/product/productSlice";
import { fetchProductIdForBulkActionSuccess } from "@/store/slice/product/productIdForBulkAction";
import { useRouter } from "next/navigation";
import { useToast as useGlobalToast } from "@/components/ui/toast";

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
}: {
  searchQuery: string;
}) {
  const dispatch = useAppDispatch();
  // Use the correct state for products with live status
  const allProducts = useAppSelector(
    (state) => state.productLiveStatus.products
  );
  const loading = useAppSelector((state) => state.productLiveStatus.loading);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const route = useRouter();
    const [viewProductLoading, setViewProductLoading] = useState(false);
  const { showToast } = useGlobalToast();
  const itemsPerPage = 10;

  // Fetch products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        const response = await getProducts();
        const data = response.data;
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
          }));
          dispatch(fetchProductsWithLiveStatus(mapped));
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoadingProducts(false);
      }
    };

    // Only fetch if we don't have products in the store
    if (!allProducts || allProducts.length === 0) {
      fetchProducts();
    }
  }, [dispatch, allProducts]);

  // Filter products by approved live status and search query
  const filteredProducts = React.useMemo(() => {
    if (!allProducts || !Array.isArray(allProducts)) return [];

    // First filter by approved live status
    const approvedProducts = allProducts.filter(
      (product: any) => product.liveStatus === "Approved"
    );

    // Then filter by search query if provided
    if (!searchQuery || searchQuery.trim() === "") return approvedProducts;

    const q = searchQuery.trim().toLowerCase();
    return approvedProducts.filter(
      (product: any) =>
        product.name?.toLowerCase().includes(q) ||
        product.category?.toLowerCase().includes(q) ||
        product.brand?.toLowerCase().includes(q) ||
        product.subCategory?.toLowerCase().includes(q) ||
        product.productType?.toLowerCase().includes(q)
    );
  }, [allProducts, searchQuery]);

  // Update total products count when filtered products change
  useEffect(() => {
    setTotalProducts(filteredProducts.length);
  }, [filteredProducts]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedData = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Selection handlers
  const handleSelectOne = (id: string) => {
    const newSelectedProducts = selectedProducts.includes(id)
      ? selectedProducts.filter((pid) => pid !== id)
      : [...selectedProducts, id];
    setSelectedProducts(newSelectedProducts);
    // Always dispatch as array of product IDs
    dispatch(fetchProductIdForBulkActionSuccess([...newSelectedProducts]));
  };

  const allSelected =
    filteredProducts.length > 0 &&
    filteredProducts.every((p: any) => selectedProducts.includes(p.id));

  const handleSelectAll = () => {
    const newSelectedProducts = allSelected
      ? []
      : filteredProducts.map((p: any) => p.id);
    setSelectedProducts(newSelectedProducts);
    // Always dispatch as array of product IDs
    dispatch(fetchProductIdForBulkActionSuccess([...newSelectedProducts]));
  };

  const handleEditProduct = (id: string) => {
    // Implement navigation or modal logic here
    route.push(`/user/dashboard/product/productedit/${id}`);
  };
  const handleViewProduct = (id: string) => {
    setViewProductLoading(true);
    try{
      route.push(`/user/dashboard/product/product-details/${id}`);
    }catch(e){
      console.log(e);
    }
    finally{
      setViewProductLoading(false);

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
    } catch (error) {
      console.error("Failed to update product status:", error);
      showToast("Failed to update product status", "error");
    }
  };

  return (
    <div className="px-4">
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
      <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left min-w-[200px] font-[Red Hat Display]">
        Name
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
      <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left min-w-[100px] font-[Red Hat Display]">
        QC Status
      </TableHead>
      <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left min-w-[100px] font-[Red Hat Display]">
        Product status
      </TableHead>
      <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-center min-w-[80px] font-[Red Hat Display]">
        Action
      </TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {loadingProducts ? (
      // Show skeleton rows when loading
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
    ) : (
      // Original content when not loading
      paginatedData.map((product: any, index: number) => (
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
          <TableCell
            className="px-6 py-4 cursor-pointer font-[Red Hat Display]"
            onClick={() => handleViewProduct(product.id)}
          >
            <div className="font-medium text-gray-900 b2 font-sans">
              {product.name}
            </div>
            <div className="text-xs text-gray-500 mt-1 md:hidden">
              {product.category} • {product.brand}
            </div>
          </TableCell>
          <TableCell className="px-6 py-4 hidden md:table-cell font-[Red Hat Display]">
            <span className="text-gray-700 b2 font-sans">
              {product.category}
            </span>
          </TableCell>
          <TableCell className="px-6 py-4 hidden lg:table-cell font-[Red Hat Display]">
            <span className="text-gray-700 b2 font-[Red Hat Display]">
              {product.subCategory}
            </span>
          </TableCell>
          <TableCell className="px-6 py-4 hidden md:table-cell font-[Red Hat Display]">
            <span className="text-gray-700 b2 font-[Red Hat Display]">
              {product.brand}
            </span>
          </TableCell>
          <TableCell className="px-6 py-4 hidden lg:table-cell font-[Red Hat Display]">
            <span className="text-gray-700 b2 font-[Red Hat Display]">
              {product.productType}
            </span>
          </TableCell>
          <TableCell className="px-6 py-4 font-[Red Hat Display]">
            <span className={`b2 ${getStatusColor(product.qcStatus)}`}>
              {product.qcStatus}
            </span>
          </TableCell>
          <TableCell className="px-6 py-4 font-[Red Hat Display]">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={`h-auto p-2 justify-between min-w-[120px] ${getStatusColor(
                    product.liveStatus
                  )}`}
                >
                  <span className="b2">{product.liveStatus}</span>
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-[120px]">
                <DropdownMenuItem
                  onClick={() => handleStatusChange(product.id, "Active")}
                  className="text-green-600 focus:text-green-600"
                >
                  Activate
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleStatusChange(product.id, "Inactive")}
                  className="text-red-600 focus:text-red-600"
                >
                  Deactivate
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
                  onClick={() => handleEditProduct(product.id)}
                >
                  Edit Product
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => handleViewProduct(product.id)}
                >
                  View Details
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
      ))
    )}
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
          </div>
          {/* Pagination Controls */}
          <div className="flex justify-center sm:justify-end">
            <Pagination>
              <PaginationContent>
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
                {Array.from({ length: Math.min(totalPages, 3) }).map(
                  (_, idx) => {
                    let pageNum;
                    if (totalPages <= 3) {
                      pageNum = idx + 1;
                    } else if (currentPage <= 2) {
                      pageNum = idx + 1;
                    } else if (currentPage >= totalPages - 1) {
                      pageNum = totalPages - 2 + idx;
                    } else {
                      pageNum = currentPage - 1 + idx;
                    }
                    if (pageNum < 1 || pageNum > totalPages) return null;
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
                    );
                  }
                )}
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
    </div>
  );
}
