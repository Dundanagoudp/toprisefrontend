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
import { getCategories, getBrand, getTypes, deleteBrand } from "@/service/product-Service";
import { updateBrand } from "@/service/catalogue-service";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { ArrowUpDown, ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import UpdateModal from "../UpdateModal";
import { useToast as useGlobalToast } from "@/components/ui/toast";

export default function ShowBrand({ searchQuery }: { searchQuery: string }) {
    const [brands, setBrands] = useState<any[]>([]);
    const [vehicleTypes, setVehicleTypes] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [sortField, setSortField] = useState<string>("");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
    const [updateModalOpen, setUpdateModalOpen] = useState(false);
    const [selectedBrand, setSelectedBrand] = useState<any>(null);
    const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
    const { showToast } = useGlobalToast();
    const itemPerPage = 10;

    // Filter and sort brands
    const filteredBrands = React.useMemo(() => {
        if (!brands || !Array.isArray(brands)) return [];
        
        let filtered = brands;
        
        // Apply search filter
        if (searchQuery && searchQuery.trim()) {
            const q = searchQuery.trim().toLowerCase();
            filtered = brands.filter((item) =>
                (item?.brand_name?.toLowerCase().includes(q) ||
                    item?.status?.toLowerCase().includes(q) ||
                    item?.type?.type_name?.toLowerCase().includes(q))
            );
        }
        
        // Apply sorting
        if (sortField) {
            filtered = [...filtered].sort((a, b) => {
                let aValue = "";
                let bValue = "";
                
                switch (sortField) {
                    case "name":
                        aValue = a?.brand_name || "";
                        bValue = b?.brand_name || "";
                        break;
                    case "status":
                        aValue = (a?.status || "").toLowerCase();
                        bValue = (b?.status || "").toLowerCase();
                        break;
                    case "type":
                        aValue = a?.type?.type_name || "";
                        bValue = b?.type?.type_name || "";
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
    }, [brands, searchQuery, sortField, sortDirection]);

    // Safe pagination calculations
    const totalPages = Math.ceil((filteredBrands?.length || 0) / itemPerPage);
    const paginatedData = React.useMemo(() => {
        if (!filteredBrands || !Array.isArray(filteredBrands)) return [];
        return filteredBrands.slice(
            (currentPage - 1) * itemPerPage,
            currentPage * itemPerPage
        );
    }, [filteredBrands, currentPage, itemPerPage]);

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
            const [brandsResponse, typesResponse] = await Promise.all([
                getBrand(),
                getTypes()
            ]);
            
            if (!brandsResponse || !brandsResponse.data) {
                console.error("No data found in response");
                setBrands([]);
            } else {
                setBrands(Array.isArray(brandsResponse.data) ? brandsResponse.data : []);
            }
            
            if (typesResponse && typesResponse.data) {
                setVehicleTypes(Array.isArray(typesResponse.data) ? typesResponse.data : []);
            }
        } catch (err: any) {
            console.error("Error fetching data:", err);
            setBrands([]);
        } finally {
            setLoading(false);
        }
    };

    const handleEditBrand = (brand: any) => {
        setSelectedBrand(brand);
        setUpdateModalOpen(true);
    };

    const handleUpdateBrand = async (formData: FormData) => {
        if (!selectedBrand) return;
        
        try {
            const response = await updateBrand(selectedBrand._id, formData);
            
            // Refresh brands after successful update
            await fetchData();
            
            // Close modal after successful update
            setUpdateModalOpen(false);
            setSelectedBrand(null);
        } catch (error: any) {
            console.error("Error updating brand:", error);
            // Re-throw error so UpdateModal can handle it
            throw error;
        }
    };

    const handleDelete = async (brandId: string) => {
        if (!confirm("Are you sure you want to delete this brand?")) return;

        try {
            setDeleteLoading(brandId);
            const response = await deleteBrand(brandId);
            
            // Check if the deletion was successful
            if (response && (response.success || response.message)) {
                showToast("Brand deleted successfully", "success");
                // Refresh the data after successful deletion
                await fetchData();
            } else {
                throw new Error("Deletion failed - no success response");
            }
        } catch (error: any) {
            console.error("Error deleting brand:", error);
            
            // Check if the error is because the brand was already deleted
            const errorMessage = error?.response?.data?.message || error?.message || "Failed to delete brand";
            
            if (errorMessage.includes("not found") || errorMessage.includes("brandid is not found")) {
                // If the brand is not found, it might have been already deleted
                showToast("Brand may have been already deleted", "warning");
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
                <h2 className="text-xl font-semibold mb-4">Brands</h2>
                <div className="flex justify-center items-center h-32">
                    <div className="text-gray-500">Loading Brands...</div>
                </div>
            </div>
        );
    }

    // Safe check for data existence
    const hasData = paginatedData && Array.isArray(paginatedData) && paginatedData.length > 0;
    const totalItems = brands && Array.isArray(brands) ? brands.length : 0;

    return (
        <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Brands</h2>
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
                                onClick={() => handleSort("type")}
                                className="h-auto p-0 font-semibold hover:bg-transparent"
                            >
                                Type
                                {getSortIcon("type")}
                            </Button>
                        </TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {hasData ? (
                        paginatedData.map((item) => (
                            <TableRow key={item?._id || Math.random()}>
                                <TableCell>{item?.brand_name || "No Name"}</TableCell>
                                <TableCell>
                                    {(() => {
                                        const status = (item?.status || "").toLowerCase();
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
                                                {item?.status || "No Status"}
                                            </span>
                                        );
                                    })()}
                                </TableCell>
                                <TableCell>{item?.type?.type_name || "No Type"}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => handleEditBrand(item)}
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
                                No brands found
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            {/* Pagination - with safe checks */}
            {totalItems > 0 && totalPages > 1 && (
                <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0 mt-8">
                    {/* Left: Showing X-Y of Z brands */}
                    <div className="text-sm text-gray-600 text-center sm:text-left">
                        {`Showing ${(currentPage - 1) * itemPerPage + 1}-${Math.min(
                            currentPage * itemPerPage,
                            totalItems
                        )} of ${totalItems} brands`}
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
                onUpdate={handleUpdateBrand}
                item={selectedBrand}
                type="brand"
                vehicleTypes={vehicleTypes}
            />
        </div>
    );
}
