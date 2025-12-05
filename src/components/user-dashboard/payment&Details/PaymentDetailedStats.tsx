"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  Clock, 
  RotateCcw, 
  DollarSign,
  Loader2,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Calendar,
  Users,
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

interface PaymentDetailedStatsProps {
  className?: string;
}

export default function PaymentDetailedStats({ className = "" }: PaymentDetailedStatsProps) {
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
      <div className={`space-y-6 ${className}`}>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-3 w-24" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card className={`border border-red-200 bg-red-50 ${className}`}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-red-500 mx-auto mb-2" />
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!paymentStats) {
    return null;
  }

  const { overview, statusBreakdown, methodBreakdown, dailyTrends, monthlyTrends, topDealers, recentPayments } = paymentStats;

  // Export functions
  const exportToCSV = () => {
    if (!paymentStats) return;
    
    const { overview, statusBreakdown, methodBreakdown, dailyTrends, monthlyTrends, topDealers, recentPayments, refunds } = paymentStats;
    
    // Create comprehensive CSV content
    const csvData = [
      ["Payment Statistics Report", ""],
      ["Generated on", new Date().toLocaleDateString()],
      ["", ""],
      ["OVERVIEW", ""],
      ["Total Payments", overview.totalPayments],
      ["Total Amount", `₹${overview.totalAmount.toLocaleString()}`],
      ["Average Amount", `₹${overview.averageAmount.toLocaleString()}`],
      ["Success Rate", `${overview.successRate.toFixed(1)}%`],
      ["Refund Rate", `${overview.refundRate.toFixed(1)}%`],
      ["Growth Rate", `${overview.growthRate.toFixed(1)}%`],
      ["", ""],
      ["STATUS BREAKDOWN", ""],
      ["Status", "Count", "Total Amount", "Average Amount", "Percentage"],
      ...statusBreakdown.map(status => [
        status.status,
        status.count,
        `₹${status.totalAmount.toLocaleString()}`,
        `₹${status.averageAmount.toLocaleString()}`,
        `${status.percentage.toFixed(1)}%`
      ]),
      ["", ""],
      ["METHOD BREAKDOWN", ""],
      ["Method", "Count", "Total Amount", "Average Amount", "Percentage"],
      ...methodBreakdown.map(method => [
        method.method,
        method.count,
        `₹${method.totalAmount.toLocaleString()}`,
        `₹${method.averageAmount.toLocaleString()}`,
        `${method.percentage.toFixed(1)}%`
      ]),
      ["", ""],
      ["DAILY TRENDS", ""],
      ["Date", "Count", "Total Amount", "Average Amount"],
      ...dailyTrends.map(trend => [
        trend.date,
        trend.count,
        `₹${trend.totalAmount.toLocaleString()}`,
        `₹${trend.averageAmount.toLocaleString()}`
      ]),
      ["", ""],
      ["MONTHLY TRENDS", ""],
      ["Month", "Count", "Total Amount", "Average Amount"],
      ...monthlyTrends.map(trend => [
        trend.month,
        trend.count,
        `₹${trend.totalAmount.toLocaleString()}`,
        `₹${trend.averageAmount.toLocaleString()}`
      ]),
      ["", ""],
      ["TOP DEALERS", ""],
      ["Dealer Name", "Dealer Code", "Count", "Total Amount", "Average Amount"],
      ...topDealers.map(dealer => [
        dealer.dealerName,
        dealer.dealerCode,
        dealer.count,
        `₹${dealer.totalAmount.toLocaleString()}`,
        `₹${dealer.averageAmount.toLocaleString()}`
      ]),
      ["", ""],
      ["RECENT PAYMENTS", ""],
      ["Payment ID", "Amount", "Status", "Method", "Created At", "Order ID"],
      ...recentPayments.map(payment => [
        payment.paymentId,
        `₹${payment.amount.toLocaleString()}`,
        payment.status,
        payment.method,
        new Date(payment.createdAt).toLocaleDateString(),
        payment.orderId || "N/A"
      ]),
      ["", ""],
      ["REFUND STATISTICS", ""],
      ["Total Refunds", refunds.totalRefunds],
      ["Total Refund Amount", `₹${refunds.totalRefundAmount.toLocaleString()}`],
      ["Successful Refunds", refunds.successfulRefunds],
      ["Pending Refunds", refunds.pendingRefunds]
    ];

    const csvContent = csvData.map(row => row.join(",")).join("\n");
    
    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `detailed-payment-report-${new Date().toISOString().split('T')[0]}.csv`);
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
    link.setAttribute("download", `detailed-payment-report-${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-700";
      case "created":
        return "bg-yellow-100 text-yellow-700";
      case "failed":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getMethodBadge = (method: string) => {
    switch (method.toLowerCase()) {
      case "upi":
        return "bg-blue-100 text-blue-700";
      case "netbanking":
        return "bg-purple-100 text-purple-700";
      case "razorpay":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Tabs defaultValue="overview" className="w-full">
        <div className="flex items-center justify-between">
          <TabsList className="grid w-full grid-cols-4 max-w-md">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            {/* <TabsTrigger value="trends">Trends</TabsTrigger> */}
            <TabsTrigger value="methods">Methods</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-6">
          {/* Overview Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Payment Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {overview.totalPayments.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Total Payments</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    ₹{overview.totalAmount.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Total Amount</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-1">
                    ₹{overview.averageAmount.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Average Amount</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-1">
                    {overview.successRate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Success Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Status Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {statusBreakdown.map((status, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusBadge(status.status)}>
                        {status.status}
                      </Badge>
                      <div>
                        <div className="font-medium">{status.count} payments</div>
                        <div className="text-sm text-gray-500">
                          Avg: ₹{status.averageAmount.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">₹{status.totalAmount.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">{status.percentage.toFixed(1)}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* <TabsContent value="trends" className="space-y-6"> */}
          {/* Daily Trends */}
          {/* <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Daily Trends (Last 10 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dailyTrends.slice(-10).map((trend, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{new Date(trend.date).toLocaleDateString()}</div>
                      <div className="text-sm text-gray-500">{trend.count} payments</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">₹{trend.totalAmount.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">Avg: ₹{trend.averageAmount.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card> */}

          {/* Monthly Trends */}
          {/* <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Monthly Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlyTrends.map((trend, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">{trend.month}</div>
                      <div className="text-sm text-gray-500">{trend.count} payments</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">₹{trend.totalAmount.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">Avg: ₹{trend.averageAmount.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card> */}
        {/* </TabsContent> */}

        <TabsContent value="methods" className="space-y-6">
          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Methods
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {methodBreakdown.map((method, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge className={getMethodBadge(method.method)}>
                        {method.method}
                      </Badge>
                      <div>
                        <div className="font-medium">{method.count} payments</div>
                        <div className="text-sm text-gray-500">
                          Avg: ₹{method.averageAmount.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">₹{method.totalAmount.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">{method.percentage.toFixed(1)}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Dealers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Top Dealers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topDealers.map((dealer, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">{dealer.dealerName}</div>
                      <div className="text-sm text-gray-500">{dealer.dealerCode}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{dealer.count} payments</div>
                      <div className="text-sm text-gray-500">₹{dealer.totalAmount.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent" className="space-y-6">
          {/* Recent Payments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentPayments.slice(0, 10).map((payment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusBadge(payment.status)}>
                        {payment.status}
                      </Badge>
                      <div>
                        <div className="font-medium text-sm">{payment.paymentId.slice(-8)}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">₹{payment.amount.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">{payment.method}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
