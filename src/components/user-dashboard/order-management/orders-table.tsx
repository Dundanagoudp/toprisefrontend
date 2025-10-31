"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Edit,
  Eye,
  MoreHorizontal,
} from "lucide-react";
// Replaced shadcn Button with shared DynamicButton where used
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
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
import OrdersFilters from "@/components/user-dashboard/order-management/OrdersFilters";
import OrderStats from "@/components/user-dashboard/order-management/OrderStats";
// import { useRouter } from "next/navigation";
import EnhancedOrderStatsCards from "@/components/user-dashboard/order-management/EnhancedOrderStatsCards";
import EnhancedOrderFilters from "@/components/user-dashboard/order-management/EnhancedOrderFilters";
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
import {
  getOrders,
  updateOrderStatusByDealerReq,
  fetchPicklists,
  fetchPicklistsByEmployee,
  fetchStaffPicklistStats,
} from "@/service/order-service";
import { fetchEnhancedOrderStats } from "@/service/dashboardServices";
import { EnhancedOrderStatsData, EnhancedOrderStatsQuery } from "@/types/dashboard-Types";
import AssignDealersModal from "@/components/user-dashboard/order-management/module/order-popus/AssignDealersModal";
import CreatePicklist from "@/components/user-dashboard/order-management/module/OrderDetailCards/CreatePicklist";
import { orderResponse } from "@/types/order-Types";
import {
  fetchOrdersFailure,
  fetchOrdersRequest,
  fetchOrdersSuccess,
} from "@/store/slice/order/orderSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getAuthToken } from "@/utils/auth";
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
  status: "Confirmed" | "Assigned" | "Scanning" | "Packed" | "Shipped" | "Delivered" | "Cancelled" | "Returned";
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
  const auth = useAppSelector((state) => state.auth.user);
  const isAuthorized = ["Super-admin", "Fulfillment-Admin", "Fullfillment-Admin"].includes(
    auth?.role
  );
  const [orderDetails, setOrderDetails] = useState<any>(null);
  // Filtered orders must be declared before pagination logic

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Action modal state
  const [actionOpen, setActionOpen] = useState(false);
  const [activeAction, setActiveAction] = useState<
    "assignDealers" | "createPicklist" | "markPacked" | "viewPicklists" | null
  >(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [dealerId, setDealerId] = useState("");
  const [staffId, setStaffId] = useState("");
  const [totalWeightKg, setTotalWeightKg] = useState<number>(0);
  const [assignmentsJson, setAssignmentsJson] = useState("[]");
  const [skuListJson, setSkuListJson] = useState("[]");
  const [loadingAction, setLoadingAction] = useState(false);
  const [picklistsData, setPicklistsData] = useState<any[]>([]);

  // Sorting state - default sort by date (newest first)
  const [sortField, setSortField] = useState<string>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Orders filters state
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPayment, setFilterPayment] = useState("all");
  const [filterOrderSource, setFilterOrderSource] = useState("all");

  // Enhanced filters state
  const [enhancedFilters, setEnhancedFilters] = useState({
    search: "",
    status: "all",
    paymentMethod: "all",
    orderSource: "all",
    dateRange: { from: undefined, to: undefined },
    orderValue: { min: "", max: "" },
    customerType: "all",
    region: "all",
    assignedDealer: "all",
  });
  
  // Force refresh state for date range changes
  const [dateRangeKey, setDateRangeKey] = useState(0);
  
  // Handle enhanced filter changes
  const handleEnhancedFiltersChange = (newFilters: any) => {
    console.log("Enhanced filters changed:", newFilters);
    setEnhancedFilters(newFilters);
    
    // Update legacy filters for backward compatibility
    setFilterStatus(newFilters.status);
    setFilterPayment(newFilters.paymentMethod);
    setFilterOrderSource(newFilters.orderSource);
    setSearchQuery(newFilters.search);
    
    // Force refresh for date range changes
    if (newFilters.dateRange.from !== enhancedFilters.dateRange.from || 
        newFilters.dateRange.to !== enhancedFilters.dateRange.to) {
      setDateRangeKey(prev => prev + 1);
    }

    // Always reset to first page when filters change to ensure full page size on first render
    if (currentPage !== 1) setCurrentPage(1);
  };
  
  // Force re-render when date range changes
  useEffect(() => {
    console.log("Date range key changed, forcing re-render:", dateRangeKey);
  }, [dateRangeKey]);

  // Reset pagination on key filter changes to avoid short first page (e.g., Razorpay)
  useEffect(() => {
    setCurrentPage(1);
  }, [filterPayment, enhancedFilters.paymentMethod, filterStatus, filterOrderSource, searchQuery]);
  
  // Enhanced order stats state
  const [enhancedOrderStats, setEnhancedOrderStats] = useState<EnhancedOrderStatsData | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsFilters, setStatsFilters] = useState<EnhancedOrderStatsQuery>({});
  const [staffPicklistStats, setStaffPicklistStats] = useState<any>(null);
  
  // Search + Sort combined
  const filteredOrders = useMemo(() => {
    let list = ordersState;
    
    // Apply enhanced filters first (they take precedence)
    if (enhancedFilters.search) {
      const q = enhancedFilters.search.toLowerCase();
      list = list.filter(
        (order: any) =>
          order.orderId?.toLowerCase().includes(q) ||
          order.customer?.toLowerCase().includes(q) ||
          order.number?.toLowerCase().includes(q)
      );
    } else if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (order: any) =>
          order.orderId?.toLowerCase().includes(q) ||
          order.customer?.toLowerCase().includes(q) ||
          order.number?.toLowerCase().includes(q)
      );
    }
    
    // Apply enhanced status filter
    if (enhancedFilters.status !== "all") {
      const fs = enhancedFilters.status.toLowerCase();
      list = list.filter(
        (o: any) => String(o.status || "").toLowerCase() === fs
      );
    } else if (filterStatus !== "all") {
      const fs = filterStatus.toLowerCase();
      list = list.filter(
        (o: any) => String(o.status || "").toLowerCase() === fs
      );
    }
    
    // Apply enhanced payment filter
    if (enhancedFilters.paymentMethod !== "all") {
      const fp = enhancedFilters.paymentMethod.toLowerCase();
      list = list.filter(
        (o: any) => String(o.payment || "").toLowerCase() === fp
      );
    } else if (filterPayment !== "all") {
      const fp = filterPayment.toLowerCase();
      list = list.filter(
        (o: any) => String(o.payment || "").toLowerCase() === fp
      );
    }
    
    // Apply enhanced order source filter
    if (enhancedFilters.orderSource !== "all") {
      const fsr = enhancedFilters.orderSource.toLowerCase();
      list = list.filter(
        (o: any) => String(o.orderSource || "").toLowerCase() === fsr
      );
    } else if (filterOrderSource !== "all") {
      const fsr = filterOrderSource.toLowerCase();
      list = list.filter(
        (o: any) => String(o.orderSource || "").toLowerCase() === fsr
      );
    }
    
    // Apply date range filter
    if (enhancedFilters.dateRange.from || enhancedFilters.dateRange.to) {
      console.log("Date range filter applied:", {
        from: enhancedFilters.dateRange.from,
        to: enhancedFilters.dateRange.to,
        totalOrders: list.length
      });
      
      list = list.filter((order: any) => {
        // Get order date and normalize to start of day for comparison
        const orderDateStr = order.createdAt || order.orderDate || order.date;
        if (!orderDateStr) return false;
        
        const orderDate = new Date(orderDateStr);
        const orderDateOnly = new Date(orderDate.getFullYear(), orderDate.getMonth(), orderDate.getDate());
        
        const fromDate = enhancedFilters.dateRange.from;
        const toDate = enhancedFilters.dateRange.to;
        
        if (fromDate && toDate) {
          // Normalize dates to start of day for proper comparison
          const fromDateOnly = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
          const toDateOnly = new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate());
          
          const isInRange = orderDateOnly >= fromDateOnly && orderDateOnly <= toDateOnly;
          console.log("Date comparison:", {
            orderDate: orderDateOnly.toISOString().split('T')[0],
            fromDate: fromDateOnly.toISOString().split('T')[0],
            toDate: toDateOnly.toISOString().split('T')[0],
            isInRange
          });
          
          return isInRange;
        } else if (fromDate) {
          const fromDateOnly = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
          return orderDateOnly >= fromDateOnly;
        } else if (toDate) {
          const toDateOnly = new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate());
          return orderDateOnly <= toDateOnly;
        }
        return true;
      });
      
      console.log("Filtered orders count:", list.length);
    }
    
    // Apply order value filter
    if (enhancedFilters.orderValue.min || enhancedFilters.orderValue.max) {
      list = list.filter((order: any) => {
        const orderValue = parseFloat(String(order.value).replace(/[^0-9.-]+/g, "")) || 0;
        const minValue = parseFloat(enhancedFilters.orderValue.min) || 0;
        const maxValue = parseFloat(enhancedFilters.orderValue.max) || Infinity;
        
        return orderValue >= minValue && orderValue <= maxValue;
      });
    }
    
    // Apply customer type filter
    if (enhancedFilters.customerType !== "all") {
      list = list.filter((order: any) => {
        const customerType = order.customerType || order.customer_type || "individual";
        return customerType.toLowerCase() === enhancedFilters.customerType.toLowerCase();
      });
    }
    
    // Apply region filter
    if (enhancedFilters.region !== "all") {
      list = list.filter((order: any) => {
        const region = order.region || order.customer_region || "";
        return region.toLowerCase() === enhancedFilters.region.toLowerCase();
      });
    }
    
    // Apply assigned dealer filter
    if (enhancedFilters.assignedDealer !== "all") {
      if (enhancedFilters.assignedDealer === "unassigned") {
        list = list.filter((order: any) => !order.assignedDealer && !order.dealer);
      } else {
        list = list.filter((order: any) => {
          const assignedDealer = order.assignedDealer || order.dealer || "";
          return assignedDealer.toLowerCase() === enhancedFilters.assignedDealer.toLowerCase();
        });
      }
    }
    if (sortField) {
      list = [...list].sort((a: any, b: any) => {
        let aValue: any;
        let bValue: any;
        switch (sortField) {
          case "orderId":
            aValue = a.orderId?.toLowerCase() || "";
            bValue = b.orderId?.toLowerCase() || "";
            break;
          case "date":
            aValue = new Date(a.orderDate).getTime();
            bValue = new Date(b.orderDate).getTime();
            break;
          case "customer":
            aValue = a.customer?.toLowerCase() || "";
            bValue = b.customer?.toLowerCase() || "";
            break;
          case "number":
            aValue = a.number?.toLowerCase() || "";
            bValue = b.number?.toLowerCase() || "";
            break;
          case "payment":
            aValue = a.payment?.toLowerCase() || "";
            bValue = b.payment?.toLowerCase() || "";
            break;
          case "value":
            aValue = parseFloat(String(a.value).replace(/[^0-9.-]+/g, "")) || 0;
            bValue = parseFloat(String(b.value).replace(/[^0-9.-]+/g, "")) || 0;
            break;
          case "skus":
            aValue = Array.isArray(a.skus) ? a.skus.length : 1;
            bValue = Array.isArray(b.skus) ? b.skus.length : 1;
            break;
          case "dealers":
            aValue = a.dealers || 0;
            bValue = b.dealers || 0;
            break;
          case "status":
            aValue = a.status?.toLowerCase() || "";
            bValue = b.status?.toLowerCase() || "";
            break;
          default:
            return 0;
        }
        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortDirection === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      });
    }
    return list;
  }, [
    ordersState,
    searchQuery,
    filterStatus,
    filterPayment,
    filterOrderSource,
    enhancedFilters,
    sortField,
    sortDirection,
    dateRangeKey,
  ]);
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
        // If fulfillment staff, load picklists assigned to employee
        if (auth?.role === "Fulfillment-Staff") {
          console.log("[OrdersTable] Role=Fulfillment-Staff. Loading picklists by employee.");
          let employeeId = "";
          try {
            const token = getAuthToken();
            if (token) {
              const payloadBase64 = token.split(".")[1];
              if (payloadBase64) {
                const base64 = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
                const paddedBase64 = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
                const payloadJson = atob(paddedBase64);
                const payload = JSON.parse(payloadJson);
                employeeId = payload.id || payload.userId || "";
                console.log("[OrdersTable] Decoded employeeId=", employeeId);
              }
            }
          } catch (e) {
            console.error("Failed to extract employee id from token", e);
          }
          if (!employeeId) {
            throw new Error("Employee ID not found for fulfillment staff");
          }

          console.log("[OrdersTable] Calling fetchPicklistsByEmployee with:", employeeId);
          const response = await fetchPicklistsByEmployee(employeeId);
          console.log("[OrdersTable] fetchPicklistsByEmployee response:", response);
          const picklists = response?.data?.data || [];
          console.log("[OrdersTable] Picklists count:", Array.isArray(picklists) ? picklists.length : 0);
          const mappedOrders = picklists.map((p: any) => {
            const o = p.orderInfo || {};
            const skuDetails = o.skuDetails || p.skuList || [];
            const mappedSkus = (skuDetails || []).map((sku: any) => ({
              sku: sku.sku,
              quantity: sku.quantity,
              productId: sku.productId,
              productName: sku.productName,
              _id: sku._id || sku.sku,
            }));
            return {
              id: o._id || p.linkedOrderId || p._id,
              orderId: o.orderId || p.linkedOrderId,
              orderDate: o.createdAt ? new Date(o.createdAt).toLocaleDateString() : new Date(p.createdAt || Date.now()).toLocaleDateString(),
              customer: o.customerDetails?.name || "",
              number: o.customerDetails?.phone || "",
              payment: o.paymentType || "",
              value: o.order_Amount != null ? `₹${o.order_Amount}` : "₹0",
              skus: mappedSkus,
              skusCount: mappedSkus.length,
              dealers: Array.isArray(o.dealerMapping) ? o.dealerMapping.length : 0,
              dealerMapping: o.dealerMapping || [],
              status: p.scanStatus || o.status || "",
              deliveryCharges: o.deliveryCharges,
              GST: o.GST,
              orderType: o.orderType,
              orderSource: o.orderSource,
              auditLogs: o.auditLogs || [],
              createdAt: p.createdAt || o.createdAt,
              updatedAt: p.updatedAt || o.updatedAt,
            };
          });
          console.log("[OrdersTable] Mapped orders count:", mappedOrders.length);
          dispatch(fetchOrdersSuccess(mappedOrders));
          setOrders(picklists);
          timer = setTimeout(() => {
            setOrders(picklists);
          }, 2000);
        } else {
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
            status: order.status,
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
        }
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

  const refreshOrders = useCallback(async () => {
    try {
      dispatch(fetchOrdersRequest());
      if (auth?.role === "Fulfillment-Staff") {
        console.log("[OrdersTable.refresh] Role=Fulfillment-Staff. Loading picklists by employee.");
        let employeeId = "";
        try {
          const token = getAuthToken();
          if (token) {
            const payloadBase64 = token.split(".")[1];
            if (payloadBase64) {
              const base64 = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
              const paddedBase64 = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
              const payloadJson = atob(paddedBase64);
              const payload = JSON.parse(payloadJson);
              employeeId = payload.id || payload.userId || "";
              console.log("[OrdersTable.refresh] Decoded employeeId=", employeeId);
            }
          }
        } catch {}
        if (!employeeId) throw new Error("Employee ID not found for fulfillment staff");

        console.log("[OrdersTable.refresh] Calling fetchPicklistsByEmployee with:", employeeId);
        const response = await fetchPicklistsByEmployee(employeeId);
        console.log("[OrdersTable.refresh] fetchPicklistsByEmployee response:", response);
        const picklists = response?.data?.data || [];
        console.log("[OrdersTable.refresh] Picklists count:", Array.isArray(picklists) ? picklists.length : 0);
        const mappedOrders = picklists.map((p: any) => {
          const o = p.orderInfo || {};
          const skuDetails = o.skuDetails || p.skuList || [];
          const mappedSkus = (skuDetails || []).map((sku: any) => ({
            sku: sku.sku,
            quantity: sku.quantity,
            productId: sku.productId,
            productName: sku.productName,
            _id: sku._id || sku.sku,
          }));
          return {
            id: o._id || p.linkedOrderId || p._id,
            orderId: o.orderId || p.linkedOrderId,
            orderDate: o.createdAt ? new Date(o.createdAt).toLocaleDateString() : new Date(p.createdAt || Date.now()).toLocaleDateString(),
            customer: o.customerDetails?.name || "",
            number: o.customerDetails?.phone || "",
            payment: o.paymentType || "",
            value: o.order_Amount != null ? `₹${o.order_Amount}` : "₹0",
            skus: mappedSkus,
            skusCount: mappedSkus.length,
            dealers: Array.isArray(o.dealerMapping) ? o.dealerMapping.length : 0,
            dealerMapping: o.dealerMapping || [],
            status: p.scanStatus || o.status || "",
            deliveryCharges: o.deliveryCharges,
            GST: o.GST,
            orderType: o.orderType,
            orderSource: o.orderSource,
            auditLogs: o.auditLogs || [],
            createdAt: p.createdAt || o.createdAt,
            updatedAt: p.updatedAt || o.updatedAt,
          };
        });
        console.log("[OrdersTable.refresh] Mapped orders count:", mappedOrders.length);
        dispatch(fetchOrdersSuccess(mappedOrders));
      } else {
        const response = await getOrders();
        const mappedOrders = response.data.map((order: any) => ({
          id: order._id,
          orderId: order.orderId,
          orderDate: new Date(order.orderDate).toLocaleDateString(),
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
          status: order.status,
          deliveryCharges: order.deliveryCharges,
          GST: order.GST,
          orderType: order.orderType,
          orderSource: order.orderSource,
          auditLogs: order.auditLogs || [],
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
        }));
        dispatch(fetchOrdersSuccess(mappedOrders));
      }
    } catch (error) {
      dispatch(fetchOrdersFailure(error as any));
    }
  }, [dispatch]);

  // Fetch enhanced order stats
  const fetchEnhancedStats = useCallback(async (queryParams: EnhancedOrderStatsQuery = {}) => {
    try {
      setStatsLoading(true);
      if (auth?.role === "Fulfillment-Staff") {
        // For Fulfillment-Staff, fetch picklist stats instead
        let staffId = "";
        try {
          const token = getAuthToken();
          if (token) {
            const payloadBase64 = token.split(".")[1];
            if (payloadBase64) {
              const base64 = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
              const paddedBase64 = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
              const payloadJson = atob(paddedBase64);
              const payload = JSON.parse(payloadJson);
              staffId = payload.id || payload.userId || "";
              console.log("[OrdersTable.stats] staffId=", staffId);
            }
          }
        } catch (e) {
          console.error("[OrdersTable.stats] Failed to extract staff id", e);
        }
        if (!staffId) {
          setStaffPicklistStats(null);
        } else {
          const res = await fetchStaffPicklistStats(staffId);
          console.log("[OrdersTable.stats] staffPicklistStats response:", res);
          setStaffPicklistStats(res?.data || null);
        }
      } else {
        const response = await fetchEnhancedOrderStats(queryParams);
        setEnhancedOrderStats(response.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setStatsLoading(false);
    }
  }, [auth?.role]);


  const handleExport = () => {
    // Implement export functionality
    showToast("Export functionality will be implemented", "info");
  };

  // Enhanced stats filter handlers
  const handleStatsFilterChange = (key: keyof EnhancedOrderStatsQuery, value: any) => {
    setStatsFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleStatsRefresh = () => {
    fetchEnhancedStats(statsFilters);
  };

  const handleClearStatsFilters = () => {
    setStatsFilters({});
  };

  // Fetch enhanced order stats on component mount and when filters change
  useEffect(() => {
    fetchEnhancedStats(statsFilters);
  }, [fetchEnhancedStats, statsFilters]);

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded text-xs font-medium";
    const s = (status || "").toLowerCase();
    if (s === "confirmed") {
      return `${baseClasses} text-green-700 bg-green-100`;
    }
    if (s === "assigned") {
      return `${baseClasses} text-blue-700 bg-blue-100`;
    }
    if (s === "scanning") {
      return `${baseClasses} text-purple-700 bg-purple-100`;
    }
    if (s === "packed") {
      return `${baseClasses} text-indigo-700 bg-indigo-100`;
    }
    if (s === "shipped") {
      return `${baseClasses} text-cyan-700 bg-cyan-100`;
    }
    if (s === "delivered" || s === "completed") {
      return `${baseClasses} text-emerald-700 bg-emerald-100`;
    }
    if (s === "cancelled" || s === "canceled") {
      return `${baseClasses} text-red-700 bg-red-100`;
    }
    if (s === "returned") {
      return `${baseClasses} text-orange-700 bg-orange-100`;
    }
    return `${baseClasses} text-gray-700 bg-gray-100`;
  };

  return (
    <div className="w-full space-y-6">
      {/* Enhanced Order Statistics */}
      {auth?.role === "Fulfillment-Staff" ? (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Picklists Summary</CardTitle>
            <CardDescription>Stats for your assigned picklists</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded border">
                <div className="text-sm text-gray-600">Total Picklists</div>
                <div className="text-2xl font-semibold">
                  {(staffPicklistStats?.summary?.totalPicklists) ?? 0}
                </div>
              </div>
              <div className="p-4 rounded border">
                <div className="text-sm text-gray-600">Not Started</div>
                <div className="text-xl font-semibold">
                  {(() => {
                    const first = Array.isArray(staffPicklistStats?.data?.data) ? staffPicklistStats.data.data[0] : null;
                    return first?.notStarted ?? 0;
                  })()}
                </div>
              </div>
              <div className="p-4 rounded border">
                <div className="text-sm text-gray-600">In Progress</div>
                <div className="text-xl font-semibold">
                  {(() => {
                    const first = Array.isArray(staffPicklistStats?.data?.data) ? staffPicklistStats.data.data[0] : null;
                    return first?.inProgress ?? 0;
                  })()}
                </div>
              </div>
              <div className="p-4 rounded border">
                <div className="text-sm text-gray-600">Completed</div>
                <div className="text-xl font-semibold">
                  {(() => {
                    const first = Array.isArray(staffPicklistStats?.data?.data) ? staffPicklistStats.data.data[0] : null;
                    return first?.completed ?? 0;
                  })()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <EnhancedOrderStatsCards
          stats={enhancedOrderStats}
          loading={statsLoading}
          filters={statsFilters}
          onFilterChange={handleStatsFilterChange}
          onRefresh={handleStatsRefresh}
          onClearFilters={handleClearStatsFilters}
        />
      )}

      {/* Enhanced Filters */}
      <EnhancedOrderFilters
        onFiltersChange={handleEnhancedFiltersChange}
        onExport={handleExport}
        onRefresh={refreshOrders}
        loading={loading}
      />

      {/* Orders Table */}
      <Card className="shadow-sm rounded-none">
        {/* Header */}
        <CardHeader className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-[#000000] font-bold text-lg font-sans">
              <span>Order Management</span>
            </CardTitle>
            <DynamicButton
              text="View Dashboard"
              variant="outline"
              customClassName="px-4 py-2 text-sm"
              onClick={() => route.push("/user/dashboard/orders-dashboard")}
            />
          </div>

          {/* Orders Section Header */}
          <div className="mb-4">
            <CardTitle className="font-sans font-bold text-lg text-[#000000]">
              Orders
            </CardTitle>
            <CardDescription className="text-sm text-[#737373] font-medium font-sans">
              Manage your Orders details
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="hidden sm:block overflow-x-auto">
            <Table className="min-w-full table-fixed">
              <TableHeader>
                <TableRow className="border-b  border-[#E5E5E5] bg-gray-50/50">
                  <TableHead className="px-4 py-4 w-8 font-[Red Hat Display]">
                    <Checkbox
                      // checked={allSelected}
                      // onCheckedChange={handleSelectAll}
                      aria-label="Select all"
                    />
                  </TableHead>

                  <TableHead
                    className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display] cursor-pointer select-none"
                    onClick={() => {
                      setSortField((prev) =>
                        prev === "orderId" ? "orderId" : "orderId"
                      );
                      setSortDirection((prev) =>
                        sortField === "orderId"
                          ? prev === "asc"
                            ? "desc"
                            : "asc"
                          : "asc"
                      );
                    }}
                    title="Sort by Order ID"
                  >
                    <span className="inline-flex items-center gap-1">
                      Order ID
                      {sortField === "orderId" &&
                        (sortDirection === "asc" ? (
                          <ChevronUp className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        ))}
                    </span>
                  </TableHead>
                  <TableHead
                    className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display] cursor-pointer select-none"
                    onClick={() => {
                      setSortField((prev) =>
                        prev === "date" ? "date" : "date"
                      );
                      setSortDirection((prev) =>
                        sortField === "date"
                          ? prev === "asc"
                            ? "desc"
                            : "asc"
                          : "asc"
                      );
                    }}
                    title="Sort by Date"
                  >
                    <span className="inline-flex items-center gap-1">
                      Date
                      {sortField === "date" &&
                        (sortDirection === "asc" ? (
                          <ChevronUp className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        ))}
                    </span>
                  </TableHead>
                  <TableHead
                    className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display] cursor-pointer select-none"
                    onClick={() => {
                      setSortField((prev) =>
                        prev === "customer" ? "customer" : "customer"
                      );
                      setSortDirection((prev) =>
                        sortField === "customer"
                          ? prev === "asc"
                            ? "desc"
                            : "asc"
                          : "asc"
                      );
                    }}
                    title="Sort by Customer"
                  >
                    <span className="inline-flex items-center gap-1">
                      Customer
                      {sortField === "customer" &&
                        (sortDirection === "asc" ? (
                          <ChevronUp className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        ))}
                    </span>
                  </TableHead>
                  <TableHead
                    className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display] cursor-pointer select-none"
                    onClick={() => {
                      setSortField((prev) =>
                        prev === "number" ? "number" : "number"
                      );
                      setSortDirection((prev) =>
                        sortField === "number"
                          ? prev === "asc"
                            ? "desc"
                            : "asc"
                          : "asc"
                      );
                    }}
                    title="Sort by Number"
                  >
                    <span className="inline-flex items-center gap-1">
                      Number
                      {sortField === "number" &&
                        (sortDirection === "asc" ? (
                          <ChevronUp className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        ))}
                    </span>
                  </TableHead>
                  <TableHead
                    className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display] cursor-pointer select-none"
                    onClick={() => {
                      setSortField((prev) =>
                        prev === "payment" ? "payment" : "payment"
                      );
                      setSortDirection((prev) =>
                        sortField === "payment"
                          ? prev === "asc"
                            ? "desc"
                            : "asc"
                          : "asc"
                      );
                    }}
                    title="Sort by Payment"
                  >
                    <span className="inline-flex items-center gap-1">
                      Payment
                      {sortField === "payment" &&
                        (sortDirection === "asc" ? (
                          <ChevronUp className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        ))}
                    </span>
                  </TableHead>
                  <TableHead
                    className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display] cursor-pointer select-none"
                    onClick={() => {
                      setSortField((prev) =>
                        prev === "value" ? "value" : "value"
                      );
                      setSortDirection((prev) =>
                        sortField === "value"
                          ? prev === "asc"
                            ? "desc"
                            : "asc"
                          : "asc"
                      );
                    }}
                    title="Sort by Value"
                  >
                    <span className="inline-flex items-center gap-1">
                      Value
                      {sortField === "value" &&
                        (sortDirection === "asc" ? (
                          <ChevronUp className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        ))}
                    </span>
                  </TableHead>
                  <TableHead
                    className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display] cursor-pointer select-none"
                    onClick={() => {
                      setSortField((prev) =>
                        prev === "skus" ? "skus" : "skus"
                      );
                      setSortDirection((prev) =>
                        sortField === "skus"
                          ? prev === "asc"
                            ? "desc"
                            : "asc"
                          : "asc"
                      );
                    }}
                    title="Sort by SKUs count"
                  >
                    <span className="inline-flex items-center gap-1">
                      No.of Skus
                      {sortField === "skus" &&
                        (sortDirection === "asc" ? (
                          <ChevronUp className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        ))}
                    </span>
                  </TableHead>
                  <TableHead
                    className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display] cursor-pointer select-none"
                    onClick={() => {
                      setSortField((prev) =>
                        prev === "dealers" ? "dealers" : "dealers"
                      );
                      setSortDirection((prev) =>
                        sortField === "dealers"
                          ? prev === "asc"
                            ? "desc"
                            : "asc"
                          : "asc"
                      );
                    }}
                    title="Sort by Dealers"
                  >
                    <span className="inline-flex items-center gap-1">
                      Dealer
                      {sortField === "dealers" &&
                        (sortDirection === "asc" ? (
                          <ChevronUp className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        ))}
                    </span>
                  </TableHead>
                  <TableHead
                    className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display] cursor-pointer select-none"
                    onClick={() => {
                      setSortField((prev) =>
                        prev === "status" ? "status" : "status"
                      );
                      setSortDirection((prev) =>
                        sortField === "status"
                          ? prev === "asc"
                            ? "desc"
                            : "asc"
                          : "asc"
                      );
                    }}
                    title="Sort by Status"
                  >
                    <span className="inline-flex items-center gap-1">
                      Status
                      {sortField === "status" &&
                        (sortDirection === "asc" ? (
                          <ChevronUp className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        ))}
                    </span>
                  </TableHead>
                  {isAuthorized && (
                    <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display]">
                      Actions
                    </TableHead>
                  )}
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
                          className="px-6 py-4 font-medium max-w-[160px] truncate cursor-pointer"
                          title={order.orderId}
                          onClick={() => handleViewOrder(order.id)}
                        >
                          {order.orderId}
                        </TableCell>
                        <TableCell className="px-6 py-4 font-semibold text-[#000000] font-sans whitespace-nowrap">
                          {order.orderDate}
                        </TableCell>
                        <TableCell
                          className="px-6 py-4 font-semibold text-[#000000] max-w-[180px] truncate"
                          title={order.customer}
                        >
                          {order.customer}
                        </TableCell>
                        <TableCell
                          className="px-6 py-4 font-semibold text-[#000000] max-w-[160px] truncate"
                          title={order.number}
                        >
                          {order.number}
                        </TableCell>
                        <TableCell
                          className="px-6 py-4 font-semibold text-[#000000] max-w-[140px] truncate"
                          title={order.payment}
                        >
                          {order.payment}
                        </TableCell>
                        <TableCell
                          className="px-6 py-4 font-semibold text-[#000000] max-w-[120px] truncate"
                          title={order.value}
                        >
                          {order.value}
                        </TableCell>
                        <TableCell className="px-6 py-4 font-semibold text-[#000000] whitespace-nowrap">
                          {Array.isArray(order.skus) ? order.skus.length : 1}
                        </TableCell>
                        <TableCell className="px-6 py-4 font-semibold text-[#000000] whitespace-nowrap">
                          {order.dealers}
                        </TableCell>
                        <TableCell className="px-6 py-4 whitespace-nowrap">
                          <span className={getStatusBadge(order.status)}>
                            {order.status}
                          </span>
                        </TableCell>
                        {isAuthorized && (
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
                        )}
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
      <Dialog
        open={
          isAuthorized &&
          actionOpen &&
          (activeAction === "markPacked" || activeAction === "viewPicklists")
        }
        onOpenChange={setActionOpen}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {activeAction === "markPacked" && "Mark Order as Packed"}
              {activeAction === "viewPicklists" && "Picklists"}
            </DialogTitle>
          </DialogHeader>

          {activeAction === "markPacked" && (
            <div className="space-y-3">
              <div>
                <Label>Order ID</Label>
                <Input readOnly value={selectedOrder?.id || ""} />
              </div>
              <div>
                <Label>Dealer ID</Label>
                <Input
                  value={dealerId}
                  onChange={(e) => setDealerId(e.target.value)}
                />
              </div>
              <div>
                <Label>Total Weight (kg)</Label>
                <Input
                  type="number"
                  value={totalWeightKg}
                  onChange={(e) =>
                    setTotalWeightKg(parseFloat(e.target.value) || 0)
                  }
                />
              </div>
              <DynamicButton
                onClick={async () => {
                  try {
                    setLoadingAction(true);
                    await updateOrderStatusByDealerReq({
                      orderId: selectedOrder?.id,
                      dealerId,
                      total_weight_kg: totalWeightKg,
                    });
                    showToast("Order marked as packed", "success");
                    setActionOpen(false);
                    await refreshOrders();
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

      {/* Separated modals */}
      <AssignDealersModal
        open={isAuthorized && actionOpen && activeAction === "assignDealers"}
        onOpenChange={(open) => {
          if (!open) {
            setActionOpen(false);
            setActiveAction(null);
          } else {
            setActionOpen(true);
          }
        }}
        orderId={selectedOrder?.id}
      />
      <CreatePicklist
        open={isAuthorized && actionOpen && activeAction === "createPicklist"}
        onClose={() => {
          setActionOpen(false);
          setActiveAction(null);
        }}
        orderId={selectedOrder?.id || ""}
        defaultDealerId={dealerId}
        defaultSkuList={[]}
      />
      {/* Removed unused AssignPicklistModal */}
    </div>
  );
}
