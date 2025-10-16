"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, RotateCcw } from "lucide-react";
import { format } from "date-fns";
import { OrderAnalyticsFilterOptions, ORDER_STATUSES, ORDER_TYPES, PAYMENT_TYPES, ORDER_SOURCES, DELIVERY_TYPES, TYPE_OF_DELIVERY, SKU_STATUSES, DEALER_MAPPING_STATUSES, PAYMENT_STATUSES, REFUND_STATUSES } from "@/types/order-analytics-types";

interface OrderAnalyticsFiltersProps {
  filters: OrderAnalyticsFilterOptions;
  onFiltersChange: (filters: OrderAnalyticsFilterOptions) => void;
}

export default function OrderAnalyticsFilters({ filters, onFiltersChange }: OrderAnalyticsFiltersProps) {
  const [localFilters, setLocalFilters] = useState<OrderAnalyticsFilterOptions>(filters);

  // Handle filter changes
  const handleFilterChange = (key: keyof OrderAnalyticsFilterOptions, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
  };

  // Apply filters
  const applyFilters = () => {
    onFiltersChange(localFilters);
  };

  // Clear filters
  const clearFilters = () => {
    const clearedFilters: OrderAnalyticsFilterOptions = {
      status: null,
      orderType: null,
      paymentType: null,
      orderSource: null,
      deliveryType: null,
      typeOfDelivery: null,
      startDate: null,
      endDate: null,
      minAmount: null,
      maxAmount: null,
      city: null,
      state: null,
      pincode: null,
      groupBy: 'date',
      sortBy: 'totalAmount',
      sortOrder: 'desc',
      limit: 100,
      // New filters
      orderId: null,
      invoiceNumber: null,
      customerName: null,
      customerEmail: null,
      customerPhone: null,
      dealerId: null,
      skuStatus: null,
      dealerMappingStatus: null,
      paymentStatus: null,
      refundStatus: null,
      razorpayOrderId: null,
      razorpayPaymentId: null,
      purchaseOrderId: null,
      minGST: null,
      maxGST: null,
      minDeliveryCharges: null,
      maxDeliveryCharges: null,
      minCGST: null,
      maxCGST: null,
      minSGST: null,
      maxSGST: null,
      minIGST: null,
      maxIGST: null,
      hasInvoice: null,
      hasRating: null,
      hasReview: null,
      minRating: null,
      maxRating: null,
      slaType: null,
      isSLAMet: null,
      minViolationMinutes: null,
      maxViolationMinutes: null,
      borzoOrderId: null,
      borzoTrackingStatus: null,
      borzoOrderStatus: null,
      awb: null,
      courierName: null
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Date Range */}
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {localFilters.startDate ? format(new Date(localFilters.startDate), "PPP") : "Pick date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={localFilters.startDate ? new Date(localFilters.startDate) : undefined}
                onSelect={(date) => handleFilterChange('startDate', date ? format(date, 'yyyy-MM-dd') : null)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">End Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {localFilters.endDate ? format(new Date(localFilters.endDate), "PPP") : "Pick date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={localFilters.endDate ? new Date(localFilters.endDate) : undefined}
                onSelect={(date) => handleFilterChange('endDate', date ? format(date, 'yyyy-MM-dd') : null)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Status Filter */}
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={localFilters.status || "all"}
            onValueChange={(value) => handleFilterChange('status', value === 'all' ? null : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {ORDER_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Order Type Filter */}
        <div className="space-y-2">
          <Label htmlFor="orderType">Order Type</Label>
          <Select
            value={localFilters.orderType || "all"}
            onValueChange={(value) => handleFilterChange('orderType', value === 'all' ? null : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Order Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Order Types</SelectItem>
              {ORDER_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Payment Type Filter */}
        <div className="space-y-2">
          <Label htmlFor="paymentType">Payment Type</Label>
          <Select
            value={localFilters.paymentType || "all"}
            onValueChange={(value) => handleFilterChange('paymentType', value === 'all' ? null : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Payment Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payment Types</SelectItem>
              {PAYMENT_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Order Source Filter */}
        <div className="space-y-2">
          <Label htmlFor="orderSource">Order Source</Label>
          <Select
            value={localFilters.orderSource || "all"}
            onValueChange={(value) => handleFilterChange('orderSource', value === 'all' ? null : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Sources" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              {ORDER_SOURCES.map((source) => (
                <SelectItem key={source} value={source}>
                  {source.charAt(0).toUpperCase() + source.slice(1).replace('_', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Delivery Type Filter */}
        <div className="space-y-2">
          <Label htmlFor="deliveryType">Delivery Type</Label>
          <Select
            value={localFilters.deliveryType || "all"}
            onValueChange={(value) => handleFilterChange('deliveryType', value === 'all' ? null : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Delivery Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Delivery Types</SelectItem>
              {DELIVERY_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Type of Delivery Filter */}
        <div className="space-y-2">
          <Label htmlFor="typeOfDelivery">Type of Delivery</Label>
          <Select
            value={localFilters.typeOfDelivery || "all"}
            onValueChange={(value) => handleFilterChange('typeOfDelivery', value === 'all' ? null : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Delivery Methods" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Delivery Methods</SelectItem>
              {TYPE_OF_DELIVERY.map((type) => (
                <SelectItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Amount Range */}
        <div className="space-y-2">
          <Label htmlFor="minAmount">Min Amount</Label>
          <Input
            id="minAmount"
            type="number"
            placeholder="Enter min amount"
            value={localFilters.minAmount || ""}
            onChange={(e) => handleFilterChange('minAmount', e.target.value ? parseFloat(e.target.value) : null)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxAmount">Max Amount</Label>
          <Input
            id="maxAmount"
            type="number"
            placeholder="Enter max amount"
            value={localFilters.maxAmount || ""}
            onChange={(e) => handleFilterChange('maxAmount', e.target.value ? parseFloat(e.target.value) : null)}
          />
        </div>

        {/* Geographic Filters */}
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            placeholder="Enter city"
            value={localFilters.city || ""}
            onChange={(e) => handleFilterChange('city', e.target.value || null)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            placeholder="Enter state"
            value={localFilters.state || ""}
            onChange={(e) => handleFilterChange('state', e.target.value || null)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="pincode">Pincode</Label>
          <Input
            id="pincode"
            placeholder="Enter pincode"
            value={localFilters.pincode || ""}
            onChange={(e) => handleFilterChange('pincode', e.target.value || null)}
          />
        </div>

        {/* Group By Filter */}
        <div className="space-y-2">
          <Label htmlFor="groupBy">Group By</Label>
          <Select
            value={localFilters.groupBy || "date"}
            onValueChange={(value) => handleFilterChange('groupBy', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Group by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="status">Status</SelectItem>
              <SelectItem value="orderType">Order Type</SelectItem>
              <SelectItem value="paymentType">Payment Type</SelectItem>
              <SelectItem value="orderSource">Order Source</SelectItem>
              <SelectItem value="deliveryType">Delivery Type</SelectItem>
              <SelectItem value="typeOfDelivery">Type of Delivery</SelectItem>
              <SelectItem value="city">City</SelectItem>
              <SelectItem value="state">State</SelectItem>
              <SelectItem value="pincode">Pincode</SelectItem>
              <SelectItem value="dealerId">Dealer ID</SelectItem>
              <SelectItem value="skuStatus">SKU Status</SelectItem>
              <SelectItem value="dealerMappingStatus">Dealer Mapping Status</SelectItem>
              <SelectItem value="paymentStatus">Payment Status</SelectItem>
              <SelectItem value="refundStatus">Refund Status</SelectItem>
              <SelectItem value="slaType">SLA Type</SelectItem>
              <SelectItem value="isSLAMet">SLA Met</SelectItem>
              <SelectItem value="courierName">Courier Name</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort By Filter */}
        <div className="space-y-2">
          <Label htmlFor="sortBy">Sort By</Label>
          <Select
            value={localFilters.sortBy || "totalAmount"}
            onValueChange={(value) => handleFilterChange('sortBy', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="totalAmount">Total Amount</SelectItem>
              <SelectItem value="count">Count</SelectItem>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="orderAmount">Order Amount</SelectItem>
              <SelectItem value="createdAt">Created At</SelectItem>
              <SelectItem value="updatedAt">Updated At</SelectItem>
              <SelectItem value="orderId">Order ID</SelectItem>
              <SelectItem value="invoiceNumber">Invoice Number</SelectItem>
              <SelectItem value="customerName">Customer Name</SelectItem>
              <SelectItem value="dealerId">Dealer ID</SelectItem>
              <SelectItem value="gst">GST</SelectItem>
              <SelectItem value="deliveryCharges">Delivery Charges</SelectItem>
              <SelectItem value="cgst">CGST</SelectItem>
              <SelectItem value="sgst">SGST</SelectItem>
              <SelectItem value="igst">IGST</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
              <SelectItem value="violationMinutes">Violation Minutes</SelectItem>
              <SelectItem value="razorpayOrderId">Razorpay Order ID</SelectItem>
              <SelectItem value="purchaseOrderId">Purchase Order ID</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort Order Filter */}
        <div className="space-y-2">
          <Label htmlFor="sortOrder">Sort Order</Label>
          <Select
            value={localFilters.sortOrder || "desc"}
            onValueChange={(value) => handleFilterChange('sortOrder', value as 'asc' | 'desc')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sort order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Descending</SelectItem>
              <SelectItem value="asc">Ascending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Limit Filter */}
        <div className="space-y-2">
          <Label htmlFor="limit">Limit</Label>
          <Select
            value={localFilters.limit?.toString() || "100"}
            onValueChange={(value) => handleFilterChange('limit', parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Limit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
              <SelectItem value="200">200</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Order ID Filter */}
        <div className="space-y-2">
          <Label htmlFor="orderId">Order ID</Label>
          <Input
            id="orderId"
            placeholder="Enter order ID"
            value={localFilters.orderId || ""}
            onChange={(e) => handleFilterChange('orderId', e.target.value || null)}
          />
        </div>

        {/* Invoice Number Filter */}
        <div className="space-y-2">
          <Label htmlFor="invoiceNumber">Invoice Number</Label>
          <Input
            id="invoiceNumber"
            placeholder="Enter invoice number"
            value={localFilters.invoiceNumber || ""}
            onChange={(e) => handleFilterChange('invoiceNumber', e.target.value || null)}
          />
        </div>

        {/* Customer Name Filter */}
        <div className="space-y-2">
          <Label htmlFor="customerName">Customer Name</Label>
          <Input
            id="customerName"
            placeholder="Enter customer name"
            value={localFilters.customerName || ""}
            onChange={(e) => handleFilterChange('customerName', e.target.value || null)}
          />
        </div>

        {/* Customer Email Filter */}
        <div className="space-y-2">
          <Label htmlFor="customerEmail">Customer Email</Label>
          <Input
            id="customerEmail"
            placeholder="Enter customer email"
            value={localFilters.customerEmail || ""}
            onChange={(e) => handleFilterChange('customerEmail', e.target.value || null)}
          />
        </div>

        {/* Customer Phone Filter */}
        <div className="space-y-2">
          <Label htmlFor="customerPhone">Customer Phone</Label>
          <Input
            id="customerPhone"
            placeholder="Enter customer phone"
            value={localFilters.customerPhone || ""}
            onChange={(e) => handleFilterChange('customerPhone', e.target.value || null)}
          />
        </div>

        {/* Dealer ID Filter */}
        <div className="space-y-2">
          <Label htmlFor="dealerId">Dealer ID</Label>
          <Input
            id="dealerId"
            placeholder="Enter dealer ID"
            value={localFilters.dealerId || ""}
            onChange={(e) => handleFilterChange('dealerId', e.target.value || null)}
          />
        </div>

        {/* SKU Status Filter */}
        <div className="space-y-2">
          <Label htmlFor="skuStatus">SKU Status</Label>
          <Select
            value={localFilters.skuStatus || "all"}
            onValueChange={(value) => handleFilterChange('skuStatus', value === 'all' ? null : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All SKU Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All SKU Status</SelectItem>
              {SKU_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Dealer Mapping Status Filter */}
        <div className="space-y-2">
          <Label htmlFor="dealerMappingStatus">Dealer Mapping Status</Label>
          <Select
            value={localFilters.dealerMappingStatus || "all"}
            onValueChange={(value) => handleFilterChange('dealerMappingStatus', value === 'all' ? null : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Mapping Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Mapping Status</SelectItem>
              {DEALER_MAPPING_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Payment Status Filter */}
        <div className="space-y-2">
          <Label htmlFor="paymentStatus">Payment Status</Label>
          <Select
            value={localFilters.paymentStatus || "all"}
            onValueChange={(value) => handleFilterChange('paymentStatus', value === 'all' ? null : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Payment Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payment Status</SelectItem>
              {PAYMENT_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Refund Status Filter */}
        <div className="space-y-2">
          <Label htmlFor="refundStatus">Refund Status</Label>
          <Select
            value={localFilters.refundStatus || "all"}
            onValueChange={(value) => handleFilterChange('refundStatus', value === 'all' ? null : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Refund Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Refund Status</SelectItem>
              {REFUND_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Razorpay Order ID Filter */}
        <div className="space-y-2">
          <Label htmlFor="razorpayOrderId">Razorpay Order ID</Label>
          <Input
            id="razorpayOrderId"
            placeholder="Enter Razorpay order ID"
            value={localFilters.razorpayOrderId || ""}
            onChange={(e) => handleFilterChange('razorpayOrderId', e.target.value || null)}
          />
        </div>

        {/* Razorpay Payment ID Filter */}
        <div className="space-y-2">
          <Label htmlFor="razorpayPaymentId">Razorpay Payment ID</Label>
          <Input
            id="razorpayPaymentId"
            placeholder="Enter Razorpay payment ID"
            value={localFilters.razorpayPaymentId || ""}
            onChange={(e) => handleFilterChange('razorpayPaymentId', e.target.value || null)}
          />
        </div>

        {/* Purchase Order ID Filter */}
        <div className="space-y-2">
          <Label htmlFor="purchaseOrderId">Purchase Order ID</Label>
          <Input
            id="purchaseOrderId"
            placeholder="Enter purchase order ID"
            value={localFilters.purchaseOrderId || ""}
            onChange={(e) => handleFilterChange('purchaseOrderId', e.target.value || null)}
          />
        </div>

        {/* GST Range */}
        <div className="space-y-2">
          <Label htmlFor="minGST">Min GST</Label>
          <Input
            id="minGST"
            type="number"
            placeholder="Enter min GST"
            value={localFilters.minGST || ""}
            onChange={(e) => handleFilterChange('minGST', e.target.value ? parseFloat(e.target.value) : null)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxGST">Max GST</Label>
          <Input
            id="maxGST"
            type="number"
            placeholder="Enter max GST"
            value={localFilters.maxGST || ""}
            onChange={(e) => handleFilterChange('maxGST', e.target.value ? parseFloat(e.target.value) : null)}
          />
        </div>

        {/* Delivery Charges Range */}
        <div className="space-y-2">
          <Label htmlFor="minDeliveryCharges">Min Delivery Charges</Label>
          <Input
            id="minDeliveryCharges"
            type="number"
            placeholder="Enter min delivery charges"
            value={localFilters.minDeliveryCharges || ""}
            onChange={(e) => handleFilterChange('minDeliveryCharges', e.target.value ? parseFloat(e.target.value) : null)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxDeliveryCharges">Max Delivery Charges</Label>
          <Input
            id="maxDeliveryCharges"
            type="number"
            placeholder="Enter max delivery charges"
            value={localFilters.maxDeliveryCharges || ""}
            onChange={(e) => handleFilterChange('maxDeliveryCharges', e.target.value ? parseFloat(e.target.value) : null)}
          />
        </div>

        {/* CGST Range */}
        <div className="space-y-2">
          <Label htmlFor="minCGST">Min CGST</Label>
          <Input
            id="minCGST"
            type="number"
            placeholder="Enter min CGST"
            value={localFilters.minCGST || ""}
            onChange={(e) => handleFilterChange('minCGST', e.target.value ? parseFloat(e.target.value) : null)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxCGST">Max CGST</Label>
          <Input
            id="maxCGST"
            type="number"
            placeholder="Enter max CGST"
            value={localFilters.maxCGST || ""}
            onChange={(e) => handleFilterChange('maxCGST', e.target.value ? parseFloat(e.target.value) : null)}
          />
        </div>

        {/* SGST Range */}
        <div className="space-y-2">
          <Label htmlFor="minSGST">Min SGST</Label>
          <Input
            id="minSGST"
            type="number"
            placeholder="Enter min SGST"
            value={localFilters.minSGST || ""}
            onChange={(e) => handleFilterChange('minSGST', e.target.value ? parseFloat(e.target.value) : null)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxSGST">Max SGST</Label>
          <Input
            id="maxSGST"
            type="number"
            placeholder="Enter max SGST"
            value={localFilters.maxSGST || ""}
            onChange={(e) => handleFilterChange('maxSGST', e.target.value ? parseFloat(e.target.value) : null)}
          />
        </div>

        {/* IGST Range */}
        <div className="space-y-2">
          <Label htmlFor="minIGST">Min IGST</Label>
          <Input
            id="minIGST"
            type="number"
            placeholder="Enter min IGST"
            value={localFilters.minIGST || ""}
            onChange={(e) => handleFilterChange('minIGST', e.target.value ? parseFloat(e.target.value) : null)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxIGST">Max IGST</Label>
          <Input
            id="maxIGST"
            type="number"
            placeholder="Enter max IGST"
            value={localFilters.maxIGST || ""}
            onChange={(e) => handleFilterChange('maxIGST', e.target.value ? parseFloat(e.target.value) : null)}
          />
        </div>

        {/* Rating Range */}
        <div className="space-y-2">
          <Label htmlFor="minRating">Min Rating</Label>
          <Input
            id="minRating"
            type="number"
            min="0"
            max="5"
            step="0.1"
            placeholder="Enter min rating"
            value={localFilters.minRating || ""}
            onChange={(e) => handleFilterChange('minRating', e.target.value ? parseFloat(e.target.value) : null)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxRating">Max Rating</Label>
          <Input
            id="maxRating"
            type="number"
            min="0"
            max="5"
            step="0.1"
            placeholder="Enter max rating"
            value={localFilters.maxRating || ""}
            onChange={(e) => handleFilterChange('maxRating', e.target.value ? parseFloat(e.target.value) : null)}
          />
        </div>

        {/* SLA Type Filter */}
        <div className="space-y-2">
          <Label htmlFor="slaType">SLA Type</Label>
          <Input
            id="slaType"
            placeholder="Enter SLA type"
            value={localFilters.slaType || ""}
            onChange={(e) => handleFilterChange('slaType', e.target.value || null)}
          />
        </div>

        {/* SLA Met Filter */}
        <div className="space-y-2">
          <Label htmlFor="isSLAMet">SLA Met</Label>
          <Select
            value={localFilters.isSLAMet === null ? "all" : localFilters.isSLAMet ? "true" : "false"}
            onValueChange={(value) => handleFilterChange('isSLAMet', value === 'all' ? null : value === 'true')}
          >
            <SelectTrigger>
              <SelectValue placeholder="All SLA Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All SLA Status</SelectItem>
              <SelectItem value="true">SLA Met</SelectItem>
              <SelectItem value="false">SLA Not Met</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Violation Minutes Range */}
        <div className="space-y-2">
          <Label htmlFor="minViolationMinutes">Min Violation Minutes</Label>
          <Input
            id="minViolationMinutes"
            type="number"
            placeholder="Enter min violation minutes"
            value={localFilters.minViolationMinutes || ""}
            onChange={(e) => handleFilterChange('minViolationMinutes', e.target.value ? parseInt(e.target.value) : null)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxViolationMinutes">Max Violation Minutes</Label>
          <Input
            id="maxViolationMinutes"
            type="number"
            placeholder="Enter max violation minutes"
            value={localFilters.maxViolationMinutes || ""}
            onChange={(e) => handleFilterChange('maxViolationMinutes', e.target.value ? parseInt(e.target.value) : null)}
          />
        </div>

        {/* Borzo Order ID Filter */}
        <div className="space-y-2">
          <Label htmlFor="borzoOrderId">Borzo Order ID</Label>
          <Input
            id="borzoOrderId"
            placeholder="Enter Borzo order ID"
            value={localFilters.borzoOrderId || ""}
            onChange={(e) => handleFilterChange('borzoOrderId', e.target.value || null)}
          />
        </div>

        {/* Borzo Tracking Status Filter */}
        <div className="space-y-2">
          <Label htmlFor="borzoTrackingStatus">Borzo Tracking Status</Label>
          <Input
            id="borzoTrackingStatus"
            placeholder="Enter Borzo tracking status"
            value={localFilters.borzoTrackingStatus || ""}
            onChange={(e) => handleFilterChange('borzoTrackingStatus', e.target.value || null)}
          />
        </div>

        {/* Borzo Order Status Filter */}
        <div className="space-y-2">
          <Label htmlFor="borzoOrderStatus">Borzo Order Status</Label>
          <Input
            id="borzoOrderStatus"
            placeholder="Enter Borzo order status"
            value={localFilters.borzoOrderStatus || ""}
            onChange={(e) => handleFilterChange('borzoOrderStatus', e.target.value || null)}
          />
        </div>

        {/* AWB Filter */}
        <div className="space-y-2">
          <Label htmlFor="awb">AWB</Label>
          <Input
            id="awb"
            placeholder="Enter AWB"
            value={localFilters.awb || ""}
            onChange={(e) => handleFilterChange('awb', e.target.value || null)}
          />
        </div>

        {/* Courier Name Filter */}
        <div className="space-y-2">
          <Label htmlFor="courierName">Courier Name</Label>
          <Input
            id="courierName"
            placeholder="Enter courier name"
            value={localFilters.courierName || ""}
            onChange={(e) => handleFilterChange('courierName', e.target.value || null)}
          />
        </div>

        {/* Has Invoice Filter */}
        <div className="space-y-2">
          <Label htmlFor="hasInvoice">Has Invoice</Label>
          <Select
            value={localFilters.hasInvoice === null ? "all" : localFilters.hasInvoice ? "true" : "false"}
            onValueChange={(value) => handleFilterChange('hasInvoice', value === 'all' ? null : value === 'true')}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Invoice Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Invoice Status</SelectItem>
              <SelectItem value="true">Has Invoice</SelectItem>
              <SelectItem value="false">No Invoice</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Has Rating Filter */}
        <div className="space-y-2">
          <Label htmlFor="hasRating">Has Rating</Label>
          <Select
            value={localFilters.hasRating === null ? "all" : localFilters.hasRating ? "true" : "false"}
            onValueChange={(value) => handleFilterChange('hasRating', value === 'all' ? null : value === 'true')}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Rating Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Rating Status</SelectItem>
              <SelectItem value="true">Has Rating</SelectItem>
              <SelectItem value="false">No Rating</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Has Review Filter */}
        <div className="space-y-2">
          <Label htmlFor="hasReview">Has Review</Label>
          <Select
            value={localFilters.hasReview === null ? "all" : localFilters.hasReview ? "true" : "false"}
            onValueChange={(value) => handleFilterChange('hasReview', value === 'all' ? null : value === 'true')}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Review Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Review Status</SelectItem>
              <SelectItem value="true">Has Review</SelectItem>
              <SelectItem value="false">No Review</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-3 pt-4">
        <Button onClick={applyFilters} className="bg-blue-600 hover:bg-blue-700">
          Apply Filters
        </Button>
        <Button
          onClick={clearFilters}
          variant="outline"
          className="flex items-center"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Clear Filters
        </Button>
      </div>
    </div>
  );
}
