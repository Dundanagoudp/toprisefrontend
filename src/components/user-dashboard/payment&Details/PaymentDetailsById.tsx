"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useBreadcrumb } from "@/contexts/BreadcrumbContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  Clock,
  DollarSign,
  Calendar,
  AlertTriangle,
  FileText,
  Download,
  Share2,
  MoreHorizontal,
  RefreshCw,
  Info,
  Banknote,
  Receipt,
  Shield,
  TrendingUp,
  TrendingDown,
  User,
  Building,
  Hash,
  Copy
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { getPaymentDetailsById } from "@/service/payment-service";
import { PaymentDetail } from "@/types/paymentDetails-Types";

interface PaymentDetailsByIdProps {
  paymentId: string;
}

export default function PaymentDetailsById({ paymentId }: PaymentDetailsByIdProps) {
  const router = useRouter();
  const { updateLabel } = useBreadcrumb();
  const [payment, setPayment] = useState<PaymentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const breadcrumbUpdatedRef = useRef(false);

  useEffect(() => {
    fetchPaymentDetails();
  }, [paymentId]);

  const fetchPaymentDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getPaymentDetailsById(paymentId);
      if (response.success && response.data) {
        setPayment(response.data);
        
        // Update breadcrumb with payment ID
        if (!breadcrumbUpdatedRef.current) {
          updateLabel(paymentId, response.data.payment_id || response.data._id);
          breadcrumbUpdatedRef.current = true;
        }
      } else {
        setError("Failed to load payment details");
      }
    } catch (error) {
      console.error("Error fetching payment details:", error);
      setError("Failed to load payment details");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-medium border";
    
    switch (status.toLowerCase()) {
      case "paid":
        return `${baseClasses} text-green-600 bg-green-50 border-green-200`;
      case "created":
        return `${baseClasses} text-blue-600 bg-blue-50 border-blue-200`;
      case "failed":
        return `${baseClasses} text-red-600 bg-red-50 border-red-200`;
      case "refunded":
        return `${baseClasses} text-purple-600 bg-purple-50 border-purple-200`;
      case "pending":
        return `${baseClasses} text-yellow-600 bg-yellow-50 border-yellow-200`;
      default:
        return `${baseClasses} text-gray-600 bg-gray-50 border-gray-200`;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return <CheckCircle className="h-4 w-4" />;
      case "created":
        return <Clock className="h-4 w-4" />;
      case "failed":
        return <XCircle className="h-4 w-4" />;
      case "refunded":
        return <Receipt className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case "card":
        return <CreditCard className="h-4 w-4" />;
      case "upi":
        return <Banknote className="h-4 w-4" />;
      case "netbanking":
        return <Building className="h-4 w-4" />;
      case "wallet":
        return <Shield className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const exportPaymentDetails = () => {
    if (!payment) return;
    
    const exportData = {
      "Payment ID": payment.payment_id || payment._id,
      "Razorpay Order ID": payment.razorpay_order_id,
      "Order ID": payment.orderDetails?.orderId || payment.order_id?.orderId || "N/A",
      "Amount": `₹${payment.amount.toLocaleString()}`,
      "Payment Method": payment.payment_method,
      "Payment Status": payment.payment_status,
      "Created At": formatDate(payment.created_at),
      "Order Amount": `₹${payment.orderDetails?.order_Amount?.toLocaleString() || payment.order_id?.order_Amount?.toLocaleString() || "N/A"}`,
      "Order Status": payment.orderDetails?.status || payment.order_id?.status || "N/A",
      "Order Date": payment.orderDetails?.orderDate ? formatDate(payment.orderDetails.orderDate) : 
                   payment.order_id?.orderDate ? formatDate(payment.order_id.orderDate) : "N/A",
      "Total SKUs": payment.orderDetails?.totalSKUs || payment.order_id?.skus?.length || "N/A"
    };

    // Create CSV content
    const csvContent = [
      Object.keys(exportData).join(","),
      Object.values(exportData).map(value => `"${value}"`).join(",")
    ].join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `payment-details-${payment.payment_id || payment._id}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const sharePaymentDetails = async () => {
    if (!payment) return;
    
    const shareData = {
      title: "Payment Details",
      text: `Payment ID: ${payment.payment_id || payment._id}\nOrder ID: ${payment.orderDetails?.orderId || payment.order_id?.orderId || "N/A"}\nAmount: ₹${payment.amount.toLocaleString()}\nStatus: ${payment.payment_status}\nMethod: ${payment.payment_method}`,
      url: window.location.href
    };

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(
          `Payment Details:\n${shareData.text}\nURL: ${shareData.url}`
        );
        // You could add a toast notification here
        alert("Payment details copied to clipboard!");
      }
    } catch (error) {
      console.error("Error sharing:", error);
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(
          `Payment Details:\n${shareData.text}\nURL: ${shareData.url}`
        );
        alert("Payment details copied to clipboard!");
      } catch (clipboardError) {
        console.error("Error copying to clipboard:", clipboardError);
        alert("Unable to share payment details");
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error || "Payment not found"}</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Payments
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payment Details</h1>
            <p className="text-gray-600">Payment ID: {payment.payment_id || payment._id}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPaymentDetails}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => copyToClipboard(payment._id)}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Payment ID
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportPaymentDetails}>
                <Download className="h-4 w-4 mr-2" />
                Export Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={sharePaymentDetails}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Status Banner */}
      <Card className="border-l-4 border-l-blue-500">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon(payment.payment_status)}
              <div>
                <h3 className="font-semibold text-gray-900">Payment Status</h3>
                <Badge className={getStatusBadge(payment.payment_status)}>
                  {payment.payment_status}
                </Badge>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-gray-500">Amount</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(payment.amount)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="transaction">Transaction</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Payment Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Payment Method</label>
                      <div className="flex items-center gap-2 mt-1">
                        {getPaymentMethodIcon(payment.payment_method)}
                        <p className="text-sm font-medium text-gray-900 capitalize">
                          {payment.payment_method}
                        </p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Payment Status</label>
                      <div className="mt-1">
                        <Badge className={getStatusBadge(payment.payment_status)}>
                          {payment.payment_status}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Amount</label>
                      <p className="text-lg font-semibold text-green-600 mt-1">
                        {formatCurrency(payment.amount)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Created At</label>
                      <p className="text-sm text-gray-900 mt-1">
                        {formatDate(payment.created_at)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Order Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Order Basic Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Order ID</label>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-sm font-mono text-gray-900">
                          {payment.orderDetails?.orderId || payment.order_id?.orderId || "N/A"}
                        </p>
                        {(payment.orderDetails?.orderId || payment.order_id?.orderId) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(payment.orderDetails?.orderId || payment.order_id?.orderId || "")}
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Order Status</label>
                      <div className="mt-1">
                        <Badge className={getStatusBadge(payment.orderDetails?.status || payment.order_id?.status || "N/A")}>
                          {payment.orderDetails?.status || payment.order_id?.status || "N/A"}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Order Date</label>
                      <p className="text-sm text-gray-900 mt-1">
                        {payment.orderDetails?.orderDate ? formatDate(payment.orderDetails.orderDate) : 
                         payment.order_id?.orderDate ? formatDate(payment.order_id.orderDate) : "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Order Type</label>
                      <p className="text-sm text-gray-900 mt-1">
                        {payment.orderDetails?.orderType || payment.order_id?.orderType || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Order Source</label>
                      <p className="text-sm text-gray-900 mt-1">
                        {payment.orderDetails?.orderSource || payment.order_id?.orderSource || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Payment Type</label>
                      <p className="text-sm text-gray-900 mt-1">
                        {payment.orderDetails?.paymentType || payment.order_id?.paymentType || "N/A"}
                      </p>
                    </div>
                  </div>


                  {/* Order Amount Details */}
                  <Separator />
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Order Amount Details</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Order Amount</label>
                        <p className="text-lg font-semibold text-gray-900 mt-1">
                          ₹{payment.orderDetails?.order_Amount?.toLocaleString() || payment.order_id?.order_Amount?.toLocaleString() || "N/A"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">GST Amount</label>
                        <p className="text-sm text-gray-900 mt-1">
                          ₹{payment.orderDetails?.GST?.toLocaleString() || payment.order_id?.GST?.toLocaleString() || "N/A"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Delivery Charges</label>
                        <p className="text-sm text-gray-900 mt-1">
                          ₹{payment.orderDetails?.deliveryCharges?.toLocaleString() || payment.order_id?.deliveryCharges?.toLocaleString() || "N/A"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Total SKUs</label>
                        <p className="text-sm text-gray-900 mt-1">
                          {payment.orderDetails?.totalSKUs || payment.order_id?.skus?.length || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Product Information */}
              {payment.orderDetails?.skus && payment.orderDetails.skus.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Hash className="h-5 w-5" />
                      Product Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {payment.orderDetails.skus.map((sku, index) => (
                        <div key={sku._id} className="border rounded-lg p-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium text-gray-500">Product Name</label>
                              <p className="text-sm text-gray-900 mt-1">{sku.productName}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-500">SKU</label>
                              <p className="text-sm font-mono text-gray-900 mt-1">{sku.sku}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-500">Quantity</label>
                              <p className="text-sm text-gray-900 mt-1">{sku.quantity}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-500">Selling Price</label>
                              <p className="text-sm text-gray-900 mt-1">₹{sku.selling_price.toLocaleString()}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-500">GST Percentage</label>
                              <p className="text-sm text-gray-900 mt-1">{sku.gst_percentage}%</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-500">Total Price</label>
                              <p className="text-sm font-semibold text-gray-900 mt-1">₹{sku.totalPrice.toLocaleString()}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-500">Status</label>
                              <Badge className={getStatusBadge(sku.tracking_info.status)}>
                                {sku.tracking_info.status}
                              </Badge>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-500">Return Status</label>
                              <Badge className={sku.return_info.is_returned ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}>
                                {sku.return_info.is_returned ? "Returned" : "Not Returned"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="transaction" className="space-y-6">
              {/* Payment Summary */}
              {payment.paymentSummary && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Receipt className="h-5 w-5" />
                      Payment Summary
                    </CardTitle>
                    <CardDescription>Comprehensive payment information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Payment ID</label>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-sm font-mono text-gray-900">
                            {payment.paymentSummary.paymentId}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(payment.paymentSummary.paymentId)}
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Razorpay Payment ID</label>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-sm font-mono text-gray-900">
                            {payment.paymentSummary.razorpayPaymentId}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(payment.paymentSummary.razorpayPaymentId)}
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Razorpay Order ID</label>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-sm font-mono text-gray-900">
                            {payment.paymentSummary.razorpayOrderId}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(payment.paymentSummary.razorpayOrderId)}
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Payment Method</label>
                        <p className="text-sm text-gray-900 mt-1 capitalize">
                          {payment.paymentSummary.paymentMethod}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Payment Status</label>
                        <div className="mt-1">
                          <Badge className={getStatusBadge(payment.paymentSummary.paymentStatus)}>
                            {payment.paymentSummary.paymentStatus}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Amount</label>
                        <p className="text-lg font-semibold text-green-600 mt-1">
                          ₹{payment.paymentSummary.amount.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Created At</label>
                        <p className="text-sm text-gray-900 mt-1">
                          {formatDate(payment.paymentSummary.createdAt)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Transaction Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Transaction Details</CardTitle>
                  <CardDescription>Detailed transaction information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Payment ID</label>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-sm font-mono text-gray-900">
                          {payment.payment_id || payment._id || "N/A"}
                        </p>
                        {(payment.payment_id || payment._id) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(payment.payment_id || payment._id)}
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Transaction Date</label>
                      <p className="text-sm text-gray-900 mt-1">
                        {formatDate(payment.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* Acquirer Data */}
                  {(payment.acquirer_data || payment.paymentSummary?.acquirerData) && (
                    <div className="mt-6">
                      <h4 className="font-medium text-gray-900 mb-3">Acquirer Data</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(payment.acquirer_data?.bank_transaction_id || payment.paymentSummary?.acquirerData?.bank_transaction_id) && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">Bank Transaction ID</label>
                            <p className="text-sm font-mono text-gray-900 mt-1">
                              {payment.acquirer_data?.bank_transaction_id || payment.paymentSummary?.acquirerData?.bank_transaction_id}
                            </p>
                          </div>
                        )}
                        {(payment.acquirer_data?.rrn || payment.paymentSummary?.acquirerData?.rrn) && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">RRN</label>
                            <p className="text-sm font-mono text-gray-900 mt-1">
                              {payment.acquirer_data?.rrn || payment.paymentSummary?.acquirerData?.rrn}
                            </p>
                          </div>
                        )}
                        {(payment.acquirer_data?.upi_transaction_id || payment.paymentSummary?.acquirerData?.upi_transaction_id) && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">UPI Transaction ID</label>
                            <p className="text-sm font-mono text-gray-900 mt-1">
                              {payment.acquirer_data?.upi_transaction_id || payment.paymentSummary?.acquirerData?.upi_transaction_id}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Days Since Payment</span>
                <span className="text-sm font-medium text-gray-900">
                  {Math.floor((Date.now() - new Date(payment.created_at).getTime()) / (1000 * 60 * 60 * 24))} days
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Payment Method</span>
                <span className="text-sm font-medium text-gray-900 capitalize">
                  {payment.payment_method}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Refund Status</span>
                <span className="text-sm font-medium text-gray-900">
                  {payment.is_refund ? "Refunded" : "Not Refunded"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <DollarSign className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Amount</p>
                    <p className="text-xs text-gray-500">Total payment</p>
                  </div>
                </div>
                <p className="text-lg font-semibold text-green-600">
                  {formatCurrency(payment.amount)}
                </p>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    {getPaymentMethodIcon(payment.payment_method)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Method</p>
                    <p className="text-xs text-gray-500">Payment method</p>
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-900 capitalize">
                  {payment.payment_method}
                </p>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Date</p>
                    <p className="text-xs text-gray-500">Payment date</p>
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(payment.created_at).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
