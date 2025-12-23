import apiClient from "@/apiClient";
import { getAuthToken } from "@/utils/auth";

// Types for dealer dashboard data
export interface DealerDashboardStats {
  products: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
    created: number;
  };
  orders: {
    total: number;
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
    totalRevenue: number;
    avgOrderValue: number;
  };
  categories: {
    assigned: number;
    active: number;
    totalProducts: number;
  };
  performance: {
    slaCompliance: number;
    avgResponseTime: number;
    customerRating: number;
    fulfillmentRate: number;
  };
}

export interface DealerOrderKPI {
  period: string;
  orders: {
    total: number;
    new: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
    growth: number;
  };
  revenue: {
    total: number;
    average: number;
    growth: number;
  };
  performance: {
    slaCompliance: number;
    avgFulfillmentTime: number;
    customerSatisfaction: number;
  };
}

export interface DealerAssignedCategory {
  _id: string;
  category_name: string;
  category_code: string;
  category_image?: string;
  category_Status: string;
  product_count: number;
  assigned_date: string;
  is_active: boolean;
}

export interface DealerOrder {
  _id: string;
  orderId: string;
  status: string;
  totalAmount: number;
  orderDate: string;
  customerDetails: any;
  dealerMapping: any[];
}

export interface DealerOrdersResponse {
  orders: DealerOrder[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface DealerDashboardResponse {
  success: boolean;
  message: string;
  data: {
    stats: DealerDashboardStats;
    orderKPIs: DealerOrderKPI[];
    assignedCategories: DealerAssignedCategory[];
  };
}

// Product stats by dealer response interface
export interface ProductStatsByDealerResponse {
  success: boolean;
  message: string;
  data: {
    totalProducts: number;
    totaApprovedProducts: number; // Note: API has typo "tota" instead of "total"
    totalPendingProducts: number;
    totalRejectedProducts: number;
  };
}

// Dealer revenue response interface
export interface DealerRevenueResponse {
  success: boolean;
  message: string;
  data: {
    dealerId: string;
    totalRevenue: number;
    totalOrders: number;
    orders: Array<{
      orderId: string;
      mongoOrderId: string;
      revenue: number;
    }>;
  };
}

// Dealer by user ID response interface
export interface DealerByUserIdResponse {
  message: string;
  dealer: {
    _id: string;
    user_id: string;
    dealerId: string;
    legal_name: string;
    trade_name: string;
    GSTIN: string;
    Pan: string;
    is_active: boolean;
    categories_allowed: string[];
    brands_allowed: string[];
    upload_access_enabled: boolean;
    default_margin: number;
    last_fulfillment_date: string;
    assigned_Toprise_employee: Array<{
      assigned_user: string;
      status: string;
      _id: string;
      assigned_at: string;
    }>;
    SLA_type: string;
    SLA_max_dispatch_time: number;
    onboarding_date: string;
    remarks: string;
    created_at: string;
    updated_at: string;
    __v: number;
    is_permissios_set: boolean;
    Address?: {
      street: string;
      city: string;
      pincode: string;
      state: string;
    };
    contact_person?: {
      name: string;
      email: string;
      phone_number: string;
    };
    permission?: any;
  };
}

// New interface for dealer list response
export interface DealerListResponse {
  success: boolean;
  message: string;
  data: {
    dealerList: Array<{
      dealerId: string;
      dealerIdString: string;
      legal_name: string;
      is_active: boolean;
    }>;
    totalDealers: number;
  };
}

// New interfaces for dealer profile information
export interface DealerAddress {
  street: string;
  city: string;
  pincode: string;
  state: string;
}

export interface DealerContactPerson {
  name: string;
  email: string;
  phone_number: string;
}

export interface DealerUserInfo {
  _id: string;
  email: string;
  phone_Number: string;
  role: string;
}

export interface DealerAssignedEmployee {
  assigned_user: string;
  status: string;
  _id: string;
  assigned_at: string;
}

export interface DealerProfileData {
  Address: DealerAddress;
  contact_person: DealerContactPerson;
  _id: string;
  user_id: DealerUserInfo;
  dealerId: string;
  legal_name: string;
  trade_name: string;
  GSTIN: string;
  Pan: string;
  is_active: boolean;
  categories_allowed: string[];
  upload_access_enabled: boolean;
  default_margin: number;
  last_fulfillment_date: string;
  assigned_Toprise_employee: DealerAssignedEmployee[];
  SLA_type: string;
  SLA_max_dispatch_time: number;
  onboarding_date: string;
  remarks: string;
  created_at: string;
  updated_at: string;
  __v: number;
}

export interface DealerProfileResponse {
  success: boolean;
  message: string;
  data: DealerProfileData;
}

// Helper function to extract user ID from token
const getUserIdFromToken = (): string => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const payloadBase64 = token.split(".")[1];
    if (!payloadBase64) {
      throw new Error("Invalid token format");
    }

    const base64 = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
    const paddedBase64 = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "="
    );
    const payloadJson = atob(paddedBase64);
    const payload = JSON.parse(payloadJson);

    const userId = payload.userId || payload.id;
    if (!userId) {
      throw new Error("User ID not found in token");
    }

    return userId;
  } catch (error) {
    console.error("Failed to extract user ID from token:", error);
    throw new Error("Failed to extract user ID from token");
  }
};

// Helper function to get dealer IDs from user ID
const getDealerIdsFromUserId = async (userId: string): Promise<string[]> => {
  try {
    const response = await apiClient.get(
      `/users/api/users/user/${userId}/all-dealer-ids`
    );
    const data: DealerListResponse = response.data;

    if (data.success && data.data.dealerList.length > 0) {
      // Return active dealer IDs (using the dealerId field from the response)
      return data.data.dealerList
        .filter((dealer) => dealer.is_active)
        .map((dealer) => dealer.dealerId);
    }

    throw new Error("No active dealer IDs found for user");
  } catch (error) {
    console.error("Failed to fetch dealer IDs from user ID:", error);
    throw new Error("Failed to fetch dealer IDs from user ID");
  }
};

// Helper function to get dealer ID (either directly from token or via user ID)
export const getDealerId = async (): Promise<string> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const payloadBase64 = token.split(".")[1];
    if (!payloadBase64) {
      throw new Error("Invalid token format");
    }

    const base64 = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
    const paddedBase64 = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "="
    );
    const payloadJson = atob(paddedBase64);
    const payload = JSON.parse(payloadJson);

    // First, try to get dealer ID directly from token
    const directDealerId = payload.dealerId;
    if (directDealerId) {
      return directDealerId;
    }

    // If no direct dealer ID, get it via user ID
    const userId = payload.userId || payload.id;
    if (!userId) {
      throw new Error("Neither dealer ID nor user ID found in token");
    }

    const dealerIds = await getDealerIdsFromUserId(userId);
    if (dealerIds.length === 0) {
      throw new Error("No dealer IDs found for user");
    }

    // For now, return the first dealer ID. In the future, you might want to handle multiple dealers
    return dealerIds[0];
  } catch (error) {
    console.error("Failed to get dealer ID:", error);
    throw new Error("Failed to get dealer ID");
  }
};

// Helper function to get all dealer IDs for a user (for multi-dealer scenarios)
const getAllDealerIds = async (): Promise<string[]> => {
  const userId = getUserIdFromToken();
  return await getDealerIdsFromUserId(userId);
};

// Mock data for development/testing
const getMockDealerDashboardData = (): DealerDashboardResponse => {
  return {
    success: true,
    message: "Mock data loaded successfully",
    data: {
      stats: {
        products: {
          total: 156,
          approved: 89,
          pending: 34,
          rejected: 12,
          created: 21,
        },
        orders: {
          total: 234,
          pending: 45,
          processing: 67,
          shipped: 89,
          delivered: 123,
          cancelled: 10,
          totalRevenue: 1250000,
          avgOrderValue: 5341,
        },
        categories: {
          assigned: 8,
          active: 7,
          totalProducts: 156,
        },
        performance: {
          slaCompliance: 94.5,
          avgResponseTime: 2.3,
          customerRating: 4.7,
          fulfillmentRate: 96.2,
        },
      },
      orderKPIs: [
        {
          period: "This Week",
          orders: {
            total: 45,
            new: 12,
            processing: 18,
            shipped: 10,
            delivered: 5,
            cancelled: 0,
            growth: 12.5,
          },
          revenue: {
            total: 240000,
            average: 5333,
            growth: 12.5,
          },
          performance: {
            slaCompliance: 96.8,
            avgFulfillmentTime: 1.8,
            customerSatisfaction: 4.8,
          },
        },
        {
          period: "Last Week",
          orders: {
            total: 38,
            new: 10,
            processing: 15,
            shipped: 8,
            delivered: 5,
            cancelled: 0,
            growth: 8.2,
          },
          revenue: {
            total: 198000,
            average: 5210,
            growth: 8.2,
          },
          performance: {
            slaCompliance: 94.2,
            avgFulfillmentTime: 2.1,
            customerSatisfaction: 4.6,
          },
        },
      ],
      assignedCategories: [
        {
          _id: "1",
          category_name: "Engine Parts",
          category_code: "ENG001",
          category_image:
            "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop",
          category_Status: "Active",
          product_count: 45,
          assigned_date: "2024-01-15T00:00:00.000Z",
          is_active: true,
        },
        {
          _id: "2",
          category_name: "Brake Systems",
          category_code: "BRK002",
          category_image:
            "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop",
          category_Status: "Active",
          product_count: 32,
          assigned_date: "2024-01-20T00:00:00.000Z",
          is_active: true,
        },
        {
          _id: "3",
          category_name: "Electrical Components",
          category_code: "ELC003",
          category_image:
            "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop",
          category_Status: "Active",
          product_count: 28,
          assigned_date: "2024-02-01T00:00:00.000Z",
          is_active: true,
        },
        {
          _id: "4",
          category_name: "Suspension Parts",
          category_code: "SUS004",
          category_image:
            "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop",
          category_Status: "Active",
          product_count: 23,
          assigned_date: "2024-02-10T00:00:00.000Z",
          is_active: true,
        },
        {
          _id: "5",
          category_name: "Cooling Systems",
          category_code: "CLD005",
          category_image:
            "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop",
          category_Status: "Active",
          product_count: 18,
          assigned_date: "2024-02-15T00:00:00.000Z",
          is_active: true,
        },
        {
          _id: "6",
          category_name: "Fuel Systems",
          category_code: "FUL006",
          category_image:
            "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop",
          category_Status: "Active",
          product_count: 15,
          assigned_date: "2024-02-20T00:00:00.000Z",
          is_active: true,
        },
        {
          _id: "7",
          category_name: "Transmission Parts",
          category_code: "TRN007",
          category_image:
            "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop",
          category_Status: "Active",
          product_count: 12,
          assigned_date: "2024-03-01T00:00:00.000Z",
          is_active: true,
        },
        {
          _id: "8",
          category_name: "Exhaust Systems",
          category_code: "EXH008",
          category_image:
            "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop",
          category_Status: "Inactive",
          product_count: 8,
          assigned_date: "2024-03-05T00:00:00.000Z",
          is_active: false,
        },
      ],
    },
  };
};

// Mock data for dealer profile
const getMockDealerProfileData = (): DealerProfileData => {
  return {
    Address: {
      street: "C 1304 APEX ATHEN",
      city: "BANGALORE",
      pincode: "201304",
      state: "UTTAR PRADESH"
    },
    contact_person: {
      name: "fulfillment-admin",
      email: "uttam123TEST123@mail.com",
      phone_number: "7563333557"
    },
    _id: "68b19889472ab653051bd008",
    user_id: {
      _id: "68b19889472ab653051bd006",
      email: "dealer123456@gmail.com",
      phone_Number: "9845631022",
      role: "Dealer"
    },
    dealerId: "938ec18e-4dfc-40bc-abcf-f42e053b847f",
    legal_name: "RAJAT FIRM PVT. LTD.",
    trade_name: "RAJAT SAXENA",
    GSTIN: "445698441212234",
    Pan: "SDSDSDSDS2",
    is_active: true,
    categories_allowed: [
      "68622ecb7032551f8670f466",
      "68677cf54ee58b7371ca463d",
      "6867aca8c14089e24f262fdf"
    ],
    upload_access_enabled: true,
    default_margin: 9,
    last_fulfillment_date: "2025-08-29T11:59:42.632Z",
    assigned_Toprise_employee: [
      {
        assigned_user: "689aed811b0952bc50f4d873",
        status: "Active",
        _id: "68b19889472ab653051bd009",
        assigned_at: "2025-08-29T12:09:45.430Z"
      }
    ],
    SLA_type: "Priority",
    SLA_max_dispatch_time: 0,
    onboarding_date: "2025-08-29T00:00:00.000Z",
    remarks: "xcxc",
    created_at: "2025-08-29T12:09:45.430Z",
    updated_at: "2025-08-29T12:09:45.430Z",
    __v: 0
  };
};

// Get dealer dashboard stats - using dealer ID from user ID
export const getDealerDashboardStats =
  async (): Promise<DealerDashboardStats> => {
    try {
      const dealerId = await getDealerId();
      const response = await apiClient.get(
        `users/api/users/dealer/${dealerId}/dashboard-stats`
      );
      return response.data.data.stats;
    } catch (error) {
      console.error("Failed to fetch dealer dashboard stats:", error);
      // Return fallback data
      return getMockDealerDashboardData().data.stats;
    }
  };

// Get dealer order KPIs - using dealer ID from user ID
export const getDealerOrderKPIs = async (
  period: string = "week"
): Promise<DealerOrderKPI[]> => {
  try {
    const dealerId = await getDealerId();
    const response = await apiClient.get(`/orders/dealer/${dealerId}/kpis`, {
      params: { period },
    });
    return response.data.data.orderKPIs;
  } catch (error) {
    console.error("Failed to fetch dealer order KPIs:", error);
    // Return fallback data
    return getMockDealerDashboardData().data.orderKPIs;
  }
};

// Get dealer assigned categories - using dealer ID from user ID
export const getDealerAssignedCategories = async (): Promise<
  DealerAssignedCategory[]
> => {
  try {
    const dealerId = await getDealerId();
    const response = await apiClient.get(
      `users/api/users/dealer/${dealerId}/assigned-categories`
    );
    return response.data.data.assignedCategories;
  } catch (error) {
    console.error("Failed to fetch dealer assigned categories:", error);
    // Return fallback data
    return getMockDealerDashboardData().data.assignedCategories;
  }
};

// Get dealer orders with pagination and filtering - using dealer ID from user ID
export const getDealerOrders = async (params?: {
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}): Promise<DealerOrdersResponse> => {
  try {
    const dealerId = await getDealerId();
    const response = await apiClient.get(`/orders/dealer/${dealerId}/orders`, {
      params: {
        page: 1,
        limit: 10,
        ...params,
      },
    });
    return response.data.data;
  } catch (error) {
    console.error("Failed to fetch dealer orders:", error);
    // Return fallback data
    return {
      orders: [],
      pagination: {
        total: 0,
        page: 1,
        limit: 10,
        pages: 0,
      },
    };
  }
};

// Get complete dealer dashboard data - using dealer ID from user ID
export const getDealerDashboardData =
  async (): Promise<DealerDashboardResponse> => {
    try {
      const dealerId = await getDealerId();
      const response = await apiClient.get(
        `users/api/users/dealer/${dealerId}/dashboard`
      );
      return response.data;
    } catch (error) {
      console.error("Failed to fetch dealer dashboard data:", error);
      console.log("Using mock data as fallback");
      // Return mock data for development/testing
      return getMockDealerDashboardData();
    }
  };

// Get all dealer IDs for a user (useful for multi-dealer scenarios)
export const getUserDealerIds = async (): Promise<string[]> => {
  try {
    return await getAllDealerIds();
  } catch (error) {
    console.error("Failed to get user dealer IDs:", error);
    throw error;
  }
};

// Get dealer products using dealer ID from user ID
export const getDealerProducts = async (params?: {
  status?: string;
  category?: string;
  page?: number;
  limit?: number;
}): Promise<any> => {
  try {
    const dealerId = await getDealerId();
    console.log("Fetching products for dealer ID:", dealerId);
    
    // Use the correct endpoint with the dealer ID from the all-dealer-ids response
    const response = await apiClient.get(`/category/products/v1/get-products-by-dealer/${dealerId}`, {
      params: {
        page: 1,
        limit: 10,
        ...params,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch dealer products:", error);
    throw error;
  }
};

// Get dealer products by category using dealer ID from user ID
export const getDealerProductsByCategory = async (
  categoryId: string,
  params?: {
    status?: string;
    page?: number;
    limit?: number;
  }
): Promise<any> => {
  try {
    const dealerId = await getDealerId();
    console.log("Fetching products by category for dealer ID:", dealerId);
    
    const response = await apiClient.get(
      `/products/dealer/${dealerId}/category/${categoryId}/products`,
      {
        params: {
          page: 1,
          limit: 10,
          ...params,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch dealer products by category:", error);
    throw error;
  }
};

// Get dealer profile information - using dealer ID from user ID
export const getDealerProfile = async (): Promise<DealerProfileData> => {
  try {
    const dealerId = await getDealerId();
    const response = await apiClient.get(
      `users/api/users/dealer/${dealerId}`
    );
    return response.data.data;
  } catch (error) {
    console.error("Failed to fetch dealer profile:", error);
    console.log("Using mock profile data as fallback");
    // Return mock data for development/testing
    return getMockDealerProfileData();
  }
};

// Get dealer profile by specific dealer ID (for admin or multi-dealer scenarios)
export const getDealerProfileById = async (dealerId: string): Promise<DealerProfileData> => {
  try {
    const response = await apiClient.get(
      `users/api/users/dealer/${dealerId}`
    );
    return response.data.data;
  } catch (error) {
    console.error("Failed to fetch dealer profile by ID:", error);
    throw error;
  }
};

// Get product stats by dealer ID
export const getProductStatsByDealer = async (dealerId: string): Promise<ProductStatsByDealerResponse | null> => {
  try {
    const response = await apiClient.get<ProductStatsByDealerResponse>(
      `/category/products/v1/get/product/stats/by-dealer/${dealerId}`
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch product stats by dealer:", error);
    // Return null instead of throwing to prevent breaking the dashboard
    return null;
  }
};

// Get dealer revenue by dealer ID
export const getDealerRevenue = async (dealerId: string): Promise<DealerRevenueResponse | null> => {
  try {
    const response = await apiClient.get<DealerRevenueResponse>(
      `/orders/api/orders/dealer/${dealerId}/revenue`
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch dealer revenue:", error);
    // Return null instead of throwing to prevent breaking the dashboard
    return null;
  }
};

// Get dealer by user ID
export const getDealerByUserId = async (userId: string): Promise<DealerByUserIdResponse | null> => {
  try {
    const response = await apiClient.get<DealerByUserIdResponse>(
      `/users/api/users/get/dealer/byUserld/${userId}`
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch dealer by user ID:", error);
    // Return null instead of throwing to prevent breaking the dashboard
    return null;
  }
};
