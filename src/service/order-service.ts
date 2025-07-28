import { orderResponse } from "@/types/order-Types";
import apiClient from "@/apiClient";



export async function getOrders(): Promise<orderResponse> {
  try {
    const response = await apiClient.get(`/orders/api/orders/all`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    throw error;
  }
}
