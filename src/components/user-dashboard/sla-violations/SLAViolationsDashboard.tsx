"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  Clock,
  TrendingUp,
  TrendingDown,
  Users,
  FileText,
  Search,
  Filter,
  RefreshCw,
  Eye,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import slaViolationsService from "@/service/slaViolations-Service";

// Types based on the API response structure
interface SLAViolationSummary {
  totalViolations: number;
  totalViolationMinutes: number;
  avgViolationMinutes: number;
  maxViolationMinutes: number;
  resolvedViolations: number;
  unresolvedViolations: number;
  uniqueDealerCount: number;
  uniqueOrderCount: number;
  resolutionRate: number;
  avgViolationsPerOrder: number;
  avgViolationsPerDealer: number;
}

interface DealerViolationData {
  _id: string;
  totalViolations: number;
  totalViolationMinutes: number;
  avgViolationMinutes: number;
  maxViolationMinutes: number;
  resolvedViolations: number;
  unresolvedViolations: number;
  firstViolation: string;
  lastViolation: string;
  orderIds: string[];
  dealerId: string;
  dealerInfo: {
    _id: string;
    legal_name: string;
    trade_name: string;
    GSTIN: string;
    Pan: string;
    is_active: boolean;
    contact_person: {
      name: string;
      email: string;
      phone_number: string;
    };
    Address: {
      street: string;
      city: string;
      pincode: string;
      state: string;
    };
    SLA_type: string;
    dealer_dispatch_time: number;
    assigned_Toprise_employee: Array<{
      assigned_user: string;
      status: string;
      _id: string;
      assigned_at: string;
    }>;
  };
  orderDetails: Array<{
    _id: string;
    orderId: string;
    status: string;
    orderType: string;
    paymentType: string;
    totalAmount: number;
    timestamps: {
      createdAt: string;
      packedAt?: string;
    };
    customerDetails: {
      name: string;
      email: string;
      phone: string;
      address: string;
    };
    slaInfo: {
      expectedFulfillmentTime: string;
      actualFulfillmentTime: string;
      isSLAMet: boolean;
      violationMinutes: number;
    };
  }>;
  orderCount: number;
  violationRate: number;
}

interface SLAViolationsResponse {
  success: boolean;
  message: string;
  data: {
    summary: SLAViolationSummary;
    data: DealerViolationData[];
    filters: {
      groupBy: string;
      includeDetails: boolean;
      includeOrderDetails: boolean;
    };
  };
}

// Stat Card Component
const StatCard: React.FC<{
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: "default" | "success" | "warning" | "danger";
}> = ({ title, value, subtitle, icon, trend, color = "default" }) => {
  const colorClasses = {
    default: "bg-blue-50 text-blue-600",
    success: "bg-green-50 text-green-600",
    warning: "bg-yellow-50 text-yellow-600",
    danger: "bg-red-50 text-red-600",
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {subtitle && (
              <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
            )}
            {trend && (
              <div className="flex items-center mt-2">
                {trend.isPositive ? (
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span
                  className={`text-xs ${
                    trend.isPositive ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {trend.value}%
                </span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-full ${colorClasses[color]}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Dealer Violation Row Component
const DealerViolationRow: React.FC<{
  dealer: DealerViolationData;
  onViewDetails: (dealer: DealerViolationData) => void;
}> = ({ dealer, onViewDetails }) => {
  const getViolationBadge = (violations: number) => {
    if (violations >= 10) return <Badge variant="destructive">Critical</Badge>;
    if (violations >= 5) return <Badge variant="destructive">High</Badge>;
    if (violations >= 3) return <Badge variant="secondary">Medium</Badge>;
    return <Badge variant="outline">Low</Badge>;
  };

  const formatMinutes = (minutes: number) => {
    if (minutes >= 1440) {
      const days = Math.floor(minutes / 1440);
      const hours = Math.floor((minutes % 1440) / 60);
      return `${days}d ${hours}h`;
    }
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}h ${mins}m`;
    }
    return `${minutes}m`;
  };

  return (
    <TableRow>
      <TableCell className="font-medium">
        <div>
          <p className="font-semibold">{dealer.dealerInfo.legal_name}</p>
          <p className="text-sm text-gray-500">{dealer.dealerInfo.trade_name}</p>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          {getViolationBadge(dealer.totalViolations)}
          <span className="font-semibold">{dealer.totalViolations}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="text-sm">
          <p className="font-medium">{formatMinutes(dealer.totalViolationMinutes)}</p>
          <p className="text-gray-500">Avg: {formatMinutes(dealer.avgViolationMinutes)}</p>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <span className="text-sm">{dealer.unresolvedViolations}</span>
          <XCircle className="h-4 w-4 text-red-500" />
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <span className="text-sm">{dealer.resolvedViolations}</span>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={dealer.dealerInfo.is_active ? "default" : "secondary"}>
          {dealer.dealerInfo.is_active ? "Active" : "Inactive"}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="text-sm">
          <p>{dealer.dealerInfo.contact_person.name}</p>
          <p className="text-gray-500">{dealer.dealerInfo.contact_person.email}</p>
        </div>
      </TableCell>
      <TableCell>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewDetails(dealer)}
        >
          <Eye className="h-4 w-4 mr-2" />
          View Details
        </Button>
      </TableCell>
    </TableRow>
  );
};

// Main SLA Violations Dashboard Component
export default function SLAViolationsDashboard() {
  const [data, setData] = useState<SLAViolationsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDealer, setSelectedDealer] = useState<DealerViolationData | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [filters, setFilters] = useState({
    groupBy: "dealer",
    includeDetails: true,
    includeOrderDetails: true,
  });

  const { toast } = useToast();

  // Fetch SLA violations data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await slaViolationsService.getStats({
        groupBy: filters.groupBy as "dealer",
        includeDetails: filters.includeDetails,
        includeOrderDetails: filters.includeOrderDetails,
      });

      if (response.success) {
        setData(response);
      } else {
        throw new Error(response.message || "Failed to fetch SLA violations data");
      }
    } catch (err: any) {
      console.error("Error fetching SLA violations:", err);
      setError(err.message || "Failed to fetch SLA violations data");
      toast({
        title: "Error",
        description: "Failed to fetch SLA violations data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  // Filter dealers based on search query
  const filteredDealers = data?.data?.data?.filter((dealer) =>
    dealer.dealerInfo.legal_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dealer.dealerInfo.trade_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dealer.dealerInfo.contact_person.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleViewDetails = (dealer: DealerViolationData) => {
    setSelectedDealer(dealer);
    setShowDetailsModal(true);
  };

  const handleRefresh = () => {
    fetchData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading SLA violations data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FileText className="h-8 w-8 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No SLA violations data available</p>
        </div>
      </div>
    );
  }

  const summary = data.data.summary;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">SLA Violations Dashboard</h1>
          <p className="text-gray-600">Monitor and manage SLA violations across dealers</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>


      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="dealers">Dealers</TabsTrigger>
          {/* <TabsTrigger value="trends">Trends</TabsTrigger> */}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Additional Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Violation Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Unresolved</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-red-500 h-2 rounded-full"
                          style={{
                            width: `${(summary.unresolvedViolations / summary.totalViolations) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{summary.unresolvedViolations}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Resolved</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{
                            width: `${(summary.resolvedViolations / summary.totalViolations) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{summary.resolvedViolations}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm">Avg Violations per Order</span>
                    <span className="font-medium">{summary.avgViolationsPerOrder.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Avg Violations per Dealer</span>
                    <span className="font-medium">{summary.avgViolationsPerDealer.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Max Violation Time</span>
                    <span className="font-medium">
                      {Math.floor(summary.maxViolationMinutes / 60)}h {summary.maxViolationMinutes % 60}m
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    View Critical Violations
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    <Users className="h-4 w-4 mr-2" />
                    Manage Dealers
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </div>
              </CardContent>
            </Card> */}
          </div>
        </TabsContent>

        <TabsContent value="dealers" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search dealers..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select
                  value={filters.groupBy}
                  onValueChange={(value) => setFilters({ ...filters, groupBy: value })}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Group by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dealer">Dealer</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="month">Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Dealers Table */}
          <Card>
            <CardHeader>
              <CardTitle>Dealers with Violations</CardTitle>
              <CardDescription>
                {filteredDealers.length} dealers found with SLA violations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dealer</TableHead>
                    <TableHead>Violations</TableHead>
                    <TableHead>Total Time</TableHead>
                    <TableHead>Unresolved</TableHead>
                    <TableHead>Resolved</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDealers.map((dealer) => (
                    <DealerViolationRow
                      key={dealer._id}
                      dealer={dealer}
                      onViewDetails={handleViewDetails}
                    />
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Violation Trends</CardTitle>
              <CardDescription>Track SLA violation patterns over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Trend analysis coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dealer Details Modal */}
      {showDetailsModal && selectedDealer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Dealer Violation Details</h2>
              <Button
                variant="outline"
                onClick={() => setShowDetailsModal(false)}
              >
                Close
              </Button>
            </div>
            
            <div className="space-y-6">
              {/* Dealer Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Dealer Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Legal Name</p>
                      <p className="font-medium">{selectedDealer.dealerInfo.legal_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Trade Name</p>
                      <p className="font-medium">{selectedDealer.dealerInfo.trade_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Contact Person</p>
                      <p className="font-medium">{selectedDealer.dealerInfo.contact_person.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{selectedDealer.dealerInfo.contact_person.email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Violation Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Violation Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600">{selectedDealer.totalViolations}</p>
                      <p className="text-sm text-gray-600">Total Violations</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600">
                        {Math.floor(selectedDealer.totalViolationMinutes / 60)}h {selectedDealer.totalViolationMinutes % 60}m
                      </p>
                      <p className="text-sm text-gray-600">Total Time</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600">{selectedDealer.unresolvedViolations}</p>
                      <p className="text-sm text-gray-600">Unresolved</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{selectedDealer.resolvedViolations}</p>
                      <p className="text-sm text-gray-600">Resolved</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedDealer.orderDetails.map((order) => (
                      <div key={order._id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium">Order #{order.orderId}</p>
                            <p className="text-sm text-gray-600">{order.customerDetails.name}</p>
                          </div>
                          <Badge variant={order.slaInfo.isSLAMet ? "default" : "destructive"}>
                            {order.slaInfo.isSLAMet ? "SLA Met" : "SLA Violated"}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Order Date</p>
                            <p>{new Date(order.timestamps.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Violation Time</p>
                            <p className="text-red-600">
                              {Math.floor(order.slaInfo.violationMinutes / 60)}h {order.slaInfo.violationMinutes % 60}m
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Expected Fulfillment</p>
                            <p>{new Date(order.slaInfo.expectedFulfillmentTime).toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Actual Fulfillment</p>
                            <p>{new Date(order.slaInfo.actualFulfillmentTime).toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
