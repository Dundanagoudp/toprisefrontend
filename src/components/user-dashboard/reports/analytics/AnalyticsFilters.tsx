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
import { AnalyticsFilterOptions } from "@/types/analytics-types";

interface AnalyticsFiltersProps {
  filters: AnalyticsFilterOptions;
  onFiltersChange: (filters: AnalyticsFilterOptions) => void;
}

export default function AnalyticsFilters({ filters, onFiltersChange }: AnalyticsFiltersProps) {
  const [localFilters, setLocalFilters] = useState<AnalyticsFilterOptions>(filters);

  // Handle filter changes
  const handleFilterChange = (key: keyof AnalyticsFilterOptions, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
  };

  // Apply filters
  const applyFilters = () => {
    console.log("Applying filters:", localFilters);
    onFiltersChange(localFilters);
  };

  // Clear filters
  const clearFilters = () => {
    const clearedFilters: AnalyticsFilterOptions = {
      status: null,
      role: null,
      startDate: null,
      endDate: null,
      groupBy: 'status',
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
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Role Filter (for performance analytics) */}
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Select
            value={localFilters.role || "all"}
            onValueChange={(value) => handleFilterChange('role', value === 'all' ? null : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="Super-admin">Super Admin</SelectItem>
              <SelectItem value="User">User</SelectItem>
              <SelectItem value="Dealer">Dealer</SelectItem>
              <SelectItem value="Fulfillment-Staff">Fulfillment Staff</SelectItem>
              <SelectItem value="Fulfillment-Admin">Fulfillment Admin</SelectItem>
              <SelectItem value="Inventory-Staff">Inventory Staff</SelectItem>
              <SelectItem value="Inventory-Admin">Inventory Admin</SelectItem>
              <SelectItem value="Customer-Support">Customer Support</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* City Filter */}
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            placeholder="Enter city"
            value={localFilters.city || ""}
            onChange={(e) => handleFilterChange('city', e.target.value || null)}
          />
        </div>

        {/* State Filter */}
        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            placeholder="Enter state"
            value={localFilters.state || ""}
            onChange={(e) => handleFilterChange('state', e.target.value || null)}
          />
        </div>

        {/* Pincode Filter */}
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
            value={localFilters.groupBy || "status"}
            onValueChange={(value) => handleFilterChange('groupBy', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Group by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="status">Status</SelectItem>
              <SelectItem value="role">Role</SelectItem>
              <SelectItem value="city">City</SelectItem>
              <SelectItem value="state">State</SelectItem>
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
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="lastLogin">Last Login</SelectItem>
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
