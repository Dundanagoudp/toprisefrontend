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
import { getModels, getBrand, deleteModel } from "@/service/product-Service";
import { updateModel } from "@/service/catalogue-service";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { ArrowUpDown, ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import UpdateModal from "../UpdateModal";
import { useToast as useGlobalToast } from "@/components/ui/toast";

export default function ShowModel({ searchQuery }: { searchQuery: string }) {
        const [model, setModel] = useState<any[]>([]);
        const [brands, setBrands] = useState<any[]>([]);
        const [currentPage, setCurrentPage] = useState(1);
        const [loading, setLoading] = useState(false);
        const [sortField, setSortField] = useState<string>("");
        const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
        const [updateModalOpen, setUpdateModalOpen] = useState(false);
        const [selectedModel, setSelectedModel] = useState<any>(null);
        const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
        const { showToast } = useGlobalToast();
        const itemPerPage = 10;

        // Filter and sort models
        const filteredModels = React.useMemo(() => {
          if (!model || !Array.isArray(model)) return [];
          
          let filtered = model;
          
          // Apply search filter
          if (searchQuery && searchQuery.trim()) {
            const q = searchQuery.trim().toLowerCase();
            filtered = model.filter((item) =>
              (item?.model_name?.toLowerCase().includes(q) ||
                item?.brand_ref?.brand_name?.toLowerCase().includes(q) ||
                item?.model_Status?.toLowerCase().includes(q))
            );
          }
          
          // Apply sorting
          if (sortField) {
            filtered = [...filtered].sort((a, b) => {
              let aValue = "";
              let bValue = "";
              
              switch (sortField) {
                case "name":
                  aValue = a?.model_name || "";
                  bValue = b?.model_name || "";
                  break;
                case "brand":
                  aValue = a?.brand_ref?.brand_name || "";
                  bValue = b?.brand_ref?.brand_name || "";
                  break;
                case "status":
                  aValue = a?.model_Status || "";
                  bValue = b?.model_Status || "";
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
        }, [model, searchQuery, sortField, sortDirection]);

        // Safe pagination calculations
        const totalPages = Math.ceil((filteredModels?.length || 0) / itemPerPage);
        const paginatedData = React.useMemo(() => {
          if (!filteredModels || !Array.isArray(filteredModels)) return [];
          return filteredModels.slice(
            (currentPage - 1) * itemPerPage,
            currentPage * itemPerPage
          );
        }, [filteredModels, currentPage, itemPerPage]);

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
            const [modelsResponse, brandsResponse] = await Promise.all([
              getModels(),
              getBrand()
            ]);
            
            if (!modelsResponse || !modelsResponse.data) {
              console.error("No models data found in response");
              setModel([]);
            } else {
              const Items = modelsResponse.data;
              setModel(Array.isArray(Items) ? Items : []);
            }

            if (!brandsResponse || !brandsResponse.data) {
              console.error("No brands data found in response");
              setBrands([]);
            } else {
              const Brands = brandsResponse.data;
              setBrands(Array.isArray(Brands) ? Brands : []);
            }
          } catch (err: any) {
            console.error("Error fetching data:", err);
            setModel([]);
            setBrands([]);
          } finally {
            setLoading(false);
          }
        };

        const handleEditModel = (model: any) => {
            setSelectedModel(model);
            setUpdateModalOpen(true);
        };

        const handleUpdateModel = async (formData: FormData) => {
            if (!selectedModel) return;
            await updateModel(selectedModel._id, formData);
            // Refresh models after update
            await fetchData();
        };

        const handleDelete = async (modelId: string) => {
            if (!confirm("Are you sure you want to delete this model?")) return;

            try {
                setDeleteLoading(modelId);
                const response = await deleteModel(modelId);
                
                // Check if the deletion was successful
                if (response && (response.success || response.message)) {
                    showToast("Model deleted successfully", "success");
                    await fetchData();
                } else {
                    throw new Error("Deletion failed - no success response");
                }
            } catch (error: any) {
                console.error("Error deleting model:", error);
                
                // Check if the error is because the model was already deleted
                const errorMessage = error?.response?.data?.message || error?.message || "Failed to delete model";
                
                if (errorMessage.includes("not found") || errorMessage.includes("modelid is not found")) {
                    // If the model is not found, it might have been already deleted
                    showToast("Model may have been already deleted", "warning");
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
              <h2 className="text-xl font-semibold mb-4">Model</h2>
              <div className="flex justify-center items-center h-32">
                <div className="text-gray-500">Loading Models...</div>
              </div>
            </div>
          );
        }

        // Safe check for data existence
        const hasData = paginatedData && Array.isArray(paginatedData) && paginatedData.length > 0;
        const totalItems = model && Array.isArray(model) ? model.length : 0;

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Models</h2>
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
                onClick={() => handleSort("brand")}
                className="h-auto p-0 font-semibold hover:bg-transparent"
              >
                Brand
                {getSortIcon("brand")}
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
                <TableCell>{item?.model_name || "No Title"}</TableCell>
                <TableCell>
                  {item?.brand_ref?.brand_name || "No Brand"}
                </TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      item?.model_Status === "Created"
                        ? "bg-green-100 text-green-800"
                        : "bg-orange-100 text-orange-800"
                    }`}
                  >
                    {item?.model_Status || "Draft"}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditModel(item)}
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
                No models found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination - with safe checks */}
      {totalItems > 0 && totalPages > 1 && (
        <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0 mt-8">
          {/* Left: Showing X-Y of Z models */}
          <div className="text-sm text-gray-600 text-center sm:text-left">
            {`Showing ${(currentPage - 1) * itemPerPage + 1}-${Math.min(
              currentPage * itemPerPage,
              totalItems
            )} of ${totalItems} models`}
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
        onUpdate={handleUpdateModel}
        item={selectedModel}
        type="model"
        brands={brands}
      />
    </div>
  );
}
