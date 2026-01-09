"use client";
import React, { useState, useEffect, use, useMemo } from "react";
import {
  ChevronDown,
  Edit,
  Package,
  HandHeart,
  Truck,
  UserCheck,
  Eye,
  ExternalLink,
  Calendar,
  CreditCard,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
// Removed unused shadcn Button import; using shared DynamicButton where needed
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import DealerIdentification from "@/components/user-dashboard/order-management/module/order-popus/dealerIdentification"; // Correct import path
import CancelOrderModal from "@/components/user-dashboard/order-management/module/order-popus/cancelorder";
import ProductPopupModal from "@/components/user-dashboard/order-management/module/order-popus/productdetails";
import ProductDetailsForOrder from "@/components/user-dashboard/order-management/module/OrderDetailCards/ProductDetailsForOrder";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { useParams } from "next/navigation";
import { getOrderById } from "@/service/order-service";
import { getDealerById } from "@/service/dealerServices";
import {
  fetchOrderByIdSuccess,
  fetchOrderByIdRequest,
  fetchOrderByIdFailure,
} from "@/store/slice/order/orderByIdSlice";
import DynamicButton from "@/components/common/button/button";
// import CreatePickList from "./order-popus/CreatePickList"; // removed old JSON-based modal

import formatDate from "@/utils/formateDate";

// Helper function to get status badge styling
const getStatusBadgeClasses = (status: string) => {
  const s = (status || "").toLowerCase();
  if (s === "delivered" || s === "completed") {
    return "bg-emerald-100 text-emerald-800 hover:bg-emerald-100";
  }
  if (s === "packed") {
    return "bg-blue-100 text-blue-800 hover:bg-blue-100";
  }
  if (s === "shipped") {
    return "bg-purple-100 text-purple-800 hover:bg-purple-100";
  }
  if (s === "cancelled" || s === "canceled") {
    return "bg-red-100 text-red-800 hover:bg-red-100";
  }
  if (s === "confirmed") {
    return "bg-green-100 text-green-800 hover:bg-green-100";
  }
  if (s === "assigned") {
    return "bg-blue-100 text-blue-800 hover:bg-blue-100";
  }
  if (s === "scanning") {
    return "bg-purple-100 text-purple-800 hover:bg-purple-100";
  }
  if (s === "packed") {
    return "bg-indigo-100 text-indigo-800 hover:bg-indigo-100";
  }
  if (s === "shipped") {
    return "bg-cyan-100 text-cyan-800 hover:bg-cyan-100";
  }
  if (s === "returned") {
    return "bg-orange-100 text-orange-800 hover:bg-orange-100";
  }
  return "bg-gray-100 text-gray-800 hover:bg-gray-100";
};

interface ProductItem {
  id: string;
  name: string;
  dealerId: string;
  mrp: number;
  gst: string;
  totalPrice: number;
  image: string;
}
type Params = { id: string };

function buildTrackingSteps(sku: any, orderData: any) {
  if (!sku || !orderData) return [];

  const skuTracking = sku?.tracking_info || {};
  const skuTimestamps = skuTracking?.timestamps || {};
  const borzo = skuTracking || {};
  const skuStatus = (skuTracking?.status || "").toLowerCase();
  const orderStatusLower = (orderData?.status || "").toLowerCase();
  const orderTimestamps = orderData?.timestamps || {};

  // Define statuses that indicate the package has been shipped or is in transit/delivery
  const shippedStatuses = ["shipped", "on_the_way_to_next_delivery_point", "out_for_delivery", "delivered", "completed"];

  // Get timestamps: Use order-level timestamps for assigned and packed steps
  const confirmedAt = skuTimestamps?.confirmedAt || orderTimestamps?.createdAt;
  const assignedAt = orderTimestamps?.assignedAt; // Use order-level timestamp for assigned
  const packedAt = orderTimestamps?.packedAt; // Use order-level timestamp for packed
  const shippedAt = skuTimestamps?.shippedAt || (shippedStatuses.includes(skuStatus) ? skuTracking?.borzo_last_updated : undefined);
  const deliveredAt = skuTimestamps?.deliveredAt;
  const cancelledAt = skuTimestamps?.cancelledAt; 
  // Use SKU-specific status for step completion, with order status as fallback for higher-level steps
  // Confirmed: Always true if SKU exists
  const isConfirmed = true;
  // Cancelled: Check both SKU and order status
  const isCancelled = ["cancelled", "canceled"].includes(skuStatus) || ["cancelled", "canceled"].includes(orderStatusLower);
  // Assigned: Check SKU status first, then order status
  const isAssigned = ["assigned", "packed", "shipped", "delivered", "completed"].includes(skuStatus) ||
                    ["assigned", "packed", "shipped", "delivered", "completed"].includes(orderStatusLower);

  // Packed: Check SKU status first, then order status
  const isPacked = ["packed", "shipped", "delivered", "completed"].includes(skuStatus) ||
                  ["packed", "shipped", "delivered", "completed"].includes(orderStatusLower);

  // Shipped: Check if SKU tracking status indicates it has been shipped or is in transit/delivery
  const isShipped = shippedStatuses.includes(skuStatus) ||
                   skuTimestamps?.shippedAt !== undefined ||
                   ["shipped", "delivered", "completed"].includes(orderStatusLower);

  // Delivered: Check SKU status first, then order status
  const isDelivered = ["delivered", "completed"].includes(skuStatus) ||
                     ["delivered", "completed"].includes(orderStatusLower);

  const borzoStatus = borzo?.borzo_order_status || "";
  const borzoUrl = borzo?.borzo_tracking_url;

  const allSteps = [
    {
      title: "Confirmed",
      status: isConfirmed ? "completed" : "pending",
      description: "Your order has been confirmed.",
      time: confirmedAt ? formatDate(confirmedAt, { includeTime: true, timeFormat: "12h" }) : "",
      details: [],
    },
  ];

  // Only include Cancelled step if order is cancelled
  if (isCancelled) {
    allSteps.push({
      title: "Cancelled",
      status: "cancelled",
      description: "Order has been cancelled.",
      time: cancelledAt ? formatDate(cancelledAt, { includeTime: true, timeFormat: "12h" }) : "",
      details: [],
    });
    // If cancelled, stop timeline here
    return allSteps;
  }

  // Add remaining steps for non-cancelled orders
  allSteps.push(
    {
      title: "Assigned",
      status: isAssigned ? "completed" : "pending",
      description: "Order assigned for processing.",
      time: assignedAt ? formatDate(assignedAt, { includeTime: true, timeFormat: "12h" }) : "",
      details: [],
    },
    {
      title: "Packed",
      status: isPacked ? "completed" : "pending",
      description: "Items packed and ready to ship.",
      time: packedAt ? formatDate(packedAt, { includeTime: true, timeFormat: "12h" }) : "",
      details: [],
    },
    {
      title: "Shipped",
      status: isShipped ? "completed" : "pending",
      description: borzoStatus ? `Courier: ${borzoStatus}${borzoUrl ? " (Track available)" : ""}` : "Shipment in progress",
      time: shippedAt ? formatDate(shippedAt, { includeTime: true, timeFormat: "12h" }) : "",
      details: [],
    },
    {
      title: "Delivered",
      status: isDelivered ? "completed" : "pending",
      description: isDelivered ? "Package delivered successfully" : "Your item will be delivered soon",
      time: deliveredAt ? formatDate(deliveredAt, { includeTime: true, timeFormat: "12h" }) : "",
      details: [],
    }
  );

  return allSteps;
}

// Component to render tracking timeline for individual products
const TrackingTimeline = ({ sku, orderData }: { sku: any; orderData: any }) => {
  const trackingSteps = buildTrackingSteps(sku, orderData);

  return (
    <div className="relative">
      {trackingSteps.map((step, index) => {
        const isLast = index === trackingSteps.length - 1;
        const isCancelled = step.status === "cancelled";
        const isCompleted = step.status === "completed";
        const nextStep = trackingSteps[index + 1];
        const nextCompleted = nextStep && nextStep.status === "completed";

        // Determine connector color based on current and next step status
        let connectorColor = "bg-gray-200";
        if (isCompleted && nextCompleted) {
          connectorColor = "bg-green-500";
        } else if (isCompleted && !nextCompleted) {
          connectorColor = "bg-green-500";
        }

        const circleColor = isCompleted ? "bg-green-500" : "bg-gray-300";

        return (
          <div key={index} className="relative flex items-start gap-3">
            {/* Vertical Line - Only show if not the last step */}
            {!isLast && (
              <div
                className={`absolute left-1.5 top-4 w-0.5 h-full ${connectorColor}`}
              ></div>
            )}

            {/* Progress Circle */}
            <div
              className={`w-3 h-3 rounded-full shrink-0 mt-1 relative z-10 ${circleColor}`}
            ></div>

            {/* Step Content */}
            <div className="flex-1 min-w-0 pb-4">
              <div className="flex items-center gap-1 mb-1">
                <h4 className={`font-medium text-sm ${isCompleted ? 'text-green-700' : isCancelled ? 'text-red-700' : 'text-gray-900'}`}>
                  {step.title}
                </h4>
              </div>
              <p className={`text-xs mb-1 ${isCompleted ? 'text-green-600' : isCancelled ? 'text-red-600' : 'text-gray-600'}`}>
                {step.description}
              </p>
              {step.time && (
                <p className={`text-xs ${isCompleted ? 'text-green-500' : isCancelled ? 'text-red-500' : 'text-gray-500'}`}>
                  {step.time}
                </p>
              )}
            </div>
          </div>
        );
      })}

      {/* Track Button for Confirmed SKUs with Tracking URL */}
      { sku?.tracking_info?.borzo_tracking_url && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <a
            href={sku.tracking_info.borzo_tracking_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 hover:border-blue-300 transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            Track Package
          </a>
        </div>
      )}
    </div>
  );
};

export default function OrderDetailsView() {
  const [loading, setLoading] = useState(true);
  const [dealerModalOpen, setDealerModalOpen] = useState(false);
  const [selectedDealer, setSelectedDealer] = useState<any>(null); // State to hold dealer data for the modal
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const dispatch = useAppDispatch();

  const params = useParams<Params>();
  const orderId = params.id;

  // Product modal state
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [order, setOrder] = useState<any>({});

  // Use the correct root state type and property name as per your store setup
  const orderById = useAppSelector(
    (state: any) => state.orderById.orders as any
  ); // Ensure it's treated as an object
  const loadingById = useAppSelector((state: any) => state.orderById.loading);
  const errorById = useAppSelector((state: any) => state.orderById.error);

  const auth = useAppSelector((state: any) => state.auth.user);
  const isAuthorized = ["Super-admin", "Fulfillment-Admin"].includes(auth?.role);
  
  // Fetch order data
  const fetchOrder = async () => {
    dispatch(fetchOrderByIdRequest());
    try {
      const response = await getOrderById(orderId);
      const item = response.data;
      console.log("Order data:", item);
      dispatch(fetchOrderByIdSuccess(item));
      setLoading(false);
    } catch (error: any) {
      console.error(`Failed to fetch order with id ${orderId}:`, error);
      dispatch(fetchOrderByIdFailure(error.message));
      setLoading(false);
    }
  };

  // Simulate loading
  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  // Note: trackingSteps is now computed per SKU in ProductDetailsForOrder component

  // Loading Skeleton Component
  const LoadingSkeleton = () => (
    <div className="p-3 sm:p-4 lg:p-6 bg-(neutral-100)-50 min-h-screen">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 lg:mb-8">
        <div>
          <Skeleton className="h-6 sm:h-8 w-40 sm:w-48 mb-2" />
          <Skeleton className="h-3 sm:h-4 w-24 sm:w-32" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 sm:h-6 w-12 sm:w-16" />
          <Skeleton className="h-8 sm:h-10 w-24 sm:w-28" />
        </div>
      </div>

      {/* Main Content Grid Skeleton */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
        {/* Left Column Skeleton */}
        <div className="space-y-4 lg:space-y-6">
          {/* Customer Information Skeleton */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-3 lg:pb-4">
              <Skeleton className="h-5 lg:h-6 w-32 lg:w-40 mb-2" />
              <Skeleton className="h-3 lg:h-4 w-24 lg:w-32" />
            </CardHeader>
            <CardContent className="space-y-3 lg:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                <div>
                  <Skeleton className="h-3 lg:h-4 w-10 lg:w-12 mb-1" />
                  <Skeleton className="h-4 lg:h-5 w-24 lg:w-32" />
                </div>
                <div>
                  <Skeleton className="h-3 lg:h-4 w-10 lg:w-12 mb-1" />
                  <Skeleton className="h-4 lg:h-5 w-36 lg:w-48" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                <div>
                  <Skeleton className="h-3 lg:h-4 w-16 lg:w-20 mb-1" />
                  <Skeleton className="h-4 lg:h-5 w-28 lg:w-36" />
                </div>
                <div>
                  <Skeleton className="h-3 lg:h-4 w-20 lg:w-24 mb-1" />
                  <Skeleton className="h-4 lg:h-5 w-44 lg:w-56" />
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Right Column - Product Details Skeleton */}
        <div className="space-y-4 lg:space-y-6">
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-3 lg:pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <Skeleton className="h-5 lg:h-6 w-24 lg:w-32 mb-2" />
                  <Skeleton className="h-3 lg:h-4 w-36 lg:w-48" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-3 lg:h-4 w-16 lg:w-20" />
                  <Skeleton className="h-3 lg:h-4 w-3 lg:w-4" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Desktop Table Skeleton Only */}
              <div className="w-full">
                <table className="w-full table-fixed">
                  <thead className="border-b border-gray-200">
                    <tr>
                      <th className="py-3 px-4">
                        <Skeleton className="h-3 w-24" />
                      </th>
                      <th className="py-3 px-2">
                        <Skeleton className="h-3 w-16" />
                      </th>
                      <th className="py-3 px-2">
                        <Skeleton className="h-3 w-12" />
                      </th>
                      <th className="py-3 px-2">
                        <Skeleton className="h-3 w-8" />
                      </th>
                      <th className="py-3 px-2">
                        <Skeleton className="h-3 w-16" />
                      </th>
                      <th className="py-3 px-2">
                        <Skeleton className="h-3 w-16" />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...Array(4)].map((_, idx) => (
                      <React.Fragment key={idx}>
                        <tr className="border-b border-gray-100">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Skeleton className="w-8 h-8 rounded" />
                              <Skeleton className="h-3 w-32" />
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <Skeleton className="h-3 w-16" />
                          </td>
                          <td className="py-3 px-2">
                            <Skeleton className="h-3 w-12" />
                          </td>
                          <td className="py-3 px-2">
                            <Skeleton className="h-3 w-8" />
                          </td>
                          <td className="py-3 px-2">
                            <Skeleton className="h-3 w-16" />
                          </td>
                          <td className="py-3 px-2">
                            <Skeleton className="h-6 w-16 rounded" />
                          </td>
                        </tr>
                        {/* Accordion tracking skeleton */}
                        {idx === 0 && ( // Show expanded tracking for first item as example
                          <tr>
                            <td colSpan={6} className="px-4 py-4 bg-gray-50 border-b border-gray-100">
                              <div className="flex items-center gap-2 mb-4">
                                <Skeleton className="w-4 h-4 rounded" />
                                <Skeleton className="h-4 w-32" />
                              </div>
                              <div className="space-y-4">
                                {[...Array(4)].map((_, stepIdx) => (
                                  <div key={stepIdx} className="relative flex items-start gap-3">
                                    <Skeleton className="w-3 h-3 rounded-full shrink-0 mt-1" />
                                    <div className="flex-1 min-w-0 pb-4">
                                      <Skeleton className="h-4 w-24 mb-1" />
                                      <Skeleton className="h-3 w-36 mb-1" />
                                      <Skeleton className="h-3 w-32 mb-2" />
                                      <Skeleton className="h-3 w-44" />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <LoadingSkeleton />;
  }

  // No page-level restriction: everyone can view; actions remain gated below

  // Handler to open modal with dealer data
  const handleDealerEyeClick = async (dealerId: string) => {
    try {
      const res = await getDealerById(dealerId);
      const dealer = (res as any)?.data || (res as any);
      // Pass through raw dealer object; DealerIdentification resolves names dynamically
      setSelectedDealer({ ...dealer, dealerId: dealerId });
      setDealerModalOpen(true);
    } catch (e) {
      // Fallback: open modal with minimal info
      setSelectedDealer({ dealerId: dealerId });
      setDealerModalOpen(true);
    }
  };

  // Function to extract product data from orderById
  const product = (orderData: any) => {
    if (!orderData || !orderData.skus) {
      return [];
    }

    return orderData.skus.map((sku: any) => ({
      productId: sku.productId || sku._id,
      productName: sku.productName || "",
      manufacturer_part_name: sku.manufacturer_part_name || "",
      dealerId: sku.dealerId || orderData.dealerMapping?.[0]?.dealerId || "N/A", // Get from dealerMapping or SKU
      sku: sku.sku || "",
      quantity: sku.quantity || 0,
      mrp: sku.mrp || 0, // This might need to be fetched from product details
      gst: sku.gst || orderData.GST || 0,
      totalPrice: sku.totalPrice || sku.quantity * (sku.mrp || 0), // Calculate if not provided
      _id: sku._id,
      // Add tracking information
      tracking_info: sku.tracking_info || { status: "Confirmed" },
      return_info: sku.return_info || { is_returned: false, return_id: null },
      dealerMapped: sku.dealerMapped || [],
      gst_percentage: sku.gst_percentage || "0",
      mrp_gst_amount: sku.mrp_gst_amount || 0,
      gst_amount: sku.gst_amount || 0,
      product_total: sku.product_total || 0,
      // Add status boolean flags
      piclistGenerated: sku.piclistGenerated || false,
      markAsPacked: sku.markAsPacked || false,
      inspectionStarted: sku.inspectionStarted || false,
      inspectionCompleted: sku.inspectionCompleted || false,
    }));
  };

  // Handler to open modal with product data
  const handleProductEyeClick = (product: any) => {
    setSelectedProduct({
      productId: product.productId || product.id,
      productName: product.productName || product.name,
      manufacturer_part_name: product.manufacturer_part_name || product.mpn,
      category: "Braking", // You can update this if you have category info
      brand: "Maruti Suzuki", // You can update this if you have brand info
      description:
        "High-quality front brake pads designed for Swift 2016 Petrol models. Ensures optimal braking performance and durability.", // Update as needed
      mrp: product.mrp,
      gst: product.gst,
      totalPrice: product.totalPrice,
      stockQuantity: 150, // Update as needed
      dealerPrice: 600.0, // Update as needed
      lastUpdated: "2025-07-22 10:30 AM", // Update as needed
      status: "Active", // Update as needed
      image: product.image,
      remarks:
        "Popular item, frequently restocked. Check for new models compatibility.", // Update as needed
      dealerId: product.dealerId, // Add dealerId to selectedProduct
    });
    setProductModalOpen(true);
  };

  return (
    <div className="p-3 sm:p-4 lg:p-6 bg-(neutral-100)-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 lg:mb-8">
        <div>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 mb-2">
            Order Details
          </h1>
          <p className="text-xs sm:text-sm text-gray-600">Order Overview</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={`px-2 sm:px-3 py-1 text-xs sm:text-sm ${getStatusBadgeClasses(orderById?.status)}`}>
            {orderById?.status || "Active"}
          </Badge>
          {isAuthorized && !["packed", "shipped", "delivered", "completed","cancelled","canceled"].includes(orderById?.status?.toLowerCase()) && (
            <DynamicButton
              variant="outline"
              customClassName="border-gray-300 text-gray-700 hover:bg-gray-50 px-3 sm:px-4 h-8 sm:h-10 text-xs sm:text-sm"
              text="Cancel Order"
              onClick={() => setCancelModalOpen(true)}
            />
          )}
        </div>
      </div>

      {/* Order Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Order Date</p>
                <p className="font-semibold text-gray-900">
                  {orderById?.orderDate ? formatDate(orderById.orderDate, { includeTime: true }) : "-"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CreditCard className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Payment Type</p>
                <p className="font-semibold text-gray-900">
                  {orderById?.paymentType || "-"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Truck className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Delivery Type</p>
                <p className="font-semibold text-gray-900">
                  {orderById?.type_of_delivery || "-"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Package className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="font-semibold text-gray-900">
                  ₹{orderById?.order_Amount?.toLocaleString() || "-"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
        {/* Left Column */}
        <div className="space-y-4 lg:space-y-6">
          {/* Customer Information */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-3 lg:pb-4">
              <CardTitle className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-gray-600" />
                Customer Information
              </CardTitle>
              <p className="text-xs sm:text-sm text-gray-600">
                Customer Details
              </p>
            </CardHeader>
            <CardContent className="space-y-3 lg:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1 flex items-center gap-1">
                    <UserCheck className="h-3 w-3" />
                    Name
                  </p>
                  <p className="font-medium text-gray-900 text-sm sm:text-base">
                    {orderById?.customerDetails?.name || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1 flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    Email
                  </p>
                  <p className="font-medium text-gray-900 text-sm sm:text-base break-all">
                    {orderById?.customerDetails?.email || "-"}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1 flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    Phone Number
                  </p>
                  <p className="font-medium text-gray-900 text-sm sm:text-base">
                    {orderById?.customerDetails?.phone || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    Delivery Address
                  </p>
                  <p className="font-medium text-gray-900 text-sm sm:text-base">
                    {(orderById?.customerDetails?.address || "-").replace(/^\{|\}$/g, '','')},{" "}
                    {orderById?.customerDetails?.pincode || ""}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product-Specific Tracking Information */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-3 lg:pb-4">
              <CardTitle className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Truck className="h-5 w-5 text-gray-600" />
                Product Tracking
              </CardTitle>
              <p className="text-xs sm:text-sm text-gray-600">
                Track individual products in this order
              </p>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {product(orderById)?.map((sku: any, index: number) => (
                  <AccordionItem key={sku._id || index} value={`item-${index}`}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-start gap-3 text-left w-full pr-4">
                        <Package className="h-4 w-4 text-gray-600 mt-1 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900 truncate">
                            {sku.productName}
                          </p>
                          <p className="text-xs text-gray-500">
                            SKU: {sku.sku} • Qty: {sku.quantity}
                          </p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="pt-2 pl-7">
                        <TrackingTimeline sku={sku} orderData={orderById} />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Product Details */}
        <div className="space-y-4 lg:space-y-6">
          <ProductDetailsForOrder
            products={product(orderById)}
            onProductEyeClick={handleProductEyeClick}
            onDealerEyeClick={handleDealerEyeClick}
            orderId={orderId}
            onRefresh={fetchOrder}
            deliveryCharges={orderById?.deliveryCharges || 0}
          />

          {/* Order Summary */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-3 lg:pb-4">
              <CardTitle className="text-base sm:text-lg font-semibold text-gray-900">
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Subtotal</span>
                <span className="font-medium text-gray-900">
                  ₹{(orderById?.order_Amount - (orderById?.GST || 0) - (orderById?.deliveryCharges || 0)).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">GST</span>
                <span className="font-medium text-gray-900">
                  ₹{orderById?.GST?.toLocaleString() || "0"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Delivery Charges</span>
                <span className="font-medium text-gray-900">
                  ₹{orderById?.deliveryCharges?.toLocaleString() || "0"}
                </span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="font-semibold text-gray-900 text-lg">
                    ₹{orderById?.order_Amount?.toLocaleString() || "0"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* DealerIdentification Modal */}
      <DealerIdentification
        isOpen={dealerModalOpen}
        onClose={() => setDealerModalOpen(false)}
        dealerData={selectedDealer}
        orderId={String(orderById?._id || orderId)}
        skus={(orderById?.skus || []).map((s: any) => ({
          sku: s.sku,
          quantity: s.quantity,
          barcode: s.barcode || "",
          dealerId: s.dealerId || orderById?.dealerMapping?.[0]?.dealerId || ""
        }))}
      />
      {/* CancelOrder Modal */}
      {isAuthorized && (
        <CancelOrderModal
          isOpen={cancelModalOpen}
          onClose={() => setCancelModalOpen(false)}
          orderId={orderId || ""}
          onOrderCancelled={() => {
            // Refresh order data after cancellation
            if (orderId) {
              dispatch(fetchOrderByIdRequest());
              getOrderById(orderId).then((response) => {
                dispatch(fetchOrderByIdSuccess(response.data));
              }).catch((error) => {
                dispatch(fetchOrderByIdFailure(error));
              });
            }
          }}
        />
      )}
      {/* Product Details Modal */}
      <ProductPopupModal
        isOpen={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        productId={selectedProduct?.productId}
        dealerId={selectedProduct?.dealerId}
      />
    </div>
  );
}