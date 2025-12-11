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
import { getCategories, getTypes, deleteCategory } from "@/service/product-Service";
import { updateCategory } from "@/service/catalogue-service";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ArrowUpDown, ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import UpdateModal from "../UpdateModal";
import { useToast as useGlobalToast } from "@/components/ui/toast";

export default function ShowCategory({ searchQuery }: { searchQuery: string }) {
  const [Categories, setCategories] = useState<any[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [sortField, setSortField] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const { showToast } = useGlobalToast();
  const itemPerPage = 10;

  // Function to get vehicle type name by ID
  const getVehicleTypeName = (typeId: string) => {
    if (!typeId || !vehicleTypes || !Array.isArray(vehicleTypes))
      return "No Vehicle Type";
    const vehicleType = vehicleTypes.find((type) => type._id === typeId);
    return vehicleType?.type_name || "Unknown Type";
  };

  // Filter and sort categories
  const filteredCategories = React.useMemo(() => {
    if (!Categories || !Array.isArray(Categories)) return [];

    let filtered = Categories;

    // Apply search filter
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      filtered = Categories.filter(
        (item) =>
          item?.category_name?.toLowerCase().includes(q) ||
          item?.category_code?.toLowerCase().includes(q) ||
          item?.category_Status?.toLowerCase().includes(q)
      );
    }

    // Apply sorting
    if (sortField) {
      filtered = [...filtered].sort((a, b) => {
        let aValue = "";
        let bValue = "";

        switch (sortField) {
          case "name":
            aValue = a?.category_name || "";
            bValue = b?.category_name || "";
            break;
          case "code":
            aValue = a?.category_code || "";
            bValue = b?.category_code || "";
            break;
          case "vehicleType":
            aValue = getVehicleTypeName(a?.type || a?.vehicleType_id);
            bValue = getVehicleTypeName(b?.type || b?.vehicleType_id);
            break;
          case "status":
            aValue = (a?.category_Status || "").toLowerCase();
            bValue = (b?.category_Status || "").toLowerCase();
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
  }, [Categories, searchQuery, sortField, sortDirection, vehicleTypes]);

  const totalPages = Math.ceil(filteredCategories.length / itemPerPage);
  const paginatedData = filteredCategories.slice(
    (currentPage - 1) * itemPerPage,
    currentPage * itemPerPage
  );

  // Fetch data function (defined outside useEffect so it can be reused)
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch categories and vehicle types in parallel
      const [categoriesResponse, typesResponse] = await Promise.all([
        getCategories(),
        getTypes(),
      ]);

      // Handle categories
      if (!categoriesResponse || !categoriesResponse.data) {
        console.error("No categories data found in response");
        setCategories([]);
      } else {
        const Items = categoriesResponse.data;
        setCategories(Array.isArray(Items) ? Items : []);
      }

      // Handle vehicle types
      if (!typesResponse || !typesResponse.data) {
        console.error("No vehicle types data found in response");
        setVehicleTypes([]);
      } else {
        const types = typesResponse.data;
        setVehicleTypes(Array.isArray(types) ? types : []);
      }
    } catch (err: any) {
      console.error("Error fetching data:", err);
      setCategories([]);
      setVehicleTypes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEditCategory = (category: any) => {
    setSelectedCategory(category);
    setUpdateModalOpen(true);
  };

  const handleUpdateCategory = async (formData: FormData) => {
    if (!selectedCategory) return;
    await updateCategory(selectedCategory._id, formData);
    // Refresh categories after update
    await fetchData();
  };

  const handleDelete = async (categoryId: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      setDeleteLoading(categoryId);
      const response = await deleteCategory(categoryId);
      
      // Check if the deletion was successful
      if (response && (response.success || response.message)) {
        showToast("Category deleted successfully", "success");
        await fetchData();
      } else {
        throw new Error("Deletion failed - no success response");
      }
    } catch (error: any) {
      console.error("Error deleting category:", error);
      
      // Check if the error is because the category was already deleted
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to delete category";
      
      if (errorMessage.includes("not found") || errorMessage.includes("categoryid is not found")) {
        // If the category is not found, it might have been already deleted
        showToast("Category may have been already deleted", "warning");
        // Still refresh the data to update the UI
        await fetchData();
      } else {
        showToast(errorMessage, "error");
      }
    } finally {
      setDeleteLoading(null);
    }
  };

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
    return sortDirection === "asc" ? (
      <ArrowUp className="h-4 w-4" />
    ) : (
      <ArrowDown className="h-4 w-4" />
    );
  };
  
  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Category</h2>
        <div className="flex justify-center items-center h-32">
          <div className="text-gray-500">Loading Categories...</div>
        </div>
      </div>
    );
  }

  // Safe check for data existence
  const hasData =
    paginatedData && Array.isArray(paginatedData) && paginatedData.length > 0;
  const totalItems =
    Categories && Array.isArray(Categories) ? Categories.length : 0;

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Category</h2>
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
                onClick={() => handleSort("code")}
                className="h-auto p-0 font-semibold hover:bg-transparent"
              >
                Code
                {getSortIcon("code")}
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort("vehicleType")}
                className="h-auto p-0 font-semibold hover:bg-transparent"
              >
                Vehicle Type
                {getSortIcon("vehicleType")}
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
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {hasData ? (
            paginatedData.map((item) => (
              <TableRow key={item?._id || Math.random()}>
                <TableCell>{item?.category_name || "No Title"}</TableCell>
                <TableCell>{item?.category_code || "No Code"}</TableCell>
                <TableCell>
                  {getVehicleTypeName(item?.type || item?.vehicleType_id)}
                </TableCell>
                <TableCell>
                  {(() => {
                    const status = (item?.category_Status || "Draft").toLowerCase();
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
                        {item?.category_Status || "Draft"}
                      </span>
                    );
                  })()}
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditCategory(item)}
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
              <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                No categories found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination - moved outside of table */}
      {Categories.length > 0 && totalPages > 1 && (
        <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0 mt-8">
          {/* Left: Showing X-Y of Z categories */}
          <div className="text-sm text-gray-600 text-center sm:text-left">
            {`Showing ${(currentPage - 1) * itemPerPage + 1}-${Math.min(
              currentPage * itemPerPage,
              Categories.length
            )} of ${Categories.length} categories`}
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

                    // Prevent out-of-bounds pageNum
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

      {/* Update Modal */}
      <UpdateModal
        open={updateModalOpen}
        onClose={() => setUpdateModalOpen(false)}
        onUpdate={handleUpdateCategory}
        item={selectedCategory}
        type="category"
        vehicleTypes={vehicleTypes}
      />
    </div>
  );
}
