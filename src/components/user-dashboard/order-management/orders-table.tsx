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
// Replaced shadcn Button with shared DynamicButton where used
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { getOrders, assignDealersToOrder, createPicklist, assignPicklistToStaff, updateOrderStatusByDealerReq, fetchPicklists } from "@/service/order-service";
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
  
  // Action modal state
  const [actionOpen, setActionOpen] = useState(false);
  const [activeAction, setActiveAction] = useState<
    "assignDealers" | "createPicklist" | "assignPicklist" | "markPacked" | "viewPicklists" | null
  >(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [dealerId, setDealerId] = useState("");
  const [staffId, setStaffId] = useState("");
  const [totalWeightKg, setTotalWeightKg] = useState<number>(0);
  const [assignmentsJson, setAssignmentsJson] = useState("[]");
  const [skuListJson, setSkuListJson] = useState("[]");
  const [loadingAction, setLoadingAction] = useState(false);
  const [picklistsData, setPicklistsData] = useState<any[]>([]);
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
    route.push(`/user/dashboard/order/orderdetails/${id}`);
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
                      <TableRow key={order.id}>
                        <TableCell className="px-4 py-4 w-8">
                          <Checkbox />
                        </TableCell>
                        <TableCell
                          className="px-6 py-4 font-medium "
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
                              <DynamicButton
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-gray-100"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </DynamicButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="w-48 rounded-lg shadow-lg border border-neutral-200 p-1 font-red-hat b3 text-base"
                            >
                              <DropdownMenuItem 
                                className="b3 text-base font-red-hat flex items-center gap-2 rounded hover:bg-neutral-100" 
                                onClick={() => handleViewOrder(order.id)}
                              >
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
      {/* Action Modal */}
      <Dialog open={actionOpen} onOpenChange={setActionOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {activeAction === "assignDealers" && "Assign Dealers to SKUs"}
              {activeAction === "createPicklist" && "Create Picklist"}
              {activeAction === "assignPicklist" && "Assign Picklist to Staff"}
              {activeAction === "markPacked" && "Mark Order as Packed"}
              {activeAction === "viewPicklists" && "Picklists"}
            </DialogTitle>
          </DialogHeader>

          {activeAction === "assignDealers" && (
            <div className="space-y-3">
              <div>
                <Label>Order ID</Label>
                <Input readOnly value={selectedOrder?.id || ""} />
              </div>
              <div>
                <Label>Assignments (JSON)</Label>
                <Textarea rows={5} value={assignmentsJson} onChange={(e) => setAssignmentsJson(e.target.value)} />
              </div>
              <DynamicButton
                onClick={async () => {
                  try {
                    setLoadingAction(true);
                    const payload = {
                      orderId: selectedOrder?.id,
                      assignments: JSON.parse(assignmentsJson || "[]"),
                    };
                    await assignDealersToOrder(payload);
                    showToast("Dealers assigned", "success");
                    setActionOpen(false);
                  } catch (e) {
                    showToast("Failed to assign dealers", "error");
                  } finally {
                    setLoadingAction(false);
                  }
                }}
                disabled={loadingAction}
              >
                {loadingAction ? "Saving..." : "Assign"}
              </DynamicButton>
            </div>
          )}

          {activeAction === "createPicklist" && (
            <div className="space-y-3">
              <div>
                <Label>Order ID</Label>
                <Input readOnly value={selectedOrder?.id || ""} />
              </div>
              <div>
                <Label>Dealer ID</Label>
                <Input value={dealerId} onChange={(e) => setDealerId(e.target.value)} />
              </div>
              <div>
                <Label>Fulfilment Staff ID</Label>
                <Input value={staffId} onChange={(e) => setStaffId(e.target.value)} />
              </div>
              <div>
                <Label>SKU List (JSON)</Label>
                <Textarea rows={5} value={skuListJson} onChange={(e) => setSkuListJson(e.target.value)} />
              </div>
              <DynamicButton
                onClick={async () => {
                  try {
                    setLoadingAction(true);
                    const payload = {
                      orderId: selectedOrder?.id,
                      dealerId,
                      fulfilmentStaff: staffId,
                      skuList: JSON.parse(skuListJson || "[]"),
                    };
                    await createPicklist(payload);
                    showToast("Picklist created", "success");
                    setActionOpen(false);
                  } catch (e) {
                    showToast("Failed to create picklist", "error");
                  } finally {
                    setLoadingAction(false);
                  }
                }}
                disabled={loadingAction}
              >
                {loadingAction ? "Creating..." : "Create"}
              </DynamicButton>
            </div>
          )}

          {activeAction === "assignPicklist" && (
            <div className="space-y-3">
              <div>
                <Label>Picklist ID</Label>
                <Input value={dealerId} onChange={(e) => setDealerId(e.target.value)} placeholder="picklistId" />
              </div>
              <div>
                <Label>Staff ID</Label>
                <Input value={staffId} onChange={(e) => setStaffId(e.target.value)} />
              </div>
              <DynamicButton
                onClick={async () => {
                  try {
                    setLoadingAction(true);
                    await assignPicklistToStaff({ picklistId: dealerId, staffId });
                    showToast("Picklist assigned", "success");
                    setActionOpen(false);
                  } catch (e) {
                    showToast("Failed to assign picklist", "error");
                  } finally {
                    setLoadingAction(false);
                  }
                }}
                disabled={loadingAction}
              >
                {loadingAction ? "Assigning..." : "Assign"}
              </DynamicButton>
            </div>
          )}

          {activeAction === "markPacked" && (
            <div className="space-y-3">
              <div>
                <Label>Order ID</Label>
                <Input readOnly value={selectedOrder?.id || ""} />
              </div>
              <div>
                <Label>Dealer ID</Label>
                <Input value={dealerId} onChange={(e) => setDealerId(e.target.value)} />
              </div>
              <div>
                <Label>Total Weight (kg)</Label>
                <Input type="number" value={totalWeightKg} onChange={(e) => setTotalWeightKg(parseFloat(e.target.value) || 0)} />
              </div>
              <DynamicButton
                onClick={async () => {
                  try {
                    setLoadingAction(true);
                    await updateOrderStatusByDealerReq({ orderId: selectedOrder?.id, dealerId, total_weight_kg: totalWeightKg });
                    showToast("Order marked as packed", "success");
                    setActionOpen(false);
                  } catch (e) {
                    showToast("Failed to mark packed", "error");
                  } finally {
                    setLoadingAction(false);
                  }
                }}
                disabled={loadingAction}
              >
                {loadingAction ? "Updating..." : "Mark Packed"}
              </DynamicButton>
            </div>
          )}

          {activeAction === "viewPicklists" && (
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {picklistsData.length === 0 ? (
                <p className="text-sm text-gray-600">No picklists found.</p>
              ) : (
                picklistsData.map((p: any) => (
                  <div key={p._id} className="border rounded p-3 text-sm">
                    <div className="font-medium mb-1">{p._id}</div>
                    <div>Order: {p.linkedOrderId}</div>
                    <div>Dealer: {p.dealerId}</div>
                    <div>Scan: {p.scanStatus}</div>
                    <div>Invoice: {p.invoiceGenerated ? "Yes" : "No"}</div>
                  </div>
                ))
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
