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
  exportProductRequests,
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

type TabType = "Pending" | "Approved" | "Rejected";

export default function ProductRequests() {
  const router = useRouter();
  const { showToast } = useGlobalToast();
  
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
      await rejectSingleProduct(selectedRequestId, rejectNotes);
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
      const promises = selectedRequests.map(productId => rejectSingleProduct(productId, rejectNotes));
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

  const handleExport = async () => {
    try {
      const filters: ProductRequestFilters = {
        startDate: dateRange.from?.toISOString(),
        endDate: dateRange.to?.toISOString(),
        status: activeTab.toLowerCase() as 'pending' | 'approved' | 'rejected',
      };

      const blob = await exportProductRequests(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `product_requests_${activeTab.toLowerCase()}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast("Export completed successfully", "success");
    } catch (error) {
      showToast("Failed to export requests", "error");
    }
  };

  const formatNumber = (num: number | undefined) => {
    if (num === undefined || num === null) return '0';
    return new Intl.NumberFormat().format(num);
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
              dateRange={dateRange}
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
              dateRange={dateRange}
              selectedRequests={selectedRequests}
              onSelectRequest={handleSelectRequest}
              onSelectAll={handleSelectAll}
              selectAll={selectAll}
              onRefresh={handleRefresh}
            />
          )}
          {activeTab === "Rejected" && (
            <RejectedProducts
              dateRange={dateRange}
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
