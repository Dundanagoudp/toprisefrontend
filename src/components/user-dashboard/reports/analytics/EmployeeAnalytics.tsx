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
  Users,
  Mail,
  Phone,
  UserCheck,
  Calendar,
  Building2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { EmployeeAnalyticsResponse } from "@/types/analytics-types";
import { format } from "date-fns";

interface EmployeeAnalyticsProps {
  data: EmployeeAnalyticsResponse | null;
}

export default function EmployeeAnalytics({ data }: EmployeeAnalyticsProps) {
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
              Total Employees
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {summary.totalEmployees}
            </div>
            <p className="text-xs text-gray-500">
              All registered employees
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Active Employees
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {summary.activeEmployees}
            </div>
            <p className="text-xs text-gray-500">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Assigned Dealers
            </CardTitle>
            <Building2 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {summary.totalAssignedDealers}
            </div>
            <p className="text-xs text-gray-500">
              Total assignments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Avg Assignments
            </CardTitle>
            <UserCheck className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {summary.avgAssignedDealers.toFixed(1)}
            </div>
            <p className="text-xs text-gray-500">
              Per employee
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

      {/* Employees Table */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee ID</TableHead>
                <TableHead>Contact Info</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Assigned Dealers</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analytics[0]?.employees.map((employee) => (
                <TableRow key={employee.employeeId}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-blue-600" />
                      {employee.employeeId}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <Mail className="h-3 w-3 mr-1 text-gray-400" />
                        {employee.userInfo.email}
                      </div>
                      <div className="flex items-center text-sm">
                        <Phone className="h-3 w-3 mr-1 text-gray-400" />
                        {employee.userInfo.phone_Number}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        employee.userInfo.role === 'Fulfillment-Admin' || employee.userInfo.role === 'Super-admin'
                          ? "bg-blue-100 text-blue-800"
                          : employee.userInfo.role === 'Fulfillment-Staff'
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }
                    >
                      {employee.userInfo.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Building2 className="h-4 w-4 mr-1 text-purple-600" />
                      <span className="font-medium">{employee.assignedDealers.length}</span>
                      {employee.assignedDealers.length > 0 && (
                        <span className="text-xs text-gray-500 ml-1">
                          dealers
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm">
                      <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                      {employee.userInfo.last_login
                        ? format(new Date(employee.userInfo.last_login), "MMM dd, yyyy")
                        : "Never"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={employee.userInfo.last_login ? "default" : "secondary"}
                      className={
                        employee.userInfo.last_login
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }
                    >
                      {employee.userInfo.last_login ? "Active" : "Inactive"}
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
                  <span>Active Employees:</span>
                  <span className="font-medium">{analytics[0]?.activeEmployees || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Inactive Employees:</span>
                  <span className="font-medium">{analytics[0]?.inactiveEmployees || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Assigned Dealers:</span>
                  <span className="font-medium">{analytics[0]?.totalAssignedDealers || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Assigned Dealers:</span>
                  <span className="font-medium">
                    {analytics[0]?.avgAssignedDealers?.toFixed(1) || 0}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Overall Statistics</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Employees:</span>
                  <span className="font-medium">{summary.totalEmployees}</span>
                </div>
                <div className="flex justify-between">
                  <span>Active Employees:</span>
                  <span className="font-medium">{summary.activeEmployees}</span>
                </div>
                <div className="flex justify-between">
                  <span>Inactive Employees:</span>
                  <span className="font-medium">{summary.inactiveEmployees}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Assigned Dealers:</span>
                  <span className="font-medium">{summary.totalAssignedDealers}</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Assigned Dealers:</span>
                  <span className="font-medium">{summary.avgAssignedDealers.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
