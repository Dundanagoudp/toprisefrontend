import apiClient from "@/apiClient";

// Types for pickup data
export interface PickupRequest {
  _id: string;
  pickupId: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  dealerName: string;
  dealerPhone: string;
  pickupAddress: {
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  scheduledDate: string;
  status:
    | "pending"
    | "scheduled"
    | "in_progress"
    | "packed"
    | "picked_up"
    | "completed"
    | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  items: PickupItem[];
  notes?: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

// New interface for picklist data from API
export interface PicklistData {
  _id: string;
  linkedOrderId: string;
  dealerId: string;
  fulfilmentStaff: string;
  skuList: {
    sku: string;
    quantity: number;
    barcode: string;
    _id: string;
  }[];
  scanStatus: string;
  invoiceGenerated: boolean;
  updatedAt: string;
  createdAt: string;
  __v: number;
  dealerInfo: any;
  staffInfo: any;
  orderInfo: {
    _id: string;
    orderId: string;
    status: string;
    order_Amount: number;
    paymentType: string;
    deliveryCharges: number;
    customerDetails: {
      userId: string;
      name: string;
      phone: string;
      address: string;
      pincode: string;
      email: string;
    };
    skuDetails: any[];
    timestamps: {
      createdAt: string;
    };
    createdAt: string;
    updatedAt: string;
  } | null;
  skuDetails: {
    sku: string;
    quantity: number;
    barcode: string;
    productDetails: any;
    error?: string;
    _id?: string;
  }[];
  totalItems: number;
  uniqueSKUs: number;
  isOverdue: boolean;
  estimatedCompletionTime: number;
  notes?: string;
}

export interface PickupItem {
  _id: string;
  productName: string;
  sku: string;
  quantity: number;
  condition: "new" | "used" | "damaged";
  notes?: string;
}

// API Response types
export interface PickupRequestsResponse {
  success: boolean;
  message: string;
  data: PickupRequest[];
}

export interface PicklistResponse {
  success: boolean;
  message: string;
  data: {
    data: PicklistData[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
    summary: {
      totalPicklists: number;
      completedPicklists: number;
      inProgressPicklists: number;
      notStartedPicklists: number;
      overduePicklists: number;
    };
  };
}

export interface PickupRequestResponse {
  success: boolean;
  message: string;
  data: PickupRequest;
}

// API functions
export const getPickupRequests = async (): Promise<PickupRequestsResponse> => {
  try {
    const response = await apiClient.get(
      "/orders/api/orders/api/pickup/requests"
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching pickup requests:", error);
    throw error;
  }
};

// New function to get all picklists using the new endpoint
export const getAllPicklists = async (): Promise<PicklistResponse> => {
  try {
    console.log("Fetching picklists from API...");
    const response = await apiClient.get("/orders/api/orders/picklists");
    console.log("API Response:", response);
    console.log("Response Data:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching picklists:", error);
    throw error;
  }
};

// end picklist inspection api
export const stopPicklistInspection = async (
  picklistId: string,
  employeeId: string,
  data?: any
): Promise<any> => {
  try {
    const response = await apiClient.patch(`/orders/api/fulfillment/picklist/end-inspection/${picklistId}/${employeeId}`, data );
    return response.data;

  } catch (error) {
    console.error("Error stopping picklist inspection:", error);
    throw error;
  }
};

//get picklist by order id
export const getPicklistById = async (orderId: string): Promise<any> => {
  try {
    const response = await apiClient.get(
      `/orders/api/fulfillment/picklist/by-orderId/${orderId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching picklist by order ID:", error);
    throw error;
  }
};
export const getPickupRequestById = async (
  pickupId: string
): Promise<PickupRequestResponse> => {
  try {
    const response = await apiClient.get(
      `/orders/api/orders/api/pickup/requests/${pickupId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching pickup request:", error);
    throw error;
  }
};

export const updatePickupStatus = async (
  pickupId: string,
  status:
    | "pending"
    | "scheduled"
    | "in_progress"
    | "packed"
    | "picked_up"
    | "completed"
    | "cancelled",
  notes?: string
): Promise<any> => {
  try {
    const response = await apiClient.put(
      `/orders/api/orders/api/pickup/requests/${pickupId}/status`,
      {
        status,
        notes,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating pickup status:", error);
    throw error;
  }
};

export const assignPickupToStaff = async (
  pickupId: string,
  staffId: string
): Promise<any> => {
  try {
    const response = await apiClient.put(
      `/orders/api/orders/api/pickup/requests/${pickupId}/assign`,
      {
        staffId,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error assigning pickup:", error);
    throw error;
  }
};

export const createPickupRequest = async (
  pickupData: Omit<
    PickupRequest,
    "_id" | "pickupId" | "createdAt" | "updatedAt"
  >
): Promise<any> => {
  try {
    const response = await apiClient.post(
      "/orders/api/orders/api/pickup/requests",
      pickupData
    );
    return response.data;
  } catch (error) {
    console.error("Error creating pickup request:", error);
    throw error;
  }
};

export const cancelPickupRequest = async (
  pickupId: string,
  reason?: string
): Promise<any> => {
  try {
    const response = await apiClient.put(
      `/orders/api/orders/api/pickup/requests/${pickupId}/cancel`,
      {
        reason,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error cancelling pickup request:", error);
    throw error;
  }
};

// Filter and search functions
export const getPickupRequestsByStatus = async (
  status: string
): Promise<PickupRequestsResponse> => {
  try {
    const response = await apiClient.get(
      `/orders/api/orders/api/pickup/requests?status=${status}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching pickup requests by status:", error);
    throw error;
  }
};

export const getPickupRequestsByPriority = async (
  priority: string
): Promise<PickupRequestsResponse> => {
  try {
    const response = await apiClient.get(
      `/orders/api/orders/api/pickup/requests?priority=${priority}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching pickup requests by priority:", error);
    throw error;
  }
};

export const searchPickupRequests = async (
  searchTerm: string
): Promise<PickupRequestsResponse> => {
  try {
    const response = await apiClient.get(
      `/orders/api/orders/api/pickup/requests/search?q=${searchTerm}`
    );
    return response.data;
  } catch (error) {
    console.error("Error searching pickup requests:", error);
    throw error;
  }
};

// Statistics functions
export const getPickupStatistics = async (): Promise<any> => {
  try {
    const response = await apiClient.get(
      "/orders/api/orders/api/pickup/statistics"
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching pickup statistics:", error);
    throw error;
  }
};
//start picklist inspection api
export const inspectPicklist = async (
  picklistId: string,
  employeeId: string,
  data?: any
): Promise<any> => {
  try {
    const response = await apiClient.patch(
      `/orders/api/fulfillment/picklist/start-inspection/${picklistId}/${employeeId}`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error inspecting picklist:", error);
    throw error;
  }
};
//get picklist by order id
export const getPicklistByOrderId = async (
  orderId: string,
  employeeId: string
): Promise<any> => {
  try {
    const response = await apiClient.get(
      `/orders/api/fulfillment/picklists/employee/${employeeId}?linkedOrderId=${orderId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching picklist by order ID:", error);
    throw error;
  }
};
// Bulk operations
export const bulkUpdatePickupStatus = async (
  pickupIds: string[],
  status: string,
  notes?: string
): Promise<any> => {
  try {
    const response = await apiClient.put(
      "/orders/api/orders/api/pickup/requests/bulk-status",
      {
        pickupIds,
        status,
        notes,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error bulk updating pickup status:", error);
    throw error;
  }
};

export const bulkAssignPickup = async (
  pickupIds: string[],
  staffId: string
): Promise<any> => {
  try {
    const response = await apiClient.put(
      "/orders/api/orders/api/pickup/requests/bulk-assign",
      {
        pickupIds,
        staffId,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error bulk assigning pickup:", error);
    throw error;
  }
};
