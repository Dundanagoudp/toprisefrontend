"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import {
  Filter,
  X,
  Search,
  Download,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CustomDatePicker } from "@/components/ui/custom-date-picker";

interface EnhancedOrderFiltersProps {
  onFiltersChange: (filters: OrderFilters) => void;
  onExport: () => void;
  onRefresh: () => void;
  loading?: boolean;
}

interface OrderFilters {
  search: string;
  status: string;
  paymentMethod: string;
  orderSource: string;
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  orderValue: {
    min: string;
    max: string;
  };
  customerType: string;
  region: string;
  assignedDealer: string;
}

export default function EnhancedOrderFilters({
  onFiltersChange,
  onExport,
  onRefresh,
  loading = false,
}: EnhancedOrderFiltersProps) {
  const [filters, setFilters] = useState<OrderFilters>({
    search: "",
    status: "all",
    paymentMethod: "all",
    orderSource: "all",
    dateRange: {
      from: undefined,
      to: undefined,
    },
    orderValue: {
      min: "",
      max: "",
    },
    customerType: "all",
    region: "all",
    assignedDealer: "all",
  });

  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key: keyof OrderFilters, value: any) => {
    console.log(`Filter change: ${key} = ${value}`);
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleDateRangeChange = (range: { from: Date | undefined; to: Date | undefined }) => {
    console.log("Date range changed:", range);
    
    // Ensure both from and to dates are properly handled
    const newRange = {
      from: range.from,
      to: range.to
    };
    
    const newFilters = { ...filters, dateRange: newRange };
    setFilters(newFilters);
    
    // Force immediate filter application
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters: OrderFilters = {
      search: "",
      status: "all",
      paymentMethod: "all",
      orderSource: "all",
      dateRange: {
        from: undefined,
        to: undefined,
      },
      orderValue: {
        min: "",
        max: "",
      },
      customerType: "all",
      region: "all",
      assignedDealer: "all",
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.status !== "all") count++;
    if (filters.paymentMethod !== "all") count++;
    if (filters.orderSource !== "all") count++;
    if (filters.dateRange.from || filters.dateRange.to) count++;
    if (filters.orderValue.min || filters.orderValue.max) count++;
    if (filters.customerType !== "all") count++;
    if (filters.region !== "all") count++;
    if (filters.assignedDealer !== "all") count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <SlidersHorizontal className="h-5 w-5" />
              <span>Order Filters</span>
              {activeFiltersCount > 0 && (
                <Badge className="ml-2 bg-blue-100 text-blue-700 hover:bg-blue-100">
                  {activeFiltersCount} active
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Filter and search orders with advanced options
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <Filter className="h-4 w-4 mr-2" />
              {isExpanded ? "Collapse" : "Expand"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Basic Filters - Always Visible */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Search */}
          <div className="space-y-2">
            <Label>Search Orders</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Order ID, customer, phone..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="scanning">Scanning</SelectItem>
                <SelectItem value="packed">Packed</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="returned">Returned</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label>Payment Method</Label>
            <Select value={filters.paymentMethod} onValueChange={(value) => handleFilterChange("paymentMethod", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payment Methods</SelectItem>
               
                <SelectItem value="prepaid">Prepaid</SelectItem>
                <SelectItem value="COD">COD</SelectItem>

              </SelectContent>
            </Select>
          </div>

          {/* Order Source */}
          <div className="space-y-2">
            <Label>Order Source</Label>
            <Select value={filters.orderSource} onValueChange={(value) => handleFilterChange("orderSource", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="Web">Web</SelectItem>
                <SelectItem value="Mobile">Mobile</SelectItem>
                <SelectItem value="POS">POS</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range (Always Visible) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Date Range</Label>
              {(filters.dateRange.from || filters.dateRange.to) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDateRangeChange({ from: undefined, to: undefined })}
                  className="h-6 px-2 text-xs"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear
                </Button>
              )}
            </div>
            <CustomDatePicker
              value={filters.dateRange}
              onChange={handleDateRangeChange}
              placeholder="Pick a date range"
              className="w-full"
            />
          </div>
        </div>

        {/* Advanced Filters - Expandable */}
        {isExpanded && (
          <div className="space-y-4 border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Order Value Range */}
              <div className="space-y-2">
                <Label>Order Value Range</Label>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Min"
                    type="number"
                    value={filters.orderValue.min}
                    onChange={(e) => handleFilterChange("orderValue", { ...filters.orderValue, min: e.target.value })}
                  />
                  <Input
                    placeholder="Max"
                    type="number"
                    value={filters.orderValue.max}
                    onChange={(e) => handleFilterChange("orderValue", { ...filters.orderValue, max: e.target.value })}
                  />
                </div>
              </div>

              {/* Customer Type */}
              <div className="space-y-2">
                <Label>Customer Type</Label>
                <Select value={filters.customerType} onValueChange={(value) => handleFilterChange("customerType", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Customer Types</SelectItem>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="wholesale">Wholesale</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Region */}
              <div className="space-y-2">
                <Label>Region</Label>
                <Select value={filters.region} onValueChange={(value) => handleFilterChange("region", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Regions</SelectItem>
                    <SelectItem value="north">North</SelectItem>
                    <SelectItem value="south">South</SelectItem>
                    <SelectItem value="east">East</SelectItem>
                    <SelectItem value="west">West</SelectItem>
                    <SelectItem value="central">Central</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Assigned Dealer */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Assigned Dealer</Label>
                <Select value={filters.assignedDealer} onValueChange={(value) => handleFilterChange("assignedDealer", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Dealers</SelectItem>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    <SelectItem value="dealer_001">Dealer 001</SelectItem>
                    <SelectItem value="dealer_002">Dealer 002</SelectItem>
                    <SelectItem value="dealer_003">Dealer 003</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-medium">Active Filters</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Clear All
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.search && (
                <Badge className="flex items-center space-x-1 bg-blue-100 text-blue-700 hover:bg-blue-100">
                  <span>Search: {filters.search}</span>
                  <button
                    type="button"
                    className="h-3 w-3 cursor-pointer hover:bg-blue-200 rounded-sm flex items-center justify-center"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Clearing search filter');
                      handleFilterChange("search", "");
                    }}
                  >
                    <X className="h-2 w-2" />
                  </button>
                </Badge>
              )}
              {filters.status !== "all" && (
                <Badge className="flex items-center space-x-1 bg-blue-100 text-blue-700 hover:bg-blue-100">
                  <span>Status: {filters.status}</span>
                  <button
                    type="button"
                    className="h-3 w-3 cursor-pointer hover:bg-blue-200 rounded-sm flex items-center justify-center"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Clearing status filter');
                      handleFilterChange("status", "all");
                    }}
                  >
                    <X className="h-2 w-2" />
                  </button>
                </Badge>
              )}
              {filters.paymentMethod !== "all" && (
                <Badge className="flex items-center space-x-1 bg-blue-100 text-blue-700 hover:bg-blue-100">
                  <span>Payment: {filters.paymentMethod}</span>
                  <button
                    type="button"
                    className="h-3 w-3 cursor-pointer hover:bg-blue-200 rounded-sm flex items-center justify-center"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Clearing payment filter');
                      handleFilterChange("paymentMethod", "all");
                    }}
                  >
                    <X className="h-2 w-2" />
                  </button>
                </Badge>
              )}
              {filters.orderSource !== "all" && (
                <Badge className="flex items-center space-x-1 bg-blue-100 text-blue-700 hover:bg-blue-100">
                  <span>Source: {filters.orderSource}</span>
                  <button
                    type="button"
                    className="h-3 w-3 cursor-pointer hover:bg-blue-200 rounded-sm flex items-center justify-center"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Clearing order source filter');
                      handleFilterChange("orderSource", "all");
                    }}
                  >
                    <X className="h-2 w-2" />
                  </button>
                </Badge>
              )}
              {(filters.dateRange.from || filters.dateRange.to) && (
                <Badge className="flex items-center space-x-1 bg-blue-100 text-blue-700 hover:bg-blue-100">
                  <span>
                    Date: {filters.dateRange.from ? format(filters.dateRange.from, "MMM dd") : "Start"} -{" "}
                    {filters.dateRange.to ? format(filters.dateRange.to, "MMM dd") : "End"}
                  </span>
                  <button
                    type="button"
                    className="h-3 w-3 cursor-pointer hover:bg-blue-200 rounded-sm flex items-center justify-center"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Clearing date range filter');
                      handleDateRangeChange({ from: undefined, to: undefined });
                    }}
                  >
                    <X className="h-2 w-2" />
                  </button>
                </Badge>
              )}
              {(filters.orderValue.min || filters.orderValue.max) && (
                <Badge className="flex items-center space-x-1 bg-blue-100 text-blue-700 hover:bg-blue-100">
                  <span>
                    Value: {filters.orderValue.min || "0"} - {filters.orderValue.max || "∞"}
                  </span>
                  <button
                    type="button"
                    className="h-3 w-3 cursor-pointer hover:bg-blue-200 rounded-sm flex items-center justify-center"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Clearing order value filter');
                      handleFilterChange("orderValue", { min: "", max: "" });
                    }}
                  >
                    <X className="h-2 w-2" />
                  </button>
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
