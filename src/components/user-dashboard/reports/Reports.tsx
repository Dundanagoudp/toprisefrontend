"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertTriangle,
  Download,
  RefreshCw,
} from "lucide-react";
import apiClient from "@/apiClient";
import OrderAnalyticsDashboard from "./order-analytics/OrderAnalyticsDashboard";
import ProductAnalyticsDashboard from "./product-analytics/ProductAnalyticsDashboard";

// Interfaces for API responses
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
}

interface DealerWithViolations {
  dealerId: string;
  dealerInfo: {
    _id: string;
    trade_name: string;
    legal_name: string;
    email: string;
    assignedEmployees: Array<{
      employeeId: string;
      assignedAt: string;
      status: string;
      employeeDetails: {
        _id: string;
        name: string;
        email: string;
        role: string;
      };
    }>;
    employeeCount: number;
  };
  totalViolations: number;
  totalViolationMinutes: number;
  avgViolationMinutes: number;
  maxViolationMinutes: number;
  resolvedViolations: number;
  unresolvedViolations: number;
  firstViolation: string;
  lastViolation: string;
  violationRate: number;
}


export default function Reports() {
  const [activeTab, setActiveTab] = useState("order-analytics");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [slaSummary, setSlaSummary] = useState<SLAViolationSummary | null>(
    null
  );
  const [dealersWithViolations, setDealersWithViolations] = useState<
    DealerWithViolations[]
  >([]);

  // Filter states
  const [dateRange, setDateRange] = useState("30d");

  // API Health Check
  const checkAPIHealth = async () => {
    try {
      const response = await apiClient.get('/health');
      return response.status === 200;
    } catch (error) {
      console.warn("API health check failed:", error);
      return false;
    }
  };

  // API Functions with retry mechanism
  const fetchSLAViolationSummary = async (retryCount = 0) => {
    try {
      const response = await apiClient.get(
        `/orders/api/sla-violations/summary?includeDetails=true`
      );
      
      if (response.data.success) {
        setSlaSummary(response.data.data.summary);
      }
    } catch (error: any) {
      console.error("Error fetching SLA summary:", error);
      
      // Check if it's a network error and retry once
      if (retryCount < 1 && (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error'))) {
        console.log("Retrying SLA summary fetch...");
        setTimeout(() => fetchSLAViolationSummary(retryCount + 1), 2000);
        return;
      }
      
      // Set fallback data to prevent UI crashes
      setSlaSummary({
        totalViolations: 0,
        totalViolationMinutes: 0,
        avgViolationMinutes: 0,
        maxViolationMinutes: 0,
        resolvedViolations: 0,
        unresolvedViolations: 0,
        uniqueDealerCount: 0,
        uniqueOrderCount: 0,
        resolutionRate: 0,
      });
    }
  };

  const fetchDealersWithViolations = async (retryCount = 0) => {
    try {
      const response = await apiClient.get(
        `/orders/api/sla-violations/multiple-violations?includeDetails=true`
      );
      
      if (response.data.success) {
        setDealersWithViolations(response.data.data || []);
      }
    } catch (error: any) {
      console.error("Error fetching dealers with violations:", error);
      
      // Check if it's a network error and retry once
      if (retryCount < 1 && (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error'))) {
        console.log("Retrying dealers with violations fetch...");
        setTimeout(() => fetchDealersWithViolations(retryCount + 1), 2000);
        return;
      }
      
      // Set fallback data to prevent UI crashes
      setDealersWithViolations([]);
    }
  };


  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Check API health first
      const isAPIHealthy = await checkAPIHealth();
      if (!isAPIHealthy) {
        console.warn("API appears to be unavailable. Using fallback data.");
      }

      // Use Promise.allSettled to handle individual API failures gracefully
      const results = await Promise.allSettled([
        fetchSLAViolationSummary(),
        fetchDealersWithViolations(),
      ]);

      // Log any failed requests but don't show error to user since we have fallback data
      const failedAPIs: string[] = [];
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          const apiNames = [
            'SLA Violation Summary',
            'Dealers with Violations'
          ];
          failedAPIs.push(apiNames[index]);
          console.warn(`Failed to fetch ${apiNames[index]}:`, result.reason);
        }
      });

      // Show a gentle warning if many APIs failed
      if (failedAPIs.length > 1) {
        setError("Some data may not be available due to network issues. Please check your connection and refresh.");
      }
    } catch (error) {
      console.error("Unexpected error in fetchAllData:", error);
      setError("Unable to load reports data. Please check your connection and refresh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Loading reports...</span>
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
          <Button onClick={fetchAllData}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Reports & Analytics
          </h1>
          <p className="text-gray-600 mt-1">
            Comprehensive insights and performance metrics
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchAllData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="order-analytics">Order Analytics</TabsTrigger>
          <TabsTrigger value="product-analytics">Product Analytics</TabsTrigger>
          <TabsTrigger value="sla">SLA Violations</TabsTrigger>
        </TabsList>


        {/* Order Analytics Tab */}
        <TabsContent value="order-analytics" className="space-y-6">
          <OrderAnalyticsDashboard />
        </TabsContent>

        {/* Product Analytics Tab */}
        <TabsContent value="product-analytics" className="space-y-6">
          <ProductAnalyticsDashboard />
        </TabsContent>

        {/* SLA Violations Tab */}
        <TabsContent value="sla" className="space-y-6">
          {/* SLA Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Average Violation Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNumber(slaSummary?.avgViolationMinutes || 0)} min
                </div>
                <p className="text-xs text-muted-foreground">per violation</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Total Violation Minutes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNumber(slaSummary?.totalViolationMinutes || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  cumulative minutes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Affected Dealers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNumber(slaSummary?.uniqueDealerCount || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  dealers with violations
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Dealers with Violations Table */}
          <Card>
            <CardHeader>
              <CardTitle>Dealers with Multiple Violations</CardTitle>
              <CardDescription>Dealers requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Dealer</TableHead>
                      <TableHead>Total Violations</TableHead>
                      <TableHead>Avg Time (min)</TableHead>
                      <TableHead>Resolved</TableHead>
                      <TableHead>Unresolved</TableHead>
                      <TableHead>Violation Rate</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dealersWithViolations.map((dealer) => (
                      <TableRow key={dealer.dealerId}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {dealer.dealerInfo?.trade_name ||
                                "Unknown Dealer"}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {dealer.dealerInfo?.email || "No email"}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatNumber(dealer.totalViolations)}
                        </TableCell>
                        <TableCell>
                          {formatNumber(dealer.avgViolationMinutes)}
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-800">
                            {formatNumber(dealer.resolvedViolations)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-red-100 text-red-800">
                            {formatNumber(dealer.unresolvedViolations)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {formatPercentage(dealer.violationRate)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              dealer.unresolvedViolations > 0
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                            }
                          >
                            {dealer.unresolvedViolations > 0
                              ? "Needs Attention"
                              : "Resolved"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
