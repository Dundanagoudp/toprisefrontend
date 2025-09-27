import apiClient from "@/apiClient";
import axios from "axios";
import Cookies from "js-cookie";

// Debug: Check if apiClient is properly imported
console.log("SLA Service - apiClient:", apiClient);
console.log("SLA Service - apiClient.post:", apiClient?.post);

// Fallback API client if the main one fails
const createFallbackClient = () => {
  const token = Cookies.get("token") || Cookies.get("authToken") || Cookies.get("jwt") || Cookies.get("accessToken");
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
    // Use fallback client if main client is not available
    const client = apiClient && typeof apiClient.get === 'function' ? apiClient : createFallbackClient();
    
    const response = await client.get(
      `/orders/api/sla-violations/dealer/${dealerId}/summary?startDate=${startDate}&endDate=${endDate}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching SLA dealer violation summary:", error);
    throw error;
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
      `/orders/api/sla-violations/stats`
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