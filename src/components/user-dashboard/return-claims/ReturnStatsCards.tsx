"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  RotateCcw, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Package,
  TrendingUp
} from "lucide-react";
import { ReturnStatsResponse } from "@/types/return-Types";

interface ReturnStatsCardsProps {
  stats: ReturnStatsResponse | null;
  className?: string;
}

export default function ReturnStatsCards({ stats, className = "" }: ReturnStatsCardsProps) {
  // Use stats from API or default to zero
  const displayStats = {
    totalReturns: stats?.totalReturns || 0,
    pendingReturns: stats?.statusCounts?.Requested || 0,
    approvedReturns: stats?.statusCounts?.Validated || 0,
    rejectedReturns: stats?.statusCounts?.Rejected || 0,
    underInspection: (stats?.statusCounts?.Inspection_Started || 0) + (stats?.statusCounts?.Inspection_Completed || 0),
    completedReturns: (stats?.statusCounts?.Initiated_Refund || 0) + (stats?.statusCounts?.Refund_Completed || 0),
  };

  const statsCards = [
    {
      title: "Total Returns",
      value: displayStats.totalReturns.toLocaleString(),
      icon: RotateCcw,
      description: "All return requests",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    },
    {
      title: "Pending",
      value: displayStats.pendingReturns.toLocaleString(),
      icon: Clock,
      description: "Awaiting validation",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200"
    },
    {
      title: "Approved",
      value: displayStats.approvedReturns.toLocaleString(),
      icon: CheckCircle,
      description: "Validated & approved",
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
    },
    {
      title: "Rejected",
      value: displayStats.rejectedReturns.toLocaleString(),
      icon: XCircle,
      description: "Not eligible",
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200"
    },
    {
      title: "Under Inspection",
      value: displayStats.underInspection.toLocaleString(),
      icon: Package,
      description: "Being inspected",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200"
    },
    {
      title: "Completed",
      value: displayStats.completedReturns.toLocaleString(),
      icon: TrendingUp,
      description: "Processed successfully",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200"
    }
  ];

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 ${className}`}>
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
