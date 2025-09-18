"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ShoppingCart,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Users,
  Package,
  Truck,
  AlertTriangle,
  Calendar,
  BarChart3,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface OrderStatsProps {
  orders: any[];
  loading?: boolean;
}

interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  averageOrderValue: number;
  totalCustomers: number;
  totalProducts: number;
  ordersToday: number;
  ordersThisWeek: number;
  ordersThisMonth: number;
  revenueGrowth: number;
  orderGrowth: number;
  topPaymentMethods: { method: string; count: number; percentage: number }[];
  orderStatusDistribution: { status: string; count: number; percentage: number }[];
  recentActivity: { type: string; description: string; time: string }[];
}

export default function OrderStats({ orders, loading = false }: OrderStatsProps) {
  const [stats, setStats] = useState<OrderStats | null>(null);

  const calculateStats = useMemo(() => {
    if (!orders || orders.length === 0) {
      return {
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        completedOrders: 0,
        cancelledOrders: 0,
        averageOrderValue: 0,
        totalCustomers: 0,
        totalProducts: 0,
        ordersToday: 0,
        ordersThisWeek: 0,
        ordersThisMonth: 0,
        revenueGrowth: 0,
        orderGrowth: 0,
        topPaymentMethods: [],
        orderStatusDistribution: [],
        recentActivity: [],
      };
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Basic stats
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => {
      const amount = parseFloat(order.value?.replace(/[^0-9.-]+/g, "") || "0");
      return sum + amount;
    }, 0);

    // Status distribution
    const statusCounts = orders.reduce((acc, order) => {
      const status = order.status?.toLowerCase() || "pending";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const pendingOrders = statusCounts.pending || 0;
    const completedOrders = statusCounts.completed || statusCounts.delivered || 0;
    const cancelledOrders = statusCounts.cancelled || statusCounts.rejected || 0;

    // Time-based stats
    const ordersToday = orders.filter(order => {
      const orderDate = new Date(order.orderDate);
      return orderDate >= today;
    }).length;

    const ordersThisWeek = orders.filter(order => {
      const orderDate = new Date(order.orderDate);
      return orderDate >= weekAgo;
    }).length;

    const ordersThisMonth = orders.filter(order => {
      const orderDate = new Date(order.orderDate);
      return orderDate >= monthAgo;
    }).length;

    // Customer and product stats
    const uniqueCustomers = new Set(orders.map(order => order.customer)).size;
    const totalProducts = orders.reduce((sum, order) => sum + (order.skusCount || 0), 0);

    // Payment methods
    const paymentCounts = orders.reduce((acc, order) => {
      const payment = order.payment?.toLowerCase() || "unknown";
      acc[payment] = (acc[payment] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topPaymentMethods = Object.entries(paymentCounts)
      .map(([method, count]) => ({
        method: method.charAt(0).toUpperCase() + method.slice(1),
        count,
        percentage: (count / totalOrders) * 100,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    // Order status distribution
    const orderStatusDistribution = Object.entries(statusCounts)
      .map(([status, count]) => ({
        status: status.charAt(0).toUpperCase() + status.slice(1),
        count,
        percentage: (count / totalOrders) * 100,
      }))
      .sort((a, b) => b.count - a.count);

    // Recent activity (mock data for now)
    const recentActivity = [
      { type: "order", description: "New order #ORD-001 created", time: "2 minutes ago" },
      { type: "payment", description: "Payment received for order #ORD-002", time: "15 minutes ago" },
      { type: "shipping", description: "Order #ORD-003 shipped", time: "1 hour ago" },
      { type: "delivery", description: "Order #ORD-004 delivered", time: "2 hours ago" },
    ];

    return {
      totalOrders,
      totalRevenue,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      totalCustomers: uniqueCustomers,
      totalProducts,
      ordersToday,
      ordersThisWeek,
      ordersThisMonth,
      revenueGrowth: 12.5, // Mock data
      orderGrowth: 8.3, // Mock data
      topPaymentMethods,
      orderStatusDistribution,
      recentActivity,
    };
  }, [orders]);

  useEffect(() => {
    setStats(calculateStats);
  }, [calculateStats]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.totalOrders)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{stats.orderGrowth}%</span> from last month
            </p>
          </CardContent>
        </Card>

        {/* Total Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{stats.revenueGrowth}%</span> from last month
            </p>
          </CardContent>
        </Card>

        {/* Pending Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.pendingOrders)}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.pendingOrders / stats.totalOrders) * 100).toFixed(1)}% of total orders
            </p>
          </CardContent>
        </Card>

        {/* Completed Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Orders</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.completedOrders)}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.completedOrders / stats.totalOrders) * 100).toFixed(1)}% completion rate
            </p>
          </CardContent>
        </Card>

        {/* Average Order Value */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.averageOrderValue)}</div>
            <p className="text-xs text-muted-foreground">
              Per order average
            </p>
          </CardContent>
        </Card>

        {/* Total Customers */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.totalCustomers)}</div>
            <p className="text-xs text-muted-foreground">
              Unique customers
            </p>
          </CardContent>
        </Card>

        {/* Total Products */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.totalProducts)}</div>
            <p className="text-xs text-muted-foreground">
              Items ordered
            </p>
          </CardContent>
        </Card>

        {/* Cancelled Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelled Orders</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.cancelledOrders)}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.cancelledOrders / stats.totalOrders) * 100).toFixed(1)}% cancellation rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Time-based Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders Today</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.ordersToday)}</div>
            <p className="text-xs text-muted-foreground">
              New orders today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.ordersThisWeek)}</div>
            <p className="text-xs text-muted-foreground">
              Orders this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.ordersThisMonth)}</div>
            <p className="text-xs text-muted-foreground">
              Orders this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods & Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Payment Methods</CardTitle>
            <CardDescription>Most used payment methods</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topPaymentMethods.map((method, index) => (
                <div key={method.method} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{method.method}</Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{method.count} orders</div>
                    <div className="text-xs text-muted-foreground">{method.percentage.toFixed(1)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Order Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Order Status</CardTitle>
            <CardDescription>Distribution of order statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.orderStatusDistribution.map((status, index) => (
                <div key={status.status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant="outline"
                      className={
                        status.status.toLowerCase() === 'completed' || status.status.toLowerCase() === 'delivered' 
                          ? 'border-green-200 text-green-800' 
                          : status.status.toLowerCase() === 'pending'
                          ? 'border-yellow-200 text-yellow-800'
                          : status.status.toLowerCase() === 'cancelled' || status.status.toLowerCase() === 'rejected'
                          ? 'border-red-200 text-red-800'
                          : 'border-gray-200 text-gray-800'
                      }
                    >
                      {status.status}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{status.count} orders</div>
                    <div className="text-xs text-muted-foreground">{status.percentage.toFixed(1)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
          <CardDescription>Latest order activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {activity.type === 'order' && <ShoppingCart className="h-4 w-4 text-blue-500" />}
                  {activity.type === 'payment' && <DollarSign className="h-4 w-4 text-green-500" />}
                  {activity.type === 'shipping' && <Truck className="h-4 w-4 text-orange-500" />}
                  {activity.type === 'delivery' && <CheckCircle className="h-4 w-4 text-green-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
