import React, { useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { fetchProductsWithLiveStatus } from "@/store/slice/product/productLiveStatusSlice";
import { getProducts } from "@/service/product-Service";

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
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { fetchProductsSuccess } from "@/store/slice/product/productSlice";


export default function CreatedProduct({ searchQuery }: { searchQuery: string }) {
  const dispatch = useAppDispatch();
  const products = useAppSelector((state) => state.productLiveStatus.products);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [totalProducts, setTotalProducts] = useState<number>(0);
 const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
   const itemsPerPage = 10;

  // Fetch products on mount and when page changes
  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        const response = await getProducts();
        setLoadingProducts(false);
        dispatch(fetchProductsSuccess(response.data));
        console.log("API Response:", response);
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
          setTotalProducts(response.data.length || 0);
        } else {
          setTotalProducts(0);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
        setTotalProducts(0);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, [ dispatch]);

  // Filter products by search query
  const filteredProducts = React.useMemo(() => {
    if (!products) return [];
    if (!searchQuery || searchQuery.trim() === "") return products;
    const q = searchQuery.trim().toLowerCase();
    return products.filter(
      (product: any) =>
        product.name?.toLowerCase().includes(q) ||
        product.category?.toLowerCase().includes(q) ||
        product.brand?.toLowerCase().includes(q) ||
        product.subCategory?.toLowerCase().includes(q) ||
        product.productType?.toLowerCase().includes(q)
    );
  }, [products, searchQuery]);
      const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const paginatedData = filteredProducts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

  // Selection handlers
  const handleSelectOne = (id: string) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };
  const allSelected =
    filteredProducts.length > 0 &&
    filteredProducts.every((p: any) => selectedProducts.includes(p.id));
  const handleSelectAll = () => {
    setSelectedProducts(
      allSelected ? [] : filteredProducts.map((p: any) => p.id)
    );
  };

  // Dummy handlers for edit/view (replace with navigation if needed)
  const handleEditProduct = (id: string) => {
    // Implement navigation or modal logic here
    alert(`Edit product ${id}`);
  };
  const handleViewProduct = (id: string) => {
    // Implement navigation or modal logic here
    alert(`View product ${id}`);
  };

  return (
    <div>
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
            <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display]">Image</TableHead>
            <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left min-w-[200px] font-[Red Hat Display]">Name</TableHead>
            <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left min-w-[120px] hidden md:table-cell font-[Red Hat Display]">Category</TableHead>
            <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left min-w-[120px] hidden lg:table-cell font-[Red Hat Display]">Sub Category</TableHead>
            <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left min-w-[100px] hidden md:table-cell font-[Red Hat Display]">Brand</TableHead>
            <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left min-w-[100px] hidden lg:table-cell font-[Red Hat Display]">Type</TableHead>
            <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left min-w-[100px] font-[Red Hat Display]">QC Status</TableHead>
            <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-center min-w-[80px] font-[Red Hat Display]">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.map((product: any, index: number) => (
            <TableRow
              key={product.id}
              className={`border-b border-gray-100 hover:bg-gray-50/50 transition-colors ${index % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}
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
                <div className="font-medium text-gray-900 b2 font-sans ">{product.name}</div>
                <div className="text-xs text-gray-500 mt-1 md:hidden">{product.category} • {product.brand}</div>
              </TableCell>
              <TableCell className="px-6 py-4 hidden md:table-cell font-[Red Hat Display]">
                <span className="text-gray-700 b2 font-sans">{product.category}</span>
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
                <span className={`b2 `}>{product.qcStatus}</span>
              </TableCell>
              <TableCell className="px-6 py-4 text-center font-[Red Hat Display]">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem className="cursor-pointer" onClick={() => handleEditProduct(product.id)}>
                      Edit Product
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer" onClick={() => handleViewProduct(product.id)}>
                      View Details
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
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
                    onClick={() =>
                      setCurrentPage((p) => Math.max(1, p - 1))
                    }
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
                      <PaginationItem
                        key={pageNum}
                        className="hidden sm:block"
                      >
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
    </div>
  );
}
