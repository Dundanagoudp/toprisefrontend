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
import { getReturnRequests, initiateBorzoPickup, getReturnStats, getReturnRequestsForFulfillmentStaff } from "@/service/return-service";
import { ReturnRequest, ReturnRequestsResponse, ReturnStatsResponse } from "@/types/return-Types";
import { getAllDealers } from "@/service/dealerServices";
import SchedulePickupDialog from "./modules/modalpopus/SchedulePickupDialog";
import CompletePickupDialog from "./modules/modalpopus/CompletePickupDialog";
import InspectDialog from "./modules/modalpopus/inspectDialog";
import InitiateRefundForm from "./modules/modalpopus/InitiateReturn";
import ReturnStatsCards from "./ReturnStatsCards";
import { getEmployeeById } from "@/service/employeeServices";
import { useAppSelector } from "@/store/hooks";
import { getUserById } from "@/service/user/userService";
3        
import { fetchEmployeeByUserId } from "@/service/order-service";
export default function FulfillmentReturnClaims() {
  const router = useRouter();
  const auth = useAppSelector((state) => state.auth.user);
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

  // Fulfillment staff dealer IDs
  const [fulfillmentDealerIds, setFulfillmentDealerIds] = useState<string[]>([]);

  // Schedule pickup dialog state
  const [schedulePickupDialog, setSchedulePickupDialog] = useState<{
    open: boolean;
    returnId: string | null;
    returnRequest: ReturnRequest | null;
  }>({
    open: false,
    returnId: null,
    returnRequest: null,
  });

  // Complete pickup dialog state
  const [completePickupDialog, setCompletePickupDialog] = useState<{
    open: boolean;
    returnId: string | null;
    returnRequest: ReturnRequest | null;
  }>({
    open: false,
    returnId: null,
    returnRequest: null,
  });



  // get Fulfillment Staff Dealer Ids
  useEffect(() => {
    const fetchFulfillmentStaffDealerIds = async () => {
      try {
        const response = await getUserById(auth?._id);
        if (response.success && response.data) {
          console.log("Fulfillment Staff User:", response.data);
          // get employee id from user id
          const employeeId = await fetchEmployeeByUserId(response.data._id);
          console.log("Employee ID:", employeeId);
          // employee details by employee id
          const employeeDetails = await getEmployeeById(employeeId.employee._id);
          console.log("Employee Details:", employeeDetails);

          // Extract assigned dealer IDs
          if (employeeDetails.success && employeeDetails.data?.assigned_dealers) {
            const dealerIds = employeeDetails.data.assigned_dealers.map(dealer => dealer._id);
            console.log("Fulfillment Staff Dealer IDs:", dealerIds);
            setFulfillmentDealerIds(dealerIds);
          }
        }
      } catch (error) {
        console.error("Failed to fetch fulfillment staff dealer IDs:", error);
      }
    };
    fetchFulfillmentStaffDealerIds();
  }, []);

  // Inspect dialog state
  const [inspectDialog, setInspectDialog] = useState<{
    open: boolean;
    returnId: string | null;
    returnRequest: ReturnRequest | null;
  }>({
    open: false,
    returnId: null,
    returnRequest: null,
  });

  // Initiate refund dialog state
  const [initiateRefundDialog, setInitiateRefundDialog] = useState<{
    open: boolean;
    returnId: string | null;
  }>({
    open: false,
    returnId: null,
  });

  // Borzo confirmation dialog state
  const [borzoConfirmDialog, setBorzoConfirmDialog] = useState<{
    open: boolean;
    returnId: string | null;
    securePackageAmount: string;
  }>({ open: false, returnId: null, securePackageAmount: "" });
  const [borzoLoading, setBorzoLoading] = useState(false);

  // Fetch return requests from API
  const fetchReturnRequests = async () => {
    try {
      setLoading(true);

      // Determine which dealer IDs to use for the API call
      let dealerIdsToUse: string[] = [];
      if (selectedDealerId === "all") {
        dealerIdsToUse = fulfillmentDealerIds;
      } else {
        dealerIdsToUse = [selectedDealerId];
      }

      // Don't fetch if we don't have dealer IDs
      if (dealerIdsToUse.length === 0) {
        console.log("No dealer IDs available for fulfillment staff");
        setReturnRequests([]);
        setTotalPages(1);
        setTotalItems(0);
        return;
      }

      const params: { refundMethod?: string; status?: string; page?: number; limit?: number } = {};

      if (advancedFilterClaimType) {
        params.refundMethod = advancedFilterClaimType;
      }

      if (advancedFilterStatus) {
        params.status = advancedFilterStatus;
      }

      params.page = currentPage;
      params.limit = itemsPerPage;

      const response: ReturnRequestsResponse = await getReturnRequestsForFulfillmentStaff(dealerIdsToUse, params);

      if (response.success && response.data) {
        setReturnRequests(response.data.returnRequests);

        setTotalPages(response.data.pagination.totalPages);
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
  }, [advancedFilterStatus, advancedFilterClaimType, selectedDealerId, currentPage, fulfillmentDealerIds]);

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

  // Handle details dialog open
  const handleOpenDetails = (returnId: string) => {
    router.push(`/user/dashboard/returnclaims/${returnId}`);
  };

  // Handle schedule pickup dialog open
  const handleOpenSchedulePickup = (returnId: string) => {
    const returnRequest = returnRequests.find((req) => req._id === returnId);
    setSchedulePickupDialog({
      open: true,
      returnId,
      returnRequest: returnRequest || null,
    });
  };

  // Handle complete pickup dialog open
  const handleOpenCompletePickup = (returnId: string) => {
    const returnRequest = returnRequests.find((req) => req._id === returnId);
    setCompletePickupDialog({
      open: true,
      returnId,
      returnRequest: returnRequest || null,
    });
  };

  // Handle inspect dialog open
  const handleOpenInspect = (returnId: string) => {
    const returnRequest = returnRequests.find((req) => req._id === returnId);
    setInspectDialog({
      open: true,
      returnId,
      returnRequest: returnRequest || null,
    });
  };

  // Handle initiate refund dialog open
  const handleOpenInitiateRefund = (returnId: string) => {
    setInitiateRefundDialog({
      open: true,
      returnId,
    });
  };

  // Handle schedule pickup dialog close
  const handleCloseSchedulePickup = () => {
    setSchedulePickupDialog({
      open: false,
      returnId: null,
      returnRequest: null,
    });
  };

  // Handle complete pickup dialog close
  const handleCloseCompletePickup = () => {
    setCompletePickupDialog({
      open: false,
      returnId: null,
      returnRequest: null,
    });
  };

  // Handle inspect dialog close
  const handleCloseInspect = () => {
    setInspectDialog({
      open: false,
      returnId: null,
      returnRequest: null,
    });
  };

  // Handle initiate refund dialog close
  const handleCloseInitiateRefund = () => {
    setInitiateRefundDialog({
      open: false,
      returnId: null,
    });
  };

  // Handle schedule pickup completion
  const handleSchedulePickupComplete = (success: boolean) => {
    if (success) {
      // Refresh the return requests to get updated data
      fetchReturnRequests();
    }
  };

  // Handle complete pickup completion
  const handleCompletePickupComplete = (success: boolean) => {
    if (success) {
      // Refresh the return requests to get updated data
      fetchReturnRequests();
    }
  };

  // Handle inspect completion
  const handleInspectComplete = (success: boolean) => {
    if (success) {
      // Refresh the return requests to get updated status
      fetchReturnRequests();
    }
  };

  // Handle initiate refund completion
  const handleInitiateRefundComplete = (success: boolean) => {
    if (success) {
      // Refresh the return requests to get updated status
      fetchReturnRequests();
    }
  };

  // Handle Borzo confirmation dialog open
  const handleOpenBorzoConfirm = (returnId: string) => {
    setBorzoConfirmDialog({ open: true, returnId, securePackageAmount: "" });
  };

  // Handle Borzo confirmation
  const handleConfirmBorzo = async () => {
    if (!borzoConfirmDialog.returnId) return;

    setBorzoLoading(true);
    try {
      const response = await initiateBorzoPickup(borzoConfirmDialog.returnId, {
        securePackageAmount: parseFloat(borzoConfirmDialog.securePackageAmount) || 0
      });
      if (response.success) {
        await fetchReturnRequests();
        setBorzoConfirmDialog({ open: false, returnId: null, securePackageAmount: "" });
      }
    } catch (error) {
      console.error("Failed to initiate Borzo pickup:", error);
    } finally {
      setBorzoLoading(false);
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
              {/* <Select value={selectedDealerId} onValueChange={setSelectedDealerId}>
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
              </Select> */}
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
          </div>
        </CardHeader>

        {/* Table */}
        <CardContent className="p-0 min-w-0 overflow-x-auto">
          <div className="hidden sm:block overflow-x-auto">
            <Table className="min-w-full table-fixed">
              <TableHeader>
                <TableRow className="border-b border-[#E5E5E5] bg-gray-50/50">
                    {/* <TableHead className="px-4 py-4 w-8 font-[Red Hat Display]">
                      <Checkbox
                        checked={allSelected}
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all"
                      />
                    </TableHead> */}
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
                          {/* <TableCell className="px-4 py-4 w-8 font-[Poppins]" onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              checked={selectedClaims.includes(rowId)}
                              onCheckedChange={() =>
                                handleSelectOne(request, index)
                              }
                              aria-label="Select row"
                            />
                          </TableCell> */}
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

                                {/* Fulfillment Staff Actions based on status */}
                                {/* Initiate Borzo → only when Validated */}
                                {request.returnStatus === "Validated" && (
                                  <DropdownMenuItem
                                    className="cursor-pointer"
                                    onClick={() =>
                                      handleOpenBorzoConfirm(request._id)
                                    }
                                  >
                                    <Edit className="h-4 w-4 mr-2" /> Initiate Borzo
                                  </DropdownMenuItem>
                                )}

                                {/* Complete Pickup → only when Pickup_Scheduled */}
                                {request.returnStatus === "Pickup_Scheduled" && (
                                  <>
                                    <div className="h-px bg-gray-200 mx-2" />
                                    <DropdownMenuItem
                                      className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium"
                                      onClick={() =>
                                        handleOpenCompletePickup(request._id)
                                      }
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2" />{" "}
                                      Complete Pickup
                                    </DropdownMenuItem>
                                  </>
                                )}

                                {/* Inspect → when Pickup_Completed OR Under_Inspection */}
                                {(request.returnStatus === "Pickup_Completed" ||
                                  request.returnStatus === "Under_Inspection") && (
                                  <>
                                    <div className="h-px bg-gray-200 mx-2" />
                                    <DropdownMenuItem
                                      className="cursor-pointer text-[#C72920] hover:text-[#c72820c0] font-medium"
                                      onClick={() =>
                                        handleOpenInspect(request._id)
                                      }
                                    >
                                      <Eye className="h-4 w-4 mr-2" /> Inspect
                                    </DropdownMenuItem>
                                  </>
                                )}

                                {/* Initiate Refund → only when Approved */}
                                {request.returnStatus === "Approved" && (
                                  <>
                                    <div className="h-px bg-gray-200 mx-2" />
                                    <DropdownMenuItem
                                      className="cursor-pointer text-green-600 hover:text-green-700 font-medium"
                                      onClick={() =>
                                        handleOpenInitiateRefund(request._id)
                                      }
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2" />{" "}
                                      Initiate Refund
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

        <SchedulePickupDialog
          open={schedulePickupDialog.open}
          onClose={handleCloseSchedulePickup}
          onScheduleComplete={handleSchedulePickupComplete}
          returnId={schedulePickupDialog.returnId}
          initialPickupAddress={
            schedulePickupDialog.returnRequest?.pickupRequest?.pickupAddress
          }
        />
        <CompletePickupDialog
          open={completePickupDialog.open}
          onClose={handleCloseCompletePickup}
          onComplete={handleCompletePickupComplete}
          returnId={completePickupDialog.returnId}
          returnRequest={completePickupDialog.returnRequest}
        />
        <InspectDialog
          open={inspectDialog.open}
          onClose={handleCloseInspect}
          onInspectComplete={handleInspectComplete}
          returnId={inspectDialog.returnId}
          returnStatus={inspectDialog.returnRequest?.returnStatus}
        />
        <InitiateRefundForm
          open={initiateRefundDialog.open}
          onClose={handleCloseInitiateRefund}
          returnId={initiateRefundDialog.returnId}
          onSubmit={() => handleInitiateRefundComplete(true)}
        />

        <Dialog
          open={borzoConfirmDialog.open}
          onOpenChange={(open) => !borzoLoading && setBorzoConfirmDialog({ ...borzoConfirmDialog, open })}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Initiate Borzo Pickup</DialogTitle>
              <DialogDescription>
                Enter the secure package amount and confirm to initiate Borzo pickup for this return request.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="space-y-2">
                <label htmlFor="securePackageAmount" className="text-sm font-medium text-gray-700">
                  Secure Package Amount (₹)
                </label>
                <Input
                  id="securePackageAmount"
                  type="number"
                  placeholder="Enter amount"
                  value={borzoConfirmDialog.securePackageAmount}
                  onChange={(e) => setBorzoConfirmDialog({
                    ...borzoConfirmDialog,
                    securePackageAmount: e.target.value
                  })}
                  disabled={borzoLoading}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setBorzoConfirmDialog({ open: false, returnId: null, securePackageAmount: "" })}
                disabled={borzoLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmBorzo}
                disabled={borzoLoading || !borzoConfirmDialog.securePackageAmount}
              >
                {borzoLoading ? "Processing..." : "Confirm"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Card>
    </div>
  );
}
