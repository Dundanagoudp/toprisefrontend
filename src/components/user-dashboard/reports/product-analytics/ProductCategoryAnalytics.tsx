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
  Package,
  DollarSign,
  BarChart3,
  TrendingUp,
  Tag,
  Calendar,
  Layers,
  Building2,
} from "lucide-react";
import { ProductCategoryResponse } from "@/types/product-analytics-types";
import { formatCurrency, formatNumber } from "@/service/product-analytics-service";

interface ProductCategoryAnalyticsProps {
  data: ProductCategoryResponse | null;
}

export default function ProductCategoryAnalytics({ data }: ProductCategoryAnalyticsProps) {
  if (!data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const { summary, categoryReport } = data.data;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Products
            </CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatNumber(summary.totalProducts)}
            </div>
            <p className="text-xs text-gray-500">
              Category tracking
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
              Status Breakdown
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
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

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Price Range
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Min MRP:</span>
                <span className="font-medium">{formatCurrency(summary.minMrp)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Max MRP:</span>
                <span className="font-medium">{formatCurrency(summary.maxMrp)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Min Selling:</span>
                <span className="font-medium">{formatCurrency(summary.avgSellingPrice)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Max Selling:</span>
                <span className="font-medium">{formatCurrency(summary.avgSellingPrice)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Average Values
            </CardTitle>
            <Layers className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Avg MRP:</span>
                <span className="font-medium">{formatCurrency(summary.avgMrp)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Avg Selling Price:</span>
                <span className="font-medium">{formatCurrency(summary.avgSellingPrice)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Analytics Table */}
      <Card>
        <CardHeader>
          <CardTitle>Category Analytics Details</CardTitle>
        </CardHeader>
        <CardContent>
          {categoryReport.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Sub Category</TableHead>
                  <TableHead>Count</TableHead>
                  <TableHead>Total MRP</TableHead>
                  <TableHead>Average MRP</TableHead>
                  <TableHead>Total Selling Price</TableHead>
                  <TableHead>Average Selling Price</TableHead>
                  <TableHead>Brands</TableHead>
                  <TableHead>Models</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categoryReport.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <Package className="h-4 w-4 mr-2 text-blue-600" />
                        {item._id.category}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Layers className="h-4 w-4 mr-1 text-gray-400" />
                        {item._id.subCategory}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <BarChart3 className="h-4 w-4 mr-1 text-gray-400" />
                        {formatNumber(item.count)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Tag className="h-4 w-4 mr-1 text-orange-600" />
                        {formatCurrency(item.totalMrp)}
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(item.avgMrp || 0)}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1 text-green-600" />
                        {formatCurrency(item.totalSellingPrice)}
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(item.avgSellingPrice)}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {item.brands.slice(0, 2).map((brand, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {brand}
                          </Badge>
                        ))}
                        {item.brands.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{item.brands.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {item.models.slice(0, 2).map((model, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {model}
                          </Badge>
                        ))}
                        {item.models.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{item.models.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No category analytics data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Product Details Table */}
      {categoryReport[0]?.products && categoryReport[0].products.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product ID</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Selling Price</TableHead>
                  <TableHead>Live Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categoryReport[0].products.map((product, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <Package className="h-4 w-4 mr-2 text-blue-600" />
                        {product.productId}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {product.sku}
                      </Badge>
                    </TableCell>
                    <TableCell>{product.productName}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Building2 className="h-3 w-3 mr-1 text-gray-400" />
                        {product.brand}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                        {product.model}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1 text-green-600" />
                        {formatCurrency(product.sellingPrice)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={
                          product.liveStatus === 'Approved' 
                            ? 'bg-green-100 text-green-800' 
                            : product.liveStatus === 'Pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }
                      >
                        {product.liveStatus}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Summary Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Category Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Category Overview</h4>
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
              <h4 className="font-medium mb-3">Category Analysis</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Average MRP:</span>
                  <span className="font-medium">{formatCurrency(summary.avgMrp)}</span>
                </div>
                <div className="flex justify-between">
                  <span>MRP Range:</span>
                  <span className="font-medium">
                    {formatCurrency(summary.minMrp)} - {formatCurrency(summary.maxMrp)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Status Breakdown:</span>
                  <span className="font-medium">
                    {Object.keys(summary.statusBreakdown).length} categories
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Category Groups:</span>
                  <span className="font-medium">
                    {categoryReport.length} groups
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
