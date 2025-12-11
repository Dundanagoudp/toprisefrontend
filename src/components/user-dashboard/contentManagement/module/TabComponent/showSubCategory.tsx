import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { getSubCategories, getCategories, deleteSubCategory } from "@/service/product-Service";
import { updateSubCategory } from "@/service/catalogue-service";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { ArrowUpDown, ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import UpdateModal from "../UpdateModal";
import { useToast as useGlobalToast } from "@/components/ui/toast";

export default function SubCategory({ searchQuery }: { searchQuery: string }) {
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [sortField, setSortField] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [selectedSubCategory, setSelectedSubCategory] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const { showToast } = useGlobalToast();
  const itemPerPage = 10;

  // Filter and sort subcategories
  const filteredSubCategories = React.useMemo(() => {
    if (!subCategories || !Array.isArray(subCategories)) return [];
    
    let filtered = subCategories;
    
    // Apply search filter
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      filtered = subCategories.filter((item) =>
        (item?.subcategory_name?.toLowerCase().includes(q) ||
          item?.subcategory_status?.toLowerCase().includes(q) ||
          item?.category_ref?.category_name?.toLowerCase().includes(q))
      );
    }
    
    // Apply sorting
    if (sortField) {
      filtered = [...filtered].sort((a, b) => {
        let aValue = "";
        let bValue = "";
        
        switch (sortField) {
          case "name":
            aValue = a?.subcategory_name || "";
            bValue = b?.subcategory_name || "";
            break;
          case "status":
            aValue = (a?.subcategory_status || "").toLowerCase();
            bValue = (b?.subcategory_status || "").toLowerCase();
            break;
          case "category":
            aValue = a?.category_ref?.category_name || "";
            bValue = b?.category_ref?.category_name || "";
            break;
          default:
            return 0;
        }
        
        if (sortDirection === "asc") {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      });
    }
    
    return filtered;
  }, [subCategories, searchQuery, sortField, sortDirection]);

  const totalPages = Math.ceil(filteredSubCategories.length / itemPerPage);
  const paginatedData = filteredSubCategories.slice(
    (currentPage - 1) * itemPerPage,
    currentPage * itemPerPage
  );

  // Function to handle sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Function to get sort icon
  const getSortIcon = (field: string) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    return sortDirection === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  // Fetch data function (defined outside useEffect so it can be reused)
  const fetchData = async () => {
    setLoading(true);
    try {
      const [subCategoriesResponse, categoriesResponse] = await Promise.all([
        getSubCategories(),
        getCategories()
      ]);
      
      if (!subCategoriesResponse || !subCategoriesResponse.data) {
        console.error("No subcategories data found in response");
        setSubCategories([]);
      } else {
        const Items = subCategoriesResponse.data;
        setSubCategories(Array.isArray(Items) ? Items : []);
      }

      if (!categoriesResponse || !categoriesResponse.data) {
        console.error("No categories data found in response");
        setCategories([]);
      } else {
        const Categories = categoriesResponse.data;
        setCategories(Array.isArray(Categories) ? Categories : []);
      }
    } catch (err: any) {
      console.error("Error fetching data:", err);
      setSubCategories([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubCategory = (subCategory: any) => {
    setSelectedSubCategory(subCategory);
    setUpdateModalOpen(true);
  };

  const handleUpdateSubCategory = async (formData: FormData) => {
    if (!selectedSubCategory) return;
    await updateSubCategory(selectedSubCategory._id, formData);
    // Refresh subcategories after update
    await fetchData();
  };

  const handleDelete = async (subCategoryId: string) => {
    if (!confirm("Are you sure you want to delete this subcategory?")) return;

    try {
      setDeleteLoading(subCategoryId);
      const response = await deleteSubCategory(subCategoryId);
      
      // Check if the deletion was successful
      if (response && (response.success || response.message)) {
        showToast("Subcategory deleted successfully", "success");
        await fetchData();
      } else {
        throw new Error("Deletion failed - no success response");
      }
    } catch (error: any) {
      console.error("Error deleting subcategory:", error);
      
      // Check if the error is because the subcategory was already deleted
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to delete subcategory";
      
      if (errorMessage.includes("not found") || errorMessage.includes("subcategoryid is not found")) {
        // If the subcategory is not found, it might have been already deleted
        showToast("Subcategory may have been already deleted", "warning");
        // Still refresh the data to update the UI
        await fetchData();
      } else {
        showToast(errorMessage, "error");
      }
    } finally {
      setDeleteLoading(null);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">SubCategory</h2>
        <div className="flex justify-center items-center h-32">
          <div className="text-gray-500">Loading subcategories...</div>
        </div>
      </div>
    );
  }

  // Safe check for data existence
  const hasData = paginatedData && Array.isArray(paginatedData) && paginatedData.length > 0;
  const totalItems = subCategories && Array.isArray(subCategories) ? subCategories.length : 0;

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">SubCategory</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort("name")}
                className="h-auto p-0 font-semibold hover:bg-transparent"
              >
                Name
                {getSortIcon("name")}
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort("status")}
                className="h-auto p-0 font-semibold hover:bg-transparent"
              >
                Status
                {getSortIcon("status")}
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort("category")}
                className="h-auto p-0 font-semibold hover:bg-transparent"
              >
                Category
                {getSortIcon("category")}
              </Button>
            </TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {hasData ? (
            paginatedData.map((item) => (
              <TableRow key={item?._id || Math.random()}>
                <TableCell>{item?.subcategory_name || "No Title"}</TableCell>
                <TableCell>
                  {(() => {
                    const status = (item?.subcategory_status || "Draft").toLowerCase();
                    const isActive = status === "active";
                    const isCreated = status === "created";
                    
                    return (
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          isActive
                            ? "bg-green-100 text-green-800"
                            : isCreated
                            ? "bg-orange-100 text-orange-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {item?.subcategory_status || "Draft"}
                      </span>
                    );
                  })()}
                </TableCell>
                <TableCell>
                  {item?.category_ref?.category_name || "No Category"}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditSubCategory(item)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(item._id)}
                      disabled={deleteLoading === item._id}
                      title="Delete"
                    >
                      {deleteLoading === item._id ? (
                        <div className="h-4 w-4 border-2 border-gray-300 border-t-red-600 rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-red-600" />
                      )}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                No subcategories found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination - moved outside of table */}
      {subCategories.length > 0 && totalPages > 1 && (
        <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0 mt-8">
          {/* Left: Showing X-Y of Z subcategories */}
          <div className="text-sm text-gray-600 text-center sm:text-left">
            {`Showing ${(currentPage - 1) * itemPerPage + 1}-${Math.min(
              currentPage * itemPerPage,
              subCategories.length
            )} of ${subCategories.length} subcategories`}
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

                    // Prevent out-of-bounds pageNum
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

      {/* Update Modal */}
      <UpdateModal
        open={updateModalOpen}
        onClose={() => setUpdateModalOpen(false)}
        onUpdate={handleUpdateSubCategory}
        item={selectedSubCategory}
        type="subcategory"
        categories={categories}
      />
    </div>
  );
}
