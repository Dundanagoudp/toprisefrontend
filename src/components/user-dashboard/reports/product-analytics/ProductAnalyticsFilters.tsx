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
import { 
  ProductAnalyticsFilterOptions, 
  PRODUCT_STATUSES, 
  PRODUCT_TYPES, 
  QC_STATUSES, 
  LIVE_STATUSES, 
  PRODUCT_CATEGORIES, 
  CREATED_BY_ROLES 
} from "@/types/product-analytics-types";

interface ProductAnalyticsFiltersProps {
  filters: ProductAnalyticsFilterOptions;
  onFiltersChange: (filters: ProductAnalyticsFilterOptions) => void;
}

export default function ProductAnalyticsFilters({ filters, onFiltersChange }: ProductAnalyticsFiltersProps) {
  const [localFilters, setLocalFilters] = useState<ProductAnalyticsFilterOptions>(filters);

  // Helper function to safely convert boolean to string
  const booleanToString = (value: boolean | null | undefined): string => {
    if (value === null || value === undefined) return "all";
    return value.toString();
  };

  // Handle filter changes
  const handleFilterChange = (key: keyof ProductAnalyticsFilterOptions, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
  };

  // Apply filters
  const applyFilters = () => {
    onFiltersChange(localFilters);
  };

  // Clear filters
  const clearFilters = () => {
    const clearedFilters: ProductAnalyticsFilterOptions = {
      startDate: null,
      endDate: null,
      brand: null,
      category: null,
      subCategory: null,
      model: null,
      variant: null,
      status: null,
      qcStatus: null,
      liveStatus: null,
      productType: null,
      isUniversal: null,
      isConsumable: null,
      minPrice: null,
      maxPrice: null,
      createdBy: null,
      createdByRole: null,
      groupBy: 'brand',
      sortBy: 'count',
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

        {/* Brand Filter */}
        <div className="space-y-2">
          <Label htmlFor="brand">Brand</Label>
          <Input
            id="brand"
            placeholder="Enter brand"
            value={localFilters.brand || ""}
            onChange={(e) => handleFilterChange('brand', e.target.value || null)}
          />
        </div>

        {/* Category Filter */}
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={localFilters.category || "all"}
            onValueChange={(value) => handleFilterChange('category', value === 'all' ? null : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {PRODUCT_CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sub Category Filter */}
        <div className="space-y-2">
          <Label htmlFor="subCategory">Sub Category</Label>
          <Input
            id="subCategory"
            placeholder="Enter sub category"
            value={localFilters.subCategory || ""}
            onChange={(e) => handleFilterChange('subCategory', e.target.value || null)}
          />
        </div>

        {/* Model Filter */}
        <div className="space-y-2">
          <Label htmlFor="model">Model</Label>
          <Input
            id="model"
            placeholder="Enter model"
            value={localFilters.model || ""}
            onChange={(e) => handleFilterChange('model', e.target.value || null)}
          />
        </div>

        {/* Variant Filter */}
        <div className="space-y-2">
          <Label htmlFor="variant">Variant</Label>
          <Input
            id="variant"
            placeholder="Enter variant"
            value={localFilters.variant || ""}
            onChange={(e) => handleFilterChange('variant', e.target.value || null)}
          />
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
              {PRODUCT_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* QC Status Filter */}
        <div className="space-y-2">
          <Label htmlFor="qcStatus">QC Status</Label>
          <Select
            value={localFilters.qcStatus || "all"}
            onValueChange={(value) => handleFilterChange('qcStatus', value === 'all' ? null : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All QC Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All QC Status</SelectItem>
              {QC_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Live Status Filter */}
        <div className="space-y-2">
          <Label htmlFor="liveStatus">Live Status</Label>
          <Select
            value={localFilters.liveStatus || "all"}
            onValueChange={(value) => handleFilterChange('liveStatus', value === 'all' ? null : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Live Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Live Status</SelectItem>
              {LIVE_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Product Type Filter */}
        <div className="space-y-2">
          <Label htmlFor="productType">Product Type</Label>
          <Select
            value={localFilters.productType || "all"}
            onValueChange={(value) => handleFilterChange('productType', value === 'all' ? null : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Product Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Product Types</SelectItem>
              {PRODUCT_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Is Universal Filter */}
        <div className="space-y-2">
          <Label htmlFor="isUniversal">Is Universal</Label>
          <Select
            value={booleanToString(localFilters.isUniversal)}
            onValueChange={(value) => handleFilterChange('isUniversal', value === 'all' ? null : value === 'true')}
          >
            <SelectTrigger>
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="true">Yes</SelectItem>
              <SelectItem value="false">No</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Is Consumable Filter */}
        <div className="space-y-2">
          <Label htmlFor="isConsumable">Is Consumable</Label>
          <Select
            value={booleanToString(localFilters.isConsumable)}
            onValueChange={(value) => handleFilterChange('isConsumable', value === 'all' ? null : value === 'true')}
          >
            <SelectTrigger>
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="true">Yes</SelectItem>
              <SelectItem value="false">No</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Price Range */}
        <div className="space-y-2">
          <Label htmlFor="minPrice">Min Price</Label>
          <Input
            id="minPrice"
            type="number"
            placeholder="Enter min price"
            value={localFilters.minPrice || ""}
            onChange={(e) => handleFilterChange('minPrice', e.target.value ? parseFloat(e.target.value) : null)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxPrice">Max Price</Label>
          <Input
            id="maxPrice"
            type="number"
            placeholder="Enter max price"
            value={localFilters.maxPrice || ""}
            onChange={(e) => handleFilterChange('maxPrice', e.target.value ? parseFloat(e.target.value) : null)}
          />
        </div>

        {/* Created By Filter */}
        <div className="space-y-2">
          <Label htmlFor="createdBy">Created By</Label>
          <Input
            id="createdBy"
            placeholder="Enter user ID"
            value={localFilters.createdBy || ""}
            onChange={(e) => handleFilterChange('createdBy', e.target.value || null)}
          />
        </div>

        {/* Created By Role Filter */}
        <div className="space-y-2">
          <Label htmlFor="createdByRole">Created By Role</Label>
          <Select
            value={localFilters.createdByRole || "all"}
            onValueChange={(value) => handleFilterChange('createdByRole', value === 'all' ? null : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {CREATED_BY_ROLES.map((role) => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Group By Filter */}
        <div className="space-y-2">
          <Label htmlFor="groupBy">Group By</Label>
          <Select
            value={localFilters.groupBy || "brand"}
            onValueChange={(value) => handleFilterChange('groupBy', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Group by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="brand">Brand</SelectItem>
              <SelectItem value="category">Category</SelectItem>
              <SelectItem value="subCategory">Sub Category</SelectItem>
              <SelectItem value="model">Model</SelectItem>
              <SelectItem value="status">Status</SelectItem>
              <SelectItem value="liveStatus">Live Status</SelectItem>
              <SelectItem value="productType">Product Type</SelectItem>
              <SelectItem value="createdByRole">Created By Role</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort By Filter */}
        <div className="space-y-2">
          <Label htmlFor="sortBy">Sort By</Label>
          <Select
            value={localFilters.sortBy || "count"}
            onValueChange={(value) => handleFilterChange('sortBy', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="count">Count</SelectItem>
              <SelectItem value="totalValue">Total Value</SelectItem>
              <SelectItem value="totalSellingPrice">Total Selling Price</SelectItem>
              <SelectItem value="avgSellingPrice">Average Selling Price</SelectItem>
              <SelectItem value="totalMrp">Total MRP</SelectItem>
              <SelectItem value="avgMrp">Average MRP</SelectItem>
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
