import apiClient from "@/apiClient";
import { Product, ProductsApiResponse, PermissionCheckResponse } from "@/types/dealer-productTypes";
import { getCookie, getAuthToken } from "@/utils/auth";

const API_PRODUCTS_BASE_URL = "/category/products/v1";
export const getProductsByDealerId = async (dealerId?: string): Promise<Product[]> => {
  try {
    // If dealerId is not provided, try to get it from cookie
    let id = dealerId;
    if (!id) {
      id = getCookie("dealerId");
      if (!id) {
        // Try to extract from token
        const token = getAuthToken();
        if (token) {
          try {
            const payloadBase64 = token.split(".")[1];
            if (payloadBase64) {
              const base64 = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
              const paddedBase64 = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
              const payloadJson = atob(paddedBase64);
              const payload = JSON.parse(payloadJson);
              // Try dealerId, fallback to id
              id = payload.dealerId || payload.id;
            }
          } catch (err) {
            console.error("Failed to decode token for dealerId:", err);
          }
        }
      }
      if (!id) {
        throw new Error("Dealer ID not found in cookie, argument, or token");
      }
    }
    const response = await apiClient.get<ProductsApiResponse>(
      `${API_PRODUCTS_BASE_URL}/get-products-by-dealer/${id}`
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching products by dealer ID:", error);
    throw error;
  }
};


//  check permission for dealer to access product

export const checkDealerProductPermission = async (dealerId: string): Promise<PermissionCheckResponse> => {
  try {
    const response = await apiClient.get<PermissionCheckResponse>(`/users/api/permissionMatrix/check-permission`, {
      params: {
        module: "Products",
        userId: dealerId,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error checking dealer product permission:", error);
    throw error;
  }
};

