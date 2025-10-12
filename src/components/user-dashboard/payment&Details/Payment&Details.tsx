"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Filter, ChevronDown, ChevronUp, Download, FileText, FileSpreadsheet } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import SearchInput from "@/components/common/search/SearchInput";
import DynamicButton from "@/components/common/button/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import useDebounce from "@/utils/useDebounce";
import DynamicPagination from "@/components/common/pagination/DynamicPagination";
import { getPaymentDetails } from "@/service/payment-service";
import { PaymentDetail, PaymentDetailsResponse, PaymentPagination } from "@/types/paymentDetails-Types";
import PaymentStatsCards from "./PaymentStatsCards";
import PaymentDetailedStats from "./PaymentDetailedStats";

// Using PaymentDetail interface from types file instead of local interface

export default function PaymentDetails() {
  const router = useRouter();
  const [payments, setPayments] = useState<PaymentDetail[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Sorting state
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  
  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPaymentMethod, setFilterPaymentMethod] = useState<string>("all");
  const [filterDateRange, setFilterDateRange] = useState<string>("all");
  
  // Pagination state from server
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;
  // Fetch payments with pagination
  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        setLoading(true);
        const response = await getPaymentDetails(currentPage, itemsPerPage);
        
        if (response.data?.data) {
          setPayments(response.data.data);
          setTotalPages(response.data.pagination.totalPages);
          setTotalItems(response.data.pagination.totalItems);
        } else {
          console.warn("Invalid response structure:", response);
          setPayments([]);
          setTotalPages(0);
          setTotalItems(0);
        }
      } catch (error) {
        console.log("error in payment details", error);
        setPayments([]);
        setTotalPages(0);
        setTotalItems(0);
      } finally {
        setLoading(false);
      }
    };
    fetchPaymentDetails();
  }, [currentPage]);
  // Removed mock data - now using real API data

  // Filter and sort payments (client-side for current page)
  const filteredAndSortedPayments = useMemo(() => {
    let currentPayments = [...payments];

    // Apply search filter
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      currentPayments = currentPayments.filter(
        (payment) =>
          payment.payment_id?.toLowerCase().includes(q) ||
          payment.razorpay_order_id?.toLowerCase().includes(q) ||
          payment.payment_method?.toLowerCase().includes(q) ||
          payment.payment_status?.toLowerCase().includes(q)
      );
    }

    // Apply status filter
    if (filterStatus !== "all") {
      currentPayments = currentPayments.filter(
        (payment) => payment.payment_status?.toLowerCase() === filterStatus.toLowerCase()
      );
    }

    // Apply payment method filter
    if (filterPaymentMethod !== "all") {
      currentPayments = currentPayments.filter(
        (payment) => payment.payment_method?.toLowerCase() === filterPaymentMethod.toLowerCase()
      );
    }


    // Apply date range filter
    if (filterDateRange !== "all") {
      const now = new Date();
      const filterDate = new Date();
      
      switch (filterDateRange) {
        case "today":
          filterDate.setHours(0, 0, 0, 0);
          break;
        case "week":
          filterDate.setDate(now.getDate() - 7);
          break;
        case "month":
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case "year":
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      currentPayments = currentPayments.filter(
        (payment) => new Date(payment.created_at) >= filterDate
      );
    }

    // Sort payments
    if (sortField) {
      currentPayments.sort((a: any, b: any) => {
        let aValue: any;
        let bValue: any;
        
        switch (sortField) {
          case "payment_id":
            aValue = a.payment_id?.toLowerCase() || "";
            bValue = b.payment_id?.toLowerCase() || "";
            break;
          case "razorpay_order_id":
            aValue = a.razorpay_order_id?.toLowerCase() || "";
            bValue = b.razorpay_order_id?.toLowerCase() || "";
            break;
          case "created_at":
            aValue = new Date(a.created_at).getTime();
            bValue = new Date(b.created_at).getTime();
            break;
          case "amount":
            aValue = a.amount || 0;
            bValue = b.amount || 0;
            break;
          case "payment_status":
            aValue = a.payment_status?.toLowerCase() || "";
            bValue = b.payment_status?.toLowerCase() || "";
            break;
          case "payment_method":
            aValue = a.payment_method?.toLowerCase() || "";
            bValue = b.payment_method?.toLowerCase() || "";
            break;
          case "is_refund":
            aValue = a.is_refund ? 1 : 0;
            bValue = b.is_refund ? 1 : 0;
            break;
          default:
            return 0;
        }
        
        if (sortDirection === "asc") {
          return aValue.localeCompare ? aValue.localeCompare(bValue) : aValue - bValue;
        } else {
          return bValue.localeCompare ? bValue.localeCompare(aValue) : bValue - aValue;
        }
      });
    }
    
    return currentPayments;
  }, [payments, searchQuery, sortField, sortDirection, filterStatus, filterPaymentMethod, filterDateRange]);

  // Use filtered payments directly (no additional pagination since server handles it)
  const paginatedData = filteredAndSortedPayments;

  // Removed old mock data useEffect

  // Debounced search functionality
  const performSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (currentPage !== 1) {
      setCurrentPage(1); // Reset to first page when searching
    }
    setIsSearching(false);
  }, [currentPage]);

  const { debouncedCallback: debouncedSearch } = useDebounce(performSearch, 500);

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    setIsSearching(value.trim() !== "");
    debouncedSearch(value);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchInput("");
    setSearchQuery("");
    setIsSearching(false);
    setCurrentPage(1);
  };

  // Handle sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) {
      return <ChevronUp className="w-4 h-4 text-gray-400" />;
    }
    return sortDirection === "asc" ? 
      <ChevronUp className="w-4 h-4 text-[#C72920]" /> : 
      <ChevronDown className="w-4 h-4 text-[#C72920]" />;
  };

  // Filter handlers
  const handleClearFilters = () => {
    setFilterStatus("all");
    setFilterPaymentMethod("all");
    setFilterDateRange("all");
  };

  const handleApplyFilters = () => {
    setShowFilters(false);
  };

  const getAppliedFiltersCount = () => {
    let count = 0;
    if (filterStatus !== "all") count++;
    if (filterPaymentMethod !== "all") count++;
    if (filterDateRange !== "all") count++;
    return count;
  };

  // Export functions for payment list
  const exportPaymentsToCSV = () => {
    if (!payments || payments.length === 0) return;
    
    const csvData = [
      ["Payment ID", "Razorpay Order ID", "Payment Method", "Payment Status", "Amount", "Created At", "Order ID", "Customer Name", "Customer Phone"],
      ...payments.map(payment => [
        payment.payment_id || payment._id,
        payment.razorpay_order_id,
        payment.payment_method,
        payment.payment_status,
        `₹${payment.amount.toLocaleString()}`,
        new Date(payment.created_at).toLocaleDateString(),
        payment.orderDetails?.orderId || payment.order_id?.orderId || "N/A",
        payment.orderDetails?.customerName || payment.order_id?.customerDetails?.name || "N/A",
        payment.orderDetails?.customerPhone || payment.order_id?.customerDetails?.phone || "N/A"
      ])
    ];

    const csvContent = csvData.map(row => row.join(",")).join("\n");
    
    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `payments-list-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPaymentsToJSON = () => {
    if (!payments || payments.length === 0) return;
    
    const jsonContent = JSON.stringify(payments, null, 2);
    
    // Create and download file
    const blob = new Blob([jsonContent], { type: "application/json" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `payments-list-${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded text-xs font-medium";
    switch (status.toLowerCase()) {
      case "paid":
        return `${baseClasses} text-green-700 bg-green-100`;
      case "created":
      case "pending":
        return `${baseClasses} text-yellow-700 bg-yellow-100`;
      case "failed":
        return `${baseClasses} text-red-700 bg-red-100`;
      case "refunded":
        return `${baseClasses} text-blue-700 bg-blue-100`;
      default:
        return `${baseClasses} text-gray-700 bg-gray-100`;
    }
  };

  // Handle opening payment details page
  const handleViewPaymentDetails = (paymentId: string) => {
    router.push(`/user/dashboard/paymentDetails/${paymentId}`);
  };

  return (
    <div className="w-full">
      <Card className="shadow-sm rounded-none">
        {/* Header */}
        <CardHeader className="space-y-4 sm:space-y-6">
          <CardTitle className="text-[#000000] font-bold text-lg font-sans">
            <span>Payment & Details</span>
          </CardTitle>

          {/* Payment Statistics Cards */}
          <PaymentStatsCards className="mb-6" />
          
          {/* Detailed Payment Statistics */}
          <PaymentDetailedStats className="mb-6" />

          {/* Search and Filters */}
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0 gap-4 w-full">
            <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:gap-3 w-full lg:w-auto">
              <SearchInput
                placeholder="Search payments"
                value={searchInput}
                onChange={handleSearchChange}
                onClear={handleClearSearch}
                isLoading={isSearching}
              />
              <div className="flex gap-2 sm:gap-3">
                <DynamicButton
                  variant="outline"
                  text={`Filters${getAppliedFiltersCount() > 0 ? ` (${getAppliedFiltersCount()})` : ''}`}
                  icon={<Filter className="h-4 w-4 mr-2" />}
                  onClick={() => setShowFilters(true)}
                />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Export
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={exportPaymentsToCSV} className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4" />
                      Export as CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={exportPaymentsToJSON} className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Export as JSON
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* Payments Section Header */}
          <div className="mb-4">
            <CardTitle className="font-sans font-bold text-lg text-[#000000]">
              Payments
            </CardTitle>
            <CardDescription className="text-sm text-[#737373] font-medium font-sans">
              Manage your payment details and transactions
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="hidden sm:block overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow className="border-b border-[#E5E5E5] bg-gray-50/50">
                  <TableHead className="px-4 py-4 w-8 font-[Red Hat Display]">
                    <Checkbox aria-label="Select all" />
                  </TableHead>
                  <TableHead 
                    className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display] cursor-pointer hover:text-[#C72920] transition-colors"
                    onClick={() => handleSort("payment_id")}
                  >
                    <div className="flex items-center gap-1">
                      Payment ID
                      {getSortIcon("payment_id")}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display] cursor-pointer hover:text-[#C72920] transition-colors"
                    onClick={() => handleSort("razorpay_order_id")}
                  >
                    <div className="flex items-center gap-1">
                      Razorpay Order ID
                      {getSortIcon("razorpay_order_id")}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display] cursor-pointer hover:text-[#C72920] transition-colors"
                    onClick={() => handleSort("created_at")}
                  >
                    <div className="flex items-center gap-1">
                      Date
                      {getSortIcon("created_at")}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display] cursor-pointer hover:text-[#C72920] transition-colors"
                    onClick={() => handleSort("amount")}
                  >
                    <div className="flex items-center gap-1">
                      Amount
                      {getSortIcon("amount")}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display] cursor-pointer hover:text-[#C72920] transition-colors"
                    onClick={() => handleSort("payment_method")}
                  >
                    <div className="flex items-center gap-1">
                      Payment Method
                      {getSortIcon("payment_method")}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display] cursor-pointer hover:text-[#C72920] transition-colors"
                    onClick={() => handleSort("payment_status")}
                  >
                    <div className="flex items-center gap-1">
                      Payment Status
                      {getSortIcon("payment_status")}
                    </div>
                  </TableHead>
                  <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display]">
                    Order ID
                  </TableHead>
                  <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display]">
                    Order Amount
                  </TableHead>
                  <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display]">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading
                  ? Array.from({ length: itemsPerPage }).map((_, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="px-4 py-4 w-8">
                          <Skeleton className="w-5 h-5 rounded" />
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Skeleton className="h-4 w-3/4" />
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Skeleton className="h-4 w-1/2" />
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Skeleton className="h-4 w-3/4" />
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Skeleton className="h-4 w-1/2" />
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Skeleton className="h-6 w-16 rounded" />
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Skeleton className="h-4 w-1/2" />
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Skeleton className="h-4 w-1/2" />
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Skeleton className="h-8 w-16 rounded" />
                        </TableCell>
                      </TableRow>
                    ))
                                      : paginatedData.map((payment) => (
                      <TableRow 
                        key={payment._id}
                        className="cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => handleViewPaymentDetails(payment._id)}
                      >
                        <TableCell 
                          className="px-4 py-4 w-8"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Checkbox />
                        </TableCell>
                        <TableCell className="px-6 py-4 font-medium">
                          {payment.payment_id || 'N/A'}
                        </TableCell>
                        <TableCell className="px-6 py-4 font-medium">
                          {payment.razorpay_order_id}
                        </TableCell>
                        <TableCell className="px-6 py-4 font-semibold text-[#000000] font-sans">
                          {new Date(payment.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="px-6 py-4 font-semibold text-[#000000]">
                          ₹{payment.amount.toLocaleString()}
                        </TableCell>
                        <TableCell className="px-6 py-4 font-semibold text-[#000000]">
                          {payment.payment_method}
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <span className={getStatusBadge(payment.payment_status)}>
                            {payment.payment_status}
                          </span>
                        </TableCell>
                        <TableCell className="px-6 py-4 font-medium">
                          {payment.orderDetails?.orderId || payment.order_id?.orderId || 'N/A'}
                        </TableCell>
                        <TableCell className="px-6 py-4 font-semibold text-[#000000]">
                          ₹{payment.orderDetails?.order_Amount?.toLocaleString() || payment.order_id?.order_Amount?.toLocaleString() || 'N/A'}
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewPaymentDetails(payment._id);
                            }}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination */}
          {totalItems > 0 && totalPages > 1 && (
            <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0 mt-8 px-6 pb-6">
              {/* Left: Showing X-Y of Z payments */}
              <div className="text-sm text-gray-600 text-center sm:text-left">
                {`Showing ${(currentPage - 1) * itemsPerPage + 1}-${Math.min(
                  currentPage * itemsPerPage,
                  totalItems
                )} of ${totalItems} payments`}
              </div>
                             {/* Right: Pagination Controls */}
               <DynamicPagination
                 currentPage={currentPage}
                 totalPages={totalPages}
                 onPageChange={setCurrentPage}
                 totalItems={totalItems}
                 itemsPerPage={itemsPerPage}
                 showItemsInfo={false}
               />
            </div>
          )}
        </CardContent>
        
        {/* Empty State */}
        {paginatedData.length === 0 && !loading && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <p className="text-gray-500 text-lg mb-2">No payments found</p>
            <p className="text-gray-400 text-sm">
              Try adjusting your search terms
            </p>
          </div>
        )}
      </Card>

      {/* Filter Modal */}
      <Dialog open={showFilters} onOpenChange={setShowFilters}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Filter Payments</DialogTitle>
            <DialogDescription>
              Apply filters to narrow down your payment results
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="status-filter">Payment Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="created">Created</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="method-filter">Payment Method</Label>
              <Select value={filterPaymentMethod} onValueChange={setFilterPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="razorpay">Razorpay</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="netbanking">Net Banking</SelectItem>
                  <SelectItem value="wallet">Wallet</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            
            <div className="grid gap-2">
              <Label htmlFor="date-filter">Date Range</Label>
              <Select value={filterDateRange} onValueChange={setFilterDateRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleClearFilters}>
              Clear Filters
            </Button>
            <Button onClick={handleApplyFilters}>
              Apply Filters
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      

    </div>
  );
}
