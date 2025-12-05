import apiClient from "@/apiClient";
import { ReturnRequestsResponse, SingleReturnResponse, ReturnStatsResponse } from "@/types/return-Types";

export const getReturnRequests = async (params?: {
  refundMethod?: string;
  status?: string;
  dealerId?: string;
  page?: number;
  limit?: number;
}): Promise<ReturnRequestsResponse> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.refundMethod) {
      queryParams.append("refundMethod", params.refundMethod);
    }
    if (params?.status) {
      queryParams.append("status", params.status);
    }
    if (params?.dealerId) {
      queryParams.append("dealerId", params.dealerId);
    }
    if (params?.page) {
      queryParams.append("page", params.page.toString());
    }
    if (params?.limit) {
      queryParams.append("limit", params.limit.toString());
    }
    
    const queryString = queryParams.toString();
    const url = queryString ? `/orders/api/returns?${queryString}` : "/orders/api/returns";
    
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching return requests:", error);
    throw error;
  }
};
export const getReturnRequestsById = async (
  id: string
): Promise<SingleReturnResponse> => {
  try {
    const response = await apiClient.get(`/orders/api/returns/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching return requests:", error);
    throw error;
  }
};

export const validateReturnRequest = async (
  returnId: string,
  payload?: any
): Promise<ReturnRequestsResponse> => {
  try {
    const response = await apiClient.put(
      `/orders/api/returns/validate-return/${returnId}`,
      payload ?? {}
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching return requests:", error);
    throw error;
  }
};


//initiate borzo pickup
export const initiateBorzoPickup = async (returnId: string) : Promise<ReturnRequestsResponse> => {
  try {
    const response = await apiClient.put(
      `/orders/api/returns/Intiate-Borzo-Return/${returnId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error initiating borzo pickup:", error);
    throw error;
  }
}


//start inspection
export const startInspection = async (
  returnId: string,
  data: any,
): Promise<ReturnRequestsResponse> => {
  try {
    const response = await apiClient.put(
      `/orders/api/returns/start-Inspection/${returnId}`,data
    );
    return response.data;
  } catch (error) {
    console.error("Error starting inspection:", error);
    throw error;
  }
}


//complete inspection
export const completeInspection = async (
  returnId: string,
  data: any,
): Promise<ReturnRequestsResponse> => {
  try {
    const response = await apiClient.put(
      `/orders/api/returns/complete-Inspection/${returnId}`,data
    );
    return response.data;
  } catch (error) {
    console.error("Error completing inspection:", error);
    throw error;
  }
};


//initiate refund
export const initiateRefund = async (

  data: any,
): Promise<ReturnRequestsResponse> => {
  try {
    const response = await apiClient.post(
      `/orders/api/refunds/createRefund-online`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error initiating refund:", error);
    throw error;
  }
};

export const schedulePickup = async (
  returnId: string,
  payload: {
    scheduledDate: string;
    pickupAddress: {
      address: string;
      city: string;
      state: string;
      pincode: string;
    };
  }
): Promise<ReturnRequestsResponse> => {
  try {
    const response = await apiClient.put(
      `/orders/api/returns/${returnId}/schedule-pickup`,
      payload
    );
    return response.data;
  } catch (error) {
    console.error("Error scheduling pickup:", error);
    throw error;
  }
};

export const completePickup = async (
  returnId: string,
  payload: {
    trackingNumber: string;
  }
): Promise<ReturnRequestsResponse> => {
  try {
    const response = await apiClient.put(
      `/orders/api/returns/${returnId}/complete-pickup`,
      payload
    );
    return response.data;
  } catch (error: any) {
    throw error;
  }
};
export const inspectReturnRequest = async (
  userId: string,
  payload: {
    staffId: string;
  }
): Promise<ReturnRequestsResponse> => {
  try {
    const response = await apiClient.put(
      `orders/api/returns/${userId}/start-inspection`,
      payload
    );
    return response.data;
  } catch (error: any) {
    throw error;
  }
};
export const startInspectReturnRequest = async (
  userId: string,
 data: any,
): Promise<ReturnRequestsResponse> => {
  try {
    const response = await apiClient.put(
      `/orders/api/returns/${userId}/complete-inspection`,
      data
    );
    return response.data;
  } catch (error: any) {
    throw error;
  }
};
export const refundInitiate = async (
 data: any,
): Promise<ReturnRequestsResponse> => {
  try {
    const response = await apiClient.post(
      `/orders/api/refunds/createRefund-online`,
      data
    );
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const markRefundCompleted = async (
  returnId: string,
  data?: any
): Promise<ReturnRequestsResponse> => {
  try {
    const response = await apiClient.put(
      `/orders/api/returns/${returnId}/mark-refund-completed`,
      data || {}
    );
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const createReturnRequest = async (
  data: any,
): Promise<ReturnRequestsResponse> => {
  try {
    const response = await apiClient.post(`/orders/api/returns/create`, data);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const processManualRefund = async (
  data: any,
): Promise<ReturnRequestsResponse> => {
  try {
    const response = await apiClient.post(
      `/orders/api/refunds/processRefund/manual`,
      data
    );
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const getReturnStats = async (): Promise<ReturnStatsResponse> => {
  try {
    const response = await apiClient.get('/orders/api/returns/return/stats');
    return response.data;
  } catch (error) {
    console.error("Error fetching return stats:", error);
    throw error;
  }
};

