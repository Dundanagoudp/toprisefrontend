"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download } from "lucide-react";
import Image from "next/image";
import { DynamicPagination } from "@/components/common/pagination";
import { getProductsByPage, getCategories, getBrand, getSubcategoriesByCategoryId } from "@/service/product-Service";
import SearchInput from "@/components/common/search/SearchInput";
import useDebounce from "@/utils/useDebounce";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import DynamicButton from "@/components/common/button/button";
import auditLogService from "@/service/audit-log-service";

export default function ProductAnalyticsTab() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string | null>(null);
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<string | null>(null);
  const [selectedSubCategoryName, setSelectedSubCategoryName] = useState<string | null>(null);
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  const [selectedBrandName, setSelectedBrandName] = useState<string | null>(null);
  const itemsPerPage = 10;

  // Load categories and brands on mount
  useEffect(() => {
    (async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          getCategories(),
          getBrand(),
        ]);
        
        const categoriesData = Array.isArray(catRes?.data) ? catRes.data : 
                              Array.isArray((catRes?.data as any)?.categories) ? (catRes.data as any).categories : [];
        setCategories(categoriesData);
        
        const brandsData = Array.isArray(brandRes?.data?.products) ? brandRes.data.products :
                          Array.isArray((brandRes?.data as any)?.brands) ? (brandRes.data as any).brands :
                          Array.isArray(brandRes?.data) ? brandRes.data : [];
        setBrands(brandsData);
      } catch (e) {
        console.error("Failed initial filter fetch", e);
      }
    })();
  }, []);

  // Load subcategories when category changes
  useEffect(() => {
    if (!selectedCategoryId) {
      setSubCategories([]);
      return;
    }
    (async () => {
      try {
        const res = await getSubcategoriesByCategoryId(selectedCategoryId);
        const subCategoriesData = Array.isArray(res?.data) ? res.data :
                                 Array.isArray((res?.data as any)?.subcategories) ? (res.data as any).subcategories : [];
        setSubCategories(subCategoriesData);
      } catch (e) {
        console.error("Failed to fetch subcategories by category id", e);
        setSubCategories([]);
      }
    })();
  }, [selectedCategoryId]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const status = "Approved";
    try {
      const res = await getProductsByPage(
        currentPage,
        itemsPerPage,
        status,
        searchQuery || "",
        selectedCategoryId || undefined,
        selectedSubCategoryId ? [selectedSubCategoryId] : undefined,
        undefined,
        selectedBrandId || undefined
      );

      const data = res.data;

      if (data?.products) {
        // Filter to show only approved products
        const approvedProducts = data.products.filter(
          (product: any) => product.live_status === "Approved"
        );
        setProducts(approvedProducts);
        const paginationData = data.pagination;
        setTotalProducts(paginationData.totalItems);
        setTotalPages(paginationData.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, searchQuery, selectedCategoryId, selectedSubCategoryId, selectedBrandId]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const performSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
    setIsSearching(false);
  }, [currentPage]);

  const { debouncedCallback: debouncedSearch } = useDebounce(performSearch, 500);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    setIsSearching(value.trim() !== "");
    debouncedSearch(value);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearchQuery("");
    setIsSearching(false);
    setCurrentPage(1);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-700 font-medium border border-green-200";
      case "Rejected":
        return "bg-red-100 text-red-700 font-medium border border-red-200";
      case "Pending":
        return "bg-yellow-100 text-yellow-700 font-medium border border-yellow-200";
      default:
        return "bg-gray-100 text-gray-700 font-medium border border-gray-200";
    }
  };

  const handleExportProducts = async () => {
    try {
      setExporting(true);

      // Fetch all approved products for export
      const allPages = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
      const res = await getProductsByPage(
        page,
        100, // Large page size for export
        "Approved",
        searchQuery || "",
        selectedCategoryId || undefined,
        selectedSubCategoryId ? [selectedSubCategoryId] : undefined,
        undefined,
        selectedBrandId || undefined
      );

        const data = res.data;
        if (data?.products) {
          const approvedProducts = data.products.filter(
            (product: any) => product.live_status === "Approved"
          );
          allPages.push(...approvedProducts);

          const paginationData = data.pagination;
          hasMore = page < paginationData.totalPages;
          page++;
        } else {
          hasMore = false;
        }
      }

      if (allPages.length === 0) {
        alert("No approved products to export");
        return;
      }

      const headers = [
        "Product Name",
        "Category",
        "Sub Category",
        "Brand",
        "Type",
        "Price",
        "QC Status"
      ];

      const dataRows = allPages.map((product: any) => [
        product.product_name || product.manufacturer_part_name || "N/A",
        product.category?.category_name || "N/A",
        product.sub_category?.subcategory_name || "N/A",
        product.brand?.brand_name || "N/A",
        product.product_type || "N/A",
        product.selling_price || "N/A",
        product.Qc_status || "N/A",
      ]);

      const csvContent = [headers, ...dataRows]
        .map((row) =>
          row
            .map((cell) => {
              const cellStr = String(cell);
              if (cellStr.includes(",") || cellStr.includes('"') || cellStr.includes("\n")) {
                return `"${cellStr.replace(/"/g, '""')}"`;
              }
              return cellStr;
            })
            .join(",")
        )
        .join("\r\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `approved-products-${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      alert(`CSV exported successfully (${allPages.length} records)`);

      // Log audit trail for export action
      try {
        await auditLogService.createActionAuditLog({
          actionName: "Product_Exported",
          actionModule: "REPORT_EXPORT",
        });
      } catch (auditError) {
        console.error("Failed to log audit trail:", auditError);
        // Don't fail the export if audit log fails
      }
    } catch (error) {
      console.error("Failed to export products CSV:", error);
      alert("Failed to export CSV");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center mb-4">
            <CardTitle>Approved Products</CardTitle>
            <Button
              onClick={handleExportProducts}
              disabled={exporting}
              variant="outline"
              className="flex items-center gap-2"
            >
              {exporting ? (
                <>
                  <Download className="h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Export CSV
                </>
              )}
            </Button>
          </div>
          
          <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:gap-3 w-full">
            <SearchInput
              placeholder="Search products..."
              value={searchInput}
              onChange={handleSearchChange}
              onClear={handleClearSearch}
              isLoading={isSearching}
            />
            
            <Popover>
              <PopoverTrigger asChild>
                <DynamicButton
                  variant="outline"
                  customClassName={`bg-transparent border-gray-300 hover:bg-gray-50 min-w-[120px] flex-shrink-0 h-10 ${
                    selectedCategoryName || selectedSubCategoryName || selectedBrandName
                      ? "border-blue-300 bg-blue-50 text-blue-700" 
                      : ""
                  }`}
                  text={
                    selectedCategoryName || selectedSubCategoryName || selectedBrandName
                      ? `Filters: ${[selectedCategoryName, selectedSubCategoryName, selectedBrandName].filter(Boolean).join(" / ")}`
                      : "Filters"
                  }
                />
              </PopoverTrigger>
              <PopoverContent align="start" className="w-80 p-4">
                {(selectedCategoryName || selectedSubCategoryName || selectedBrandName) && (
                  <div className="flex justify-end mb-4">
                    <button
                      className="text-xs text-[#C72920] underline hover:text-[#A01E1A]"
                      onClick={() => {
                        setSelectedCategoryId(null);
                        setSelectedCategoryName(null);
                        setSelectedSubCategoryId(null);
                        setSelectedSubCategoryName(null);
                        setSelectedBrandId(null);
                        setSelectedBrandName(null);
                      }}
                    >
                      Clear All Filters
                    </button>
                  </div>
                )}
                <Accordion type="multiple" defaultValue={[]}>
                  <AccordionItem value="category">
                    <AccordionTrigger className="text-sm font-medium">Category</AccordionTrigger>
                    <AccordionContent>
                      {selectedCategoryName && (
                        <div className="flex justify-end mb-2">
                          <button
                            className="text-xs text-[#C72920] underline"
                            onClick={() => { 
                              setSelectedCategoryId(null); 
                              setSelectedCategoryName(null); 
                              setSelectedSubCategoryId(null);
                              setSelectedSubCategoryName(null); 
                            }}
                          >
                            Clear
                          </button>
                        </div>
                      )}
                      <ul className="space-y-1 text-sm text-gray-700 max-h-64 overflow-y-auto">
                        {categories && categories.length > 0 ? (
                          categories.map((cat: any) => (
                            <li key={cat?._id || cat?.id}>
                              <button
                                className={`w-full text-left px-2 py-1 rounded hover:bg-gray-100 ${
                                  selectedCategoryName === (cat?.category_name || cat?.name) ? "bg-gray-100" : ""
                                }`}
                                onClick={() => { 
                                  const rawCategoryId = cat?._id ?? cat?.id ?? cat?.category_id;
                                  setSelectedCategoryId(rawCategoryId);
                                  setSelectedCategoryName(cat?.category_name || cat?.name);
                                  setSelectedSubCategoryId(null);
                                  setSelectedSubCategoryName(null);
                                }}
                              >
                                {cat?.category_name || cat?.name}
                              </button>
                            </li>
                          ))
                        ) : (
                          <li className="text-gray-500 text-sm">No categories found</li>
                        )}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="subcategory">
                    <AccordionTrigger className="text-sm font-medium">Sub Category</AccordionTrigger>
                    <AccordionContent>
                      {selectedSubCategoryName && (
                        <div className="flex justify-end mb-2">
                          <button
                            className="text-xs text-[#C72920] underline"
                            onClick={() => { 
                              setSelectedSubCategoryId(null);
                              setSelectedSubCategoryName(null); 
                            }}
                          >
                            Clear
                          </button>
                        </div>
                      )}
                      <ul className="space-y-1 text-sm text-gray-700 max-h-64 overflow-y-auto">
                        {subCategories && subCategories.length > 0 ? (
                          subCategories.map((sub: any) => (
                            <li key={sub?._id || sub?.id}>
                              <button
                                className={`w-full text-left px-2 py-1 rounded hover:bg-gray-100 ${
                                  selectedSubCategoryName === (sub?.subcategory_name || sub?.name) ? "bg-gray-100" : ""
                                }`}
                                onClick={() => { 
                                  const rawSubCategoryId = sub?._id ?? sub?.id ?? sub?.subcategory_id;
                                  setSelectedSubCategoryId(rawSubCategoryId);
                                  setSelectedSubCategoryName(sub?.subcategory_name || sub?.name);
                                }}
                              >
                                {sub?.subcategory_name || sub?.name}
                              </button>
                            </li>
                          ))
                        ) : (
                          <li className="text-gray-500 text-sm">
                            {selectedCategoryId ? "No subcategories found" : "Select a category first"}
                          </li>
                        )}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="brand">
                    <AccordionTrigger className="text-sm font-medium">Brand</AccordionTrigger>
                    <AccordionContent>
                      {selectedBrandName && (
                        <div className="flex justify-end mb-2">
                          <button
                            className="text-xs text-[#C72920] underline"
                            onClick={() => { 
                              setSelectedBrandId(null);
                              setSelectedBrandName(null); 
                            }}
                          >
                            Clear
                          </button>
                        </div>
                      )}
                      <ul className="space-y-1 text-sm text-gray-700 max-h-64 overflow-y-auto">
                        {brands && brands.length > 0 ? (
                          brands.map((brand: any) => (
                            <li key={brand?._id || brand?.id}>
                              <button
                                className={`w-full text-left px-2 py-1 rounded hover:bg-gray-100 ${
                                  selectedBrandName === (brand?.brand_name || brand?.name) ? "bg-gray-100" : ""
                                }`}
                                onClick={() => { 
                                  const rawBrandId = brand?._id ?? brand?.id ?? brand?.brand_id;
                                  setSelectedBrandId(rawBrandId);
                                  setSelectedBrandName(brand?.brand_name || brand?.name);
                                }}
                              >
                                {brand?.brand_name || brand?.name}
                              </button>
                            </li>
                          ))
                        ) : (
                          <li className="text-gray-500 text-sm">No brands found</li>
                        )}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Category</TableHead>
                <TableHead className="hidden lg:table-cell">Sub Category</TableHead>
                <TableHead className="hidden md:table-cell">Brand</TableHead>
                <TableHead className="hidden lg:table-cell">Type</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>QC Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">Loading...</TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    No approved products found
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product: any) => (
                  <TableRow key={product._id}>
                    <TableCell>
                      <div className="w-12 h-10 sm:w-16 sm:h-12 lg:w-20 lg:h-16 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                        <Image
                          src={product.images?.[0] || "/placeholder.svg"}
                          alt={product.product_name || product.manufacturer_part_name || "Product"}
                          width={80}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {product.product_name || product.manufacturer_part_name || "N/A"}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {product.category?.category_name || "N/A"}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {product.sub_category?.subcategory_name || "N/A"}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {product.brand?.brand_name || "N/A"}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {product.product_type || "N/A"}
                    </TableCell>
                    <TableCell>
                      ₹{product.selling_price || "N/A"}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(product.Qc_status || "Pending")}>
                        {product.Qc_status || "Pending"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {totalProducts > 0 && totalPages > 1 && (
        <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
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
    </div>
  );
}

