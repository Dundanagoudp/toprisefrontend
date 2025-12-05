"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  Clock, 
  RotateCcw, 
  DollarSign,
  Loader2,
  Download,
  FileText,
  FileSpreadsheet
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getComprehensivePaymentStats } from "@/service/payment-service";
import { ComprehensivePaymentStats } from "@/types/paymentDetails-Types";

interface PaymentStatsCardsProps {
  className?: string;
}

export default function PaymentStatsCards({ className = "" }: PaymentStatsCardsProps) {
  const [paymentStats, setPaymentStats] = useState<ComprehensivePaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPaymentStats = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await getComprehensivePaymentStats();
        
        if (response.success && response.data) {
          setPaymentStats(response.data);
        } else {
          console.warn("Failed to fetch payment stats:", response);
          setError("Failed to load payment statistics");
        }
      } catch (err) {
        console.error("Error fetching payment stats:", err);
        setError("Failed to load payment statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentStats();
  }, []);

  if (loading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 ${className}`}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="border border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-6 w-16 mb-1" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 ${className}`}>
        <Card className="border border-red-200 bg-red-50 col-span-full">
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-red-500 mx-auto mb-2" />
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!paymentStats) {
    return null;
  }

  // Export functions
  const exportToCSV = () => {
    if (!paymentStats) return;
    
    const { overview, statusBreakdown, methodBreakdown, refunds } = paymentStats;
    
    // Create CSV content for overview
    const overviewData = [
      ["Metric", "Value"],
      ["Total Payments", overview.totalPayments],
      ["Total Amount", `₹${overview.totalAmount.toLocaleString()}`],
      ["Average Amount", `₹${overview.averageAmount.toLocaleString()}`],
      ["Success Rate", `${overview.successRate.toFixed(1)}%`],
      ["Refund Rate", `${overview.refundRate.toFixed(1)}%`],
      ["Growth Rate", `${overview.growthRate.toFixed(1)}%`],
      ["", ""],
      ["Status Breakdown", ""],
      ["Status", "Count", "Total Amount", "Average Amount", "Percentage"],
      ...statusBreakdown.map(status => [
        status.status,
        status.count,
        `₹${status.totalAmount.toLocaleString()}`,
        `₹${status.averageAmount.toLocaleString()}`,
        `${status.percentage.toFixed(1)}%`
      ]),
      ["", ""],
      ["Method Breakdown", ""],
      ["Method", "Count", "Total Amount", "Average Amount", "Percentage"],
      ...methodBreakdown.map(method => [
        method.method,
        method.count,
        `₹${method.totalAmount.toLocaleString()}`,
        `₹${method.averageAmount.toLocaleString()}`,
        `${method.percentage.toFixed(1)}%`
      ]),
      ["", ""],
      ["Refund Statistics", ""],
      ["Total Refunds", refunds.totalRefunds],
      ["Total Refund Amount", `₹${refunds.totalRefundAmount.toLocaleString()}`],
      ["Successful Refunds", refunds.successfulRefunds],
      ["Pending Refunds", refunds.pendingRefunds]
    ];

    const csvContent = overviewData.map(row => row.join(",")).join("\n");
    
    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `payment-statistics-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToJSON = () => {
    if (!paymentStats) return;
    
    const jsonContent = JSON.stringify(paymentStats, null, 2);
    
    // Create and download file
    const blob = new Blob([jsonContent], { type: "application/json" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `payment-statistics-${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate statistics from the comprehensive data
  const { overview, statusBreakdown, methodBreakdown, refunds } = paymentStats;
  
  // Find paid status count
  const paidStatus = statusBreakdown.find(status => status.status === "paid");
  const createdStatus = statusBreakdown.find(status => status.status === "created" || status.status === "Created");
  
  const statsCards = [
    {
      title: "Total Payments",
      value: overview.totalPayments.toLocaleString(),
      icon: CreditCard,
      description: "All payment transactions",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    },
    {
      title: "Total Amount",
      value: `₹${overview.totalAmount.toLocaleString()}`,
      icon: DollarSign,
      description: `Avg: ₹${overview.averageAmount.toLocaleString()}`,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
    },
    {
      title: "Successful",
      value: paidStatus ? paidStatus.count.toLocaleString() : "0",
      icon: CheckCircle,
      description: paidStatus ? `₹${paidStatus.totalAmount.toLocaleString()}` : "No successful payments",
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
    },
    {
      title: "Created",
      value: createdStatus ? createdStatus.count.toLocaleString() : "0",
      icon: Clock,
      description: createdStatus ? `₹${createdStatus.totalAmount.toLocaleString()}` : "No created payments",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200"
    },
    {
      title: "Top Method",
      value: methodBreakdown.length > 0 ? methodBreakdown[0].method : "N/A",
      icon: CreditCard,
      description: methodBreakdown.length > 0 ? `${methodBreakdown[0].count} payments` : "No data",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200"
    },
    {
      title: "Refunds",
      value: refunds.totalRefunds.toLocaleString(),
      icon: RotateCcw,
      description: `₹${refunds.totalRefundAmount.toLocaleString()}`,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200"
    }
  ];

  return (
    <div className={`space-y-4 ${className}`}>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
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
    </div>
  );
}
