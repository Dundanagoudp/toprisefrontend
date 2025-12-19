"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  Edit,
  Eye,
  MoreHorizontal,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import DynamicPagination from "@/components/common/pagination/DynamicPagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import SearchFiltersModal from "./modules/modalpopus/searchfilters";
import SearchInput from "@/components/common/search/SearchInput";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getReturnRequests, getReturnStats } from "@/service/return-service";
import { ReturnRequest, ReturnRequestsResponse, ReturnStatsResponse } from "@/types/return-Types";
import ValidateReturnRequest from "./modules/modalpopus/Validate";
import { getAllDealers } from "@/service/dealerServices";
import RejectReturnDialog from "./modules/modalpopus/RejectReturnDialog";
import ReturnStatsCards from "./ReturnStatsCards";

export default function AdminReturnClaims() {
  const router = useRouter();
  const [returnRequests, setReturnRequests] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;
  const [selectedClaims, setSelectedClaims] = useState<string[]>([]);

  // Stats state
  const [stats, setStats] = useState<ReturnStatsResponse | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Advanced filter states from modal
  const [advancedFilterStatus, setAdvancedFilterStatus] = useState<string | null>(null);
  const [advancedFilterClaimType, setAdvancedFilterClaimType] = useState<string | null>(null);

  // Dealer filter states
  const [selectedDealerId, setSelectedDealerId] = useState<string>("all");
  const [dealers, setDealers] = useState<Array<{ _id: string; legal_name: string }>>([]);
  const [loadingDealers, setLoadingDealers] = useState(false);

  // Validation dialog state
  const [validationDialog, setValidationDialog] = useState<{
    open: boolean;
    returnId: string | null;
  }>({
    open: false,
    returnId: null,
  });

  // Reject dialog state
  const [rejectDialog, setRejectDialog] = useState<{
    open: boolean;
    returnId: string | null;
  }>({
    open: false,
    returnId: null,
  });

  // Fetch return requests from API
  const fetchReturnRequests = async () => {
    try {
      setLoading(true);
      const params: { refundMethod?: string; status?: string; dealerId?: string; page?: number; limit?: number } = {};

      if (advancedFilterClaimType) {
        params.refundMethod = advancedFilterClaimType;
      }

      if (advancedFilterStatus) {
        params.status = advancedFilterStatus;
      }

      if (selectedDealerId && selectedDealerId !== "all") {
        params.dealerId = selectedDealerId;
      }

      params.page = currentPage;
      params.limit = itemsPerPage;

      const response: ReturnRequestsResponse = await getReturnRequests(params);

      if (response.success && response.data) {
        setReturnRequests(response.data.returnRequests);

        setTotalPages(response.data.pagination.pages);
        setTotalItems(response.data.pagination.total);
      }
    } catch (error) {
      console.error("Failed to fetch return requests:", error);
      setReturnRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturnRequests();
  }, [advancedFilterStatus, advancedFilterClaimType, selectedDealerId, currentPage]);

  // Fetch return stats on mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoadingStats(true);
        const response = await getReturnStats();
        if (response.success) {
          setStats(response);
        }
      } catch (error) {
        console.error("Failed to fetch return stats:", error);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  // Fetch dealers on mount
  useEffect(() => {
    const fetchDealers = async () => {
      try {
        setLoadingDealers(true);
        const response = await getAllDealers();
        if (response.success && response.data) {
          setDealers(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch dealers:", error);
      } finally {
        setLoadingDealers(false);
      }
    };
    fetchDealers();
  }, []);

  // Handle validation dialog open
  const handleOpenValidation = (returnId: string) => {
    setValidationDialog({
      open: true,
      returnId,
    });
  };

  // Handle reject dialog open
  const handleOpenRejectReturn = (returnId: string) => {
    setRejectDialog({
      open: true,
      returnId,
    });
  };

  // Handle details dialog open
  const handleOpenDetails = (returnId: string) => {
    router.push(`/user/dashboard/returnclaims/${returnId}`);
  };

  // Handle validation dialog close
  const handleCloseValidation = () => {
    setValidationDialog({
      open: false,
      returnId: null,
    });
  };

  // Handle reject dialog close
  const handleCloseRejectReturn = () => {
    setRejectDialog({
      open: false,
      returnId: null,
    });
  };

  // Handle validation completion
  const handleValidationComplete = (success: boolean) => {
    if (success) {
      // Refresh the return requests to get updated status
      fetchReturnRequests();
    }
  };

  // Handle reject completion
  const handleRejectComplete = (success: boolean) => {
    if (success) {
      // Refresh the return requests to get updated status
      fetchReturnRequests();
    }
  };


  const filteredReturnRequests = useMemo(() => {
    return returnRequests.filter((request) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        request._id.toLowerCase().includes(searchLower) ||
        request.sku.toLowerCase().includes(searchLower) ||
        (request.orderId?.orderId || "")
          .toLowerCase()
          .includes(searchLower) ||
        (request.orderId?.customerDetails?.name || "")
          .toLowerCase()
          .includes(searchLower) ||
        request.returnReason.toLowerCase().includes(searchLower)
      );
    });
  }, [returnRequests, searchTerm]);

  // Handle advanced filter apply
  const handleApplyAdvancedFilters = (status: string, claimType: string) => {
    setAdvancedFilterStatus(status);
    setAdvancedFilterClaimType(claimType);
    setCurrentPage(1);
  };

  // Handle advanced filter reset
  const handleResetAdvancedFilters = () => {
    setAdvancedFilterStatus(null);
    setAdvancedFilterClaimType(null);
    setCurrentPage(1);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Reset selection when page or filters change
  useEffect(() => {
    setSelectedClaims([]);
  }, [currentPage, searchTerm]);

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-medium border font-[Poppins]";

    switch (status) {
      case "Requested":
        return `${baseClasses} text-yellow-600 bg-yellow-50 border-yellow-200`;
      case "Validated":
        return `${baseClasses} text-blue-600 bg-blue-50 border-blue-200`;
      case "Rejected":
        return `${baseClasses} text-red-600 bg-red-50 border-red-200`;
      case "Shipment_Intiated":
        return `${baseClasses} text-indigo-600 bg-indigo-50 border-indigo-200`;
      case "Shipment_Completed":
        return `${baseClasses} text-purple-600 bg-purple-50 border-purple-200`;
      case "Inspection_Started":
        return `${baseClasses} text-orange-600 bg-orange-50 border-orange-200`;
      case "Inspection_Completed":
        return `${baseClasses} text-teal-600 bg-teal-50 border-teal-200`;
      case "Intiated_Refund":
        return `${baseClasses} text-cyan-600 bg-cyan-50 border-cyan-200`;
      case "Refund_Completed":
        return `${baseClasses} text-green-600 bg-green-50 border-green-200`;
      case "Refund_Failed":
        return `${baseClasses} text-red-700 bg-red-100 border-red-300`;
      default:
        return `${baseClasses} text-gray-600 bg-gray-50 border-gray-200`;
    }
  };

  // Helper function to format status display name
  const formatStatusName = (status: string) => {
    let formatted = status.replace(/_/g, " ");
    // Fix typo: "Intiated Refund" -> "Initiated Refund"
    if (formatted === "Intiated Refund") {
      formatted = "Initiated Refund";
    }
    return formatted;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getRowId = (request: ReturnRequest, index: number) =>
    `${request._id}-${index}`;

  const allSelected =
    filteredReturnRequests.length > 0 &&
    filteredReturnRequests.every((r, idx) =>
      selectedClaims.includes(getRowId(r, idx))
    );

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedClaims([]);
    } else {
      const ids = filteredReturnRequests.map((r, idx) => getRowId(r, idx));
      setSelectedClaims(ids);
    }
  };

  const handleSelectOne = (request: ReturnRequest, index: number) => {
    const id = getRowId(request, index);
    setSelectedClaims((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="w-full min-w-0 overflow-x-hidden">
      <Card className="shadow-sm rounded-none min-w-0">
        {/* Header: Search and Filters */}
        <CardHeader className="space-y-4 sm:space-y-6">
          {/* Return Statistics Cards */}
          <ReturnStatsCards stats={stats} className="mb-6" />

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 flex-1">
              <div className="relative flex-1 w-full sm:max-w-md">
                <SearchInput
                  value={searchTerm}
                  onChange={setSearchTerm}
                  onClear={() => setSearchTerm("")}
                  placeholder="Search returns..."
                />
              </div>
              <Select value={selectedDealerId} onValueChange={setSelectedDealerId}>
                <SelectTrigger className="w-full sm:w-48 h-10 bg-white border-gray-200">
                  <SelectValue placeholder="All Dealers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dealers</SelectItem>
                  {loadingDealers ? (
                    <SelectItem value="loading" disabled>Loading...</SelectItem>
                  ) : (
                    dealers.map((dealer) => (
                      <SelectItem key={dealer._id} value={dealer._id}>
                        {dealer.legal_name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <SearchFiltersModal
                trigger={
                  <Button
                    variant="outline"
                    className="h-10 px-4 bg-white border-gray-200 w-full sm:w-auto"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                    {(advancedFilterStatus || advancedFilterClaimType) && (
                      <span className="ml-2 px-2 py-0.5 bg-red-600 text-white text-xs rounded-full">
                        {[advancedFilterStatus, advancedFilterClaimType].filter(Boolean).length}
                      </span>
                    )}
                  </Button>
                }
                currentStatus={advancedFilterStatus || ""}
                currentClaimType={advancedFilterClaimType || ""}
                onApplyFilters={handleApplyAdvancedFilters}
                onResetFilters={handleResetAdvancedFilters}
              />
            </div>
            <div className="flex w-full sm:w-auto justify-end gap-3">
              {selectedClaims.length > 0 &&
                selectedClaims.some((id) => {
                  const returnId = id.split("-")[0];
                  const request = returnRequests.find(
                    (r) => r._id === returnId
                  );
                  return request?.returnStatus === "Requested";
                }) && (
                  <Button
                    onClick={() => {
                      // For now, validate the first selected claim
                      // In the future, you could implement bulk validation
                      const firstSelectedId = selectedClaims[0].split("-")[0];
                      handleOpenValidation(firstSelectedId);
                    }}
                    className="flex items-center gap-2 border-blue-400 text-blue-600 bg-blue-50 hover:bg-blue-100 hover:border-blue-500 px-6 py-2 rounded-lg font-medium text-base h-10 shadow-none focus:ring-2 focus:ring-blue-100"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Validate Selected ({selectedClaims.length})
                  </Button>
                )}
            </div>
          </div>
        </CardHeader>

        {/* Table */}
        <CardContent className="p-0 min-w-0 overflow-x-auto">
          <div className="hidden sm:block overflow-x-auto">
            <Table className="min-w-full table-fixed">
              <TableHeader>
                <TableRow className="border-b border-[#E5E5E5] bg-gray-50/50">
                  <TableHead className="px-4 py-4 w-8 font-[Red Hat Display]">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all"
                    />
                  </TableHead>
                  <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display] w-[120px]">
                    Return ID
                  </TableHead>
                  <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display] w-[140px] cursor-pointer select-none">
                    Order ID
                  </TableHead>
                  <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display] w-[140px] whitespace-nowrap">
                    SKU
                  </TableHead>
                  <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display] w-[200px] whitespace-nowrap">
                    Customer
                  </TableHead>
                  <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display] w-[140px] whitespace-nowrap overflow-hidden text-ellipsis">
                    Request Date
                  </TableHead>
                  <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display] w-[90px] whitespace-nowrap">
                    Quantity
                  </TableHead>
                  <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display] w-[220px] whitespace-nowrap overflow-hidden text-ellipsis">
                    Return Reason
                  </TableHead>
                  <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display] w-[170px] whitespace-nowrap">
                    Status
                  </TableHead>
                  <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-right pr-8 font-[Red Hat Display] w-[120px] whitespace-nowrap">
                    Refund Amount
                  </TableHead>
                  <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-center font-[Red Hat Display] w-[80px] whitespace-nowrap">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading
                  ? Array.from({ length: 5 }).map((_, index) => (
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
                          <Skeleton className="h-4 w-[100px]" />
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Skeleton className="h-4 w-[100px]" />
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Skeleton className="h-4 w-[160px]" />
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Skeleton className="h-4 w-[140px]" />
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Skeleton className="h-4 w-[120px]" />
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Skeleton className="h-4 w-[140px]" />
                        </TableCell>
                        <TableCell className="px-6 py-4 text-center">
                          <Skeleton className="h-8 w-8 rounded-full mx-auto" />
                        </TableCell>
                      </TableRow>
                    ))
                  : filteredReturnRequests.map((request, index) => {
                      const rowId = getRowId(request, index);
                      const zebra =
                        index % 2 === 0 ? "bg-white" : "bg-gray-50/30";
                      return (
                        <TableRow
                          key={`${rowId}`}
                          className={`border-b border-gray-100 hover:bg-gray-50/50 transition-colors ${zebra} cursor-pointer`}
                          onClick={() => handleOpenDetails(request._id)}
                        >
                          <TableCell className="px-4 py-4 w-8 font-[Poppins]" onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              checked={selectedClaims.includes(rowId)}
                              onCheckedChange={() =>
                                handleSelectOne(request, index)
                              }
                              aria-label="Select row"
                            />
                          </TableCell>
                          <TableCell className="px-6 py-4 font-[Poppins] whitespace-nowrap">
                            <span className="text-gray-900 b2 font-mono text-sm">
                              {request._id.slice(-8)}
                            </span>
                          </TableCell>
                          <TableCell
                            className="px-6 py-4 font-[Poppins] whitespace-nowrap max-w-[160px] truncate"
                            title={request.orderId?.orderId || "N/A"}
                          >
                            <span className="text-gray-700 b2">
                              {request.orderId?.orderId
                                ? request.orderId.orderId.length > 8
                                  ? request.orderId.orderId.slice(0, 8) + "..."
                                  : request.orderId.orderId
                                : "N/A"}
                            </span>
                          </TableCell>
                          <TableCell
                            className="px-6 py-4 font-[Poppins] whitespace-nowrap max-w-[140px] truncate"
                            title={request.sku}
                          >
                            <span className="text-gray-900 b2 font-mono">
                              {request.sku}
                            </span>
                          </TableCell>
                          <TableCell className="px-6 py-4 font-[Poppins] max-w-[200px]">
                            <div className="flex flex-col truncate">
                              <span className="text-gray-900 b2">
                                {request.orderId?.customerDetails?.name ||
                                  "N/A"}
                              </span>
                              <span className="text-gray-500 text-xs">
                                {request.orderId?.customerDetails?.email || ""}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="px-6 py-4 font-[Poppins] whitespace-nowrap font-semibold text-[#000000]">
                            <span className="text-gray-700 b2">
                              {request.createdAt ? formatDate(request.createdAt) : 'N/A'}
                            </span>
                          </TableCell>
                          <TableCell className="px-6 py-4 font-[Poppins] whitespace-nowrap font-semibold text-[#000000]">
                            <span className="text-gray-900 b2">
                              {request.quantity}
                            </span>
                          </TableCell>
                          <TableCell className="px-6 py-4 font-[Poppins]">
                            <div className="max-w-[220px] pr-4">
                              <span
                                className="text-gray-700 b2 truncate block"
                                title={request.returnReason}
                              >
                                {request.returnReason}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="px-6 py-4 font-[Poppins]">
                            <span
                              className={getStatusBadge(request.returnStatus)}
                            >
                              {formatStatusName(request.returnStatus)}
                            </span>
                          </TableCell>
                          <TableCell className="px-6 py-4 font-[Poppins] whitespace-nowrap text-right">
                            <span className="text-gray-900 b2 font-semibold">
                              ₹{request.refund?.refundAmount?.toLocaleString() || '0'}
                            </span>
                          </TableCell>
                          <TableCell className="px-6 py-4 text-center font-[Poppins]" onClick={(e) => e.stopPropagation()}>
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
                                {/* Always show details */}
                                <DropdownMenuItem
                                  className="cursor-pointer"
                                  onClick={() => handleOpenDetails(request._id)}
                                >
                                  <Eye className="h-4 w-4 mr-2" /> View Details
                                </DropdownMenuItem>

                                {/* Admin Actions: Validate and Reject → only when Requested */}
                                {request.returnStatus === "Requested" && (
                                  <>
                                    <DropdownMenuItem
                                      className="cursor-pointer"
                                      onClick={() =>
                                        handleOpenValidation(request._id)
                                      }
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2" />{" "}
                                      Validate
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="cursor-pointer text-red-600 hover:text-red-700"
                                      onClick={() =>
                                        handleOpenRejectReturn(request._id)
                                      }
                                    >
                                      <XCircle className="h-4 w-4 mr-2" />{" "}
                                      Reject Return
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
              </TableBody>
            </Table>
          </div>
        </CardContent>

        {/* Pagination */}
        {totalItems > 0 && totalPages > 1 && (
          <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0 mt-8">
            <div className="text-sm text-gray-600 text-center sm:text-left">
              {`Showing ${(currentPage - 1) * itemsPerPage + 1}-${Math.min(
                currentPage * itemsPerPage,
                totalItems
              )} of ${totalItems} return requests`}
            </div>
            <div className="flex justify-center sm:justify-end">
              <DynamicPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                showItemsInfo={false}
              />
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredReturnRequests.length === 0 && !loading && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center mt-6">
            <p className="text-gray-500 text-lg mb-2">
              No return requests found
            </p>
            <p className="text-gray-400 text-sm">
              Try adjusting your search terms or filters
            </p>
          </div>
        )}
        <ValidateReturnRequest
          open={validationDialog.open}
          onClose={handleCloseValidation}
          onValidationComplete={handleValidationComplete}
          returnId={validationDialog.returnId}
        />

        <RejectReturnDialog
          open={rejectDialog.open}
          onClose={handleCloseRejectReturn}
          onRejectComplete={handleRejectComplete}
          returnId={rejectDialog.returnId}
        />
      </Card>
    </div>
  );
}
