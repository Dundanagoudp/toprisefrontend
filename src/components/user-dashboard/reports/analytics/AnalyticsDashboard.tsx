"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TrendingUp,
  Users,
  UserCheck,
  BarChart3,
  Download,
  RefreshCw,
  Filter,
  Calendar,
  Building2,
  Activity,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import {
  fetchAllAnalytics,
  exportAnalyticsToCSV,
  getDefaultFilters,
} from "@/service/analytics-service";
import {
  DealerAnalyticsResponse,
  EmployeeAnalyticsResponse,
  UserPerformanceResponse,
  AnalyticsFilterOptions,
} from "@/types/analytics-types";
import AnalyticsFilters from "./AnalyticsFilters";
import DealerAnalytics from "./DealerAnalytics";
import EmployeeAnalytics from "./EmployeeAnalytics";
import UserPerformanceAnalytics from "./UserPerformanceAnalytics";

export default function AnalyticsDashboard() {
  const { showToast } = useToast();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("dealers");
  const [filters, setFilters] = useState<AnalyticsFilterOptions>(getDefaultFilters());
  
  // Analytics data
  const [dealersData, setDealersData] = useState<DealerAnalyticsResponse | null>(null);
  const [employeesData, setEmployeesData] = useState<EmployeeAnalyticsResponse | null>(null);
  const [performanceData, setPerformanceData] = useState<UserPerformanceResponse | null>(null);

  // Fetch analytics data
  const fetchAnalytics = useCallback(async (showRefreshToast = false) => {
    try {
      if (showRefreshToast) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const data = await fetchAllAnalytics(filters);
      
      setDealersData(data.dealers);
      setEmployeesData(data.employees);
      setPerformanceData(data.performance);

      if (showRefreshToast) {
        showToast("Analytics data refreshed successfully", "success");
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      showToast("Failed to fetch analytics data", "error");
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
  const handleFiltersChange = (newFilters: AnalyticsFilterOptions) => {
    setFilters(newFilters);
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchAnalytics(true);
  };

  // Handle export
  const handleExport = (type: 'dealers' | 'employees' | 'performance') => {
    try {
      let data: any[] = [];
      let filename = '';
      let headers: string[] = [];

      switch (type) {
        case 'dealers':
          if (dealersData?.data.analytics[0]?.dealers) {
            data = dealersData.data.analytics[0].dealers.map(dealer => ({
              'Dealer ID': dealer.dealerId,
              'Legal Name': dealer.legalName,
              'Email': dealer.userInfo.email,
              'Phone': dealer.userInfo.phone_Number,
              'Categories': dealer.categoriesAllowed.join(', '),
              'Last Login': dealer.userInfo.last_login || 'Never',
            }));
            filename = 'dealer_analytics';
            headers = ['Dealer ID', 'Legal Name', 'Email', 'Phone', 'Categories', 'Last Login'];
          }
          break;
        case 'employees':
          if (employeesData?.data.analytics[0]?.employees) {
            data = employeesData.data.analytics[0].employees.map(employee => ({
              'Employee ID': employee.employeeId,
              'Email': employee.userInfo.email,
              'Role': employee.userInfo.role,
              'Assigned Dealers': employee.assignedDealers.length,
              'Last Login': employee.userInfo.last_login || 'Never',
            }));
            filename = 'employee_analytics';
            headers = ['Employee ID', 'Email', 'Role', 'Assigned Dealers', 'Last Login'];
          }
          break;
        case 'performance':
          if (performanceData?.data.performance) {
            data = performanceData.data.performance.map(user => ({
              'User ID': user.userId,
              'Email': user.email,
              'Role': user.role,
              'Days Since Creation': user.daysSinceCreation || 'N/A',
              'Days Since Last Login': user.daysSinceLastLogin || 'N/A',
              'Activity Score': user.activityScore || 'N/A',
            }));
            filename = 'user_performance';
            headers = ['User ID', 'Email', 'Role', 'Days Since Creation', 'Days Since Last Login', 'Activity Score'];
          }
          break;
      }

      if (data.length > 0) {
        exportAnalyticsToCSV(data, filename, headers);
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
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
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
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Comprehensive analytics for dealers, employees, and user performance
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Dealers Summary */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Dealers
            </CardTitle>
            <Building2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {dealersData?.data.summary.totalDealers || 0}
            </div>
            <p className="text-xs text-gray-500">
              {dealersData?.data.summary.activeDealers || 0} active, {dealersData?.data.summary.inactiveDealers || 0} inactive
            </p>
          </CardContent>
        </Card>

        {/* Employees Summary */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Employees
            </CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {employeesData?.data.summary.totalEmployees || 0}
            </div>
            <p className="text-xs text-gray-500">
              {employeesData?.data.summary.activeEmployees || 0} active, {employeesData?.data.summary.inactiveEmployees || 0} inactive
            </p>
          </CardContent>
        </Card>

        {/* Users Summary */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Users
            </CardTitle>
            <UserCheck className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {performanceData?.data.summary.totalUsers || 0}
            </div>
            <p className="text-xs text-gray-500">
              {performanceData?.data.summary.activeUsers || 0} active, {performanceData?.data.summary.inactiveUsers || 0} inactive
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
          <AnalyticsFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
          />
        </CardContent>
      </Card>

      {/* Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dealers" className="flex items-center">
            <Building2 className="h-4 w-4 mr-2" />
            Dealers
          </TabsTrigger>
          <TabsTrigger value="employees" className="flex items-center">
            <Users className="h-4 w-4 mr-2" />
            Employees
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center">
            <Activity className="h-4 w-4 mr-2" />
            Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dealers" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Dealer Analytics</h2>
            <Button
              onClick={() => handleExport('dealers')}
              variant="outline"
              size="sm"
              className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
          <DealerAnalytics data={dealersData} />
        </TabsContent>

        <TabsContent value="employees" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Employee Analytics</h2>
            <Button
              onClick={() => handleExport('employees')}
              variant="outline"
              size="sm"
              className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
          <EmployeeAnalytics data={employeesData} />
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">User Performance Analytics</h2>
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
          <UserPerformanceAnalytics data={performanceData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
