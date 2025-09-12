"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TrendingUp,
  ShoppingCart,
  Package,
  BarChart3,
  Download,
  RefreshCw,
  Filter,
  Calendar,
  DollarSign,
  Activity,
  Truck,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import {
  fetchAllOrderAnalytics,
  exportOrderAnalyticsToCSV,
  getDefaultOrderAnalyticsFilters,
  formatCurrency,
  formatNumber,
} from "@/service/order-analytics-service";
import {
  SalesAnalyticsResponse,
  OrderAnalyticsResponse,
  OrderPerformanceResponse,
  PicklistAnalyticsResponse,
  OrderAnalyticsFilterOptions,
} from "@/types/order-analytics-types";
import OrderAnalyticsFilters from "./OrderAnalyticsFilters";
import SalesAnalytics from "./SalesAnalytics";
import OrderAnalytics from "./OrderAnalytics";
import OrderPerformanceAnalytics from "./OrderPerformanceAnalytics";
import PicklistAnalytics from "./PicklistAnalytics";

export default function OrderAnalyticsDashboard() {
  const { showToast } = useToast();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("sales");
  const [filters, setFilters] = useState<OrderAnalyticsFilterOptions>(getDefaultOrderAnalyticsFilters());
  
  // Analytics data
  const [salesData, setSalesData] = useState<SalesAnalyticsResponse | null>(null);
  const [analyticsData, setAnalyticsData] = useState<OrderAnalyticsResponse | null>(null);
  const [performanceData, setPerformanceData] = useState<OrderPerformanceResponse | null>(null);
  const [picklistsData, setPicklistsData] = useState<PicklistAnalyticsResponse | null>(null);

  // Fetch analytics data
  const fetchAnalytics = useCallback(async (showRefreshToast = false) => {
    try {
      if (showRefreshToast) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const data = await fetchAllOrderAnalytics(filters);
      
      setSalesData(data.sales);
      setAnalyticsData(data.analytics);
      setPerformanceData(data.performance);
      setPicklistsData(data.picklists);

      if (showRefreshToast) {
        showToast("Order analytics data refreshed successfully", "success");
      }
    } catch (error) {
      console.error("Error fetching order analytics:", error);
      showToast("Failed to fetch order analytics data", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filters, showToast]);

  // Initial load
  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Handle filter changes
  const handleFiltersChange = (newFilters: OrderAnalyticsFilterOptions) => {
    setFilters(newFilters);
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchAnalytics(true);
  };

  // Handle export
  const handleExport = (type: 'sales' | 'analytics' | 'performance' | 'picklists') => {
    try {
      let data: any[] = [];
      let filename = '';
      let headers: string[] = [];

      switch (type) {
        case 'sales':
          if (salesData?.data.salesAnalytics) {
            data = salesData.data.salesAnalytics.map(item => ({
              'Date/Group': item._id || 'All',
              'Count': item.count,
              'Total Amount': item.totalAmount,
              'Average Amount': item.avgAmount,
              'Min Amount': item.minAmount,
              'Max Amount': item.maxAmount,
              'Total GST': item.totalGST,
              'Average GST': item.avgGST,
              'Total Delivery Charges': item.totalDeliveryCharges,
              'Average Delivery Charges': item.avgDeliveryCharges,
              'Total Revenue': item.totalRevenue,
              'Average Revenue': item.avgRevenue,
            }));
            filename = 'sales_analytics';
            headers = ['Date/Group', 'Count', 'Total Amount', 'Average Amount', 'Min Amount', 'Max Amount', 'Total GST', 'Average GST', 'Total Delivery Charges', 'Average Delivery Charges', 'Total Revenue', 'Average Revenue'];
          }
          break;
        case 'analytics':
          if (analyticsData?.data.analytics) {
            data = analyticsData.data.analytics.map(item => ({
              'Group': item._id || 'All',
              'Count': item.count,
              'Total Amount': item.totalAmount,
              'Average Amount': item.avgAmount,
              'Min Amount': item.minAmount,
              'Max Amount': item.maxAmount,
              'Total GST': item.totalGST,
              'Average GST': item.avgGST,
              'Total Delivery Charges': item.totalDeliveryCharges,
              'Average Delivery Charges': item.avgDeliveryCharges,
            }));
            filename = 'order_analytics';
            headers = ['Group', 'Count', 'Total Amount', 'Average Amount', 'Min Amount', 'Max Amount', 'Total GST', 'Average GST', 'Total Delivery Charges', 'Average Delivery Charges'];
          }
          break;
        case 'performance':
          if (performanceData?.data.performance) {
            data = performanceData.data.performance.map(item => ({
              'Order ID': item.orderId,
              'Order Amount': item.orderAmount,
              'GST Amount': item.gstAmount,
              'Delivery Charges': item.deliveryCharges,
              'Total Amount': item.totalAmount,
              'Status': item.status,
              'Order Type': item.orderType,
              'Payment Type': item.paymentType,
              'Order Source': item.orderSource,
              'Delivery Type': item.deliveryType,
              'Type of Delivery': item.typeOfDelivery,
              'Customer Name': item.customerInfo?.name || 'N/A',
              'Customer Email': item.customerInfo?.email || 'N/A',
              'Customer Phone': item.customerInfo?.phone || 'N/A',
              'City': item.customerInfo?.address?.city || 'N/A',
              'State': item.customerInfo?.address?.state || 'N/A',
              'Pincode': item.customerInfo?.address?.pincode || 'N/A',
              'Dealer ID': item.dealerInfo?.dealerId || 'N/A',
              'Dealer Name': item.dealerInfo?.legalName || 'N/A',
              'Created At': item.createdAt,
              'Updated At': item.updatedAt,
            }));
            filename = 'order_performance';
            headers = ['Order ID', 'Order Amount', 'GST Amount', 'Delivery Charges', 'Total Amount', 'Status', 'Order Type', 'Payment Type', 'Order Source', 'Delivery Type', 'Type of Delivery', 'Customer Name', 'Customer Email', 'Customer Phone', 'City', 'State', 'Pincode', 'Dealer ID', 'Dealer Name', 'Created At', 'Updated At'];
          }
          break;
        case 'picklists':
          if (picklistsData?.data.analytics[0]?.picklists) {
            data = picklistsData.data.analytics[0].picklists.map((picklist: any, index: number) => ({
              'Picklist ID': picklist._id || `picklist_${index}`,
              'Status': picklist.status || 'N/A',
              'Order ID': picklist.orderId || 'N/A',
              'Amount': picklist.amount || 0,
              'GST': picklist.gst || 0,
              'Delivery Charges': picklist.deliveryCharges || 0,
              'Created At': picklist.createdAt || 'N/A',
              'Updated At': picklist.updatedAt || 'N/A',
            }));
            filename = 'picklist_analytics';
            headers = ['Picklist ID', 'Status', 'Order ID', 'Amount', 'GST', 'Delivery Charges', 'Created At', 'Updated At'];
          }
          break;
      }

      if (data.length > 0) {
        exportOrderAnalyticsToCSV(data, filename, headers);
        showToast(`${type} data exported successfully`, "success");
      } else {
        showToast("No data available to export", "warning");
      }
    } catch (error) {
      console.error("Error exporting data:", error);
      showToast("Failed to export data", "error");
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96 mt-2" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-24 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Order Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Comprehensive analytics for sales, orders, performance, and picklists
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={handleRefresh}
            variant="outline"
            disabled={refreshing}
            className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sales Summary */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Sales
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(salesData?.data.summary.totalAmount || 0)}
            </div>
            <p className="text-xs text-gray-500">
              {formatNumber(salesData?.data.summary.totalOrders || 0)} orders
            </p>
          </CardContent>
        </Card>

        {/* Orders Summary */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Orders
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatNumber(analyticsData?.data.summary.totalOrders || 0)}
            </div>
            <p className="text-xs text-gray-500">
              {formatCurrency(analyticsData?.data.summary.totalAmount || 0)} total value
            </p>
          </CardContent>
        </Card>

        {/* Performance Summary */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Performance
            </CardTitle>
            <Activity className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatNumber(performanceData?.data.summary.totalOrders || 0)}
            </div>
            <p className="text-xs text-gray-500">
              {formatCurrency(performanceData?.data.summary.totalRevenue || 0)} revenue
            </p>
          </CardContent>
        </Card>

        {/* Picklists Summary */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Picklists
            </CardTitle>
            <Truck className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatNumber(picklistsData?.data.summary.totalPicklists || 0)}
            </div>
            <p className="text-xs text-gray-500">
              {formatCurrency(picklistsData?.data.summary.totalAmount || 0)} total value
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <OrderAnalyticsFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
          />
        </CardContent>
      </Card>

      {/* Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sales" className="flex items-center">
            <DollarSign className="h-4 w-4 mr-2" />
            Sales
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center">
            <Activity className="h-4 w-4 mr-2" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="picklists" className="flex items-center">
            <Truck className="h-4 w-4 mr-2" />
            Picklists
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Sales Analytics</h2>
            <Button
              onClick={() => handleExport('sales')}
              variant="outline"
              size="sm"
              className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
          <SalesAnalytics data={salesData} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Order Analytics</h2>
            <Button
              onClick={() => handleExport('analytics')}
              variant="outline"
              size="sm"
              className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
          <OrderAnalytics data={analyticsData} />
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Order Performance Analytics</h2>
            <Button
              onClick={() => handleExport('performance')}
              variant="outline"
              size="sm"
              className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
          <OrderPerformanceAnalytics data={performanceData} />
        </TabsContent>

        <TabsContent value="picklists" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Picklist Analytics</h2>
            <Button
              onClick={() => handleExport('picklists')}
              variant="outline"
              size="sm"
              className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
          <PicklistAnalytics data={picklistsData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
