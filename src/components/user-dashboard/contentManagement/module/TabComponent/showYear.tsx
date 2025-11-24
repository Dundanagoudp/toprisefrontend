'use client';
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
import { deleteYear, getAllYears, updateYear } from "@/service/product-Service";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { ArrowUpDown, ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import YearUpdateModal from "../YearUpdateModal";
import { useToast as useGlobalToast } from "@/components/ui/toast";

export default function ShowYear({ searchQuery }: { searchQuery: string }) {
  const [years, setYears] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [sortField, setSortField] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const { showToast } = useGlobalToast();
  const itemPerPage = 10;

  // Filter and sort years
  const filteredYears = React.useMemo(() => {
    if (!years || !Array.isArray(years)) return [];
    
    let filtered = years;
    
    // Apply search filter
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      filtered = years.filter((item) =>
        (item?.year_name?.toLowerCase().includes(q))
      );
    }
    
    // Apply sorting
    if (sortField) {
      filtered = [...filtered].sort((a, b) => {
        let aValue = "";
        let bValue = "";
        
        switch (sortField) {
          case "name":
            aValue = a?.year_name?.toString() || "";
            bValue = b?.year_name?.toString() || "";
            break;
          case "status":
            aValue = a?.year_status?.toString() || "";
            bValue = b?.year_status?.toString() || "";
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
  }, [years, searchQuery, sortField, sortDirection]);

  // Safe pagination calculations
  const totalPages = Math.ceil((filteredYears?.length || 0) / itemPerPage);
  const paginatedData = React.useMemo(() => {
    if (!filteredYears || !Array.isArray(filteredYears)) return [];
    return filteredYears.slice(
      (currentPage - 1) * itemPerPage,
      currentPage * itemPerPage
    );
  }, [filteredYears, currentPage, itemPerPage]);

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

  // Fetch data function
  const fetchData = async () => {
    setLoading(true);
    try {
      const yearsResponse = await getAllYears();
      
      if (!yearsResponse || !yearsResponse.data) {
        console.error("No years data found in response");
        setYears([]);
        showToast("No years data available", "warning");
      } else {
        const yearItems = yearsResponse.data;
        setYears(Array.isArray(yearItems) ? yearItems : []);
      }
    } catch (err: any) {
      console.error("Error fetching data:", err);
      setYears([]);
      const errorMessage = err?.response?.data?.message || err?.message || "Failed to fetch years data";
      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEditYear = (year: any) => {
    setSelectedYear(year);
    setUpdateModalOpen(true);
  };

  const handleUpdateYear = async (nextYearName: string) => {
    if (!selectedYear) return;
    
    setUpdateLoading(true);
    try {
      const response = await updateYear(selectedYear._id, { year_name: nextYearName });
      
      // Check if the update was successful
      if (response && (response.success || response.data)) {
        showToast("Year updated successfully", "success");
        setUpdateModalOpen(false);
        setSelectedYear(null);
        // Refresh data after successful update
        await fetchData();
      } else {
        throw new Error("Update failed - no success response");
      }
    } catch (error: any) {
      console.error("Error updating year:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to update year";
      showToast(errorMessage, "error");
    } finally {
      setUpdateLoading(false);
    }
  };

  const closeModal = () => {
    setUpdateModalOpen(false);
    setSelectedYear(null);
  };

  const handleDelete = async (yearId: string) => {
    if (!confirm("Are you sure you want to delete this year?")) return;

    try {
      setDeleteLoading(yearId);
      const response = await deleteYear(yearId);
      
      // Check if the deletion was successful
      if (response && (response.success || response.message)) {
        showToast("Year deleted successfully", "success");
        // Refresh data after successful deletion
        await fetchData();
      } else {
        throw new Error("Deletion failed - no success response");
      }
    } catch (error: any) {
      console.error("Error deleting year:", error);
      
      // Check if the error is because the year was already deleted
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to delete year";
      
      if (errorMessage.includes("not found") || errorMessage.includes("yearid is not found")) {
        // If the year is not found, it might have been already deleted
        showToast("Year may have been already deleted", "warning");
        // Still refresh the data to update the UI
        await fetchData();
      } else {
        showToast(errorMessage, "error");
      }
    } finally {
      setDeleteLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Years</h2>
        <div className="flex justify-center items-center h-32">
          <div className="text-gray-500">Loading Years...</div>
        </div>
      </div>
    );
  }

  // Safe check for data existence
  const hasData = paginatedData && Array.isArray(paginatedData) && paginatedData.length > 0;
  const totalItems = years && Array.isArray(years) ? years.length : 0;

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Years</h2>
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
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {hasData ? (
            paginatedData.map((item) => (
              <TableRow key={item?._id || Math.random()}>
                <TableCell>{item?.year_name || "No Title"}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditYear(item)}
                      disabled={deleteLoading === item._id}
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
              <TableCell colSpan={2} className="text-center py-8 text-gray-500">
                No years found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination - with safe checks */}
      {totalItems > 0 && totalPages > 1 && (
        <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0 mt-8">
          {/* Left: Showing X-Y of Z years */}
          <div className="text-sm text-gray-600 text-center sm:text-left">
            {`Showing ${(currentPage - 1) * itemPerPage + 1}-${Math.min(
              currentPage * itemPerPage,
              totalItems
            )} of ${totalItems} years`}
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
      <YearUpdateModal
        open={updateModalOpen}
        onClose={closeModal}
        onSubmit={handleUpdateYear}
        year={selectedYear}
 
      />
    </div>
  );
}