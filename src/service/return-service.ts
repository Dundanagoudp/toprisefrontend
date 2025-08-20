import apiClient from "@/apiClient";
import { ReturnRequestsResponse } from "@/types/return-Types";




export const getReturnRequests = async (): Promise<ReturnRequestsResponse> => {
   try {
    const response = await apiClient.get("/orders/api/returns");
    return response.data;
   } catch (error) {
    console.error("Error fetching return requests:", error);
    throw error;
   }

}
export const getReturnRequestsById = async (id: string): Promise<ReturnRequestsResponse> => {
   try {
    const response = await apiClient.get(`/orders/api/returns/${id}`);
    return response.data;
   } catch (error) {
    console.error("Error fetching return requests:", error);
    throw error;
   }

}

export const validateReturnRequest = async (returnId: string): Promise<ReturnRequestsResponse> => {
    try {
     const response = await apiClient.put(`/orders/api/returns/${returnId}/validate`);
     return response.data;
    } catch (error) {
     console.error("Error fetching return requests:", error);
     throw error;
    }
 
 }
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
    const response = await apiClient.put(`/orders/api/returns/${returnId}/schedule-pickup`, payload);
    return response.data;
  } catch (error) {
    console.error("Error scheduling pickup:", error);
    throw error;
  }
}

export const completePickup = async (
  returnId: string,
  payload: {
    trackingNumber: string;
  }
): Promise<ReturnRequestsResponse> => {
  try {
    const response = await apiClient.put(`/orders/api/returns/${returnId}/complete-pickup`, payload);
    return response.data;
  } catch (error: any) {
    throw error;
  }
}