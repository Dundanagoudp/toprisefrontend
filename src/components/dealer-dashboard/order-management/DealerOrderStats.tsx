"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingCart, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Calendar,
  DollarSign,
  BarChart3
} from "lucide-react";
import { getDealerOrderStats, DealerOrderStats as DealerOrderStatsType } from "@/service/dealer-order-stats-service";
import { useToast } from "@/components/ui/toast";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: "default" | "success" | "warning" | "danger" | "info";
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatCard = ({ title, value, subtitle, icon, color, trend }: StatCardProps) => {
  const colorClasses = {
    default: "text-gray-600 bg-gray-100",
    success: "text-green-600 bg-green-100",
    warning: "text-yellow-600 bg-yellow-100", 
    danger: "text-red-600 bg-red-100",
    info: "text-blue-600 bg-blue-100"
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {subtitle && (
              <p className="text-xs text-gray-500">{subtitle}</p>
            )}
            {trend && (
              <div className="flex items-center space-x-1">
                <TrendingUp 
                  className={`h-3 w-3 ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`} 
                />
                <span className={`text-xs ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {trend.isPositive ? '+' : ''}{trend.value}%
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

interface StatusBadgeProps {
  status: string;
  count: number;
}

const StatusBadge = ({ status, count }: StatusBadgeProps) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "assigned":
        return "bg-blue-100 text-blue-800";
      case "packed":
        return "bg-purple-100 text-purple-800";
      case "shipped":
        return "bg-indigo-100 text-indigo-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "processing":
        return "bg-orange-100 text-orange-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm font-medium text-gray-700">{status}</span>
      <Badge className={getStatusColor(status)}>
        {count}
      </Badge>
    </div>
  );
};

export default function DealerOrderStats() {
  const [stats, setStats] = useState<DealerOrderStatsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const statsData = await getDealerOrderStats();
        setStats(statsData);
      } catch (err) {
        console.error("Failed to fetch dealer order stats:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch order statistics");
        showToast("Failed to load order statistics", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [showToast]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-12 w-12 rounded-full" />
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
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Statistics</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Available</h3>
          <p className="text-gray-600">No order statistics found for your account.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          subtitle="All time orders"
          icon={<ShoppingCart className="h-6 w-6" />}
          color="info"
        />
        
        <StatCard
          title="Orders Today"
          value={stats.todaysOrders}
          subtitle="New orders today"
          icon={<Calendar className="h-6 w-6" />}
          color="default"
        />
        
        <StatCard
          title="Pending Orders"
          value={stats.pendingOrders}
          subtitle="Awaiting processing"
          icon={<Clock className="h-6 w-6" />}
          color="warning"
        />
        
        <StatCard
          title="Delivered Orders"
          value={stats.deliveredOrders}
          subtitle="Successfully delivered"
          icon={<CheckCircle className="h-6 w-6" />}
          color="success"
        />
      </div>

      {/* Picklist Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Picklists"
          value={stats.totalPickLists}
          subtitle="All picklists"
          icon={<Package className="h-6 w-6" />}
          color="info"
        />
        
        <StatCard
          title="Picklists Today"
          value={stats.todaysPickLists}
          subtitle="New picklists today"
          icon={<Calendar className="h-6 w-6" />}
          color="default"
        />
        
        <StatCard
          title="Pending Picklists"
          value={stats.pendingPickLists}
          subtitle="Awaiting processing"
          icon={<Clock className="h-6 w-6" />}
          color="warning"
        />
        
        <StatCard
          title="Completed Picklists"
          value={stats.completedPickLists}
          subtitle="Successfully processed"
          icon={<CheckCircle className="h-6 w-6" />}
          color="success"
        />
      </div>

      {/* Financial Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Order Value"
          value={`₹${stats.totalOrderValue.toLocaleString()}`}
          subtitle="All time revenue"
          icon={<DollarSign className="h-6 w-6" />}
          color="success"
        />
        
        <StatCard
          title="Average Order Value"
          value={`₹${stats.averageOrderValue.toLocaleString()}`}
          subtitle="Per order average"
          icon={<TrendingUp className="h-6 w-6" />}
          color="info"
        />
        
        <StatCard
          title="Min Order Value"
          value={`₹${stats.minOrderValue.toLocaleString()}`}
          subtitle="Lowest order amount"
          icon={<BarChart3 className="h-6 w-6" />}
          color="default"
        />
        
        <StatCard
          title="Max Order Value"
          value={`₹${stats.maxOrderValue.toLocaleString()}`}
          subtitle="Highest order amount"
          icon={<BarChart3 className="h-6 w-6" />}
          color="default"
        />
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Order Completion Rate"
          value={`${stats.orderCompletionRate.toFixed(1)}%`}
          subtitle={`${stats.deliveredOrders} out of ${stats.totalOrders} orders`}
          icon={<CheckCircle className="h-6 w-6" />}
          color="success"
        />
        
        <StatCard
          title="Picklist Completion Rate"
          value={`${stats.picklistCompletionRate.toFixed(1)}%`}
          subtitle={`${stats.completedPickLists} out of ${stats.totalPickLists} picklists`}
          icon={<Package className="h-6 w-6" />}
          color="success"
        />
        
        <StatCard
          title="Active Orders"
          value={stats.activeOrders}
          subtitle="Orders in progress"
          icon={<Clock className="h-6 w-6" />}
          color="warning"
        />
      </div>

      {/* Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Order Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <StatusBadge status="Pending" count={stats.pendingOrders} />
              <StatusBadge status="Assigned" count={stats.assignedOrders} />
              <StatusBadge status="Packed" count={stats.packedOrders} />
              <StatusBadge status="Shipped" count={stats.shippedOrders} />
              <StatusBadge status="Delivered" count={stats.deliveredOrders} />
              <StatusBadge status="Cancelled" count={stats.cancelledOrders} />
              <StatusBadge status="Returned" count={stats.returnedOrders} />
            </div>
          </CardContent>
        </Card>

        {/* Picklist Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Picklist Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <StatusBadge status="Pending" count={stats.pendingPickLists} />
              <StatusBadge status="Processing" count={stats.processedPickLists} />
              <StatusBadge status="Completed" count={stats.completedPickLists} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
