import apiClient from "@/apiClient";
import axios from "axios";
import Cookies from "js-cookie";

// Types
export interface SLAViolation {
  _id: string;
  dealer_id: string;
  order_id: string;
  orderDetails?: {
    orderId: string;
    orderDate: string;
    customerDetails?: {
      name: string;
      email: string;
      phone: string;
    };
  };
  expected_fulfillment_time: string;
  actual_fulfillment_time: string;
  violation_minutes: number;
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "resolved" | "acknowledged";
  created_at: string;
  updated_at: string;
  resolution_notes?: string;
  resolved_by?: string;
  resolved_at?: string;
  dealerInfo?: {
    legal_name: string;
    trade_name: string;
    contact_person: {
      name: string;
      email: string;
      phone_number: string;
    };
  };
}

export interface SLAViolationsSummary {
  totalViolations: number;
  resolvedViolations: number;
  unresolvedViolations: number;
  averageViolationMinutes: number;
  criticalViolations: number;
  highViolations: number;
  mediumViolations: number;
  lowViolations: number;
}

// Enhanced endpoint response structure
export interface SLAViolationsEnhancedResponse {
  success: boolean;
  message: string;
  data: {
    dealerDetails: any | null;
    statistics: {
      totalViolations: number;
      resolvedViolations: number;
      unresolvedViolations: number;
      averageViolationMinutes: number;
      maxViolationMinutes: number;
      resolutionRate: number;
    };
    violations: SLAViolation[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      limit: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

export interface SLAViolationsResponse {
  success: boolean;
  message: string;
  data: {
    violations: SLAViolation[];
    summary: SLAViolationsSummary;
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
}

// Utility functions
export const formatViolationTime = (minutes: number): string => {
  // Handle NaN, null, undefined, or invalid numbers
  if (!minutes || isNaN(minutes) || minutes < 0) {
    return "0m";
  }
  
  if (minutes < 60) {
    return `${Math.round(minutes)}m`;
  } else if (minutes < 1440) { // Less than 24 hours
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.round(minutes % 60);
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  } else {
    const days = Math.floor(minutes / 1440);
    const remainingHours = Math.floor((minutes % 1440) / 60);
    return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
  }
};

export const getSeverityColor = (severity: string): string => {
  switch (severity?.toLowerCase()) {
    case "critical":
      return "bg-red-100 text-red-800 border-red-200";
    case "high":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "medium":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "low":
      return "bg-green-100 text-green-800 border-green-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export const formatViolationDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid Date";
  }
};

// Debug: Check if apiClient is properly imported
console.log("SLA Service - apiClient:", apiClient);
console.log("SLA Service - apiClient.post:", apiClient?.post);

// Fallback API client if the main one fails
const createFallbackClient = () => {
  const token = Cookies.get("token") || Cookies.get("authToken") || Cookies.get("jwt") || Cookies.get("accessToken");
  console.log("Creating fallback client with token:", !!token);
  return axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.toprise.in/api",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` })
    },
    withCredentials: true,
    timeout: 10000000,
  });
};

// Contact dealer about SLA violation
export const contactDealerAboutViolation = async (
  violationId: string,
  contactData: {
    contact_method: "notification" | "email" | "phone";
    custom_message: string;
  }
): Promise<any> => {
  try {
    console.log("Contacting dealer with violationId:", violationId);
    console.log("Contact data:", contactData);
    console.log("apiClient available:", !!apiClient);
    
    // Use fallback client if main client is not available
    const client = apiClient && typeof apiClient.post === 'function' ? apiClient : createFallbackClient();
    console.log("Using client:", client === apiClient ? "main" : "fallback");
    
    const response = await client.post(
      `/orders/api/sla-violations/${violationId}/contact-dealer`,
      contactData
    );
    return response.data;
  } catch (error) {
    console.error("Error contacting dealer about violation:", error);
    throw error;
  }
};

// Resolve SLA violation
export const resolveSLAViolation = async (
  violationId: string, 
  resolutionData: {
    resolution_notes: string;
    resolved_by: string;
  }
): Promise<any> => {
  try {
    console.log("Resolving violation with ID:", violationId);
    console.log("Resolution data:", resolutionData);
    console.log("apiClient available:", !!apiClient);
    console.log("apiClient.put available:", !!apiClient?.put);
    
    // Use fallback client if main client is not available
    const client = apiClient && typeof apiClient.put === 'function' ? apiClient : createFallbackClient();
    console.log("Using client:", client === apiClient ? "main" : "fallback");
    
    const response = await client.put(
      `/orders/api/sla-violations/resolve/${violationId}`,
      resolutionData
    );
    return response.data;
  } catch (error) {
    console.error("Error resolving SLA violation:", error);
    throw error;
  }
};

// Get SLA dealer violation summary
export const getSLADealerViolationSummary = async (
  dealerId: string,
  startDate: string,
  endDate: string
): Promise<any> => {
  try {
    console.log("Fetching dealer summary for:", dealerId);
    console.log("Date range:", startDate, "to", endDate);
    
    // Use fallback client if main client is not available
    const client = apiClient && typeof apiClient.get === 'function' ? apiClient : createFallbackClient();
    
    const response = await client.get(
      `/orders/api/sla-violations/dealer/${dealerId}/summary?startDate=${startDate}&endDate=${endDate}`
    );
    
    console.log("Dealer summary API response:", response.data);
    
    // Handle different response structures
    if (response.data.success) {
      return response.data;
    } else if (response.data.data) {
      // If response has data but no success flag, wrap it
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || "Summary fetched successfully"
      };
    } else {
      // If response structure is different, return as is
      return response.data;
    }
  } catch (error) {
    console.error("Error fetching SLA dealer violation summary:", error);
    
    // Return a fallback response structure
    return {
      success: false,
      data: {
        totalViolations: 0,
        resolvedViolations: 0,
        unresolvedViolations: 0,
        avgResolutionTime: "N/A"
      },
      message: "Failed to fetch dealer summary"
    };
  }
};

// Get enhanced SLA violations with populated data
export const getEnhancedSLAViolations = async (): Promise<any> => {
  try {
    console.log("Fetching enhanced SLA violations...");
    console.log("apiClient available:", !!apiClient);
    
    // Use fallback client if main client is not available
    const client = apiClient && typeof apiClient.get === 'function' ? apiClient : createFallbackClient();
    console.log("Using client:", client === apiClient ? "main" : "fallback");
    
    const response = await client.get(
      `/orders/api/orders/sla/violations/enhanced`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching enhanced SLA violations:", error);
    throw error;
  }
};

// Get SLA violation statistics
export const getSLAViolationStats = async (): Promise<any> => {
  try {
    console.log("Fetching SLA violation statistics...");
    console.log("apiClient available:", !!apiClient);
    
    // Use fallback client if main client is not available
    const client = apiClient && typeof apiClient.get === 'function' ? apiClient : createFallbackClient();
    console.log("Using client:", client === apiClient ? "main" : "fallback");
    
    const response = await client.get(
      `/orders/api/sla-violations/stats/stats`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching SLA violation statistics:", error);
    throw error;
  }
};

// Create manual SLA violation
export const createManualSLAViolation = async (violationData: {
  dealer_id: string;
  order_id: string;
  expected_fulfillment_time: string;
  actual_fulfillment_time: string;
  violation_minutes: number;
  notes: string;
  created_by: string;
  contact_dealer?: boolean;
}): Promise<any> => {
  try {
    console.log("Creating manual SLA violation...");
    console.log("Violation data:", violationData);
    console.log("apiClient available:", !!apiClient);
    
    // Use fallback client if main client is not available
    const client = apiClient && typeof apiClient.post === 'function' ? apiClient : createFallbackClient();
    console.log("Using client:", client === apiClient ? "main" : "fallback");
    
    const response = await client.post(
      `/orders/api/sla-violations/manual`,
      violationData
    );
    return response.data;
  } catch (error) {
    console.error("Error creating manual SLA violation:", error);
    throw error;
  }
};

// Get SLA violations by dealer
export const getSLAViolationsByDealer = async (
  dealerId?: string,
  page: number = 1,
  limit: number = 10,
  filters: any = {}
): Promise<SLAViolationsEnhancedResponse> => {
  try {
    console.log("Fetching SLA violations by dealer...");
    console.log("Dealer ID:", dealerId);
    console.log("Page:", page);
    console.log("Limit:", limit);
    console.log("Filters:", filters);
    console.log("apiClient available:", !!apiClient);
    
    // Get authentication token
    const token = Cookies.get("token") || Cookies.get("authToken") || Cookies.get("jwt") || Cookies.get("accessToken");
    console.log("Auth token available:", !!token);
    
    // Use fallback client if main client is not available
    const client = apiClient && typeof apiClient.get === 'function' ? apiClient : createFallbackClient();
    console.log("Using client:", client === apiClient ? "main" : "fallback");
    
    // Build query parameters
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    // Add filters
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null) {
        params.append(key, filters[key].toString());
      }
    });
    
    // Use the enhanced endpoint with dealer ID in the URL path
    const endpoint = dealerId 
      ? `/orders/api/sla-violations/enhanced/dealer/${dealerId}?${params.toString()}`
      : `/orders/api/sla-violations/enhanced/dealer?${params.toString()}`;
    
    console.log("API Endpoint:", endpoint);
    
    const response = await client.get(endpoint, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });
    
    console.log("SLA violations response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching SLA violations by dealer:", error);
    throw error;
  }
};