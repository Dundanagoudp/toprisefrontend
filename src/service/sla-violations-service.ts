import apiClient from "@/apiClient";
import { getDealerIdFromUserId } from "./dealerServices";

export interface SLAViolation {
  _id: string;
  dealer_id: string;
  order_id: {
    _id: string;
    orderId: string;
    orderDate: string;
    customerDetails: {
      userId: string;
      name: string;
      phone: string;
      address: string;
      pincode: string;
      email: string;
    };
  };
  expected_fulfillment_time: string;
  actual_fulfillment_time: string;
  violation_minutes: number;
  violation_hours: number;
  violation_days: number;
  resolved: boolean;
  notes: string;
  created_at: string;
  severity: string;
  orderDetails: {
    _id: string;
    orderId: string;
    orderDate: string;
    customerDetails: {
      userId: string;
      name: string;
      phone: string;
      address: string;
      pincode: string;
      email: string;
    };
  };
}

export interface SLAViolationsSummary {
  totalViolations: number;
  totalViolationMinutes: number;
  averageViolationMinutes: number;
  resolvedViolations: number;
  unresolvedViolations: number;
  maxViolationMinutes: number;
  minViolationMinutes: number;
}

export interface SLAViolationsByDate {
  [date: string]: {
    count: number;
    totalMinutes: number;
    violations: SLAViolation[];
  };
}

export interface SLAViolationsPagination {
  currentPage: number;
  totalPages: number;
  totalViolations: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage: number | null;
  prevPage: number | null;
}

export interface SLAViolationsFilters {
  startDate: string | null;
  endDate: string | null;
  resolved: boolean | null;
  sortBy: string;
  sortOrder: string;
}

export interface SLAViolationsResponse {
  success: boolean;
  message: string;
  data: {
    dealerId: string;
    dealerInfo: any;
    violations: SLAViolation[];
    summary: SLAViolationsSummary;
    violationsByDate: SLAViolationsByDate;
    pagination: SLAViolationsPagination;
    filters: SLAViolationsFilters;
  };
}

// Get SLA violations for a dealer
export async function getSLAViolationsByDealer(
  dealerId?: string,
  page: number = 1,
  limit: number = 10,
  filters?: {
    startDate?: string;
    endDate?: string;
    resolved?: boolean;
    sortBy?: string;
    sortOrder?: string;
  }
): Promise<SLAViolationsResponse> {
  try {
    let id = dealerId;
    
    // If dealerId is not provided, get it from dealer services
    if (!id) {
      try {
        console.log(`[getSLAViolationsByDealer] Getting dealer ID from dealer services`);
        id = await getDealerIdFromUserId();
        console.log(`[getSLAViolationsByDealer] Successfully got dealer ID: ${id}`);
      } catch (dealerServiceError) {
        console.error("Failed to get dealer ID from dealer services:", dealerServiceError);
        throw new Error("Unable to determine dealer ID");
      }
    }
    
    console.log(`[getSLAViolationsByDealer] Fetching SLA violations for dealer ID: ${id}`);
    
    // Build query parameters
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (filters) {
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      if (filters.resolved !== undefined) queryParams.append('resolved', filters.resolved.toString());
      if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
      if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder);
    }
    
    const url = `/orders/api/orders/sla/violations/dealer/${id}?${queryParams.toString()}`;
    console.log(`[getSLAViolationsByDealer] API URL: ${url}`);
    
    const response = await apiClient.get(url);
    
    if (response.data && response.data.success) {
      console.log(`[getSLAViolationsByDealer] Successfully fetched SLA violations for dealer ID: ${id}`);
      return response.data;
    } else {
      throw new Error("Invalid response from SLA violations endpoint");
    }
  } catch (error) {
    console.error("Error fetching SLA violations:", error);
    throw error;
  }
}

// Get SLA violations summary for a dealer
export async function getSLAViolationsSummary(dealerId?: string): Promise<SLAViolationsSummary> {
  try {
    const response = await getSLAViolationsByDealer(dealerId, 1, 1);
    return response.data.summary;
  } catch (error) {
    console.error("Error fetching SLA violations summary:", error);
    throw error;
  }
}

// Format violation time for display
export function formatViolationTime(minutes: number): string {
  if (minutes === 0) return "0 minutes";
  
  const days = Math.floor(minutes / (24 * 60));
  const hours = Math.floor((minutes % (24 * 60)) / 60);
  const remainingMinutes = minutes % 60;
  
  const parts = [];
  if (days > 0) parts.push(`${days} day${days > 1 ? 's' : ''}`);
  if (hours > 0) parts.push(`${hours} hour${hours > 1 ? 's' : ''}`);
  if (remainingMinutes > 0) parts.push(`${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}`);
  
  return parts.join(', ');
}

// Get severity color for UI
export function getSeverityColor(severity: string): string {
  switch (severity.toLowerCase()) {
    case 'high':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'low':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

// Format date for display
export function formatViolationDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return 'Invalid Date';
  }
}
