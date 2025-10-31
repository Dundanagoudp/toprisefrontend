import { orderResponse, PicklistResponse, AssignDealersRequest, CreatePicklistRequest, AssignPicklistRequest, UpdateOrderStatusByDealerRequest } from "@/types/order-Types";
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

export async function getOrderById(id: string): Promise<orderResponse> {
  try {
    const response = await apiClient.get(`/orders/api/orders/id/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch order with id ${id}:`, error);
    throw error;
  }
}

// Get order statistics
export async function getOrderStats(): Promise<{
  success: boolean;
  data: {
    totalOrders: number;
    statusCounts: {
      Confirmed: number;
      Assigned: number;
      Shipped: number;
      Delivered: number;
      Cancelled: number;
      Returned: number;
    };
    todaysOrders: number;
    todaysStatusCounts: {
      Confirmed: number;
      Assigned: number;
      Shipped: number;
      Delivered: number;
      Cancelled: number;
      Returned: number;
    };
    dateRange: {
      startDate: string;
      endDate: string;
    };
  };
}> {
  try {
    const response = await apiClient.get(`/orders/api/orders/stats`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch order statistics:", error);
    throw error;
  }
}

// Assign dealers to SKUs
export async function assignDealersToOrder(payload: AssignDealersRequest): Promise<{ success: boolean; message: string }> {
  try {
    const response = await apiClient.post(`/orders/api/orders/assign-dealers`, payload);
    return response.data;
  } catch (error) {
    console.error("Failed to assign dealers:", error);
    throw error;
  }
}

// Fetch all picklists
export async function fetchPicklists(): Promise<PicklistResponse> {
  try {
    // Disable credentials for this GET to avoid CORS '*' with credentials
    const response = await apiClient.get(`/orders/api/orders/picklists`, { withCredentials: false });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch picklists:", error);
    throw error;
  }
}

// Fetch picklists assigned to a specific fulfillment staff (employee)
export async function fetchPicklistsByEmployee(employeeId: string): Promise<{
  success: boolean;
  message: string;
  data: {
    data: any[];
    pagination?: any;
    staffInfo?: any;
    summary?: any;
  };
}> {
  try {
    console.log(`[fetchPicklistsByEmployee] Employee ID: ${employeeId}`);
    const url = `/orders/api/orders/picklists/employee/${employeeId}`;
    console.log(`[fetchPicklistsByEmployee] GET ${url}`);
    const response = await apiClient.get(url);
    try {
      const count = Array.isArray(response?.data?.data?.data) ? response.data.data.data.length : 0;
      console.log(`[fetchPicklistsByEmployee] Response success=${response?.data?.success} message="${response?.data?.message}" count=${count}`);
    } catch {}
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch picklists for employee ${employeeId}:`, error);
    throw error;
  }
}

// Fetch picklist statistics for a specific fulfillment staff
export async function fetchStaffPicklistStats(staffId: string): Promise<{
  success: boolean;
  message: string;
  data: {
    data: Array<{
      staffId: string;
      staffInfo: any;
      totalPicklists: number;
      completed: number;
      inProgress: number;
      notStarted: number;
      lastUpdated: string;
    }>;
    pagination: any;
    summary: { totalPicklists: number; distinctStaff: number };
    filters: any;
  };
}> {
  try {
    const url = `/orders/api/orders/picklists/stats/staff?staffId=${encodeURIComponent(staffId)}`;
    console.log(`[fetchStaffPicklistStats] GET ${url}`);
    const response = await apiClient.get(url);
    const total = response?.data?.data?.summary?.totalPicklists ?? 0;
    console.log(`[fetchStaffPicklistStats] success=${response?.data?.success} totalPicklists=${total}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch staff picklist stats for ${staffId}:`, error);
    throw error;
  }
}

// Create picklist explicitly
export async function createPicklist(payload: CreatePicklistRequest): Promise<{ success: boolean; message: string }> {
  try {
    const response = await apiClient.post(`/orders/api/orders/create-pickup`, payload);
    return response.data;
  } catch (error) {
    console.error("Failed to create picklist:", error);
    throw error;
  }
}

// Assign a picklist to a fulfilment staff
export async function assignPicklistToStaff(payload: AssignPicklistRequest): Promise<{ success: boolean; message: string }> {
  try {
    const response = await apiClient.post(`/orders/api/orders/assign-picklist`, payload);
    return response.data;
  } catch (error) {
    console.error("Failed to assign picklist:", error);
    throw error;
  }
}

// Dealer packs order with total weight
export async function updateOrderStatusByDealerReq(payload: UpdateOrderStatusByDealerRequest): Promise<{ success: boolean; message: string }> {
  try {
    const response = await apiClient.put(`/orders/api/orders/update/order-status-by-dealer`, payload);
    return response.data;
  } catch (error) {
    console.error("Failed to update order status by dealer:", error);
    throw error;
  }
}

// Pack order using the new endpoint
export async function packOrder(orderId: string, payload: { total_weight_kg?: number }): Promise<{ success: boolean; message: string }> {
  try {
    const response = await apiClient.put(`/orders/api/orders/${orderId}/pack`, payload);
    return response.data;
  } catch (error) {
    console.error("Failed to pack order:", error);
    throw error;
  }
}

// Get all orders from the specified endpoint
export async function getAllOrders(): Promise<{
  success: boolean;
  message: string;
  data: Array<{
    _id: string;
    orderId: string;
    orderDate: string;
    order_Amount: number;
    status: string;
    paymentType: string;
    orderType: string;
    orderSource: string;
    createdAt: string;
    updatedAt: string;
    skus: Array<{
      sku: string;
      quantity: number;
      productName: string;
      totalPrice: number;
      tracking_info: {
        status: string;
      };
    }>;
    customerDetails: {
      name: string;
      email: string;
      phone: string;
    };
  }>;
}> {
  try {
    console.log("Fetching all orders from endpoint: /orders/api/orders/all");
    const response = await apiClient.get(`/orders/api/orders/all`);
    console.log("All orders response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch all orders:", error);
    throw error;
  }
}

// Cancel order with reason
export async function cancelOrder(orderId: string, reason: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await apiClient.post(`/orders/api/orders/${orderId}/cancel`, {
      reason: reason
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to cancel order ${orderId}:`, error);
    throw error;
  }
}