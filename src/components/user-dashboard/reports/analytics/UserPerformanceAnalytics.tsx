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
  UserCheck,
  Mail,
  Activity,
  Calendar,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
} from "lucide-react";
import { UserPerformanceResponse } from "@/types/analytics-types";
import { format } from "date-fns";

interface UserPerformanceAnalyticsProps {
  data: UserPerformanceResponse | null;
}

export default function UserPerformanceAnalytics({ data }: UserPerformanceAnalyticsProps) {
  if (!data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const { summary, performance } = data.data;

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Super-admin':
        return "bg-red-100 text-red-800";
      case 'Fulfillment-Admin':
        return "bg-blue-100 text-blue-800";
      case 'Fulfillment-Staff':
        return "bg-green-100 text-green-800";
      case 'Inventory-Admin':
        return "bg-purple-100 text-purple-800";
      case 'Inventory-Staff':
        return "bg-orange-100 text-orange-800";
      case 'Customer-Support':
        return "bg-pink-100 text-pink-800";
      case 'Dealer':
        return "bg-yellow-100 text-yellow-800";
      case 'User':
        return "bg-gray-100 text-gray-800";
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
              Total Users
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {summary.totalUsers}
            </div>
            <p className="text-xs text-gray-500">
              All registered users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Active Users
            </CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {summary.activeUsers}
            </div>
            <p className="text-xs text-gray-500">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Avg Login Count
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {summary.avgLoginCount}
            </div>
            <p className="text-xs text-gray-500">
              Per user
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Logins
            </CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {summary.totalLoginCount}
            </div>
            <p className="text-xs text-gray-500">
              All time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Role Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Role Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(summary.roleBreakdown).map(([role, data]) => (
              <div key={role} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Badge className={getRoleBadgeColor(role)}>
                    {role}
                  </Badge>
                  <span className="text-2xl font-bold text-gray-900">
                    {data.count}
                  </span>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Total Logins:</span>
                    <span className="font-medium">{data.totalLogins}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Logins:</span>
                    <span className="font-medium">{data.avgLogins}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>User Performance Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Days Since Creation</TableHead>
                <TableHead>Days Since Last Login</TableHead>
                <TableHead>Activity Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {performance.map((user) => (
                <TableRow key={user.userId}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <UserCheck className="h-4 w-4 mr-2 text-blue-600" />
                      {user.userId}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm">
                      <Mail className="h-3 w-3 mr-1 text-gray-400" />
                      {user.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getRoleBadgeColor(user.role)}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                      <span className={user.daysSinceCreation ? "text-gray-900" : "text-gray-400"}>
                        {user.daysSinceCreation ? `${user.daysSinceCreation} days` : "N/A"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1 text-gray-400" />
                      <span className={user.daysSinceLastLogin ? "text-gray-900" : "text-gray-400"}>
                        {user.daysSinceLastLogin ? `${user.daysSinceLastLogin} days` : "N/A"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {user.activityScore !== null ? (
                        <>
                          <Activity className="h-4 w-4 mr-1 text-green-600" />
                          <span className="font-medium text-green-600">
                            {user.activityScore}
                          </span>
                        </>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">User Statistics</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Users:</span>
                  <span className="font-medium">{summary.totalUsers}</span>
                </div>
                <div className="flex justify-between">
                  <span>Active Users:</span>
                  <span className="font-medium">{summary.activeUsers}</span>
                </div>
                <div className="flex justify-between">
                  <span>Inactive Users:</span>
                  <span className="font-medium">{summary.inactiveUsers}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Login Count:</span>
                  <span className="font-medium">{summary.totalLoginCount}</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Login Statistics</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Average Login Count:</span>
                  <span className="font-medium">{summary.avgLoginCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Maximum Login Count:</span>
                  <span className="font-medium">{summary.maxLoginCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Minimum Login Count:</span>
                  <span className="font-medium">{summary.minLoginCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Roles:</span>
                  <span className="font-medium">{Object.keys(summary.roleBreakdown).length}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
