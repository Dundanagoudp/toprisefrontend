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
import { deletePopularVehicles, getAllPopularVehicles } from "@/service/product-Service";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { ArrowUpDown, ArrowUp, ArrowDown, Trash2, Edit } from "lucide-react";
import PopularVehicleUpdateModal from "../PopularVehicleUpdateModal";
import { useToast as useGlobalToast } from "@/components/ui/toast";
import Image from "next/image";

export default function ShowPopularVehicle({ searchQuery }: { searchQuery: string }) {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [sortField, setSortField] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const { showToast } = useGlobalToast();
  const itemPerPage = 10;

  // Filter and sort vehicles
  const filteredVehicles = React.useMemo(() => {
    if (!vehicles || !Array.isArray(vehicles)) return [];

    let filtered = vehicles;

    // Apply search filter
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      filtered = vehicles.filter((item) =>
        (item?.vehicle_name?.toLowerCase().includes(q)) ||
        (item?.brand_id?.brand_name?.toLowerCase().includes(q)) ||
        (item?.model_id?.model_name?.toLowerCase().includes(q)) ||
        (item?.variant_id?.variant_name?.toLowerCase().includes(q)) ||
        (item?.vehicle_type?.type_name?.toLowerCase().includes(q))
      );
    }

    // Apply sorting
    if (sortField) {
      filtered = [...filtered].sort((a, b) => {
        let aValue = "";
        let bValue = "";

        switch (sortField) {
          case "name":
            aValue = a?.vehicle_name?.toString() || "";
            bValue = b?.vehicle_name?.toString() || "";
            break;
          case "brand":
            aValue = a?.brand_id?.brand_name?.toString() || "";
            bValue = b?.brand_id?.brand_name?.toString() || "";
            break;
          case "model":
            aValue = a?.model_id?.model_name?.toString() || "";
            bValue = b?.model_id?.model_name?.toString() || "";
            break;
          case "variant":
            aValue = a?.variant_id?.variant_name?.toString() || "";
            bValue = b?.variant_id?.variant_name?.toString() || "";
            break;
          case "type":
            aValue = a?.vehicle_type?.type_name?.toString() || "";
            bValue = b?.vehicle_type?.type_name?.toString() || "";
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
  }, [vehicles, searchQuery, sortField, sortDirection]);

  // Safe pagination calculations
  const totalPages = Math.ceil((filteredVehicles?.length || 0) / itemPerPage);
  const paginatedData = React.useMemo(() => {
    if (!filteredVehicles || !Array.isArray(filteredVehicles)) return [];
    return filteredVehicles.slice(
      (currentPage - 1) * itemPerPage,
      currentPage * itemPerPage
    );
  }, [filteredVehicles, currentPage, itemPerPage]);

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
      const vehiclesResponse = await getAllPopularVehicles();

      if (!vehiclesResponse || !vehiclesResponse.data) {
        console.error("No vehicles data found in response");
        setVehicles([]);
        showToast("No vehicles data available", "warning");
      } else {
        const vehicleItems = vehiclesResponse.data;
        setVehicles(Array.isArray(vehicleItems) ? vehicleItems : []);
      }
    } catch (err: any) {
      console.error("Error fetching data:", err);
      setVehicles([]);
      const errorMessage = err?.response?.data?.message || err?.message || "Failed to fetch vehicles data";
      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEditVehicle = (vehicle: any) => {
    setSelectedVehicle(vehicle);
    setUpdateModalOpen(true);
  };

  const handleUpdateVehicle = async (formData: any) => {
    setUpdateLoading(true);
    try {
      // The update logic is handled in the modal component
      setUpdateModalOpen(false);
      setSelectedVehicle(null);
      // Refresh data after successful update
      await fetchData();
    } catch (error: any) {
      console.error("Error updating vehicle:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to update vehicle";
      showToast(errorMessage, "error");
    } finally {
      setUpdateLoading(false);
    }
  };

  const closeModal = () => {
    setUpdateModalOpen(false);
    setSelectedVehicle(null);
  };

  const handleDelete = async (vehicleId: string) => {
    if (!confirm("Are you sure you want to delete this popular vehicle?")) return;

    try {
      setDeleteLoading(vehicleId);
      const response = await deletePopularVehicles(vehicleId);

      // Check if the deletion was successful
      if (response && (response.success || response.message)) {
        showToast("Popular vehicle deleted successfully", "success");
        // Refresh data after successful deletion
        await fetchData();
      } else {
        throw new Error("Deletion failed - no success response");
      }
    } catch (error: any) {
      console.error("Error deleting vehicle:", error);

      // Check if the error is because the vehicle was already deleted
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to delete vehicle";

      if (errorMessage.includes("not found") || errorMessage.includes("does not exist")) {
        // If the vehicle is not found, it might have been already deleted
        showToast("Vehicle may have been already deleted", "warning");
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
        <h2 className="text-xl font-semibold mb-4">Popular Vehicles</h2>
        <div className="flex justify-center items-center h-32">
          <div className="text-gray-500">Loading Popular Vehicles...</div>
        </div>
      </div>
    );
  }

  // Safe check for data existence
  const hasData = paginatedData && Array.isArray(paginatedData) && paginatedData.length > 0;
  const totalItems = vehicles && Array.isArray(vehicles) ? vehicles.length : 0;

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Popular Vehicles</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Image</TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort("name")}
                className="h-auto p-0 font-semibold hover:bg-transparent"
              >
                Vehicle Name
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
                onClick={() => handleSort("model")}
                className="h-auto p-0 font-semibold hover:bg-transparent"
              >
                Model
                {getSortIcon("model")}
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort("variant")}
                className="h-auto p-0 font-semibold hover:bg-transparent"
              >
                Variant
                {getSortIcon("variant")}
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
                <TableCell>
                  {item?.vehicle_image ? (
                    <Image
                      src={item.vehicle_image}
                      alt={item.vehicle_name || "Vehicle"}
                      width={60}
                      height={45}
                      className="object-contain rounded"
                    />
                  ) : (
                    <div className="w-15 h-11 bg-gray-200 flex items-center justify-center rounded">
                      <span className="text-xs text-gray-500">No Image</span>
                    </div>
                  )}
                </TableCell>
                <TableCell>{item?.vehicle_name || "No Name"}</TableCell>
                <TableCell>{item?.brand_id?.brand_name || "N/A"}</TableCell>
                <TableCell>{item?.model_id?.model_name || "N/A"}</TableCell>
                <TableCell>{item?.variant_id?.variant_name || "N/A"}</TableCell>
                <TableCell>{item?.vehicle_type?.type_name || "N/A"}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditVehicle(item)}
                      disabled={deleteLoading === item._id}
                    >
                      <Edit className="h-4 w-4" />
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
              <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                No popular vehicles found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination - with safe checks */}
      {totalItems > 0 && totalPages > 1 && (
        <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0 mt-8">
          {/* Left: Showing X-Y of Z vehicles */}
          <div className="text-sm text-gray-600 text-center sm:text-left">
            {`Showing ${(currentPage - 1) * itemPerPage + 1}-${Math.min(
              currentPage * itemPerPage,
              totalItems
            )} of ${totalItems} vehicles`}
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
      <PopularVehicleUpdateModal
        open={updateModalOpen}
        onClose={closeModal}
        onSubmit={handleUpdateVehicle}
        vehicle={selectedVehicle}
      />
    </div>
  );
}
