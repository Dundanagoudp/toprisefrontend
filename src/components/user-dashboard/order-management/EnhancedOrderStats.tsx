"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ShoppingCart,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  RotateCcw,
  Calendar,
  TrendingUp,
  Package,
  Users,
  AlertTriangle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { getOrderStats } from "@/service/order-service";

interface OrderStatsData {
  totalOrders: number;
  statusCounts: {
    Confirmed: number;
    Assigned: number;
    Shipped: number;
    Delivered: number;
    Cancelled: number;
    Returned: number;
  };
  todaysOrders: number;
  todaysStatusCounts: {
    Confirmed: number;
    Assigned: number;
    Shipped: number;
    Delivered: number;
    Cancelled: number;
    Returned: number;
  };
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

interface OrderStatsResponse {
  success: boolean;
  data: OrderStatsData;
}

// Stat Card Component
const StatCard: React.FC<{
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color?: "default" | "success" | "warning" | "danger" | "info";
  trend?: {
    value: number;
    isPositive: boolean;
  };
}> = ({ title, value, subtitle, icon, color = "default", trend }) => {
  const colorClasses = {
    default: "bg-blue-50 text-blue-600",
    success: "bg-green-50 text-green-600",
    warning: "bg-yellow-50 text-yellow-600",
    danger: "bg-red-50 text-red-600",
    info: "bg-purple-50 text-purple-600",
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
                  <TrendingUp className="h-4 w-4 text-red-500 mr-1 rotate-180" />
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

// Status Badge Component
const StatusBadge: React.FC<{ status: string; count: number }> = ({ status, count }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "assigned":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "shipped":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      case "returned":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <Badge className={`${getStatusColor(status)} border`}>
        {status}
      </Badge>
      <span className="font-semibold text-gray-900">{count}</span>
    </div>
  );
};

export default function EnhancedOrderStats() {
  const [stats, setStats] = useState<OrderStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch order statistics
  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response: OrderStatsResponse = await getOrderStats();
      
      if (response.success) {
        setStats(response.data);
      } else {
        throw new Error("Failed to fetch order statistics");
      }
    } catch (err: any) {
      console.error("Error fetching order statistics:", err);
      setError(err.message || "Failed to fetch order statistics");
      toast({
        title: "Error",
        description: "Failed to fetch order statistics. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-8 w-16 mb-2" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-12 w-12 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Status Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[...Array(3)].map((_, j) => (
                    <Skeleton key={j} className="h-12 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchStats}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Package className="h-8 w-8 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No order statistics available</p>
        </div>
      </div>
    );
  }

  // Calculate additional metrics with safe access
  const statusCounts = stats.statusCounts || {};
  const todaysStatusCounts = stats.todaysStatusCounts || {};
  
  const totalDelivered = statusCounts.Delivered || 0;
  const totalCancelled = statusCounts.Cancelled || 0;
  const totalReturned = statusCounts.Returned || 0;
  const totalInProgress = (statusCounts.Confirmed || 0) + (statusCounts.Assigned || 0) + (statusCounts.Shipped || 0);
  const completionRate = stats.totalOrders > 0 ? ((totalDelivered / stats.totalOrders) * 100).toFixed(1) : "0";
  const cancellationRate = stats.totalOrders > 0 ? ((totalCancelled / stats.totalOrders) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Orders"
          value={stats.totalOrders || 0}
          subtitle={`${stats.dateRange?.startDate || 'N/A'} to ${stats.dateRange?.endDate || 'N/A'}`}
          icon={<ShoppingCart className="h-6 w-6" />}
          color="info"
        />
        
        <StatCard
          title="Orders Today"
          value={stats.todaysOrders || 0}
          subtitle="New orders today"
          icon={<Calendar className="h-6 w-6" />}
          color="default"
        />
        
        <StatCard
          title="In Progress"
          value={totalInProgress}
          subtitle={`${stats.totalOrders > 0 ? ((totalInProgress / stats.totalOrders) * 100).toFixed(1) : '0'}% of total`}
          icon={<Clock className="h-6 w-6" />}
          color="warning"
        />
        
        <StatCard
          title="Delivered"
          value={totalDelivered}
          subtitle={`${completionRate}% completion rate`}
          icon={<CheckCircle className="h-6 w-6" />}
          color="success"
        />
      </div>

      {/* Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overall Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Order Status Distribution</CardTitle>
            <CardDescription>Overall order status breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <StatusBadge status="Confirmed" count={statusCounts.Confirmed || 0} />
              <StatusBadge status="Assigned" count={statusCounts.Assigned || 0} />
              <StatusBadge status="Shipped" count={statusCounts.Shipped || 0} />
              <StatusBadge status="Delivered" count={statusCounts.Delivered || 0} />
              <StatusBadge status="Cancelled" count={statusCounts.Cancelled || 0} />
              <StatusBadge status="Returned" count={statusCounts.Returned || 0} />
            </div>
          </CardContent>
        </Card>

        {/* Today's Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Today's Orders</CardTitle>
            <CardDescription>Status breakdown for today's orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <StatusBadge status="Confirmed" count={todaysStatusCounts.Confirmed || 0} />
              <StatusBadge status="Assigned" count={todaysStatusCounts.Assigned || 0} />
              <StatusBadge status="Shipped" count={todaysStatusCounts.Shipped || 0} />
              <StatusBadge status="Delivered" count={todaysStatusCounts.Delivered || 0} />
              <StatusBadge status="Cancelled" count={todaysStatusCounts.Cancelled || 0} />
              <StatusBadge status="Returned" count={todaysStatusCounts.Returned || 0} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Completion Rate"
          value={`${completionRate}%`}
          subtitle={`${totalDelivered} out of ${stats.totalOrders || 0} orders`}
          icon={<CheckCircle className="h-6 w-6" />}
          color="success"
        />
        
        <StatCard
          title="Cancellation Rate"
          value={`${cancellationRate}%`}
          subtitle={`${totalCancelled} cancelled orders`}
          icon={<XCircle className="h-6 w-6" />}
          color="danger"
        />
        
        <StatCard
          title="Return Rate"
          value={`${(stats.totalOrders || 0) > 0 ? ((totalReturned / (stats.totalOrders || 1)) * 100).toFixed(1) : "0"}%`}
          subtitle={`${totalReturned} returned orders`}
          icon={<RotateCcw className="h-6 w-6" />}
          color="warning"
        />
      </div>
    </div>
  );
}
