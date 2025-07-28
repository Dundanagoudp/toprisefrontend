"use client";

import { useState, useEffect ,useCallback } from "react";
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
import { getOrders } from "@/service/order-service";
import { orderResponse } from "@/types/order-Types";
import {
  fetchOrdersFailure,
  fetchOrdersRequest,
  fetchOrdersSuccess,
} from "@/store/slice/order/orderSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import useDebounce from "@/utils/useDebounce";
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

const mockOrders: Order[] = [
  {
    id: "O56789",
    date: "26 Jun 2025",
    customer: "A. Sharma",
    number: "+91 8523694712",
    payment: "Cod",
    value: "₹1,899",
    skus: 5,
    dealers: 5,
    status: "Pending",
  },
  {
    id: "O56790",
    date: "26 Jun 2025",
    customer: "Maren Dokidis",
    number: "+91 8523694712",
    payment: "UPI",
    value: "₹1,899",
    skus: 15,
    dealers: 15,
    status: "Approved",
  },
  {
    id: "O56789",
    date: "26 Jun 2025",
    customer: "Cristofer Siphron",
    number: "+91 8523694712",
    payment: "Card",
    value: "₹1,899",
    skus: 4,
    dealers: 4,
    status: "Pending",
  },
  {
    id: "O56790",
    date: "26 Jun 2025",
    customer: "Zaire Dorwart",
    number: "+91 8523694712",
    payment: "Cod",
    value: "₹1,899",
    skus: 6,
    dealers: 6,
    status: "Approved",
  },
  {
    id: "O56789",
    date: "26 Jun 2025",
    customer: "Mira Phillips",
    number: "+91 8523694712",
    payment: "UPI",
    value: "₹1,899",
    skus: 8,
    dealers: 8,
    status: "Pending",
  },
  {
    id: "O56790",
    date: "26 Jun 2025",
    customer: "Madelyn Donin",
    number: "+91 8523694712",
    payment: "Card",
    value: "₹1,899",
    skus: 6,
    dealers: 6,
    status: "Approved",
  },
  {
    id: "O56789",
    date: "26 Jun 2025",
    customer: "Cooper Aminoff",
    number: "+91 8523694712",
    payment: "Cod",
    value: "₹1,899",
    skus: 5,
    dealers: 5,
    status: "Pending",
  },
  {
    id: "O56789",
    date: "26 Jun 2025",
    customer: "Nolan Korsgaard",
    number: "+91 8523694712",
    payment: "UPI",
    value: "₹1,899",
    skus: 7,
    dealers: 7,
    status: "Approved",
  },
  {
    id: "O56789",
    date: "26 Jun 2025",
    customer: "Nolan Korsgaard",
    number: "+91 8523694712",
    payment: "Card",
    value: "₹1,899",
    skus: 20,
    dealers: 20,
    status: "Approved",
  },
];

export default function OrdersTable() {
  const [orders, setOrders] = useState<any[]>([]);
  const { showToast } = GlobalToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("Requests");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const dispatch = useAppDispatch();
  const ordersState = useAppSelector((state) => state.order.orders);
  const loading = useAppSelector((state: any) => state.order.loading);
  const error = useAppSelector((state: any) => state.order.error);
  // Filtered orders must be declared before pagination logic

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const filteredOrders = searchQuery
  ? ordersState.filter((order: any) =>
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
          orderDate: new Date(order.orderDate).toLocaleDateString(),
          customer: order.customerDetails?.name || "",
          number: order.customerDetails?.phone || "",
          payment: order.paymentType,
          value: `₹${order.order_Amount}`,
          skus: order.skus?.length || 0,
          dealers: order.dealerMapping?.length || 0,
          status: order.status === "Confirmed" ? "Approved" : "Pending", // Map status as needed
        }));
        dispatch(fetchOrdersSuccess(mappedOrders));
        console.log(response);
        setOrders(response.data);
        timer = setTimeout(() => {
          setOrders(mockOrders);
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
                <TableRow className="border-b border-[#E5E5E5] bg-gray-50/50">
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
                  : paginatedData.map((order, index) => (
                      <TableRow key={order.id + "-" + index}>
                        <TableCell className="px-4 py-4 w-8">
                          <Checkbox />
                        </TableCell>
                        <TableCell className="px-6 py-4 font-medium ">
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
                            ? order.skus
                                .map((sku: any) => sku.productName)
                                .join(", ")
                            : order.skus}
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
                                <Edit className="h-4 w-4 mr-2" /> Edit
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
                {!loading &&
                      !error &&
                      paginatedData.length > 0 &&
                      totalPages > 1 && (
                        <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0 mt-8 px-4 sm:px-6 pb-6">
                          {/* Left: Showing X-Y of Z products */}
                          <div className="text-sm text-gray-600 text-center sm:text-left">
                            {`Showing ${(currentPage - 1) * itemsPerPage + 1}-${Math.min(
                              currentPage * itemsPerPage,
                              paginatedData.length
                            )} of ${paginatedData.length} products`}
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
