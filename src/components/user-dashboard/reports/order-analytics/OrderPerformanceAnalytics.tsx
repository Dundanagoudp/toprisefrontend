"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity,
  DollarSign,
  Receipt,
  Truck,
  BarChart3,
  TrendingUp,
  Package,
  Calendar,
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
} from "lucide-react";
import { OrderPerformanceResponse } from "@/types/order-analytics-types";
import { formatCurrency, formatNumber } from "@/service/order-analytics-service";
import { format } from "date-fns";

interface OrderPerformanceAnalyticsProps {
  data: OrderPerformanceResponse | null;
}

export default function OrderPerformanceAnalytics({ data }: OrderPerformanceAnalyticsProps) {
  if (!data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const { summary, performance } = data.data;

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return "bg-yellow-100 text-yellow-800";
      case 'confirmed':
        return "bg-blue-100 text-blue-800";
      case 'processing':
        return "bg-purple-100 text-purple-800";
      case 'shipped':
        return "bg-indigo-100 text-indigo-800";
      case 'delivered':
        return "bg-green-100 text-green-800";
      case 'cancelled':
        return "bg-red-100 text-red-800";
      case 'returned':
        return "bg-orange-100 text-orange-800";
      case 'refunded':
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getOrderTypeBadgeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'standard':
        return "bg-blue-100 text-blue-800";
      case 'express':
        return "bg-red-100 text-red-800";
      case 'bulk':
        return "bg-purple-100 text-purple-800";
      case 'subscription':
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentTypeBadgeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'cash_on_delivery':
        return "bg-green-100 text-green-800";
      case 'online':
        return "bg-blue-100 text-blue-800";
      case 'wallet':
        return "bg-purple-100 text-purple-800";
      case 'card':
        return "bg-indigo-100 text-indigo-800";
      case 'upi':
        return "bg-orange-100 text-orange-800";
      case 'net_banking':
        return "bg-teal-100 text-teal-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Orders
            </CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatNumber(summary.totalOrders)}
            </div>
            <p className="text-xs text-gray-500">
              Performance tracking
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Amount
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(summary.totalAmount)}
            </div>
            <p className="text-xs text-gray-500">
              {formatCurrency(summary.avgAmount)} average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Revenue
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(summary.totalRevenue)}
            </div>
            <p className="text-xs text-gray-500">
              {formatCurrency(summary.avgRevenue)} average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total GST
            </CardTitle>
            <Receipt className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(summary.totalGST)}
            </div>
            <p className="text-xs text-gray-500">
              {formatCurrency(summary.avgGST)} average
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Amount Range
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Min:</span>
                <span className="font-medium">{formatCurrency(summary.minAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Max:</span>
                <span className="font-medium">{formatCurrency(summary.maxAmount)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Delivery Charges
            </CardTitle>
            <Truck className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(summary.totalDeliveryCharges)}
            </div>
            <p className="text-xs text-gray-500">
              {formatCurrency(summary.avgDeliveryCharges)} average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Status Breakdown
            </CardTitle>
            <Package className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {Object.keys(summary.statusBreakdown).length > 0 ? (
                Object.entries(summary.statusBreakdown).map(([status, count]) => (
                  <Badge key={status} variant="outline" className="text-xs">
                    {status || 'Unknown'}: {count}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-gray-500">No status data</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Order Performance Details</CardTitle>
        </CardHeader>
        <CardContent>
          {performance.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Dealer</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {performance.map((order) => (
                  <TableRow key={order.orderId}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <Package className="h-4 w-4 mr-2 text-blue-600" />
                        {order.orderId}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <DollarSign className="h-3 w-3 mr-1 text-green-600" />
                          <span className="font-medium">{formatCurrency(order.orderAmount)}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Total: {formatCurrency(order.totalAmount)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeColor(order.status)}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getOrderTypeBadgeColor(order.orderType)}>
                        {order.orderType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPaymentTypeBadgeColor(order.paymentType)}>
                        {order.paymentType.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <User className="h-3 w-3 mr-1 text-gray-400" />
                          {order.customerInfo?.name || 'N/A'}
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <Mail className="h-3 w-3 mr-1" />
                          {order.customerInfo?.email || 'N/A'}
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <Phone className="h-3 w-3 mr-1" />
                          {order.customerInfo?.phone || 'N/A'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Building2 className="h-3 w-3 mr-1 text-gray-400" />
                          {order.dealerInfo?.legalName || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {order.dealerInfo?.dealerId || 'N/A'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm">
                        <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                        {format(new Date(order.createdAt), "MMM dd, yyyy")}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No order performance data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Order Overview</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Orders:</span>
                  <span className="font-medium">{formatNumber(summary.totalOrders)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Amount:</span>
                  <span className="font-medium">{formatCurrency(summary.totalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Average Amount:</span>
                  <span className="font-medium">{formatCurrency(summary.avgAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Amount Range:</span>
                  <span className="font-medium">
                    {formatCurrency(summary.minAmount)} - {formatCurrency(summary.maxAmount)}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-3">Financial Performance</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Revenue:</span>
                  <span className="font-medium">{formatCurrency(summary.totalRevenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Average Revenue:</span>
                  <span className="font-medium">{formatCurrency(summary.avgRevenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total GST:</span>
                  <span className="font-medium">{formatCurrency(summary.totalGST)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Delivery Charges:</span>
                  <span className="font-medium">{formatCurrency(summary.totalDeliveryCharges)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
