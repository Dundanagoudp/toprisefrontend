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
  ShoppingCart,
  DollarSign,
  Receipt,
  Truck,
  BarChart3,
  TrendingUp,
  Package,
  Calendar,
} from "lucide-react";
import { OrderAnalyticsResponse } from "@/types/order-analytics-types";
import { formatCurrency, formatNumber } from "@/service/order-analytics-service";
import { format } from "date-fns";

interface OrderAnalyticsProps {
  data: OrderAnalyticsResponse | null;
}

export default function OrderAnalytics({ data }: OrderAnalyticsProps) {
  if (!data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const { summary, analytics } = data.data;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Orders
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatNumber(summary.totalOrders)}
            </div>
            <p className="text-xs text-gray-500">
              All time orders
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Delivery Charges
            </CardTitle>
            <Truck className="h-4 w-4 text-purple-600" />
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
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              Status Breakdown
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-teal-600" />
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

      {/* Order Analytics Table */}
      <Card>
        <CardHeader>
          <CardTitle>Order Analytics Details</CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Group</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Average Amount</TableHead>
                  <TableHead>Min Amount</TableHead>
                  <TableHead>Max Amount</TableHead>
                  <TableHead>Total GST</TableHead>
                  <TableHead>Delivery Charges</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                        {item._id ? (
                          item._id.includes('-') ? 
                            format(new Date(item._id), "MMM dd, yyyy") : 
                            item._id
                        ) : 'All'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Package className="h-4 w-4 mr-1 text-gray-400" />
                        {formatNumber(item.count)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1 text-green-600" />
                        {formatCurrency(item.totalAmount)}
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(item.avgAmount)}</TableCell>
                    <TableCell>{formatCurrency(item.minAmount)}</TableCell>
                    <TableCell>{formatCurrency(item.maxAmount)}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Receipt className="h-4 w-4 mr-1 text-orange-600" />
                        {formatCurrency(item.totalGST)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Truck className="h-4 w-4 mr-1 text-purple-600" />
                        {formatCurrency(item.totalDeliveryCharges)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No order analytics data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Order Analytics Summary</CardTitle>
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
              <h4 className="font-medium mb-3">Financial Breakdown</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total GST:</span>
                  <span className="font-medium">{formatCurrency(summary.totalGST)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Average GST:</span>
                  <span className="font-medium">{formatCurrency(summary.avgGST)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Delivery Charges:</span>
                  <span className="font-medium">{formatCurrency(summary.totalDeliveryCharges)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Average Delivery Charges:</span>
                  <span className="font-medium">{formatCurrency(summary.avgDeliveryCharges)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
