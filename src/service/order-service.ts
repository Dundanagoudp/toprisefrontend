import { orderResponse, OrderWithPicklistResponse, PicklistResponse, AssignDealersRequest, CreatePicklistRequest, AssignPicklistRequest, UpdateOrderStatusByDealerRequest } from "@/types/order-Types";
import apiClient from "@/apiClient";

import axios from "axios";

export interface OrderFilters {
  paymentType?: string;
  status?: string;
  orderSource?: string;
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
  dealerId?: string;
  sortBy?: string;
  order?: string;
}

export async function getOrders(page: number, limit: number, filters?: OrderFilters): Promise<orderResponse> {
  try {
    let url = `/orders/api/orders/all?page=${page}&limit=${limit}`;
    
    if (filters) {
      if (filters.paymentType && filters.paymentType !== 'all') {
        url += `&paymentType=${filters.paymentType}`;
      }
      if (filters.status && filters.status !== 'all') {
        url += `&status=${filters.status}`;
      }
      if (filters.orderSource && filters.orderSource !== 'all') {
        url += `&orderSource=${filters.orderSource}`;
      }
      if (filters.startDate) {
        url += `&startDate=${filters.startDate}`;
      }
      if (filters.endDate) {
        url += `&endDate=${filters.endDate}`;
      }
      if (filters.searchTerm) {
        url += `&searchTerm=${encodeURIComponent(filters.searchTerm)}`;
      }
      if (filters.dealerId && filters.dealerId !== 'all') {
        url += `&dealerId=${filters.dealerId}`;
      }
      if (filters.sortBy) {
        url += `&sortBy=${filters.sortBy}`;
      }
      if (filters.order) {
        url += `&order=${filters.order}`;
      }
    }
    
    const response = await apiClient.get(url);
    
    
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


// get order by piclist id
export async function getOrderByPiclistId(piclistId: string): Promise<OrderWithPicklistResponse> {
  try {
    const response = await apiClient.get(`/orders/api/fulfillment/get/order/byPicklistId/${piclistId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch order with piclist id ${piclistId}:`, error);
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
//get picklist by  order id
export async function fetchPicklistByOrderId(orderId:string):Promise<PicklistResponse>{
  try{
    const response = await apiClient.get(`/orders/api/fulfillment/picklist/by-orderId/${orderId}`)
    return response.data
  }
catch(err){
  console.error("failed to fetch picklist by order id", err)
  throw err
}
}
//get employee from userid
export async function fetchEmployeeByUserId(userId:string):Promise<any>{
  try{
    const resposne = await apiClient.get(`/users/api/users/employee/getEmployee/byUserId/${userId}`)
    return resposne.data
  }
  catch(err){
    console.error("failed to fetch user ", err)
  }
}

// Fetch picklists assigned to a specific fulfillment staff (employee)
export async function fetchPicklistsByEmployee(employeeId: string , page?:number): Promise<{
  success: boolean;
  message: string;
  data: {
    picklists: any[];
    pagination?: any;
    staffInfo?: any;
    summary?: any;
  };
}> {
  try { 
    const url = page 
      ? `/orders/api/fulfillment/picklists/employee/${employeeId}?page=${page}`
      : `/orders/api/fulfillment/picklists/employee/${employeeId}`;
    const response = await apiClient.get(url);
    try {
      const count = Array.isArray(response?.data?.data?.data) ? response.data.data.data.length : 0;
      const totalPages = response?.data?.data?.pagination?.totalPages || 0;
      const currentPage = response?.data?.data?.pagination?.currentPage || 1;
      const itemsPerPage = response?.data?.data?.pagination?.itemsPerPage || 10;
      const hasNextPage = response?.data?.data?.pagination?.hasNextPage || false;
      const hasPreviousPage = response?.data?.data?.pagination?.hasPreviousPage || false;
      const pagination = {
        totalItems: count,
        totalPages,
        currentPage,
        itemsPerPage,
        hasNextPage,
        hasPreviousPage,
      };
      return {
        success: response.data.success,
        message: response.data.message,
        data: {
          picklists: response.data.data,
          pagination,
          staffInfo: response.data.staffInfo,
          summary: response.data.summary,
        },
      };
    } catch {}
    return  response.data;
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
// mark as packed 
export async function markOrderAsPacked(data: any): Promise<any> {
  try {
    const response = await apiClient.put(`/orders/api/orders/update/order-status-by-dealer/by-sku`, data);
    return response.data;
  } catch (error) {
    console.error("Failed to mark order as packed:", error);
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