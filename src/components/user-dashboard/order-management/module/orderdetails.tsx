"use client";
import { useState, useEffect, use, useMemo } from "react";
import {
  ChevronDown,
  Edit,
  Package,
  HandHeart,
  Truck,
  UserCheck,
  Eye,
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

function buildTrackingSteps(orderData: any) {
  const firstSku = orderData?.skus?.[0] || {};
  const skuTracking = firstSku?.tracking_info || {};
  const skuTimestamps = skuTracking?.timestamps || {};
  const orderTimestamps = orderData?.timestamps || {};
  const borzo = orderData?.order_track_info || skuTracking || {};

  const confirmedAt = skuTimestamps?.confirmedAt || orderTimestamps?.createdAt || orderData?.createdAt;
  const assignedAt = skuTimestamps?.assignedAt || orderTimestamps?.assignedAt;
  const packedAt = skuTimestamps?.packedAt || orderTimestamps?.packedAt || (orderData?.dealerMapping?.some((m: any) => (m?.status || "").toLowerCase() === "packed") ? orderTimestamps?.packedAt || confirmedAt : undefined);
  const shippedAt = skuTimestamps?.shippedAt;
  const deliveredAt = skuTimestamps?.deliveredAt;

  const borzoStatus = borzo?.borzo_order_status || "";
  const borzoUrl = borzo?.borzo_tracking_url;

  return [
    {
      title: "Confirmed",
      status: confirmedAt ? "completed" : "pending",
      description: "Your order has been confirmed.",
      time: confirmedAt ? formatDate(confirmedAt, { includeTime: true, timeFormat: "12h" }) : "",
      details: [],
    },
    {
      title: "Assigned",
      status: assignedAt ? "completed" : "pending",
      description: "Order assigned for processing.",
      time: assignedAt ? formatDate(assignedAt, { includeTime: true, timeFormat: "12h" }) : "",
      details: [],
    },
    {
      title: "Packed",
      status: packedAt ? "completed" : "pending",
      description: "Items packed and ready to ship.",
      time: packedAt ? formatDate(packedAt, { includeTime: true, timeFormat: "12h" }) : "",
      details: [],
    },
    {
      title: "Shipped",
      status: shippedAt ? "completed" : "pending",
      description: borzoStatus ? `Courier: ${borzoStatus}${borzoUrl ? " (Track available)" : ""}` : "Shipment in progress",
      time: shippedAt ? formatDate(shippedAt, { includeTime: true, timeFormat: "12h" }) : "",
      details: [],
    },
    {
      title: "Delivered",
      status: deliveredAt ? "completed" : "pending",
      description: deliveredAt ? "Package delivered successfully" : "Your item will be delivered soon",
      time: deliveredAt ? formatDate(deliveredAt, { includeTime: true, timeFormat: "12h" }) : "",
      details: [],
    },
  ];
}

export default function OrderDetailsView() {
  const [loading, setLoading] = useState(true);
  const [dealerModalOpen, setDealerModalOpen] = useState(false);
  const [selectedDealer, setSelectedDealer] = useState<any>(null); // State to hold dealer data for the modal
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  // const [createPickListOpen, setCreatePickListOpen] = useState(false); // removed duplicate modal state
  const dispatch = useAppDispatch();

  const params = useParams<Params>();
  const orderId = params.id;
  console.log(orderId);
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
  console.log(orderById);
  // Simulate loading
  useEffect(() => {
    let timer: NodeJS.Timeout;
    async function fetchOrder() {
      dispatch(fetchOrderByIdRequest());
      try {
        const response = await getOrderById(orderId);

        const item = response.data;
        dispatch(fetchOrderByIdSuccess(item));

        timer = setTimeout(() => {
          setLoading(false);
        }, 2000);
      } catch (error: any) {
        console.error(`Failed to fetch order with id ${orderId}:`, error);
        dispatch(fetchOrderByIdFailure(error.message));
        setLoading(false);
      }
    }
    fetchOrder();

    return () => clearTimeout(timer);
  }, []);

  // Compute tracking steps from live order data
  const trackingSteps = useMemo(() => buildTrackingSteps(orderById), [orderById]);

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

          {/* Tracking Information Skeleton */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-3 lg:pb-4">
              <Skeleton className="h-5 lg:h-6 w-36 lg:w-44 mb-2" />
              <Skeleton className="h-3 lg:h-4 w-28 lg:w-36" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4 lg:space-y-6">
                {[...Array(4)].map((_, index) => (
                  <div
                    key={index}
                    className="relative flex items-start gap-3 lg:gap-4"
                  >
                    <Skeleton className="w-3 h-3 lg:w-4 lg:h-4 rounded-full flex-shrink-0 mt-1" />
                    <div className="flex-1 min-w-0 pb-4 lg:pb-6">
                      <Skeleton className="h-4 lg:h-5 w-24 lg:w-32 mb-1" />
                      <Skeleton className="h-3 lg:h-4 w-36 lg:w-48 mb-1" />
                      <Skeleton className="h-3 w-32 lg:w-40 mb-2" />
                      <Skeleton className="h-3 lg:h-4 w-44 lg:w-56 mb-1" />
                      <Skeleton className="h-3 w-28 lg:w-36" />
                    </div>
                  </div>
                ))}
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
                      <tr key={idx} className="border-b border-gray-100">
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
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Update Status Skeleton */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-3 lg:pb-4">
              <Skeleton className="h-5 lg:h-6 w-32 lg:w-40" />
            </CardHeader>
            <CardContent className="space-y-3 lg:space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Skeleton className="h-4 lg:h-5 w-20 lg:w-24 mb-1" />
                  <Skeleton className="h-3 lg:h-4 w-12 lg:w-16" />
                </div>
                <div className="text-right">
                  <Skeleton className="h-4 lg:h-5 w-16 lg:w-20 mb-1" />
                  <Skeleton className="h-3 w-20 lg:w-24" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 lg:h-4 w-24 lg:w-32" />
                <Skeleton className="h-8 lg:h-10 w-full" />
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
      dealerId: sku.dealerId || orderData.dealerMapping?.[0]?.dealerId || "N/A", // Get from dealerMapping or SKU
      sku: sku.sku || "",
      quantity: sku.quantity || 0,
      mrp: sku.mrp || 0, // This might need to be fetched from product details
      gst: sku.gst || orderData.GST || 0,
      totalPrice: sku.totalPrice || sku.quantity * (sku.mrp || 0), // Calculate if not provided
      _id: sku._id,
    }));
  };

  // Handler to open modal with product data
  const handleProductEyeClick = (product: any) => {
    setSelectedProduct({
      productId: product.productId || product.id,
      productName: product.productName || product.name,
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
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 px-2 sm:px-3 py-1 text-xs sm:text-sm">
            Active
          </Badge>

          <DynamicButton
            variant="outline"
            customClassName="border-gray-300 text-gray-700 hover:bg-gray-50 px-3 sm:px-4 h-8 sm:h-10 text-xs sm:text-sm"
            text="Cancel Order"
            onClick={() => setCancelModalOpen(true)}
          />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
        {/* Left Column */}
        <div className="space-y-4 lg:space-y-6">
          {/* Customer Information */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-3 lg:pb-4">
              <CardTitle className="text-base sm:text-lg font-semibold text-gray-900">
                Customer Information
              </CardTitle>
              <p className="text-xs sm:text-sm text-gray-600">
                Customer Details
              </p>
            </CardHeader>
            <CardContent className="space-y-3 lg:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">Name</p>
                  <p className="font-medium text-gray-900 text-sm sm:text-base">
                    {orderById?.customerDetails?.name || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">Email</p>
                  <p className="font-medium text-gray-900 text-sm sm:text-base break-all">
                    {orderById?.customerDetails?.email || "-"}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">
                    Phone Number
                  </p>
                  <p className="font-medium text-gray-900 text-sm sm:text-base">
                    {orderById?.customerDetails?.phone || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">
                    Delivery Address
                  </p>
                  <p className="font-medium text-gray-900 text-sm sm:text-base">
                    {orderById?.customerDetails?.address || "-"},{" "}
                    {orderById?.customerDetails?.pincode || ""}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tracking Information */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-3 lg:pb-4">
              <CardTitle className="text-base sm:text-lg font-semibold text-gray-900">
                Tracking Information
              </CardTitle>
              <p className="text-xs sm:text-sm text-gray-600">
                Check the order status
              </p>
            </CardHeader>
            <CardContent>
              {/* Vertical Progress Bar */}
              <div className="relative">
                {trackingSteps.map((step, index) => {
                  const isLast = index === trackingSteps.length - 1;
                  const nextCompleted = !isLast && trackingSteps[index + 1]?.status === "completed";
                  const connectorColor = nextCompleted ? "bg-green-500" : "bg-gray-200";
                  const circleColor = step.status === "completed" ? "bg-green-500" : "bg-gray-300";
                  return (
                  <div key={index} className="relative flex items-start gap-4">
                    {/* Vertical Line - Full Connection */}
                    <div
                      className={`absolute left-2 top-4 w-0.5 ${isLast ? "h-full bg-gray-200" : `h-full ${connectorColor}`}`}
                      style={{
                        height:
                          isLast
                            ? "100%"
                            : "calc(100% + 24px)",
                      }}
                    ></div>

                    {/* Progress Circle */}
                    <div
                      className={`w-4 h-4 rounded-full flex-shrink-0 mt-1 relative z-10 ${circleColor}`}
                    ></div>

                    {/* Step Content */}
                    <div className="flex-1 min-w-0 pb-6">
                      <div className="flex items-center gap-1 mb-1">
                        <h3 className="font-semibold text-gray-900">{step.title}</h3>
                        {/* {index === 0 && (
                          <button
                            type="button"
                            aria-label="Edit Order Confirmation"
                            style={{ marginLeft: 10, display: 'flex', alignItems: 'center', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                            className="focus:outline-none focus:ring-2 focus:ring-red-200 rounded transition hover:scale-110"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E53935" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pen-line-icon" style={{ verticalAlign: 'middle' }}>
                              <path d="M13 21h8" />
                              <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
                            </svg>
                          </button>
                        )} */}
                      </div>
                      <p className="text-sm text-gray-700 mb-1">{step.description}</p>
                      {step.time && (
                        <p className="text-xs text-gray-500 mb-2">{step.time}</p>
                      )}

                      {/* Additional Details */}
                      {step.details.map((detail, detailIndex) => (
                        <div key={detailIndex} className="mb-1">
                          <p className="text-sm text-gray-600">{detail}</p>
                          <p className="text-xs text-gray-500">
                            Sun, 16 Jun '24 - 7:51 pm
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );})}
              </div>
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
          />


          {/* Update Orders Status Card */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-3 lg:pb-4">
              <CardTitle className="text-base sm:text-lg font-semibold text-gray-900">
                Update Orders Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 lg:space-y-4">
              {/* Product Info */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                    Rear shocker
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600">Yamaha</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <span className="text-base sm:text-lg font-semibold text-gray-900">
                      ₹6399.00
                    </span>
                    <span className="text-xs sm:text-sm text-gray-500 line-through">
                      ₹6599.00
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">25 Jan 2025 12:00 PM</p>
                </div>
              </div>

              {/* Update Status Dropdown */}
              <div className="space-y-2 ">
                <label className="text-xs sm:text-sm font-medium text-gray-900 ">
                  Update Order Status
                </label>
                <Select>
                  <SelectTrigger className="w-full bg-white border-gray-300 h-9 sm:h-10">
                    <SelectValue placeholder="Select Reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="returned">Returned</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Textarea
                  id="remark"
                  placeholder="Remark"
                  className="w-full bg-white border-gray-300 min-h-[80px]"
                />
              </div>
              <div className="flex justify-end pt-2">
                <DynamicButton
                  variant="default"
                  text="Update"
                  customClassName="bg-[#C72920] text-[#FFFFFF] "
                />
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
      <CancelOrderModal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
      />
      {/* Product Details Modal */}
      <ProductPopupModal
        isOpen={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        productId={selectedProduct?.productId}
      />
      {/* Removed old CreatePickList modal; create action is now inside DealerIdentification */}
    </div>
  );
}
