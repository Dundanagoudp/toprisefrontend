"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Filter,
  Download,
  Plus,
  RefreshCw,
  Search,
  Calendar,
  User,
  Package,
  TrendingUp,
  AlertCircle,
  FileText,
  MoreHorizontal,
  ArrowUpDown,
  CalendarDays,
  Tag,
  Users,
  BarChart3,
  Activity,
  Target,
  Zap,
  Clock3,
  CheckSquare,
  XSquare,
  Pause,
  Play,
} from "lucide-react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import SearchInput from "@/components/common/search/SearchInput";
import DynamicButton from "@/components/common/button/button";
import DynamicPagination from "@/components/common/pagination/DynamicPagination";
import useDebounce from "@/utils/useDebounce";
import {
  getProductRequests,
  getProductRequestStats,
  approveProductRequest,
  rejectProductRequest,
  putRequestInReview,
  bulkApproveProductRequests,
  bulkRejectProductRequests,
  exportProductRequests,
} from "@/service/product-request-service";
import { approveSingleProduct, rejectSingleProduct } from "@/service/product-Service";
import {
  ProductRequest,
  ProductRequestStats,
  ProductRequestFilters,
  ApprovalStatsResponse,
} from "@/types/product-request-Types";
import { useToast as useGlobalToast } from "@/components/ui/toast";

export default function ProductRequests() {
  const router = useRouter();
  const { showToast } = useGlobalToast();
  
  // State management
  const [requests, setRequests] = useState<ProductRequest[]>([]);
  const [stats, setStats] = useState<ApprovalStatsResponse['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRangeLoading, setDateRangeLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;
  
  // Filter states
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  
  // Selection state
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  
  // Dialog states
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string>("");
  const [rejectNotes, setRejectNotes] = useState("");
  const [reviewNotes, setReviewNotes] = useState("");
  
  // Debounced search
  const { debouncedCallback: debouncedSearch } = useDebounce(
    (query: string) => {
      setSearchQuery(query);
      setCurrentPage(1);
    },
    500
  );

  // Fetch requests
  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filters: ProductRequestFilters = {
        search: searchQuery || undefined,
        status: selectedStatus !== "all" ? selectedStatus as any : undefined,
        requestType: selectedType !== "all" ? selectedType as any : undefined,
        priority: selectedPriority !== "all" ? selectedPriority as any : undefined,
        startDate: dateRange.from?.toISOString(),
        endDate: dateRange.to?.toISOString(),
      };

      console.log('Fetching requests with filters:', filters);
      console.log('Date range:', dateRange);

      const response = await getProductRequests(currentPage, itemsPerPage, filters);
      
      if (response.success) {
        // Handle the actual API response structure
        const products = response.data.products || response.data || [];
        setRequests(products);
        setTotalPages(response.data.pagination?.pages || 1);
        setTotalItems(response.data.pagination?.total || products.length);
        console.log('Fetched products:', products.length);
      } else {
        setRequests([]);
        setTotalPages(1);
        setTotalItems(0);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
             setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, selectedStatus, selectedType, selectedPriority, dateRange]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      console.log('Fetching product request stats...');
      const response = await getProductRequestStats();
      
      if (response.success) {
        console.log('Stats fetched successfully:', response.data);
        setStats(response.data);
      } else {
        console.error('Failed to fetch stats:', response.message);
        // Fallback to mock stats if API fails
        const mockStats = {
          pending: 0,
          approved: 0,
          rejected: 0,
          total: 0,
          approvalRate: "0.00",
          rejectionRate: "0.00",
        };
        setStats(mockStats);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      showToast("Failed to load statistics", "error");
      
      // Fallback to mock stats on error
      const mockStats = {
        pending: 0,
        approved: 0,
        rejected: 0,
        total: 0,
        approvalRate: "0.00",
        rejectionRate: "0.00",
      };
      setStats(mockStats);
    } finally {
      setStatsLoading(false);
    }
  }, [showToast]);

  // Load data on mount and when filters change
  useEffect(() => {
    console.log('Date range changed:', dateRange);
    fetchRequests();
  }, [fetchRequests]);

  // Debug date range changes and trigger API call
  useEffect(() => {
    console.log('Date range state updated:', dateRange);
    // Trigger API call when date range changes
    if (dateRange.from || dateRange.to) {
      console.log('Date range filter applied, fetching data...');
      setDateRangeLoading(true);
      fetchRequests().finally(() => setDateRangeLoading(false));
    }
  }, [dateRange, fetchRequests]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Handle search
  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    debouncedSearch(value);
  };

  // Handle selection
  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedRequests(requests?.map(req => req._id) || []);
    } else {
      setSelectedRequests([]);
    }
  };

  const handleSelectRequest = (requestId: string, checked: boolean) => {
    if (checked) {
      setSelectedRequests(prev => [...prev, requestId]);
    } else {
      setSelectedRequests(prev => prev.filter(id => id !== requestId));
    }
  };

  // Handle actions
  const handleApprove = async (requestId: string) => {
    try {
      await approveSingleProduct(requestId);
      showToast("Product approved successfully", "success");
      fetchRequests();
      fetchStats();
    } catch (error) {
      showToast("Failed to approve product", "error");
    }
  };

  const handleReject = async () => {
    if (!rejectNotes.trim()) {
      showToast("Please provide rejection notes", "error");
      return;
    }

    try {
      await rejectSingleProduct(selectedRequestId, rejectNotes);
      showToast("Product rejected successfully", "success");
      setIsRejectDialogOpen(false);
      setRejectNotes("");
      setSelectedRequestId("");
      fetchRequests();
      fetchStats();
    } catch (error) {
      showToast("Failed to reject product", "error");
    }
  };

  const handleReview = async () => {
    try {
      await putRequestInReview(selectedRequestId, reviewNotes);
      showToast("Request put in review successfully", "success");
      setIsReviewDialogOpen(false);
      setReviewNotes("");
      setSelectedRequestId("");
      fetchRequests();
      fetchStats();
    } catch (error) {
      showToast("Failed to put request in review", "error");
    }
  };

  const handleBulkApprove = async () => {
    if (selectedRequests.length === 0) {
      showToast("Please select products to approve", "error");
      return;
    }

    try {
      const promises = selectedRequests.map(productId => approveSingleProduct(productId));
      await Promise.all(promises);
      showToast("Products approved successfully", "success");
      setSelectedRequests([]);
      setSelectAll(false);
      fetchRequests();
      fetchStats();
    } catch (error) {
      showToast("Failed to approve products", "error");
    }
  };

  const handleBulkReject = async () => {
    if (selectedRequests.length === 0) {
      showToast("Please select products to reject", "error");
      return;
    }

    if (!rejectNotes.trim()) {
      showToast("Please provide rejection notes", "error");
      return;
    }

    try {
      const promises = selectedRequests.map(productId => rejectSingleProduct(productId, rejectNotes));
      await Promise.all(promises);
      showToast("Products rejected successfully", "success");
      setSelectedRequests([]);
      setSelectAll(false);
      setRejectNotes("");
      fetchRequests();
      fetchStats();
    } catch (error) {
      showToast("Failed to reject products", "error");
    }
  };

  const handleExport = async () => {
    try {
      const filters: ProductRequestFilters = {
        search: searchQuery || undefined,
        status: selectedStatus !== "all" ? selectedStatus as any : undefined,
        requestType: selectedType !== "all" ? selectedType as any : undefined,
        priority: selectedPriority !== "all" ? selectedPriority as any : undefined,
        startDate: dateRange.from?.toISOString(),
        endDate: dateRange.to?.toISOString(),
      };

      const blob = await exportProductRequests(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `product_requests_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast("Export completed successfully", "success");
    } catch (error) {
      showToast("Failed to export requests", "error");
    }
  };

  // Utility functions
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "approved":
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case "rejected":
        return <Badge variant="secondary" className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case "in_review":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800"><Eye className="w-3 h-3 mr-1" />In Review</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <Badge variant="destructive"><Zap className="w-3 h-3 mr-1" />Urgent</Badge>;
      case "high":
        return <Badge variant="secondary" className="bg-red-100 text-red-800"><AlertTriangle className="w-3 h-3 mr-1" />High</Badge>;
      case "medium":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock3 className="w-3 h-3 mr-1" />Medium</Badge>;
      case "low":
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckSquare className="w-3 h-3 mr-1" />Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "new_product":
        return <Plus className="w-4 h-4" />;
      case "update_product":
        return <Edit className="w-4 h-4" />;
      case "price_change":
        return <TrendingUp className="w-4 h-4" />;
      case "stock_update":
        return <Package className="w-4 h-4" />;
      case "category_change":
        return <Tag className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy HH:mm");
  };

  const formatNumber = (num: number | undefined) => {
    if (num === undefined || num === null) return '0';
    return new Intl.NumberFormat().format(num);
  };

  if (loading && requests.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
                     <span>Loading products...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchRequests}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Product Approval</h1>
          <p className="text-gray-600 mt-1">
            Review and approve pending products
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button onClick={fetchRequests} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleExport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{formatNumber(stats?.total || 0)}</div>
                <p className="text-xs text-muted-foreground">
                  {formatNumber(stats?.pending || 0)} pending approval
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{formatNumber(stats?.pending || 0)}</div>
                <p className="text-xs text-muted-foreground">
                  Awaiting review
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{formatNumber(stats?.approved || 0)}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.approvalRate || "0.00"}% approval rate
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{formatNumber(stats?.rejected || 0)}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.rejectionRate || "0.00"}% rejection rate
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter products by various criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search Bar - Full Width */}
            <div className="w-full">
              <Label htmlFor="search-filter" className="mb-2 block">Search</Label>
              <SearchInput
                id="search-filter"
                placeholder="Search products..."
                value={searchInput}
                onChange={handleSearchChange}
                onClear={() => {
                  setSearchInput("");
                  setSearchQuery("");
                }}
                className="h-10 w-full"
              />
            </div>

            {/* Filters Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="status-filter">Status</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger id="status-filter" className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="in_review">In Review</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="type-filter">Type</Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger id="type-filter" className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="new_product">New Product</SelectItem>
                    <SelectItem value="update_product">Update Product</SelectItem>
                    <SelectItem value="price_change">Price Change</SelectItem>
                    <SelectItem value="stock_update">Stock Update</SelectItem>
                    <SelectItem value="category_change">Category Change</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="priority-filter">Priority</Label>
              <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                <SelectTrigger id="priority-filter" className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            </div>

            {/* Date Range Filter - Full Width */}
            <div className="w-full">
              <Label htmlFor="date-range-filter" className="mb-2 block">
                Date Range
                {(dateRange.from || dateRange.to) && (
                  <span className="ml-2 text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                    {dateRangeLoading ? 'Filtering...' : 'Filter Active'}
                  </span>
                )}
              </Label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date-range-filter"
                      variant="outline"
                      className={cn(
                        "w-full sm:w-[280px] h-10 justify-start text-left font-normal",
                        !dateRange.from && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "LLL dd, y")} -{" "}
                            {format(dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-50" align="start" side="bottom" sideOffset={4}>
                    <CalendarComponent
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange.from}
                      selected={dateRange}
                      onSelect={(range) => {
                        console.log('Date range selected:', range);
                        setDateRange(range || { from: undefined, to: undefined });
                      }}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
                {(dateRange.from || dateRange.to) && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-10"
                    onClick={() => {
                      console.log('Clearing date range');
                      setDateRange({ from: undefined, to: undefined });
                    }}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedRequests.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                                 <span className="text-sm text-muted-foreground">
                   {selectedRequests.length} product(s) selected
                 </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedRequests([]);
                    setSelectAll(false);
                  }}
                >
                  Clear Selection
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Button onClick={handleBulkApprove} variant="outline" size="sm">
                  <CheckSquare className="w-4 h-4 mr-2" />
                  Approve Selected
                </Button>
                <Button
                  onClick={() => setIsRejectDialogOpen(true)}
                  variant="outline"
                  size="sm"
                >
                  <XSquare className="w-4 h-4 mr-2" />
                  Reject Selected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Requests Table */}
      <Card>
                 <CardHeader>
           <CardTitle>Products</CardTitle>
           <CardDescription>
             {formatNumber(totalItems)} total products
           </CardDescription>
         </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectAll}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-12">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                                                 <span className="ml-2">Loading products...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : requests?.length === 0 ? (
                  <TableRow>
                                         <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                       No products found
                     </TableCell>
                  </TableRow>
                ) : (
                  requests?.map((request) => (
                  <TableRow key={request._id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedRequests.includes(request._id)}
                        onCheckedChange={(checked) =>
                          handleSelectRequest(request._id, checked as boolean)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{request.product_name || 'N/A'}</div>
                        <div className="text-sm text-muted-foreground">
                          {request.sku_code || 'N/A'}
                        </div>
                        <div className="text-sm text-muted-foreground line-clamp-2">
                          {request.admin_notes || 'No description available'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Package className="w-4 h-4" />
                        <span className="capitalize">Product</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getPriorityBadge(request.priority || 'medium')}
                    </TableCell>
                    <TableCell>{getStatusBadge(request.live_status || request.Qc_status || 'pending')}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">System</div>
                        <div className="text-sm text-muted-foreground">
                          Dealer
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatDate(request.createdAt || new Date().toISOString())}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => router.push(`/user/dashboard/requests/${request._id}`)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {(request.live_status || request.Qc_status || 'pending') === "pending" && (
                            <>
                              <DropdownMenuItem
                                onClick={() => handleApprove(request._id)}
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedRequestId(request._id);
                                  setIsRejectDialogOpen(true);
                                }}
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Reject
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedRequestId(request._id);
                                  setIsReviewDialogOpen(true);
                                }}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Put in Review
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuItem
                            onClick={() => router.push(`/user/dashboard/product/productedit/${request._id}`)}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <DynamicPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            showItemsInfo={true}
          />
        </div>
      )}

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Product</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this product.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Enter rejection reason..."
            value={rejectNotes}
            onChange={(e) => setRejectNotes(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleReject} variant="destructive">
              Reject Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Put Product in Review</DialogTitle>
            <DialogDescription>
              Add any notes for the review process.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Enter review notes (optional)..."
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleReview}>
              Put in Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
