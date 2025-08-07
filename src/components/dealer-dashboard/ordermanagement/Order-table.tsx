"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Filter, ChevronDown, Edit, Eye, MoreHorizontal } from 'lucide-react';
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast as GlobalToast } from "@/components/ui/toast";
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
import { useRouter } from "next/navigation";
import { getOrdersByDealerId, updateOrderStatusByDealer } from "@/service/dealerOrder-services";
import { DealerOrder } from "@/types/dealerOrder-types";
import {
  fetchOrdersFailure,
  fetchOrdersRequest,
  fetchOrdersSuccess,
} from "@/store/slice/order/orderSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import useDebounce from "@/utils/useDebounce";
import DynamicPagination from "@/components/common/pagination/DynamicPagination";
import DealerProductsModal from "./DealerProductsModal";
import { getCookie, getAuthToken } from "@/utils/auth";

interface Order {
  id: string;
  date: string;
  customer: string;
  number: string;
  payment: string;
  value: string;
  skus: number;
  dealers: number;
  status: "Pending" | "Approved";
  dealerProducts: any[];
}

export default function OrdersTable() {
  const [orders, setOrders] = useState<any[]>([]);
  const { showToast } = GlobalToast();
  const route = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("Requests");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const dispatch = useAppDispatch();
  const ordersState = useAppSelector((state) => state.order.orders);
  const loading = useAppSelector((state: any) => state.order.loading);
  const error = useAppSelector((state: any) => state.order.error);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  
  // Modal state
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedOrderProducts, setSelectedOrderProducts] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState("");

  // Filtered orders must be declared before pagination logic
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const filteredOrders = searchQuery
    ? ordersState.filter(
        (order: any) =>
          order.orderId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.customer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.number?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : ordersState;

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedData = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  console.log("paginatedData", paginatedData);

  const handleViewOrder = (id: string) => {
    setOrderDetails(id);
    setTimeout(() => setOrderDetails(null), 1000);
  };

  const handleViewProducts = (order: any) => {
    setSelectedOrderProducts(order.dealerProducts || []);
    setSelectedOrderId(order.orderId);
    setViewModalOpen(true);
  };

  const handleMarkAsPacked = async (order: any) => {
    try {
      // Show loading state
      showToast("Updating Status: Marking order as packed...", "success");
  
      // Get dealer ID from token/cookie
      let dealerId = getCookie("dealerId");
      
      if (!dealerId) {
        const token = getAuthToken();
        if (token) {
          try {
            const payloadBase64 = token.split(".")[1];
            if (payloadBase64) {
              const base64 = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
              const paddedBase64 = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
              const payloadJson = atob(paddedBase64);
              const payload = JSON.parse(payloadJson);
              dealerId = payload.dealerId || payload.id;
            }
          } catch (err) {
            console.error("Failed to decode token for dealerId:", err);
          }
        }
      }
  
      if (!dealerId) {
        showToast("Error: Dealer ID not found. Please login again.", "error");
        return;
      }
  
      // Call the API
      const response = await updateOrderStatusByDealer(dealerId, order.id);
      
      // Update the local state
      const updatedOrders = ordersState.map((o: any) => 
        o.id === order.id 
          ? { ...o, status: "Packed" }
          : o
      );
      dispatch(fetchOrdersSuccess(updatedOrders));
  
      // Show success message
      showToast(`Packed! Order ${order.orderId} is now ready for shipment.`, "success");
      console.log(`Packed! Order ${order.orderId} is now ready for shipment.`);
      console.log("Order status updated:", response);
    } catch (error) {
      console.error("Error updating order status:", error);
      showToast("Failed to update order status. Please try again.", "error");
    }
  };

  // Simulate loading
  useEffect(() => {
    let timer: NodeJS.Timeout;
    async function fetchOrders() {
      dispatch(fetchOrdersRequest());
      try {
        const response = await getOrdersByDealerId();
        const mappedOrders = response.map((order: DealerOrder) => ({
          id: order.orderDetails._id,
          orderId: order.orderId,
          orderDate: new Date(order.orderDetails.orderDate).toLocaleDateString(),
          customer: order.customerDetails?.name || "",
          number: order.customerDetails?.phone || "",
          payment: order.orderDetails.paymentType,
          value: `₹${order.orderDetails.order_Amount}`,
          skus: order.orderDetails.skus || [],
          skusCount: order.orderDetails.skus?.length || 0,
          dealers: order.orderDetails.dealerMapping?.length || 0,
          dealerMapping: order.orderDetails.dealerMapping || [],
          status: order.status, 
          deliveryCharges: order.orderDetails.order_Amount,
          orderType: order.orderDetails.orderType,
          orderSource: order.orderDetails.orderSource,
          auditLogs: order.orderDetails.auditLogs || [],
          createdAt: order.orderDetails.createdAt,
          updatedAt: order.orderDetails.updatedAt,
          dealerProducts: order.DealerProducts || [], 
        }));
        dispatch(fetchOrdersSuccess(mappedOrders));
        console.log("Dealer Orders Response:", response);
        setOrders(mappedOrders);
      } catch (error) {
        console.error("Failed to fetch dealer orders:", error);
        dispatch(fetchOrdersFailure(error));
      }
    }
    fetchOrders();
    // return () => {
    //   if (timer) clearTimeout(timer);
    // };
  }, [dispatch]);

  // Debounced search functionality
  const performSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    setIsSearching(false);
  }, []);

  const { debouncedCallback: debouncedSearch, cleanup: cleanupDebounce } =
    useDebounce(performSearch, 500);

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

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded text-xs font-medium";
    switch (status) {
      case "Pending":
        return `${baseClasses} text-yellow-700 bg-yellow-100`;
      case "Approved":
      case "Confirmed":
        return `${baseClasses} text-green-700 bg-green-100`;
      case "Packed":
        return `${baseClasses} text-green-700 bg-green-100`;
      case "Shipped":
        return `${baseClasses} text-purple-700 bg-purple-100`;
      case "Delivered":
        return `${baseClasses} text-green-900 bg-green-200`;
      case "Cancelled":
        return `${baseClasses} text-red-700 bg-red-100`;
      default:
        return `${baseClasses} text-gray-700 bg-gray-100`;
    }
  };

  return (
    <div className="w-full">
      <Card className="shadow-sm rounded-none">
        {/* Header */}
        <CardHeader className="space-y-4 sm:space-y-6">
          <CardTitle className="text-[#000000] font-bold text-lg font-sans">
            <span>Order Management</span>
          </CardTitle>
          {/* Search and Filters */}
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0 gap-4 w-full">
            <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:gap-3 w-full lg:w-auto">
              <SearchInput
                placeholder="Search Spare parts"
                value={searchInput}
                onChange={handleSearchChange}
                onClear={handleClearSearch}
                isLoading={isSearching}
              />
              <div className="flex gap-2 sm:gap-3">
                <DynamicButton
                  variant="outline"
                  text="Filters"
                  icon={<Filter className="h-4 w-4 mr-2" />}
                />
              </div>
            </div>
          </div>
          {/* Orders Section Header */}
          <div className="mb-4">
            <CardTitle className="font-sans font-bold text-lg text-[#000000]">
              Order
            </CardTitle>
            <CardDescription className="text-sm text-[#737373] font-medium font-sans">
              Manage your Orders details
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
                  <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display]">
                    Order ID
                  </TableHead>
                  <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display]">
                    Date
                  </TableHead>
                  <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display]">
                    Customer
                  </TableHead>
                  <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display]">
                    Number
                  </TableHead>
                  <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display]">
                    Payment
                  </TableHead>
                  <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display]">
                    Value
                  </TableHead>
                  <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display]">
                    No.of Skus
                  </TableHead>
                  <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display]">
                    Dealer
                  </TableHead>
                  <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display]">
                    Status
                  </TableHead>
                  <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display]">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading
                  ? Array.from({ length: 10 }).map((_, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="px-4 py-4 w-8">
                          <Skeleton className="w-5 h-5 rounded" />
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Skeleton className="w-16 h-12 rounded-md" />
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Skeleton className="h-4 w-3/4 mb-2" />
                          <Skeleton className="h-3 w-1/2" />
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Skeleton className="h-3 w-1/2" />
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Skeleton className="h-3 w-1/2" />
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Skeleton className="h-3 w-1/2" />
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Skeleton className="h-3 w-1/2" />
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Skeleton className="h-3 w-1/2" />
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Skeleton className="h-3 w-1/2" />
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Skeleton className="h-3 w-1/2" />
                        </TableCell>
                        <TableCell className="px-6 py-4 text-center">
                          <Skeleton className="h-8 w-8 rounded" />
                        </TableCell>
                      </TableRow>
                    ))
                  : paginatedData.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="px-4 py-4 w-8">
                          <Checkbox />
                        </TableCell>
                        <TableCell
                          className="px-6 py-4 font-medium cursor-pointer hover:text-blue-600"
                          onClick={() => handleViewOrder(order.id)}
                        >
                          {order.orderId}
                        </TableCell>
                        <TableCell className="px-6 py-4 font-semibold text-[#000000] font-sans">
                          {order.orderDate}
                        </TableCell>
                        <TableCell className="px-6 py-4 font-semibold text-[#000000]">
                          {order.customer}
                        </TableCell>
                        <TableCell className="px-6 py-4 font-semibold text-[#000000]">
                          {order.number}
                        </TableCell>
                        <TableCell className="px-6 py-4 font-semibold text-[#000000]">
                          {order.payment}
                        </TableCell>
                        <TableCell className="px-6 py-4 font-semibold text-[#000000]">
                          {order.value}
                        </TableCell>
                        <TableCell className="px-6 py-4 font-semibold text-[#000000]">
                          {Array.isArray(order.skus) ? order.skus.length : 1}
                        </TableCell>
                        <TableCell className="px-6 py-4 font-semibold text-[#000000]">
                          {order.dealers}
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <span className={getStatusBadge(order.status)}>
                            {order.status}
                          </span>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-9 px-4 rounded-lg border border-neutral-300 b3 text-base font-sans text-gray-900 flex items-center gap-1 shadow-sm hover:border-red-100 focus:ring-2 focus:ring-red-100"
                              >
                                Mark Action
                                <ChevronDown className="h-4 w-4 ml-1" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="w-40 rounded-lg shadow-lg border border-neutral-200 p-1 font-red-hat b3 text-base"
                            >
                              <DropdownMenuItem 
                                className="b3 text-base font-red-hat flex items-center gap-2 rounded hover:bg-neutral-100 cursor-pointer"
                                onClick={() => handleViewProducts(order)}
                              >
                                <Eye className="h-4 w-4" />
                                View Products
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="b3 text-base font-red-hat flex items-center gap-2 rounded hover:bg-neutral-100 cursor-pointer"
                                onClick={() => handleMarkAsPacked(order)}
                              >
                                Packed
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </div>
          {!loading && !error && paginatedData.length > 0 && totalPages > 1 && (
            <DynamicPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={filteredOrders.length}
              itemsPerPage={itemsPerPage}
            />
          )}
        </CardContent>
        {/* Empty State */}
        {paginatedData.length === 0 && !loading && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <p className="text-gray-500 text-lg mb-2">No orders found</p>
            <p className="text-gray-400 text-sm">
              Try adjusting your search terms
            </p>
          </div>
        )}
      </Card>

      {/* Dealer Products Modal */}
      <DealerProductsModal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        products={selectedOrderProducts}
        orderId={selectedOrderId}
      />
    </div>
  );
}
