import apiClient from "@/apiClient";

export interface BulkUploadSession {
  id: string;
  // Add other relevant fields based on your API response
}

export async function getProductBulkUploadLogs(): Promise<any> {
  try {
    const response = await apiClient.get(`/category/api/product-bulk-session`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch bulk upload logs:", error);
    throw error;
  }
}

export async function getProductBulkUploadLogsById(id: string): Promise<any> {
  try {
    const response = await apiClient.get(`/category/api/product-bulk-session/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch bulk upload log with ID ${id}:`, error);
    throw error;
  }
}

export async function deleteSingleProductBulkUploadLogs(id: string): Promise<any> {
  try {
    const response = await apiClient.delete(`/category/api/product-bulk-session/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to delete bulk upload log with ID ${id}:`, error);
    throw error;
  }
}

export async function deleteAllProductBulkUploadLogs(ids: string[]): Promise<any> {
  try {
    const response = await apiClient.delete(`/category/api/product-bulk-session`, {
      data: ids
    });
    return response.data;
  } catch (error) {
    console.error("Failed to delete bulk upload logs:", error);
    throw error;
  }
}