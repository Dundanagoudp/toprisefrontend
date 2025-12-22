"use client";

import { useState, useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchOrdersRequest, fetchOrdersSuccess, fetchOrdersFailure } from "@/store/slice/order/orderSlice";
import { getOrders, type OrderFilters } from "@/service/order-service";
import { fetchEnhancedOrderStats } from "@/service/dashboardServices";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import DynamicButton from "@/components/common/button/button";
import EnhancedOrderFilters from "@/components/user-dashboard/order-management/EnhancedOrderFilters";
import EnhancedOrderStatsCards from "@/components/user-dashboard/order-management/EnhancedOrderStatsCards";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Eye, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DynamicPagination } from "@/components/common/pagination";
import { format } from "date-fns";
import auditLogService from "@/service/audit-log-service";

// Strict Type Definition
interface AdminOrder {
  id: string;
  orderId: string;
  customer: string;
  amount: string;
  status: string;
  paymentStatus: string;
  date: string;
  dealers: number;
}

export default function AdminOrdersTable() {
  const dispatch = useAppDispatch();
  const route = useRouter();
  // const { orders, loading } = useAppSelector((state) => state.order);
  
  // Local State
  // get the order from local state 
  const [Orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [stats, setStats] = useState<any>(null);
  const [filters, setFilters] = useState<any>({
    status: "all",
    search: "",
    paymentMethod: "all",
    orderSource: "all",
    dealerId: "all",
    dateRange: {
      from: undefined,
      to: undefined,
    }
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [exporting, setExporting] = useState(false);
  const itemsPerPage = 10;

  const mapApiOrders = (apiData: any): AdminOrder[] => {
    const rawOrders: any[] = Array.isArray(apiData)
      ? apiData
      : Array.isArray(apiData?.orders)
        ? apiData.orders
        : [];

    return rawOrders.map((o: any) => ({
      id: o._id,
      orderId: o.orderId,
      customer: o.customerDetails?.name || "N/A",
      amount: `₹${o.order_Amount}`,
      status: o.status,
      paymentStatus: o.payment_id?.payment_status || "N/A",
      date: o.orderDate ? new Date(o.orderDate).toLocaleDateString() : "",
      dealers: o.dealerMapping?.length || 0,
    }));
  };

  const getStatusBadge = (status: string) => {
    const s = (status || "").toLowerCase();
    switch (s) {
      case "confirmed":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "assigned":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "scanning":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100";
      case "packed":
        return "bg-indigo-100 text-indigo-800 hover:bg-indigo-100";
      case "shipped":
        return "bg-cyan-100 text-cyan-800 hover:bg-cyan-100";
      case "delivered":
        return "bg-emerald-100 text-emerald-800 hover:bg-emerald-100";
      case "cancelled":
      case "canceled":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      case "returned":
        return "bg-orange-100 text-orange-800 hover:bg-orange-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    const s = (status || "").toLowerCase();
    switch (s) {
      case "paid":
      case "success":
      case "successful":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "pending":
      case "created":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      case "failed":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      case "refunded":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  const applyFilters = (ordersToFilter: AdminOrder[]) => {
    return ordersToFilter.filter((o: AdminOrder) => {
      const matchSearch =
        !filters.search ||
        o.orderId.toLowerCase().includes(filters.search.toLowerCase()) ||
        o.customer.toLowerCase().includes(filters.search.toLowerCase());
      const matchStatus = filters.status === "all" || o.status.toLowerCase() === filters.status.toLowerCase();
      return matchSearch && matchStatus;
    });
  };

  // Data Fetching
  const fetchOrdersData = async () => {
    dispatch(fetchOrdersRequest());
    try {
      setLoading(true);
      
      const orderFilters: OrderFilters = {
        paymentType: filters.paymentMethod,
        status: filters.status,
        orderSource: filters.orderSource,
        dealerId: filters.dealerId,
        searchTerm: filters.search,
        sortBy: filters.sortBy,
        order: filters.order,
      };

      if (filters.dateRange?.from) {
        orderFilters.startDate = format(filters.dateRange.from, 'yyyy-MM-dd');
      }
      if (filters.dateRange?.to) {
        orderFilters.endDate = format(filters.dateRange.to, 'yyyy-MM-dd');
      }

      const [orderRes, statsRes] = await Promise.all([
        getOrders(currentPage, itemsPerPage, orderFilters),
        fetchEnhancedOrderStats({})
      ]);

      const apiData: any = orderRes.data;
      const mapped = mapApiOrders(apiData);
      console.log("Mapped Orders:", mapped);
      setOrders(mapped);
      dispatch(fetchOrdersSuccess(mapped));
      setStats(statsRes.data);
      // Handle pagination if present, else fallback
      setTotalOrders(apiData.pagination?.totalItems || mapped.length);
      setTotalPages(apiData.pagination?.totalPages || Math.ceil(mapped.length / itemsPerPage));
    } catch (err: any) {
      dispatch(fetchOrdersFailure(err.message));
    }
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersData();
  }, [dispatch, currentPage, filters.paymentMethod, filters.status, filters.orderSource, filters.dealerId, filters.search, filters.sortBy, filters.order, filters.dateRange?.from, filters.dateRange?.to]);

  // Client-side Filtering (Replace with Server-side in future)
  const filteredData = useMemo(() => {
    return applyFilters(Orders as AdminOrder[]);
  }, [Orders, filters]);

  const toCSVValue = (value: string | number | undefined | null) => {
    const stringValue = value ?? "";
    const needsEscaping = /[",\n]/.test(String(stringValue));
    const sanitized = String(stringValue).replace(/"/g, '""');
    return needsEscaping ? `"${sanitized}"` : sanitized;
  };

  const normalizeAmount = (amount: string) => {
    if (!amount) return "";
    return amount.replace(/[^\d.-]/g, "");
  };

  const handleExportOrders = async () => {
    try {
      setExporting(true);

      const orderFilters: OrderFilters = {
        paymentType: filters.paymentMethod,
        status: filters.status,
        orderSource: filters.orderSource,
        dealerId: filters.dealerId,
        searchTerm: filters.search,
        sortBy: filters.sortBy,
        order: filters.order,
      };

      if (filters.dateRange?.from) {
        orderFilters.startDate = format(filters.dateRange.from, 'yyyy-MM-dd');
      }
      if (filters.dateRange?.to) {
        orderFilters.endDate = format(filters.dateRange.to, 'yyyy-MM-dd');
      }

      const pageNumbers = totalPages > 1 ? Array.from({ length: totalPages }, (_, idx) => idx + 1) : [currentPage];
      const responses = await Promise.all(
        pageNumbers.map(async (page) => {
          const res = await getOrders(page, itemsPerPage, orderFilters);
          return mapApiOrders(res.data);
        })
      );
      const everyOrder = responses.flat();
      const exportData = applyFilters(everyOrder);

      if (!exportData.length) {
        setExporting(false);
        return;
      }

      const headers = ["Order ID", "Date", "Customer", "Amount", "Dealers", "Status", "Payment Status"];
      const dataRows = exportData.map((order: AdminOrder) => [
        order.orderId,
        order.date,
        order.customer,
        normalizeAmount(order.amount),
        order.dealers,
        order.status,
        order.paymentStatus,
      ]);
      const csvContent = [headers, ...dataRows]
        .map((row) => row.map((cell) => toCSVValue(cell as string | number)).join(","))
        .join("\r\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `orders-${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Log audit trail for export action
      try {
        await auditLogService.createActionAuditLog({
          actionName: "Order_Exported",
          actionModule: "REPORT_EXPORT",
        });
      } catch (auditError) {
        console.error("Failed to log audit trail:", auditError);
        // Don't fail the export if audit log fails
      }
    } catch (error) {
      console.error("Failed to export orders CSV:", error);
    } finally {
      setExporting(false);
    }
  };

  const handleSort = (field: string) => {
    setFilters((prev: any) => {
      const currentSortBy = prev.sortBy;
      const currentOrder = prev.order;

      if (field === "Amount") {
        // Handle Amount column sorting: no sort -> asc -> desc -> no sort
        if (!currentSortBy || currentSortBy !== "order_Amount") {
          // No sort or different field - start with ascending
          return {
            ...prev,
            sortBy: "order_Amount",
            order: "asc"
          };
        } else if (currentOrder === "asc") {
          // Currently ascending - switch to descending
          return {
            ...prev,
            sortBy: "order_Amount",
            order: "desc"
          };
        } else {
          // Currently descending - remove sorting (no sort)
          const { sortBy, order, ...rest } = prev;
          return rest;
        }
      }

      return { ...prev, sortBy: field };
    });
  };

  return (
    <div className="space-y-6">
      <EnhancedOrderStatsCards 
        stats={stats} 
        loading={loading} 
        filters={filters} 
        onFilterChange={(k, v) => setFilters((prev: any) => ({...prev, [k]: v}))} 
        onRefresh={() => {}} 
        onClearFilters={() => setFilters({})}
      />

      <EnhancedOrderFilters 
        onFiltersChange={setFilters} 
        loading={loading || exporting} 
        onExport={handleExportOrders}
        onRefresh={fetchOrdersData}
      />

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Order Management</CardTitle>
            {/* <DynamicButton text="Dashboard" variant="outline" onClick={() => route.push("/user/dashboard/orders-dashboard")} /> */}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-gray-100 select-none"
                  onClick={() => handleSort("Amount")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Amount</span>
                    {filters.sortBy === "order_Amount" ? (
                      filters.order === "asc" ? (
                        <ArrowUp className="h-4 w-4" />
                      ) : (
                        <ArrowDown className="h-4 w-4" />
                      )
                    ) : (
                      <ArrowUpDown className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </TableHead>
                <TableHead>Dealers</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">Loading...</TableCell>
                </TableRow>
              ) : filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    No Orders found
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((order: AdminOrder) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.orderId}</TableCell>
                    <TableCell>{order.date}</TableCell>
                    <TableCell>{order.customer}</TableCell>
                    <TableCell>{order.amount}</TableCell>
                    <TableCell>{order.dealers}</TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(order.status)}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPaymentStatusBadge(order.paymentStatus)}>
                        {order.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger><MoreHorizontal className="w-4 h-4" /></DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => route.push(`/user/dashboard/order/orderdetails/${order.id}`)}>
                              <Eye className="mr-2 h-4 w-4"/> View
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalOrders > 0 && totalPages > 1 && (
        <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
          <div className="text-sm text-gray-600 text-center sm:text-left">
            {`Showing ${(currentPage - 1) * itemsPerPage + 1}-${Math.min(
              currentPage * itemsPerPage,
              totalOrders
            )} of ${totalOrders} orders`}
          </div>
          <div className="flex justify-center sm:justify-end">
            <DynamicPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalOrders}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      )}
    </div>
  );
}