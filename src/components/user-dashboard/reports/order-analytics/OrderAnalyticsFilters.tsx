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
import { OrderAnalyticsFilterOptions, ORDER_STATUSES, ORDER_TYPES, PAYMENT_TYPES, ORDER_SOURCES, DELIVERY_TYPES, TYPE_OF_DELIVERY } from "@/types/order-analytics-types";

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
      limit: 100
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
              <SelectItem value="city">City</SelectItem>
              <SelectItem value="state">State</SelectItem>
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
