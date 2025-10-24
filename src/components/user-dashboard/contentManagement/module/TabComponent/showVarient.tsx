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
import { getvarient, getModels, getYearRange, deleteVariant } from "@/service/product-Service";
import { updateVariant } from "@/service/catalogue-service";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { ArrowUpDown, ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import UpdateModal from "../UpdateModal";
import { useToast as useGlobalToast } from "@/components/ui/toast";

export default function ShowVarient({ searchQuery }: { searchQuery: string }) {
    const [variants, setVariants] = useState<any[]>([]);
    const [models, setModels] = useState<any[]>([]);
    const [years, setYears] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [sortField, setSortField] = useState<string>("");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
    const [updateModalOpen, setUpdateModalOpen] = useState(false);
    const [selectedVariant, setSelectedVariant] = useState<any>(null);
    const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
    const { showToast } = useGlobalToast();
    const itemPerPage = 10;

    // Filter and sort variants
    const filteredVariants = React.useMemo(() => {
        if (!variants || !Array.isArray(variants)) return [];
        
        let filtered = variants;
        
        // Apply search filter
        if (searchQuery && searchQuery.trim()) {
            const q = searchQuery.trim().toLowerCase();
            filtered = variants.filter((item) =>
                (item?.variant_name?.toLowerCase().includes(q) ||
                    item?.model?.model_name?.toLowerCase().includes(q) ||
                    item?.variant_status?.toLowerCase().includes(q))
            );
        }
        
        // Apply sorting
        if (sortField) {
            filtered = [...filtered].sort((a, b) => {
                let aValue = "";
                let bValue = "";
                
                switch (sortField) {
                    case "name":
                        aValue = a?.variant_name || "";
                        bValue = b?.variant_name || "";
                        break;
                    case "model":
                        aValue = a?.model?.model_name || "";
                        bValue = b?.model?.model_name || "";
                        break;
                    case "status":
                        aValue = a?.variant_status || "";
                        bValue = b?.variant_status || "";
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
    }, [variants, searchQuery, sortField, sortDirection]);

    // Safe pagination calculations
    const totalPages = Math.ceil((filteredVariants?.length || 0) / itemPerPage);
    const paginatedData = React.useMemo(() => {
        if (!filteredVariants || !Array.isArray(filteredVariants)) return [];
        return filteredVariants.slice(
            (currentPage - 1) * itemPerPage,
            currentPage * itemPerPage
        );
    }, [filteredVariants, currentPage, itemPerPage]);

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
            const [variantsResponse, modelsResponse, yearsResponse] = await Promise.all([
                getvarient(),
                getModels(),
                getYearRange()
            ]);
            
            if (!variantsResponse || !variantsResponse.data) {
                console.error("No variants data found in response");
                setVariants([]);
            } else {
                setVariants(Array.isArray(variantsResponse.data) ? variantsResponse.data : []);
            }

            if (!modelsResponse || !modelsResponse.data) {
                console.error("No models data found in response");
                setModels([]);
            } else {
                setModels(Array.isArray(modelsResponse.data) ? modelsResponse.data : []);
            }

            if (!yearsResponse || !yearsResponse.data) {
                console.error("No years data found in response");
                setYears([]);
            } else {
                setYears(Array.isArray(yearsResponse.data) ? yearsResponse.data : []);
            }
        } catch (err: any) {
            console.error("Error fetching data:", err);
            setVariants([]);
            setModels([]);
            setYears([]);
        } finally {
            setLoading(false);
        }
    };

    const handleEditVariant = (variant: any) => {
        setSelectedVariant(variant);
        setUpdateModalOpen(true);
    };

    const handleUpdateVariant = async (formData: FormData) => {
        if (!selectedVariant) return;
        await updateVariant(selectedVariant._id, formData);
        // Refresh variants after update
        await fetchData();
    };

    const handleDelete = async (variantId: string) => {
        if (!confirm("Are you sure you want to delete this variant?")) return;

        try {
            setDeleteLoading(variantId);
            const response = await deleteVariant(variantId);
            
            // Check if the deletion was successful
            if (response && (response.success || response.message)) {
                showToast("Variant deleted successfully", "success");
                await fetchData();
            } else {
                throw new Error("Deletion failed - no success response");
            }
        } catch (error: any) {
            console.error("Error deleting variant:", error);
            
            // Check if the error is because the variant was already deleted
            const errorMessage = error?.response?.data?.message || error?.message || "Failed to delete variant";
            
            if (errorMessage.includes("not found") || errorMessage.includes("variantid is not found")) {
                // If the variant is not found, it might have been already deleted
                showToast("Variant may have been already deleted", "warning");
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
                <h2 className="text-xl font-semibold mb-4">Variants</h2>
                <div className="flex justify-center items-center h-32">
                    <div className="text-gray-500">Loading Variants...</div>
                </div>
            </div>
        );
    }

    // Safe check for data existence
    const hasData = paginatedData && Array.isArray(paginatedData) && paginatedData.length > 0;
    const totalItems = variants && Array.isArray(variants) ? variants.length : 0;

    return (
        <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Variants</h2>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>
                            <Button
                                variant="ghost"
                                onClick={() => handleSort("name")}
                                className="h-auto p-0 font-semibold hover:bg-transparent"
                            >
                                Variant Name
                                {getSortIcon("name")}
                            </Button>
                        </TableHead>
                        <TableHead>
                            <Button
                                variant="ghost"
                                onClick={() => handleSort("model")}
                                className="h-auto p-0 font-semibold hover:bg-transparent"
                            >
                                Model Name
                                {getSortIcon("model")}
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
                                <TableCell>{item?.variant_name || "No Name"}</TableCell>
                                <TableCell>{item?.model?.model_name || "No Model"}</TableCell>
                                <TableCell>
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                            item?.variant_status === "active"
                                                ? "bg-green-100 text-green-800"
                                                : item?.variant_status === "inactive"
                                                    ? "bg-orange-100 text-orange-800"
                                                    : "bg-gray-200 text-gray-700"
                                        }`}
                                    >
                                        {item?.variant_status || "No Status"}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => handleEditVariant(item)}
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
                                No variants found
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            {/* Pagination - with safe checks */}
            {totalItems > 0 && totalPages > 1 && (
                <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0 mt-8">
                    {/* Left: Showing X-Y of Z variants */}
                    <div className="text-sm text-gray-600 text-center sm:text-left">
                        {`Showing ${(currentPage - 1) * itemPerPage + 1}-${Math.min(
                            currentPage * itemPerPage,
                            totalItems
                        )} of ${totalItems} variants`}
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
                onUpdate={handleUpdateVariant}
                item={selectedVariant}
                type="variant"
                models={models}
                years={years}
            />
        </div>
    );
}
