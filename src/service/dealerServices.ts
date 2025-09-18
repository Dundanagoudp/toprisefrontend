import apiClient from "@/apiClient"
import type { Dealer, CreateDealerRequest, ApiResponse, User, Category } from "@/types/dealer-types"
import { SlaTypesResponse } from "@/types/sla-types"
import { getAuthToken, getCookie } from "@/utils/auth"

// Create a dealer
export async function createDealer(data: CreateDealerRequest): Promise<ApiResponse<Dealer>> {
  try {
    const response = await apiClient.post("/users/api/users/dealer", data)
    return response.data
  } catch (error) {
    console.error("Failed to create dealer:", error)
    throw error
  }
}

// Get all dealers
export async function getAllDealers(): Promise<ApiResponse<Dealer[]>> {
  try {
    const response = await apiClient.get("/users/api/users/dealers")
    return response.data
  } catch (error) {
    console.error("Failed to fetch dealers:", error)
    throw error
  }
}

// Get dealer by id
export async function getDealerById(id: string): Promise<ApiResponse<Dealer>> {
  try {
    const response = await apiClient.get(`/users/api/users/dealer/${id}`)
    return response.data
  } catch (error) {
    console.error(`Failed to fetch dealer with id ${id}:`, error)
    throw error
  }
}

// Update dealer by id
export async function updateDealerById(id: string, data: Partial<CreateDealerRequest>): Promise<ApiResponse<Dealer>> {
  try {
    const response = await apiClient.put(`/users/api/users/dealer/${id}`, data)
    return response.data
  } catch (error) {
    console.error(`Failed to update dealer with id ${id}:`, error)
    throw error
  }
}

// Get all users for assignment
export async function getAllUsers(): Promise<ApiResponse<User[]>> {
  try {
    const response = await apiClient.get("/users/api/users")
    return response.data
  } catch (error) {
    console.error("Failed to fetch users:", error)
    throw error
  }
}

// get all categories
export async function getAllCategories(): Promise<ApiResponse<Category[]>> {
  try {
    const response = await apiClient.get("/category/api/category")
    return response.data
  } catch (error) {
    console.error("Failed to fetch categories:", error)
    throw error
  }
}

export async function uploadDealerBulk(  data: FormData): Promise<ApiResponse<Dealer>> {
  try {
    const response = await apiClient.post("/users/api/users/dealers/bulk", data)
    return response.data
  } catch (error) {
    console.error("Failed to upload dealer:", error)
    throw error
  }
}

export async function getAllCSlaTypes(): Promise<SlaTypesResponse> {
  try {
    const response = await apiClient.get("/orders/api/orders/sla/types")
    return response.data
  } catch (error) {
    console.error("Failed to fetch SLA types:", error)
    throw error
  }
}

// Get dealers by category ID
export async function getDealersByCategory(categoryId: string): Promise<ApiResponse<Dealer[]>> {
  try {
    const response = await apiClient.get(`/users/api/users/get/dealerByCategoryName/${categoryId}`)
    console.log("[getDealersByCategory] Full response:", response);
    console.log("[getDealersByCategory] Response data:", response.data);

    // Handle the actual API response structure
    const responseData = response.data;
    
    // The API returns: { success: true, message: "...", data: { dealers: [...], ... } }
    if (responseData && responseData.success && responseData.data && Array.isArray(responseData.data.dealers)) {
      console.log("[getDealersByCategory] Found dealers array:", responseData.data.dealers);
      return {
        success: responseData.success,
        message: responseData.message,
        data: responseData.data.dealers
      };
    }
    
    // Fallback: if response.data is the array directly
    if (Array.isArray(responseData)) {
      console.log("[getDealersByCategory] Response data is array directly:", responseData);
      return {
        success: true,
        message: "Dealers fetched successfully",
        data: responseData
      };
    }
    
    // If response.data has a data property that's an array
    if (responseData && responseData.data && Array.isArray(responseData.data)) {
      console.log("[getDealersByCategory] Response data.data is array:", responseData.data);
      return {
        success: responseData.success || true,
        message: responseData.message || "Dealers fetched successfully",
        data: responseData.data
      };
    }
    
    // If no dealers found or unexpected structure
    console.warn("[getDealersByCategory] No dealers found or unexpected structure:", responseData);
    return {
      success: responseData?.success || false,
      message: responseData?.message || "No dealers found",
      data: []
    };

  } catch (error) {
    console.error("Failed to fetch dealers by category:", error)
    throw error
  }
}

export async function setSlaType(dealerId: string, data: any): Promise<SlaTypesResponse> {
  try {
    const response = await apiClient.post(`/orders/api/orders/dealers/${dealerId}/sla`, data)
    return response.data
  } catch (error) {
    console.error("Failed to upload dealer:", error)
    throw error
  }
}

// Get dealer statistics (alternative approach)
export async function getDealerStats(): Promise<any> {
  try {
    // Try to get dealer stats from a different endpoint that doesn't require dealer model in user service
    const response = await apiClient.get(`/users/api/users/stats/dealer-counts`)
    return response.data
  } catch (error) {
    console.error("Failed to fetch dealer stats:", error)
    
    // Return fallback data if the endpoint doesn't exist
    return {
      success: true,
      message: "Fallback dealer stats",
      data: {
        totalDealers: 0,
        activeDealers: 0,
        deactivatedDealers: 0,
        dealersWithUploadAccess: 0,
        dealersWithAssignedEmployees: 0,
        avgCategoriesPerDealer: 0
      }
    }
  }
}

// patch disble dealer 

export async function disableDealer(dealerId: string): Promise<ApiResponse<Dealer>> {
  try {
    const response = await apiClient.patch(`/users/api/users/disable-dealer/${dealerId}`)
    return response.data
  } catch (error) {
    console.error(`Failed to disable dealer with id ${dealerId}:`, error)
    throw error
  }
}

export async function enableDealer(dealerId: string): Promise<ApiResponse<Dealer>> {
  try {
    const response = await apiClient.patch(`/users/api/users/enable-dealer/${dealerId}`)
    return response.data
  } catch (error) {
    console.error(`Failed to enable dealer with id ${dealerId}:`, error)
    throw error
  }
}

// Add allowed categories for dealer
export async function addAllowedCategories(dealerId: string, categories: string[]): Promise<ApiResponse<any>> {
  try {
    const response = await apiClient.patch(`/users/api/users/updateDealer/addAllowedCategores/${dealerId}`, {
      categories
    })
    return response.data
  } catch (error) {
    console.error(`Failed to add allowed categories for dealer ${dealerId}:`, error)
    throw error
  }
}

// Remove allowed categories for dealer
export async function removeAllowedCategories(dealerId: string, categories: string[]): Promise<ApiResponse<any>> {
  try {
    const response = await apiClient.patch(`/users/api/users/updateDealer/removeAllowedCategores/${dealerId}`, {
      categories
    })
    return response.data
  } catch (error) {
    console.error(`Failed to remove allowed categories for dealer ${dealerId}:`, error)
    throw error
  }
}

// Assign employees to a dealer
export async function assignEmployeesToDealer(
  dealerId: string,
  payload: { employeeIds: string[]; assignmentNotes?: string; region?: string }
): Promise<ApiResponse<any>> {
  try {
    console.log("[assignEmployeesToDealer] dealerId:", dealerId)
    console.log("[assignEmployeesToDealer] payload:", payload)
    const response = await apiClient.post(
      `/users/api/users/dealers/${dealerId}/assign-employees`,
      payload
    )
    console.log("[assignEmployeesToDealer] response:", response?.data)
    return response.data
  } catch (error) {
    console.error(`Failed to assign employees to dealer ${dealerId}:`, error)
    throw error
  }
}

// Remove employees from a dealer
export async function removeEmployeesFromDealer(
  dealerId: string,
  payload: { employeeIds: string[]; assignmentNotes?: string }
): Promise<ApiResponse<any>> {
  try {
    const response = await apiClient.delete(
      `/users/api/users/dealers/${dealerId}/remove-employees`,
      { data: payload }
    )
    return response.data
  } catch (error) {
    console.error(`Failed to remove employees from dealer ${dealerId}:`, error)
    throw error
  }
}

// Get employees assigned to a specific dealer
export async function getAssignedEmployeesForDealer(
  dealerId: string
): Promise<ApiResponse<any>> {
  try {
    const response = await apiClient.get(
      `/users/api/users/dealers/${dealerId}/assigned-employees`
    )
    return response.data
  } catch (error) {
    console.error(
      `Failed to fetch assigned employees for dealer ${dealerId}:`,
      error
    )
    throw error
  }
}

// Get dealer ID from user ID using the internal endpoint
export async function getDealerIdFromUserId(userId?: string): Promise<string> {
  try {
    let id = userId;
    
    // If userId is not provided, get it from token
    if (!id) {
      const token = getAuthToken();
      if (token) {
        try {
          const payloadBase64 = token.split(".")[1];
          if (payloadBase64) {
            const base64 = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
            const paddedBase64 = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
            const payloadJson = atob(paddedBase64);
            const payload = JSON.parse(payloadJson);
            id = payload.id || payload.userId;
          }
        } catch (err) {
          console.error("Failed to decode token for userId:", err);
        }
      }
    }
    
    if (!id) {
      throw new Error("User ID not found in token or parameter");
    }
    
    console.log(`[getDealerIdFromUserId] Getting dealer ID for user ID: ${id}`);
    
    const response = await apiClient.get(`/users/api/users/internal/dealers/user/${id}`);
    
    if (response.data && response.data.success && response.data.data) {
      let dealerId;
      
      // Handle both array and object response structures
      if (Array.isArray(response.data.data) && response.data.data.length > 0) {
        // Array structure: get the first dealer's _id
        dealerId = response.data.data[0]._id;
      } else if (response.data.data._id) {
        // Object structure: get the _id directly
        dealerId = response.data.data._id;
      } else {
        throw new Error("No dealer ID found in response");
      }
      
      console.log(`[getDealerIdFromUserId] Successfully got dealer ID: ${dealerId}`);
      return dealerId;
    } else {
      throw new Error("Invalid response from dealer ID endpoint or no dealers found");
    }
  } catch (error) {
    console.error("Error getting dealer ID from user ID:", error);
    throw error;
  }
}

// Get dealer profile details by dealer ID
export async function getDealerProfileDetails(dealerId?: string): Promise<Dealer> {
  try {
    let id = dealerId;
    
    // If dealerId is not provided, get it from dealer services using user ID
    if (!id) {
      try {
        console.log(`[getDealerProfileDetails] Getting dealer ID from dealer services using user ID`);
        id = await getDealerIdFromUserId();
        console.log(`[getDealerProfileDetails] Successfully got dealer ID from dealer services: ${id}`);
      } catch (dealerServiceError) {
        console.log(`[getDealerProfileDetails] Failed to get dealer ID from dealer services, trying fallback methods`);
        
        // Fallback: try to get from cookie
        id = getCookie("dealerId");
        if (!id) {
          // Fallback: try to extract from token
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
      }
      
      if (!id) {
        throw new Error("Dealer ID not found in dealer services, cookie, or token");
      }
    }
    
    console.log(`[getDealerProfileDetails] Fetching dealer profile for dealer ID: ${id}`);
    
    // Get token for debugging
    const token = getAuthToken();
    console.log(`[getDealerProfileDetails] Auth token available:`, !!token);
    if (token) {
      console.log(`[getDealerProfileDetails] Token length:`, token.length);
    }
    
    const response = await apiClient.get(`/users/api/users/dealer/${id}`);
    
    if (response.data && response.data.success && response.data.data) {
      console.log(`[getDealerProfileDetails] Successfully fetched dealer profile for dealer ID: ${id}`);
      return response.data.data;
    } else {
      throw new Error("Invalid response from dealer profile endpoint");
    }
  } catch (error) {
    console.error("Error fetching dealer profile details:", error);
    throw error;
  }
}