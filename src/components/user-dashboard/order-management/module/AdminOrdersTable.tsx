"use client";

import { useState, useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchOrdersRequest, fetchOrdersSuccess, fetchOrdersFailure } from "@/store/slice/order/orderSlice";
import { getOrders } from "@/service/order-service";
import { fetchEnhancedOrderStats } from "@/service/dashboardServices";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import DynamicButton from "@/components/common/button/button";
import EnhancedOrderFilters from "@/components/user-dashboard/order-management/EnhancedOrderFilters";
import EnhancedOrderStatsCards from "@/components/user-dashboard/order-management/EnhancedOrderStatsCards";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Eye } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DynamicPagination } from "@/components/common/pagination";

// Strict Type Definition
interface AdminOrder {
  id: string;
  orderId: string;
  customer: string;
  amount: string;
  status: string;
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
  const [filters, setFilters] = useState<any>({ status: "all", search: "" });
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
      date: o.orderDate ? new Date(o.orderDate).toLocaleDateString() : "",
      dealers: o.dealerMapping?.length || 0,
    }));
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
useEffect(() => {
    const init = async () => {
      dispatch(fetchOrdersRequest());
      try {
        setLoading(true);
        const [orderRes, statsRes] = await Promise.all([
          getOrders(currentPage, itemsPerPage, filters.paymentMethod),
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
    init();
  }, [dispatch, currentPage, filters.paymentMethod]);

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

      const pageNumbers = totalPages > 1 ? Array.from({ length: totalPages }, (_, idx) => idx + 1) : [currentPage];
      const responses = await Promise.all(
        pageNumbers.map(async (page) => {
          const res = await getOrders(page, itemsPerPage);
          return mapApiOrders(res.data);
        })
      );
      const everyOrder = responses.flat();
      const exportData = applyFilters(everyOrder);

      if (!exportData.length) {
        setExporting(false);
        return;
      }

      const headers = ["Order ID", "Date", "Customer", "Amount", "Dealers", "Status"];
      const dataRows = exportData.map((order: AdminOrder) => [
        order.orderId,
        order.date,
        order.customer,
        normalizeAmount(order.amount),
        order.dealers,
        order.status,
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
    } catch (error) {
      console.error("Failed to export orders CSV:", error);
    } finally {
      setExporting(false);
    }
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
        onRefresh={() => dispatch(fetchOrdersRequest())}
      />

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Order Management</CardTitle>
            <DynamicButton text="Dashboard" variant="outline" onClick={() => route.push("/user/dashboard/orders-dashboard")} />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Dealers</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? <TableRow><TableCell colSpan={7} className="text-center">Loading...</TableCell></TableRow> : 
               filteredData.map((order: AdminOrder) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.orderId}</TableCell>
                  <TableCell>{order.date}</TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell>{order.amount}</TableCell>
                  <TableCell>{order.dealers}</TableCell>
                  <TableCell>{order.status}</TableCell>
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
              ))}
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