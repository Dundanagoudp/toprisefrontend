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
  Loader2 
} from "lucide-react";
import { getPaymentStats } from "@/service/payment-service";
import { PaymentSummary } from "@/types/paymentDetails-Types";

interface PaymentStatsCardsProps {
  className?: string;
}

export default function PaymentStatsCards({ className = "" }: PaymentStatsCardsProps) {
  const [paymentStats, setPaymentStats] = useState<PaymentSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPaymentStats = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await getPaymentStats();
        
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

  // Calculate percentages
  const totalPayments = paymentStats.total_payments;
  const successRate = totalPayments > 0 ? ((paymentStats.successful_payments / totalPayments) * 100).toFixed(1) : "0";
  const failureRate = totalPayments > 0 ? ((paymentStats.failed_payments / totalPayments) * 100).toFixed(1) : "0";

  const statsCards = [
    {
      title: "Total Payments",
      value: paymentStats.total_payments.toLocaleString(),
      icon: CreditCard,
      description: "All payment transactions",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    },
    {
      title: "Total Amount",
      value: `₹${paymentStats.total_amount.toLocaleString()}`,
      icon: DollarSign,
      description: "Total payment value",
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
    },
    {
      title: "Successful",
      value: paymentStats.successful_payments.toLocaleString(),
      icon: CheckCircle,
      description: `${successRate}% success rate`,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
    },
    {
      title: "Failed",
      value: paymentStats.failed_payments.toLocaleString(),
      icon: XCircle,
      description: `${failureRate}% failure rate`,
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200"
    },
    {
      title: "Pending",
      value: paymentStats.pending_payments.toLocaleString(),
      icon: Clock,
      description: "Awaiting processing",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200"
    },
    {
      title: "Refunded",
      value: paymentStats.refunded_payments.toLocaleString(),
      icon: RotateCcw,
      description: "Processed refunds",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200"
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
