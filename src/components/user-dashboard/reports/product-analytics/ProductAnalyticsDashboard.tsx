"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Package,
  TrendingUp,
  BarChart3,
  Download,
  RefreshCw,
  Filter,
  DollarSign,
  Activity,
  Layers,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import {
  fetchAllProductAnalytics,
  exportProductAnalyticsToCSV,
  getDefaultProductAnalyticsFilters,
  formatCurrency,
  formatNumber,
} from "@/service/product-analytics-service";
import {
  ProductAnalyticsResponse,
  ProductPerformanceResponse,
  ProductInventoryResponse,
  ProductCategoryResponse,
  ProductAnalyticsFilterOptions,
} from "@/types/product-analytics-types";
import ProductAnalyticsFilters from "./ProductAnalyticsFilters";
import ProductAnalytics from "./ProductAnalytics";
import ProductPerformanceAnalytics from "./ProductPerformanceAnalytics";
import ProductInventoryAnalytics from "./ProductInventoryAnalytics";
import ProductCategoryAnalytics from "./ProductCategoryAnalytics";

export default function ProductAnalyticsDashboard() {
  const { showToast } = useToast();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("analytics");
  const [filters, setFilters] = useState<ProductAnalyticsFilterOptions>(getDefaultProductAnalyticsFilters());
  
  // Analytics data
  const [analyticsData, setAnalyticsData] = useState<ProductAnalyticsResponse | null>(null);
  const [performanceData, setPerformanceData] = useState<ProductPerformanceResponse | null>(null);
  const [inventoryData, setInventoryData] = useState<ProductInventoryResponse | null>(null);
  const [categoryData, setCategoryData] = useState<ProductCategoryResponse | null>(null);

  // Fetch analytics data
  const fetchAnalytics = useCallback(async (showRefreshToast = false) => {
    try {
      if (showRefreshToast) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const data = await fetchAllProductAnalytics(filters);
      
      setAnalyticsData(data.analytics);
      setPerformanceData(data.performance);
      setInventoryData(data.inventory);
      setCategoryData(data.category);

      if (showRefreshToast) {
        showToast("Product analytics data refreshed successfully", "success");
      }
    } catch (error) {
      console.error("Error fetching product analytics:", error);
      showToast("Failed to fetch product analytics data", "error");
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
  const handleFiltersChange = (newFilters: ProductAnalyticsFilterOptions) => {
    setFilters(newFilters);
    // Trigger immediate data fetch with new filters
    fetchAnalyticsWithFilters(newFilters);
  };

  // Fetch analytics with specific filters
  const fetchAnalyticsWithFilters = useCallback(async (filterOptions: ProductAnalyticsFilterOptions, showRefreshToast = false) => {
    try {
      if (showRefreshToast) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const data = await fetchAllProductAnalytics(filterOptions);
      
      setAnalyticsData(data.analytics);
      setPerformanceData(data.performance);
      setInventoryData(data.inventory);
      setCategoryData(data.category);

      if (showRefreshToast) {
        showToast("Product analytics data refreshed successfully", "success");
      }
    } catch (error) {
      console.error("Error fetching product analytics:", error);
      showToast("Failed to fetch product analytics data", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showToast]);

  // Handle refresh
  const handleRefresh = () => {
    fetchAnalytics(true);
  };

  // Handle export
  const handleExport = (type: 'analytics' | 'performance' | 'inventory' | 'category') => {
    try {
      let data: any[] = [];
      let filename = '';
      let headers: string[] = [];

      switch (type) {
        case 'analytics':
          if (analyticsData?.data.analytics) {
            data = analyticsData.data.analytics.map(item => ({
              'Brand/Group': item._id ? item._id.join(', ') : 'All',
              'Count': item.count,
              'Total MRP': item.totalMrp,
              'Average MRP': item.avgMrp || 0,
              'Min MRP': item.minMrp || 0,
              'Max MRP': item.maxMrp || 0,
              'Total Selling Price': item.totalSellingPrice,
              'Average Selling Price': item.avgSellingPrice,
            }));
            filename = 'product_analytics';
            headers = ['Brand/Group', 'Count', 'Total MRP', 'Average MRP', 'Min MRP', 'Max MRP', 'Total Selling Price', 'Average Selling Price'];
          }
          break;
        case 'performance':
          if (performanceData?.data.performance) {
            data = performanceData.data.performance.map(item => ({
              'Product ID': item.productId,
              'SKU': item.sku,
              'Product Name': item.productName,
              'Manufacturer Part Name': item.manufacturerPartName,
              'Brand': item.brand,
              'Category': item.category,
              'Sub Category': item.subCategory,
              'Model': item.model,
              'Selling Price': item.sellingPrice,
              'Live Status': item.liveStatus,
              'Product Type': item.productType,
              'Is Universal': item.isUniversal,
              'Is Consumable': item.isConsumable,
              'Images': item.images,
              'Created By': item.createdBy,
              'Created By Role': item.createdByRole,
              'Price Difference': item.priceDifference || 0,
              'Discount Percentage': item.discountPercentage || 0,
              'Value Score': item.valueScore || 0,
            }));
            filename = 'product_performance';
            headers = ['Product ID', 'SKU', 'Product Name', 'Manufacturer Part Name', 'Brand', 'Category', 'Sub Category', 'Model', 'Selling Price', 'Live Status', 'Product Type', 'Is Universal', 'Is Consumable', 'Images', 'Created By', 'Created By Role', 'Price Difference', 'Discount Percentage', 'Value Score'];
          }
          break;
        case 'inventory':
          if (inventoryData?.data.inventory) {
            data = inventoryData.data.inventory.map(item => ({
              'Group': item._id || 'All',
              'Count': item.count,
              'Total MRP': item.totalMrp,
              'Average MRP': item.avgMrp || 0,
              'Min MRP': item.minMrp || 0,
              'Max MRP': item.maxMrp || 0,
              'Total Selling Price': item.totalSellingPrice,
              'Average Selling Price': item.avgSellingPrice,
            }));
            filename = 'product_inventory';
            headers = ['Group', 'Count', 'Total MRP', 'Average MRP', 'Min MRP', 'Max MRP', 'Total Selling Price', 'Average Selling Price'];
          }
          break;
        case 'category':
          if (categoryData?.data.categoryReport) {
            data = categoryData.data.categoryReport.map(item => ({
              'Category': item._id.category,
              'Sub Category': item._id.subCategory,
              'Count': item.count,
              'Total MRP': item.totalMrp,
              'Average MRP': item.avgMrp || 0,
              'Min MRP': item.minMrp || 0,
              'Max MRP': item.maxMrp || 0,
              'Total Selling Price': item.totalSellingPrice,
              'Average Selling Price': item.avgSellingPrice,
              'Brands': item.brands.join(', '),
              'Models': item.models.join(', '),
            }));
            filename = 'product_category';
            headers = ['Category', 'Sub Category', 'Count', 'Total MRP', 'Average MRP', 'Min MRP', 'Max MRP', 'Total Selling Price', 'Average Selling Price', 'Brands', 'Models'];
          }
          break;
      }

      if (data.length > 0) {
        exportProductAnalyticsToCSV(data, filename, headers);
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
          <h1 className="text-3xl font-bold text-gray-900">Product Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Comprehensive analytics for products, performance, inventory, and categories
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
        {/* Analytics Summary */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Products
            </CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatNumber(analyticsData?.data.summary.totalProducts || 0)}
            </div>
            <p className="text-xs text-gray-500">
              {formatCurrency(analyticsData?.data.summary.totalSellingPrice || 0)} total value
            </p>
          </CardContent>
        </Card>

        {/* Performance Summary */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Performance
            </CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatNumber(performanceData?.data.summary.totalProducts || 0)}
            </div>
            <p className="text-xs text-gray-500">
              {formatCurrency(performanceData?.data.summary.totalSellingPrice || 0)} total value
            </p>
          </CardContent>
        </Card>

        {/* Inventory Summary */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Inventory
            </CardTitle>
            <Layers className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatNumber(inventoryData?.data.summary.totalProducts || 0)}
            </div>
            <p className="text-xs text-gray-500">
              {formatCurrency(inventoryData?.data.summary.totalSellingPrice || 0)} total value
            </p>
          </CardContent>
        </Card>

        {/* Category Summary */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Categories
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatNumber(categoryData?.data.summary.totalProducts || 0)}
            </div>
            <p className="text-xs text-gray-500">
              {formatCurrency(categoryData?.data.summary.totalSellingPrice || 0)} total value
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
          <ProductAnalyticsFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
          />
        </CardContent>
      </Card>

      {/* Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="analytics" className="flex items-center">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center">
            <Activity className="h-4 w-4 mr-2" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="inventory" className="flex items-center">
            <Layers className="h-4 w-4 mr-2" />
            Inventory
          </TabsTrigger>
          <TabsTrigger value="category" className="flex items-center">
            <Package className="h-4 w-4 mr-2" />
            Category
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Product Analytics</h2>
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
          <ProductAnalytics data={analyticsData} />
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Product Performance Analytics</h2>
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
          <ProductPerformanceAnalytics data={performanceData} />
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Product Inventory Analytics</h2>
            <Button
              onClick={() => handleExport('inventory')}
              variant="outline"
              size="sm"
              className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
          <ProductInventoryAnalytics data={inventoryData} />
        </TabsContent>

        <TabsContent value="category" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Product Category Analytics</h2>
            <Button
              onClick={() => handleExport('category')}
              variant="outline"
              size="sm"
              className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
          <ProductCategoryAnalytics data={categoryData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
