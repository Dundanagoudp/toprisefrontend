"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw, Filter } from "lucide-react";
import DynamicPagination from "@/components/common/pagination/DynamicPagination";
import { getPaymentDetails, exportAllPaymentDetails } from "@/service/payment-service";
import { PaymentDetail } from "@/types/paymentDetails-Types";
import SearchInput from "@/components/common/search/SearchInput";
import DynamicButton from "@/components/common/button/button";
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
import useDebounce from "@/utils/useDebounce";

export default function PaymentsTab() {
  const [payments, setPayments] = useState<PaymentDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPaymentMethod, setFilterPaymentMethod] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [tempStatus, setTempStatus] = useState("all");
  const [tempMethod, setTempMethod] = useState("all");
  const [tempStartDate, setTempStartDate] = useState<string>("");
  const [tempEndDate, setTempEndDate] = useState<string>("");
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  const fetchPaymentDetails = async () => {
    try {
      setLoading(true);
      const response = await getPaymentDetails(currentPage, itemsPerPage, {
        payment_status: filterStatus,
        payment_method: filterPaymentMethod,
        startDate: startDate || null,
        endDate: endDate || null,
      });

      setPayments(response.data.data);
      setTotalPages(response.data.pagination.totalPages);
      setTotalItems(response.data.pagination.totalItems);
    } catch (error) {
      console.log("error in payment details", error);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentDetails();
  }, [currentPage, filterStatus, filterPaymentMethod, startDate, endDate]);

  const performSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
    setIsSearching(false);
  }, [currentPage]);

  const { debouncedCallback: debouncedSearch } = useDebounce(performSearch, 500);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    setIsSearching(value.trim() !== "");
    debouncedSearch(value);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearchQuery("");
    setIsSearching(false);
    setCurrentPage(1);
  };

  const filteredPayments = useMemo(() => {
    let filtered = [...payments];
    
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (payment) =>
          payment.payment_id?.toLowerCase().includes(q) ||
          payment.razorpay_order_id?.toLowerCase().includes(q) ||
          payment.payment_method?.toLowerCase().includes(q) ||
          payment.payment_status?.toLowerCase().includes(q)
      );
    }
    
    return filtered;
  }, [payments, searchQuery]);

  const handleClearFilters = () => {
    setTempStatus("all");
    setTempMethod("all");
    setTempStartDate("");
    setTempEndDate("");
    setFilterStatus("all");
    setFilterPaymentMethod("all");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  };

  const handleApplyFilters = () => {
    setFilterStatus(tempStatus);
    setFilterPaymentMethod(tempMethod);
    setStartDate(tempStartDate);
    setEndDate(tempEndDate);
    setCurrentPage(1);
    setShowFilters(false);
  };

  const getAppliedFiltersCount = () => {
    let count = 0;
    if (filterStatus !== "all") count++;
    if (filterPaymentMethod !== "all") count++;
    if (startDate || endDate) count++;
    return count;
  };

  useEffect(() => {
    if (showFilters) {
      setTempStatus(filterStatus);
      setTempMethod(filterPaymentMethod);
      setTempStartDate(startDate);
      setTempEndDate(endDate);
    }
  }, [showFilters]);

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

  const exportPaymentsToCSV = async () => {
    try {
      setIsExporting(true);
      
      const response = await exportAllPaymentDetails({
        payment_status: filterStatus,
        payment_method: filterPaymentMethod,
        startDate: startDate || null,
        endDate: endDate || null,
      });
      
      const allPayments = response.data.data || [];
      
      if (allPayments.length === 0) {
        alert("No data to export");
        return;
      }
      
      const formatPhoneNumber = (phone: string | undefined) => {
        if (!phone) return 'N/A';
        const cleaned = phone.replace(/[\s\-\(\)]/g, '');
        let formattedPhone = '';
        if (!cleaned.startsWith('+')) {
          formattedPhone = `+91${cleaned}`;
        } else {
          formattedPhone = cleaned;
        }
        return `'${formattedPhone}`;
      };
      
      const csvData = [
        ["Payment ID", "Razorpay Order ID", "Payment Method", "Razorpay Payment Method", "Payment Status", "Amount", "Created At", "Order ID", "Order Amount", "Customer Name", "Customer Phone"],
        ...allPayments.map((payment: any) => [
          payment.payment_id || payment._id || 'N/A',
          payment.razorpay_order_id || 'N/A',
          payment.payment_method || 'N/A',
          payment.razorpay_payment_method || 'N/A',
          payment.payment_status || 'N/A',
          `₹${payment.amount?.toLocaleString() || '0'}`,
          payment.created_at ? new Date(payment.created_at).toLocaleDateString() : 'N/A',
          payment.orderDetails?.orderId || payment.order_id?.orderId || "N/A",
          `₹${payment.orderDetails?.order_Amount?.toLocaleString() || payment.order_id?.order_Amount?.toLocaleString() || '0'}`,
          payment.orderDetails?.customerName || payment.order_id?.customerDetails?.name || "N/A",
          formatPhoneNumber(payment.orderDetails?.customerPhone || payment.order_id?.customerDetails?.phone)
        ])
      ];

      const csvContent = csvData.map(row => 
        row.map(cell => {
          const cellStr = String(cell);
          if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
            return `"${cellStr.replace(/"/g, '""')}"`;
          }
          return cellStr;
        }).join(',')
      ).join("\n");
      
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      const filename = `payments-list_${new Date().toISOString().split('T')[0]}.csv`;
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      alert(`CSV exported successfully (${allPayments.length} records)`);
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export CSV");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center mb-4">
            <CardTitle>Payments</CardTitle>
            <Button
              onClick={exportPaymentsToCSV}
              disabled={isExporting}
              variant="outline"
              className="flex items-center gap-2 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
            >
              {isExporting ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Export CSV
                </>
              )}
            </Button>
          </div>
          
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
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead>Order Amount</TableHead>
                <TableHead>Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">Loading...</TableCell>
                </TableRow>
              ) : filteredPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No payments found
                  </TableCell>
                </TableRow>
              ) : (
                filteredPayments.map((payment) => (
                  <TableRow key={payment._id}>
                    <TableCell className="font-semibold">
                      {new Date(payment.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {payment.payment_method === "Razorpay" 
                        ? payment.razorpay_payment_method 
                        : payment.payment_method}
                    </TableCell>
                    <TableCell>
                      <span className={getStatusBadge(payment.payment_status || "")}>
                        {payment.payment_status}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">
                      {payment.orderDetails?.orderId || payment.order_id?.orderId || 'N/A'}
                    </TableCell>
                    <TableCell className="font-semibold">
                      ₹{payment.orderDetails?.order_Amount?.toLocaleString() || payment.order_id?.order_Amount?.toLocaleString() || 'N/A'}
                    </TableCell>
                    <TableCell className="font-semibold">
                      ₹{payment.amount?.toLocaleString() || '0'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {totalItems > 0 && totalPages > 1 && (
        <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
          <div className="text-sm text-gray-600 text-center sm:text-left">
            {`Showing ${(currentPage - 1) * itemsPerPage + 1}-${Math.min(
              currentPage * itemsPerPage,
              totalItems
            )} of ${totalItems} payments`}
          </div>
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
              <Select value={tempStatus} onValueChange={setTempStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Failed">Failed</SelectItem>
                  <SelectItem value="Created">Created</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="method-filter">Payment Method</Label>
              <Select value={tempMethod} onValueChange={setTempMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="Razorpay">Razorpay</SelectItem>
                  <SelectItem value="COD">COD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="start-date">From Date</Label>
              <input
                id="start-date"
                type="date"
                value={tempStartDate}
                onChange={(e) => setTempStartDate(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="end-date">To Date</Label>
              <input
                id="end-date"
                type="date"
                value={tempEndDate}
                onChange={(e) => setTempEndDate(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
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

