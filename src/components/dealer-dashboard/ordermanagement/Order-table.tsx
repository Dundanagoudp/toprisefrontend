"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Filter,
  ChevronDown,
  Edit,
  Eye,
  MoreHorizontal,
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast as GlobalToast } from "@/components/ui/toast";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
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
import { getOrders } from "@/service/order-service";
import { orderResponse } from "@/types/order-Types";
import {
  fetchOrdersFailure,
  fetchOrdersRequest,
  fetchOrdersSuccess,
} from "@/store/slice/order/orderSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import useDebounce from "@/utils/useDebounce";
import DynamicPagination from "@/components/common/pagination/DynamicPagination";
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

console.log( "paginatedData", paginatedData);

    const handleViewOrder = (id: string) => {
    setOrderDetails(id);
    // route.push(`/dealer/dashboard/order/orderdetails/${id}`);
    // Clear loading state after navigation (simulated delay)
    setTimeout(() => setOrderDetails(null), 1000);
  };
  // Simulate loading
  useEffect(() => {
    let timer: NodeJS.Timeout;
    async function fetchOrders() {
      dispatch(fetchOrdersRequest());

      try {
        const response = await getOrders();
        const mappedOrders = response.data.map((order: any) => ({
          id: order._id,
          orderId: order.orderId,
          orderDate: new Date(order.orderDate).toLocaleDateString(), // Format as needed
          customer: order.customerDetails?.name || "",
          number: order.customerDetails?.phone || "",
          payment: order.paymentType,
          value: `₹${order.order_Amount}`,
          skus:
            order.skus?.map((sku: any) => ({
              sku: sku.sku,
              quantity: sku.quantity,
              productId: sku.productId,
              productName: sku.productName,
              _id: sku._id,
            })) || [],
          skusCount: order.skus?.length || 0,
          dealers: order.dealerMapping?.length || 0,
          dealerMapping: order.dealerMapping || [],
          status: order.status === "Confirmed" ? "Approved" : "Pending",
          deliveryCharges: order.deliveryCharges,
          GST: order.GST,
          orderType: order.orderType,
          orderSource: order.orderSource,
          auditLogs: order.auditLogs || [],
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
        }));
        dispatch(fetchOrdersSuccess(mappedOrders));
        console.log(response);
        setOrders(response.data);
        timer = setTimeout(() => {
          setOrders(response.data);
        }, 2000);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
        dispatch(fetchOrdersFailure(error));
      }
    }
    fetchOrders();
    return () => {
      if (timer) clearTimeout(timer);
    };
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

  const getStatusBadge = (status: "Pending" | "Approved") => {
    const baseClasses = "px-2 py-1 rounded text-xs font-medium";
    if (status === "Pending") {
      return `${baseClasses} text-yellow-700 bg-yellow-100`;
    }
    return `${baseClasses} text-green-700 bg-green-100`;
  };

  // Loading Skeleton Component

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
              {/* <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search Spare parts"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-gray-200 h-10"
            /> */}

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
                {/* 
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-32 h-10 bg-white border-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Requests">Requests</SelectItem>
                <SelectItem value="Orders">Orders</SelectItem>
                <SelectItem value="Returns">Returns</SelectItem>
              </SelectContent>
            </Select> */}
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
                <TableRow className="border-b  border-[#E5E5E5] bg-gray-50/50">
                  <TableHead className="px-4 py-4 w-8 font-[Red Hat Display]">
                    <Checkbox
                      // checked={allSelected}
                      // onCheckedChange={handleSelectAll}
                      aria-label="Select all"
                    />
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
                    Staus
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
                      <TableRow key={order.id}
                      >
                        <TableCell className="px-4 py-4 w-8">
                          <Checkbox />
                        </TableCell>
                        <TableCell className="px-6 py-4 font-medium "
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
                          {Array.isArray(order.skus)
                            ? order.skus.length
                            : 1}
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
                                {order.status === "Pending" ? "Edit" : "View"}
                                <ChevronDown className="h-4 w-4 ml-1" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="w-40 rounded-lg shadow-lg border border-neutral-200 p-1 font-red-hat b3 text-base"
                            >
                              <DropdownMenuItem className="b3 text-base font-red-hat flex items-center gap-2 rounded hover:bg-neutral-100">
                                <Edit className="h-4 w-4 mr-2" /> Packed
                              </DropdownMenuItem>
                              <DropdownMenuItem className="b3 text-base font-red-hat flex items-center gap-2 rounded hover:bg-neutral-100">
                                <Eye className="h-4 w-4 mr-2" /> View
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
    </div>
  );
}
