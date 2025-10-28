"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  Package,
  TrendingUp,
  Filter,
  Search,
  RefreshCw
} from "lucide-react";
import { 
  getSLAViolationsByDealer, 
  formatViolationTime, 
  getSeverityColor, 
  formatViolationDate,
  type SLAViolation,
  type SLAViolationsResponse,
  type SLAViolationsSummary
} from "@/service/sla-violations-service";
import { useToast } from "@/components/ui/toast";
import { getCookie, getAuthToken } from "@/utils/auth";

interface ViolationCardProps {
  violation: SLAViolation;
}

const ViolationCard = ({ violation }: ViolationCardProps) => {
  const order = violation.order_id || violation.orderDetails;
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <CardTitle className="text-lg">Order {order?.orderId}</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Badge 
              variant="outline" 
              className={getSeverityColor(violation.severity)}
            >
              {violation.severity}
            </Badge>
            <Badge variant={violation.resolved ? "default" : "destructive"}>
              {violation.resolved ? "Resolved" : "Unresolved"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Order Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-900 flex items-center">
              <Package className="h-4 w-4 mr-2" />
              Order Details
            </h4>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">Order ID:</span> {order?.orderId}</p>
              <p><span className="font-medium">Order Date:</span> {formatViolationDate(order?.orderDate || '')}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-900 flex items-center">
              <User className="h-4 w-4 mr-2" />
              Customer Details
            </h4>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">Name:</span> {order?.customerDetails?.name}</p>
              <p><span className="font-medium">Phone:</span> {order?.customerDetails?.phone}</p>
              <p><span className="font-medium">Email:</span> {order?.customerDetails?.email}</p>
            </div>
          </div>
        </div>
        
        {/* Address */}
        <div className="space-y-2">
          <h4 className="font-semibold text-gray-900 flex items-center">
            <MapPin className="h-4 w-4 mr-2" />
            Delivery Address
          </h4>
          <p className="text-sm text-gray-600">
            {order?.customerDetails?.address}, {order?.customerDetails?.pincode}
          </p>
        </div>
        
        {/* SLA Violation Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-900 flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Expected Fulfillment
            </h4>
            <p className="text-sm">{formatViolationDate(violation.expected_fulfillment_time)}</p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-900 flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              Actual Fulfillment
            </h4>
            <p className="text-sm">{formatViolationDate(violation.actual_fulfillment_time)}</p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-900 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Violation Time
            </h4>
            <p className="text-sm font-medium text-orange-600">
              {formatViolationTime(violation.violation_minutes)}
            </p>
          </div>
        </div>
        
        {/* Notes */}
        {violation.notes && (
          <div className="pt-4 border-t">
            <h4 className="font-semibold text-gray-900 mb-2">Notes</h4>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
              {violation.notes}
            </p>
          </div>
        )}
        
        {/* Created Date */}
        <div className="pt-2 border-t">
          <p className="text-xs text-gray-500">
            Violation detected: {formatViolationDate(violation.created_at)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

interface SummaryCardProps {
  summary: SLAViolationsSummary;
  loading: boolean;
}

const SummaryCard = ({ summary, loading }: SummaryCardProps) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="text-center">
                <Skeleton className="h-8 w-16 mx-auto mb-2" />
                <Skeleton className="h-4 w-20 mx-auto" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
          SLA Violations Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {summary.totalViolations || 0}
            </div>
            <div className="text-sm text-gray-600">Total Violations</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {summary.unresolvedViolations || 0}
            </div>
            <div className="text-sm text-gray-600">Unresolved</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {summary.resolvedViolations || 0}
            </div>
            <div className="text-sm text-gray-600">Resolved</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {formatViolationTime(summary.averageViolationMinutes || 0)}
            </div>
            <div className="text-sm text-gray-600">Avg Violation Time</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function DealerSLAViolations() {
  const [violations, setViolations] = useState<SLAViolation[]>([]);
  const [summary, setSummary] = useState<SLAViolationsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const { showToast } = useToast();

  const fetchViolations = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      // Get dealer ID from cookie or token
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
            console.error("Failed to get dealerId from token:", err);
          }
        }
      }
      
      if (!dealerId) {
        throw new Error("Dealer ID not found in cookie or token");
      }
      
      console.log("Fetching SLA violations for dealer ID:", dealerId);
      
      const filters: any = {};
      if (statusFilter !== "all") {
        filters.resolved = statusFilter === "resolved";
      }
      
      const response = await getSLAViolationsByDealer(dealerId, page, 10, filters);
      
      console.log("SLA violations response:", response);
      
      // Handle the enhanced endpoint response structure
      setViolations(response.data.violations || []);
      
      // Map statistics to summary format with proper validation
      const statistics = response.data.statistics;
      const mappedSummary = {
        totalViolations: Number(statistics?.totalViolations) || 0,
        resolvedViolations: Number(statistics?.resolvedViolations) || 0,
        unresolvedViolations: Number(statistics?.unresolvedViolations) || 0,
        averageViolationMinutes: Number(statistics?.averageViolationMinutes) || 0,
        criticalViolations: 0, // Not provided in enhanced endpoint
        highViolations: 0, // Not provided in enhanced endpoint
        mediumViolations: 0, // Not provided in enhanced endpoint
        lowViolations: 0, // Not provided in enhanced endpoint
      };
      
      console.log("Mapped summary:", mappedSummary);
      setSummary(mappedSummary);
      
      setCurrentPage(response.data.pagination?.currentPage || 1);
      setTotalPages(response.data.pagination?.totalPages || 0);
      
    } catch (err) {
      console.error("Failed to fetch SLA violations:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch SLA violations");
      showToast("Failed to load SLA violations", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchViolations();
  }, [statusFilter, severityFilter]);

  const filteredViolations = violations.filter(violation => {
    const order = violation.order_id || violation.orderDetails;
    const matchesSearch = searchTerm === "" || 
      order?.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order?.customerDetails?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order?.customerDetails?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSeverity = severityFilter === "all" || 
      violation.severity.toLowerCase() === severityFilter.toLowerCase();
    
    return matchesSearch && matchesSeverity;
  });

  const handleRefresh = () => {
    fetchViolations(currentPage);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchViolations(page);
  };

  if (loading && violations.length === 0) {
    return (
      <div className="space-y-6">
        <SummaryCard summary={summary!} loading={true} />
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load SLA Violations</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">SLA Violations</h1>
          <p className="text-gray-600">Monitor and track SLA violations for your orders</p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Summary Card */}
      <SummaryCard summary={summary!} loading={loading} />

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Search by order ID, customer name, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="unresolved">Unresolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Severity</label>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severity</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Violations List */}
      <div className="space-y-4">
        {filteredViolations.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No SLA Violations Found</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== "all" || severityFilter !== "all"
                  ? "No violations match your current filters."
                  : "Great! You have no SLA violations at the moment."}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredViolations.map((violation) => (
            <ViolationCard key={violation._id} violation={violation} />
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
