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
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Package,
  User,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { DealerAnalyticsResponse } from "@/types/analytics-types";
import { format } from "date-fns";

interface DealerAnalyticsProps {
  data: DealerAnalyticsResponse | null;
}

export default function DealerAnalytics({ data }: DealerAnalyticsProps) {
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
              Total Dealers
            </CardTitle>
            <Building2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {summary.totalDealers}
            </div>
            <p className="text-xs text-gray-500">
              All registered dealers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Active Dealers
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {summary.activeDealers}
            </div>
            <p className="text-xs text-gray-500">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Categories
            </CardTitle>
            <Package className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {summary.totalCategories}
            </div>
            <p className="text-xs text-gray-500">
              Across all dealers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Avg Categories
            </CardTitle>
            <Package className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {summary.avgCategories.toFixed(1)}
            </div>
            <p className="text-xs text-gray-500">
              Per dealer
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown */}
      {Object.keys(summary.statusBreakdown).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(summary.statusBreakdown).map(([status, count]) => (
                <Badge
                  key={status}
                  variant={status === 'active' ? 'default' : 'secondary'}
                  className="px-3 py-1"
                >
                  {status || 'Unknown'}: {count}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dealers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Dealer Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dealer ID</TableHead>
                <TableHead>Legal Name</TableHead>
                <TableHead>Contact Info</TableHead>
                <TableHead>Categories</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analytics[0]?.dealers.map((dealer) => (
                <TableRow key={dealer.dealerId}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <Building2 className="h-4 w-4 mr-2 text-blue-600" />
                      {dealer.dealerId}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{dealer.legalName}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <Mail className="h-3 w-3 mr-1 text-gray-400" />
                        {dealer.userInfo.email}
                      </div>
                      <div className="flex items-center text-sm">
                        <Phone className="h-3 w-3 mr-1 text-gray-400" />
                        {dealer.userInfo.phone_Number}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {dealer.categoriesAllowed.slice(0, 2).map((category, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {category}
                        </Badge>
                      ))}
                      {dealer.categoriesAllowed.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{dealer.categoriesAllowed.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm">
                      <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                      {dealer.userInfo.last_login
                        ? format(new Date(dealer.userInfo.last_login), "MMM dd, yyyy")
                        : "Never"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={dealer.userInfo.last_login ? "default" : "secondary"}
                      className={
                        dealer.userInfo.last_login
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }
                    >
                      {dealer.userInfo.last_login ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Analytics Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Analytics Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Group Statistics</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Count:</span>
                  <span className="font-medium">{analytics[0]?.count || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Active Dealers:</span>
                  <span className="font-medium">{analytics[0]?.activeDealers || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Inactive Dealers:</span>
                  <span className="font-medium">{analytics[0]?.inactiveDealers || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Categories:</span>
                  <span className="font-medium">{analytics[0]?.totalCategories || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Categories:</span>
                  <span className="font-medium">
                    {analytics[0]?.avgCategories?.toFixed(1) || 0}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Overall Statistics</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Dealers:</span>
                  <span className="font-medium">{summary.totalDealers}</span>
                </div>
                <div className="flex justify-between">
                  <span>Active Dealers:</span>
                  <span className="font-medium">{summary.activeDealers}</span>
                </div>
                <div className="flex justify-between">
                  <span>Inactive Dealers:</span>
                  <span className="font-medium">{summary.inactiveDealers}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Categories:</span>
                  <span className="font-medium">{summary.totalCategories}</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Categories:</span>
                  <span className="font-medium">{summary.avgCategories.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
