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
  Package,
  BarChart3,
  TrendingUp,
  Tag,
  Calendar,
  User,
  Building2,
  Image,
} from "lucide-react";
import { ProductPerformanceResponse } from "@/types/product-analytics-types";
import { formatCurrency, formatNumber } from "@/service/product-analytics-service";

interface ProductPerformanceAnalyticsProps {
  data: ProductPerformanceResponse | null;
}

export default function ProductPerformanceAnalytics({ data }: ProductPerformanceAnalyticsProps) {
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
      case 'approved':
        return "bg-green-100 text-green-800";
      case 'pending':
        return "bg-yellow-100 text-yellow-800";
      case 'rejected':
        return "bg-red-100 text-red-800";
      case 'draft':
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getProductTypeBadgeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'oe':
        return "bg-blue-100 text-blue-800";
      case 'oes':
        return "bg-purple-100 text-purple-800";
      case 'aftermarket':
        return "bg-green-100 text-green-800";
      case 'universal':
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'super-admin':
        return "bg-red-100 text-red-800";
      case 'admin':
        return "bg-blue-100 text-blue-800";
      case 'user':
        return "bg-green-100 text-green-800";
      case 'dealer':
        return "bg-purple-100 text-purple-800";
      case 'fulfillment-staff':
        return "bg-orange-100 text-orange-800";
      case 'fulfillment-admin':
        return "bg-indigo-100 text-indigo-800";
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
              Total Products
            </CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatNumber(summary.totalProducts)}
            </div>
            <p className="text-xs text-gray-500">
              Performance tracking
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Selling Price
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(summary.totalSellingPrice)}
            </div>
            <p className="text-xs text-gray-500">
              {formatCurrency(summary.avgSellingPrice)} average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total MRP
            </CardTitle>
            <Tag className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(summary.totalMrp)}
            </div>
            <p className="text-xs text-gray-500">
              {formatCurrency(summary.avgMrp)} average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Average Discount
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {summary.avgDiscount.toFixed(1)}%
            </div>
            <p className="text-xs text-gray-500">
              Average discount rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Product Performance Details</CardTitle>
        </CardHeader>
        <CardContent>
          {performance.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Properties</TableHead>
                  <TableHead>Created By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {performance.map((product) => (
                  <TableRow key={product.productId}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <Package className="h-4 w-4 mr-2 text-blue-600" />
                          <span className="font-medium">{product.productName}</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {product.sku}
                        </div>
                        <div className="text-xs text-gray-400">
                          {product.productId}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">
                          <span className="font-medium">Brand:</span> {product.brand}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Category:</span> {product.category}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Sub:</span> {product.subCategory}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Model:</span> {product.model}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Part:</span> {product.manufacturerPartName}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <DollarSign className="h-3 w-3 mr-1 text-green-600" />
                          <span className="font-medium">{formatCurrency(product.sellingPrice)}</span>
                        </div>
                        {product.priceDifference !== null && (
                          <div className="text-xs text-gray-500">
                            Diff: {formatCurrency(product.priceDifference)}
                          </div>
                        )}
                        {product.discountPercentage !== null && (
                          <div className="text-xs text-gray-500">
                            Discount: {product.discountPercentage}%
                          </div>
                        )}
                        {product.valueScore !== null && (
                          <div className="text-xs text-gray-500">
                            Score: {product.valueScore}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeColor(product.liveStatus)}>
                        {product.liveStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getProductTypeBadgeColor(product.productType)}>
                        {product.productType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Building2 className="h-3 w-3 mr-1 text-gray-400" />
                          <span className={product.isUniversal ? "text-green-600" : "text-gray-600"}>
                            {product.isUniversal ? "Universal" : "Specific"}
                          </span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Package className="h-3 w-3 mr-1 text-gray-400" />
                          <span className={product.isConsumable ? "text-orange-600" : "text-gray-600"}>
                            {product.isConsumable ? "Consumable" : "Durable"}
                          </span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Image className="h-3 w-3 mr-1 text-gray-400" />
                          <span>{product.images} images</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <User className="h-3 w-3 mr-1 text-gray-400" />
                          {product.createdBy}
                        </div>
                        <Badge className={getRoleBadgeColor(product.createdByRole)} variant="outline">
                          {product.createdByRole}
                        </Badge>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No product performance data available
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
              <h4 className="font-medium mb-3">Product Overview</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Products:</span>
                  <span className="font-medium">{formatNumber(summary.totalProducts)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Selling Price:</span>
                  <span className="font-medium">{formatCurrency(summary.totalSellingPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Average Selling Price:</span>
                  <span className="font-medium">{formatCurrency(summary.avgSellingPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total MRP:</span>
                  <span className="font-medium">{formatCurrency(summary.totalMrp)}</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-3">Performance Metrics</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Average MRP:</span>
                  <span className="font-medium">{formatCurrency(summary.avgMrp)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Average Discount:</span>
                  <span className="font-medium">{summary.avgDiscount.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Price Range:</span>
                  <span className="font-medium">
                    {formatCurrency(summary.avgSellingPrice)} avg
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
