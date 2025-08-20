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