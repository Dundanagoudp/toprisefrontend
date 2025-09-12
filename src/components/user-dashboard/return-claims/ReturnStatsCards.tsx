"use client";

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  RotateCcw, 
  Clock, 
  CheckCircle, 
  XCircle, 
  DollarSign,
  Package,
  AlertTriangle,
  TrendingUp
} from "lucide-react";
import { ReturnRequest, ReturnStatus } from "@/types/return-Types";

interface ReturnStatsCardsProps {
  returnRequests: ReturnRequest[];
  className?: string;
}

export default function ReturnStatsCards({ returnRequests, className = "" }: ReturnStatsCardsProps) {
  // Calculate statistics from table data
  const stats = useMemo(() => {
    if (!returnRequests || returnRequests.length === 0) {
      return {
        totalReturns: 0,
        pendingReturns: 0,
        approvedReturns: 0,
        rejectedReturns: 0,
        underInspection: 0,
        completedReturns: 0,
        totalRefundAmount: 0,
        avgProcessingTime: 0
      };
    }

    const totalReturns = returnRequests.length;
    
    // Count by status
    const statusCounts = returnRequests.reduce((acc, request) => {
      const status = request.returnStatus;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<ReturnStatus, number>);

    // Calculate refund amounts
    const totalRefundAmount = returnRequests.reduce((sum, request) => {
      return sum + (request.refund?.refundAmount || 0);
    }, 0);

    // Calculate processing time (simplified - days between request and completion)
    const processingTimes = returnRequests
      .filter(request => request.returnStatus === "Completed" || request.returnStatus === "Refund_Processed")
      .map(request => {
        const requestDate = new Date(request.timestamps.requestedAt);
        const completionDate = new Date(request.updatedAt);
        return Math.ceil((completionDate.getTime() - requestDate.getTime()) / (1000 * 60 * 60 * 24));
      });

    const avgProcessingTime = processingTimes.length > 0 
      ? processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length 
      : 0;

    return {
      totalReturns,
      pendingReturns: statusCounts["Requested"] || 0,
      approvedReturns: (statusCounts["Approved"] || 0) + (statusCounts["Validated"] || 0),
      rejectedReturns: statusCounts["Rejected"] || 0,
      underInspection: statusCounts["Under_Inspection"] || 0,
      completedReturns: (statusCounts["Completed"] || 0) + (statusCounts["Refund_Processed"] || 0),
      totalRefundAmount,
      avgProcessingTime: Math.round(avgProcessingTime * 10) / 10 // Round to 1 decimal place
    };
  }, [returnRequests]);

  const statsCards = [
    {
      title: "Total Returns",
      value: stats.totalReturns.toLocaleString(),
      icon: RotateCcw,
      description: "All return requests",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    },
    {
      title: "Pending",
      value: stats.pendingReturns.toLocaleString(),
      icon: Clock,
      description: "Awaiting validation",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200"
    },
    {
      title: "Approved",
      value: stats.approvedReturns.toLocaleString(),
      icon: CheckCircle,
      description: "Validated & approved",
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
    },
    {
      title: "Rejected",
      value: stats.rejectedReturns.toLocaleString(),
      icon: XCircle,
      description: "Not eligible",
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200"
    },
    {
      title: "Under Inspection",
      value: stats.underInspection.toLocaleString(),
      icon: Package,
      description: "Being inspected",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200"
    },
    {
      title: "Completed",
      value: stats.completedReturns.toLocaleString(),
      icon: TrendingUp,
      description: "Processed successfully",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200"
    },
    {
      title: "Total Refund",
      value: `₹${stats.totalRefundAmount.toLocaleString()}`,
      icon: DollarSign,
      description: "Amount refunded",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-200"
    },
    {
      title: "Avg Processing",
      value: `${stats.avgProcessingTime} days`,
      icon: AlertTriangle,
      description: "Time to complete",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200"
    }
  ];

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4 ${className}`}>
      {statsCards.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <Card 
            key={index} 
            className={`border ${stat.borderColor} hover:shadow-md transition-shadow duration-200`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <IconComponent className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {stat.value}
              </div>
              <p className="text-xs text-gray-500">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
