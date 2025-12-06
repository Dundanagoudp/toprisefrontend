"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Download,
  RefreshCw,
  CheckSquare,
  XSquare,
  FileText,
} from "lucide-react";
import { format } from "date-fns";
import { SimpleDatePicker } from "@/components/ui/simple-date-picker";
import DynamicButton from "@/components/common/button/button";
import {
  getProductRequestStats,
  putRequestInReview,
  getProductRequests,
} from "@/service/product-request-service";
import { aproveDealerProduct, rejectSingleProduct } from "@/service/product-Service";
import {
  ProductRequestFilters,
  ApprovalStatsResponse,
} from "@/types/product-request-Types";
import { useToast as useGlobalToast } from "@/components/ui/toast";
import PendingProducts from "./tabs/PendingProducts";
import ApprovedProducts from "./tabs/ApprovedProducts";
import RejectedProducts from "./tabs/RejectedProducts";
import { auth } from "@/lib/firebase";
import { useAppSelector } from "@/store/hooks";

type TabType = "Pending" | "Approved" | "Rejected";

export default function ProductRequests() {
  const router = useRouter();
  const { showToast } = useGlobalToast();
  const userid = useAppSelector((state)=>state.auth.user._id)
  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>("Pending");
  
  // State management
  const [stats, setStats] = useState<ApprovalStatsResponse['data'] | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Date range filter state
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
  
  // Export state
  const [isExporting, setIsExporting] = useState(false);
  
  // Dialog states
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string>("");
  const [rejectNotes, setRejectNotes] = useState("");
  const [reviewNotes, setReviewNotes] = useState("");
 


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

  // Load stats on mount
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Handle date range change
  const handleDateRangeChange = (range: { from: Date | undefined; to: Date | undefined }) => {
    console.log('Date range changed:', range);
    setDateRange(range);
  };

  // Trigger refresh for child components
  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
    fetchStats();
  };

  // Handle selection
  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      // Clear selections when checking all - let child component manage its own selections
      setSelectedRequests([]);
    } else {
      setSelectedRequests([]);
    }
  };

  const handleSelectRequest = (requestId: string, checked: boolean) => {
    if (checked) {
      setSelectedRequests(prev => [...prev, requestId]);
    } else {
      setSelectedRequests(prev => prev.filter(id => id !== requestId));
      setSelectAll(false);
    }
  };

  // Handle actions
  const handleApprove = async (requestId: string) => {
    try {
      await aproveDealerProduct(requestId);
      showToast("Product approved successfully", "success");
      handleRefresh();
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
      const response = await rejectSingleProduct({
        productIds: [selectedRequestId],
        reason: rejectNotes,
        rejectedBy: userid,
      });
      showToast("Product rejected successfully", "success");
      setIsRejectDialogOpen(false);
      setRejectNotes("");
      setSelectedRequestId("");
      handleRefresh();
    } catch (error) {
      showToast("Failed to reject product", "error");
    }
  };

  const handleRejectRequest = (requestId: string) => {
    setSelectedRequestId(requestId);
    setIsRejectDialogOpen(true);
  };

  const handleReview = async () => {
    try {
      await putRequestInReview(selectedRequestId, reviewNotes);
      showToast("Request put in review successfully", "success");
      setIsReviewDialogOpen(false);
      setReviewNotes("");
      setSelectedRequestId("");
      handleRefresh();
    } catch (error) {
      showToast("Failed to put request in review", "error");
    }
  };

  const handleReviewRequest = (requestId: string) => {
    setSelectedRequestId(requestId);
    setIsReviewDialogOpen(true);
  };

  const handleBulkApprove = async () => {
    if (selectedRequests.length === 0) {
      showToast("Please select products to approve", "error");
      return;
    }

    try {
      console.log("Bulk approving products:", selectedRequests);
      const promises = selectedRequests.map(productId => aproveDealerProduct(productId));
      await Promise.all(promises);
      showToast("Products approved successfully", "success");
      setSelectedRequests([]);
      setSelectAll(false);
      handleRefresh();
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
      const promises = selectedRequests.map(productId => rejectSingleProduct({
        productIds: [productId],
        reason: rejectNotes,
        rejectedBy: userid,
      }));
      await Promise.all(promises);
      showToast("Products rejected successfully", "success");
      setSelectedRequests([]);
      setSelectAll(false);
      setRejectNotes("");
      setIsRejectDialogOpen(false);
      handleRefresh();
    } catch (error) {
      showToast("Failed to reject products", "error");
    }
  };

  // Format phone number with country code and prevent Excel scientific notation
  const formatPhoneNumber = (phone: string | undefined) => {
    if (!phone) return 'N/A';
    // Remove any spaces, dashes, or special characters
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');
    // If it doesn't start with +, add +91
    let formattedPhone = '';
    if (!cleaned.startsWith('+')) {
      formattedPhone = `+91${cleaned}`;
    } else {
      formattedPhone = cleaned;
    }
    // Prepend with single quote to force Excel text format
    return `'${formattedPhone}`;
  };

  // Generate CSV from product data
  const generateCSV = (products: any[]) => {
    // Debug: Log first product to see actual structure
    if (products.length > 0) {
      console.log("=== CSV Export Debug ===");
      console.log("First product:", products[0]);
      console.log("Available keys:", Object.keys(products[0]));
      console.log("Dealer field:", products[0].dealer);
      console.log("Dealer name field:", products[0].dealer_name);
      console.log("Created by field:", products[0].created_by);
    }
    
    // Prepare CSV headers (removed Dealer Name)
    const headers = [
      "Product_ID",
      "Product_Name",
      "SKU_Code",
      "Category",
      "Brand",
      "Manufacturer",
      "MRP",
      "Selling_Price",
      "Stock_Quantity",
      "Status",
      "QC_Status",
      "Live_Status",
      "Created_Date",
      "Updated_Date",
      "Description"
    ];

    // Helper function to safely get value and handle objects
    const getValue = (value: any, field: string = '') => {
      if (value === null || value === undefined) return 'N/A';
      
      // If it's an object and not a Date
      if (typeof value === 'object' && !(value instanceof Date)) {
        // Try to extract meaningful value from object
        if (value.name) return String(value.name);
        if (value.category_name) return String(value.category_name);
        if (value.brand_name) return String(value.brand_name);
        if (value.trade_name) return String(value.trade_name);
        if (value.legal_name) return String(value.legal_name);
        if (value.title) return String(value.title);
        if (value.value) return String(value.value);
        if (value._id) return String(value._id);
        // Return 'N/A' instead of [object Object]
        return 'N/A';
      }
      
      return String(value);
    };

    // Prepare CSV rows with correct field names
    const rows = products.map((product: any) => {
      // Extract category - could be object or string
      let category = 'N/A';
      if (product.category) {
        if (typeof product.category === 'object') {
          category = product.category.category_name || product.category.name || getValue(product.category);
        } else {
          category = String(product.category);
        }
      } else if (product.category_name) {
        category = String(product.category_name);
      }

      // Extract brand - could be object or string
      let brand = 'N/A';
      if (product.brand) {
        if (typeof product.brand === 'object') {
          brand = product.brand.brand_name || product.brand.name || getValue(product.brand);
        } else {
          brand = String(product.brand);
        }
      } else if (product.brand_name) {
        brand = String(product.brand_name);
      }

      // Extract manufacturer
      let manufacturer = 'N/A';
      if (product.manufacturer) {
        manufacturer = getValue(product.manufacturer);
      } else if (product.manufacturer_part_name) {
        manufacturer = String(product.manufacturer_part_name);
      }

      return [
        getValue(product._id || product.id),
        getValue(product.product_name || product.name || product.productName),
        getValue(product.sku_code || product.sku || product.skuCode),
        category,
        brand,
        manufacturer,
        getValue(product.mrp_with_gst || product.mrp || product.MRP || '0'),
        getValue(product.selling_price || product.sellingPrice || product.price || '0'),
        getValue(product.stock_quantity || product.stockQuantity || product.quantity || '0'),
        getValue(product.status || product.product_status || product.live_status),
        getValue(product.Qc_status || product.qc_status || product.qcStatus),
        getValue(product.live_status || product.liveStatus),
        product.created_at ? format(new Date(product.created_at), "MMM dd, yyyy HH:mm") : 
          (product.createdAt ? format(new Date(product.createdAt), "MMM dd, yyyy HH:mm") : 'N/A'),
        product.updated_at ? format(new Date(product.updated_at), "MMM dd, yyyy HH:mm") : 
          (product.updatedAt ? format(new Date(product.updatedAt), "MMM dd, yyyy HH:mm") : 'N/A'),
        getValue((product.admin_notes || product.description || product.notes || 'N/A')).replace(/[\r\n]+/g, ' ')
      ];
    });

    // Convert to CSV format
    const csvContent = [
      headers.join(','),
      ...rows.map(row => 
        row.map(cell => {
          // Escape quotes and wrap in quotes if contains comma, quote, or newline
          const cellStr = String(cell);
          if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
            return `"${cellStr.replace(/"/g, '""')}"`;
          }
          return cellStr;
        }).join(',')
      )
    ].join('\n');

    return csvContent;
  };

  // Download CSV file
  const downloadCSV = (csvContent: string, filename: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
    a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
  };

  // Export ALL data for active tab
  const handleExport = async () => {
    try {
      setIsExporting(true);
      
      // Build filters based on active tab and date range
      const filters: any = {
        status: activeTab, // "Pending", "Approved", or "Rejected"
      };
      
      if (dateRange.from) {
        filters.startDate = dateRange.from.toISOString();
      }
      if (dateRange.to) {
        filters.endDate = dateRange.to.toISOString();
      }

      // Fetch ALL data for export (not paginated)
      const response = await getProductRequests(1, 10000, filters);
      
      if (!response.success) {
        showToast("Failed to fetch data for export", "error");
        return;
      }
      
      const allProducts = response.data?.products || [];
      
      if (allProducts.length === 0) {
        showToast("No data to export", "error");
        return;
      }
      
      // Generate CSV directly without dealer fetching to avoid 404 errors
      const csvContent = generateCSV(allProducts);
      const statusText = activeTab.toLowerCase();
      const filename = `product_requests_${statusText}_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.csv`;
      
      downloadCSV(csvContent, filename);
      showToast(`CSV exported successfully (${allProducts.length} records)`, "success");
    } catch (error) {
      console.error("Export error:", error);
      showToast("Failed to export data", "error");
    } finally {
      setIsExporting(false);
    }
  };

  const formatNumber = (num: number | undefined) => {
    if (num === undefined || num === null) return '0';
    return new Intl.NumberFormat().format(num);
  };
  

  // ==================================================
// EXPORT FILTERED PRODUCTS (inside this same file)
// ==================================================

const formatOnlyDate = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const handleFrontendExport = async () => {
  try {
    setIsExporting(true);
//     console.log("Export Started...");
//     console.log("EXPORT dateRange.from TYPE →", typeof dateRange.from);
// console.log("EXPORT instanceof Date →", dateRange.from instanceof Date);
// if(dateRange){
//   console.log("EXPORT dateRange.from VALUE →", dateRange.from);
// }else{
//   console.log("EXPORT dateRange is undefined");
// }


    const status = activeTab; // "Approved" | "Pending" | "Rejected"

    // 1️⃣ Define columns ONCE, same for all tabs
    const columns = [
      { label: "Product_Name", key: "product_name" },
      { label: "SKU", key: "sku_code" },
      { label: "Brand", key: "brand.brand_name" },
      { label: "Category", key: "category.category_name" },
      { label: "Subcategory", key: "sub_category.subcategory_name" },
      { label: "Model", key: "model.model_name" },
      { label: "Variant", key: "variant.0.variant_name" },
      { label: "MRP", key: "mrp_with_gst" },
      { label: "Selling_Price", key: "selling_price" },
      { label: "Status", key: "Qc_status" },
    ];

    // 2️⃣ Safely read nested keys
    const getNestedValue = (obj, path) => {
      try {
        return path
          .replace(/\[(\d+)\]/g, ".$1")
          .split(".")
          .reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : ""), obj);
      } catch {
        return "";
      }
    };

    // 3️⃣ Build filters EXACTLY like table filters
    const params = new URLSearchParams();

    params.append("status", status);

    // if (selectedCategoryId) params.append("category", selectedCategoryId);
    // if (selectedSubCategoryId) params.append("subcategory", selectedSubCategoryId);
    // if (selectedBrandId) params.append("brand", selectedBrandId);
    // if (selectedModelId) params.append("model", selectedModelId);
    // if (selectedVariantId) params.append("variant", selectedVariantId);
    // if (minPrice) params.append("min_price", minPrice);
    // if (maxPrice) params.append("max_price", maxPrice);
    // if (sortType) params.append("sort_by", sortType);
    // if (searchQuery) params.append("search", searchQuery);
    

   if (dateRange.from) {
  params.append("startDate", formatOnlyDate(dateRange.from));
}
if (dateRange.to) {
  params.append("endDate", formatOnlyDate(dateRange.to));
}


    console.log("Export Filters →", Object.fromEntries(params.entries()));

    // 4️⃣ API URL
    const url = `/category/products/v1/get/product/for-export?${params.toString()}`;

    // 5️⃣ Fetch products
    const res = await apiClient.get(url);
    const products = res.data?.data?.products || [];

    if (!products.length) {
      showToast("No products found to export", "error");
      return;
    }

    // 6️⃣ Build CSV
    const headerRow = columns.map((c) => c.label).join(",");

    const dataRows = products.map((item) =>
      columns
        .map((col) => {
          const value = getNestedValue(item, col.key);

          // ESCAPE CSV values (fix commas, quotes, newlines)
          if (typeof value === "string") {
            return `"${value.replace(/"/g, '""').replace(/\n/g, " ")}"`;
          }
          return `"${String(value)}"`;
        })
        .join(",")
    );

    const csv = [headerRow, ...dataRows].join("\n");

    // 7️⃣ Download file
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);

    link.download = `products_${status}_${format(new Date(), "yyyy-MM-dd_HH-mm")}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast("Export Successful!", "success");
  } catch (error) {
    console.error("EXPORT ERROR:", error);
    showToast("Export failed", "error");
  }finally {
    setIsExporting(false);
  }
};



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
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button 
  onClick={handleFrontendExport} 
  variant="outline"
  disabled={isExporting}
  className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
>
  {isExporting ? (
    <>
      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
      Exporting...
    </>
  ) : (
    <>
      <Download className="h-4 w-4 mr-2" />
      Export CSV
    </>
  )}
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

      {/* Date Range Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Date Range Filter</CardTitle>
          <CardDescription>Filter products by creation date range</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full">
            <Label htmlFor="date-range-filter" className="mb-2 block">
              Date Range
              {(dateRange.from || dateRange.to) && (
                <span className="ml-2 text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                  Filter Active
                </span>
              )}
            </Label>
            <SimpleDatePicker
              value={dateRange}
              onChange={handleDateRangeChange}
              placeholder="Select date range"
              className="w-full"
            />
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
          <div className="flex items-center justify-between border-b border-gray-200">
            <nav className="flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab("Pending")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "Pending"
                    ? "text-[#C72920] border-[#C72920]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Clock className="w-4 h-4 inline mr-2" />
                Pending
              </button>
              <button
                onClick={() => setActiveTab("Approved")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "Approved"
                    ? "text-[#C72920] border-[#C72920]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <CheckCircle className="w-4 h-4 inline mr-2" />
                Approved
              </button>
              <button
                onClick={() => setActiveTab("Rejected")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "Rejected"
                    ? "text-[#C72920] border-[#C72920]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <XCircle className="w-4 h-4 inline mr-2" />
                Rejected
              </button>
            </nav>
          </div>
        </CardHeader>
        <CardContent>
          {activeTab === "Pending" && (
            <PendingProducts
              dateRange={{ ...dateRange }} 
              selectedRequests={selectedRequests}
              onSelectRequest={handleSelectRequest}
              onSelectAll={handleSelectAll}
              selectAll={selectAll}
              onApprove={handleApprove}
              onReject={handleRejectRequest}
              onReview={handleReviewRequest}
              onRefresh={handleRefresh}
            />
          )}
          {activeTab === "Approved" && (
            <ApprovedProducts
              dateRange={{ ...dateRange }} 
              selectedRequests={selectedRequests}
              onSelectRequest={handleSelectRequest}
              onSelectAll={handleSelectAll}
              selectAll={selectAll}
              onRefresh={handleRefresh}
            />
          )}
          {activeTab === "Rejected" && (
            <RejectedProducts
              dateRange={{ ...dateRange }} 
              selectedRequests={selectedRequests}
              onSelectRequest={handleSelectRequest}
              onSelectAll={handleSelectAll}
              selectAll={selectAll}
              onRefresh={handleRefresh}
            />
          )}
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedRequests.length > 0 
                ? `Reject ${selectedRequests.length} Product(s)` 
                : "Reject Product"}
            </DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting {selectedRequests.length > 0 ? "these products" : "this product"}.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Enter rejection reason..."
            value={rejectNotes}
            onChange={(e) => setRejectNotes(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsRejectDialogOpen(false);
              setRejectNotes("");
            }}>
              Cancel
            </Button>
            <Button 
              onClick={selectedRequests.length > 0 ? handleBulkReject : handleReject} 
              variant="destructive"
            >
              Reject {selectedRequests.length > 0 ? `(${selectedRequests.length})` : "Product"}
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
