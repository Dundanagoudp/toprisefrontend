import apiClient from "@/apiClient";
import { getCookie, getAuthToken } from "@/utils/auth";
import { DealerOrder, DealerPickList } from "@/types/dealerOrder-types";
import { getDealerIdFromUserId } from "@/service/dealerServices";

export interface DealerOrderStats {
  totalOrders: number;
  pendingOrders: number;
  assignedOrders: number;
  packedOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  returnedOrders: number;
  totalPickLists: number;
  pendingPickLists: number;
  processedPickLists: number;
  completedPickLists: number;
  todaysOrders: number;
  todaysPickLists: number;
  totalOrderValue: number;
  averageOrderValue: number;
  minOrderValue: number;
  maxOrderValue: number;
  orderCompletionRate: number;
  picklistCompletionRate: number;
  totalRevenue: number;
  activeOrders: number;
  totalPicklistsGenerated: number;
}

export interface DealerOrderStatsResponse {
  success: boolean;
  message: string;
  data: {
    dealerId: string;
    dateRange: {
      startDate: string;
      endDate: string;
    };
    orderStats: {
      totalOrders: number;
      ordersToday: number;
      pendingOrders: number;
      deliveredOrders: number;
      cancelledOrders: number;
      returnedOrders: number;
      completionRate: number;
    };
    picklistStats: {
      totalPicklists: number;
      pendingPicklists: number;
      completedPicklists: number;
      picklistsToday: number;
      completionRate: number;
    };
    financialStats: {
      totalOrderValue: number;
      averageOrderValue: number;
      minOrderValue: number;
      maxOrderValue: number;
      orderCount: number;
    };
    summary: {
      totalRevenue: number;
      averageOrderValue: number;
      orderCompletionRate: number;
      picklistCompletionRate: number;
      activeOrders: number;
      totalPicklistsGenerated: number;
    };
  };
}

/**
 * Get dealer order statistics
 * @param dealerId - Optional dealer ID, will try to get from cookie/token if not provided
 * @returns Promise<DealerOrderStats>
 */
export const getDealerOrderStats = async (dealerId?: string): Promise<DealerOrderStats> => {
  try {
    let id = dealerId;
    
    // If dealerId is not provided, get it from dealer services using user ID
    if (!id) {
      try {
        console.log(`[getDealerOrderStats] Getting dealer ID from dealer services using user ID`);
        id = await getDealerIdFromUserId();
        console.log(`[getDealerOrderStats] Successfully got dealer ID from dealer services: ${id}`);
      } catch (dealerServiceError) {
        console.log(`[getDealerOrderStats] Failed to get dealer ID from dealer services, trying fallback methods`);
        
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
                // Prioritize dealerId, don't fallback to userId
                id = payload.dealerId;
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

    console.log(`[getDealerOrderStats] Fetching order stats for dealer ID: ${id}`);
    
    // Use the specific dealer stats endpoint with dealer ID
    try {
      const response = await apiClient.get<DealerOrderStatsResponse>(
        `/orders/api/orders/dealer/${id}/stats`
      );
      
      if (response.data.success) {
        console.log(`[getDealerOrderStats] Successfully fetched stats from dealer endpoint for dealer ID: ${id}`);
        return transformApiResponseToStats(response.data);
      } else {
        throw new Error("API returned unsuccessful response");
      }
    } catch (apiError) {
      console.log(`[getDealerOrderStats] Dealer stats endpoint failed, falling back to calculation method`);
      
      // Fallback: Calculate stats from orders and picklists data using dealer ID
      const [orders, pickLists] = await Promise.all([
        fetchOrdersForStats(id),
        fetchPickListsForStats(id)
      ]);

      const stats = calculateStatsFromData(orders, pickLists);
      console.log(`[getDealerOrderStats] Calculated stats from orders and picklists data for dealer ID: ${id}`);
      
      return stats;
    }
  } catch (error) {
    console.error("Error fetching dealer order stats:", error);
    throw error;
  }
};

/**
 * Transform API response to DealerOrderStats format
 */
const transformApiResponseToStats = (apiResponse: DealerOrderStatsResponse): DealerOrderStats => {
  const { orderStats, picklistStats, financialStats, summary } = apiResponse.data;
  
  return {
    // Order stats
    totalOrders: orderStats.totalOrders,
    pendingOrders: orderStats.pendingOrders,
    assignedOrders: 0, // Not provided in API response
    packedOrders: 0, // Not provided in API response
    shippedOrders: 0, // Not provided in API response
    deliveredOrders: orderStats.deliveredOrders,
    cancelledOrders: orderStats.cancelledOrders,
    returnedOrders: orderStats.returnedOrders,
    
    // Picklist stats
    totalPickLists: picklistStats.totalPicklists,
    pendingPickLists: picklistStats.pendingPicklists,
    processedPickLists: 0, // Not provided in API response
    completedPickLists: picklistStats.completedPicklists,
    
    // Today's stats
    todaysOrders: orderStats.ordersToday,
    todaysPickLists: picklistStats.picklistsToday,
    
    // Financial stats
    totalOrderValue: financialStats.totalOrderValue,
    averageOrderValue: financialStats.averageOrderValue,
    minOrderValue: financialStats.minOrderValue,
    maxOrderValue: financialStats.maxOrderValue,
    
    // Summary stats
    orderCompletionRate: summary.orderCompletionRate,
    picklistCompletionRate: summary.picklistCompletionRate,
    totalRevenue: summary.totalRevenue,
    activeOrders: summary.activeOrders,
    totalPicklistsGenerated: summary.totalPicklistsGenerated
  };
};

/**
 * Fetch orders for statistics calculation using dealer ID
 */
const fetchOrdersForStats = async (dealerId: string): Promise<DealerOrder[]> => {
  try {
    console.log(`[fetchOrdersForStats] Fetching orders for dealer ID: ${dealerId}`);
    const response = await apiClient.get(`/orders/api/orders/get/order-by-dealer/${dealerId}`);
    console.log(`[fetchOrdersForStats] API Response:`, response.data);
    
    // Handle different response structures
    let orders: DealerOrder[] = [];
    if (response.data && response.data.orders && Array.isArray(response.data.orders)) {
      orders = response.data.orders;
    } else if (response.data && Array.isArray(response.data)) {
      orders = response.data;
    } else if (Array.isArray(response.data)) {
      orders = response.data;
    }
    
    console.log(`[fetchOrdersForStats] Successfully fetched ${orders.length} orders for dealer ID: ${dealerId}`);
    return orders;
  } catch (error) {
    console.error(`[fetchOrdersForStats] Error fetching orders for dealer ID ${dealerId}:`, error);
    return [];
  }
};

/**
 * Fetch picklists for statistics calculation using dealer ID
 */
const fetchPickListsForStats = async (dealerId: string): Promise<DealerPickList[]> => {
  try {
    console.log(`[fetchPickListsForStats] Fetching picklists for dealer ID: ${dealerId}`);
    const response = await apiClient.get(`/orders/api/orders/picklists/dealer/${dealerId}`);
    console.log(`[fetchPickListsForStats] API Response:`, response.data);
    
    // Handle different response structures
    let picklists: DealerPickList[] = [];
    if (response.data && response.data.data && Array.isArray(response.data.data)) {
      picklists = response.data.data;
    } else if (response.data && Array.isArray(response.data)) {
      picklists = response.data;
    } else if (Array.isArray(response.data)) {
      picklists = response.data;
    }
    
    console.log(`[fetchPickListsForStats] Successfully fetched ${picklists.length} picklists for dealer ID: ${dealerId}`);
    return picklists;
  } catch (error) {
    console.error(`[fetchPickListsForStats] Error fetching picklists for dealer ID ${dealerId}:`, error);
    return [];
  }
};

/**
 * Calculate statistics from orders and picklists data
 */
const calculateStatsFromData = (orders: DealerOrder[], pickLists: DealerPickList[]): DealerOrderStats => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Ensure orders and pickLists are arrays
  const safeOrders = Array.isArray(orders) ? orders : [];
  const safePickLists = Array.isArray(pickLists) ? pickLists : [];

  // Calculate order statistics
  const totalOrders = safeOrders.length;
  const pendingOrders = safeOrders.filter(order => order.status === "Pending").length;
  const assignedOrders = safeOrders.filter(order => order.status === "Assigned").length;
  const packedOrders = safeOrders.filter(order => order.status === "Packed").length;
  const shippedOrders = safeOrders.filter(order => order.status === "Shipped").length;
  const deliveredOrders = safeOrders.filter(order => order.status === "Delivered").length;
  const cancelledOrders = safeOrders.filter(order => order.status === "Cancelled").length;
  const returnedOrders = safeOrders.filter(order => order.status === "Returned").length;

  // Calculate today's orders
  const todaysOrders = safeOrders.filter(order => {
    const orderDate = new Date(order.orderDetails.orderDate);
    orderDate.setHours(0, 0, 0, 0);
    return orderDate.getTime() === today.getTime();
  }).length;

  // Calculate order value statistics
  const orderValues = safeOrders.map(order => order.orderDetails.order_Amount || 0);
  const totalOrderValue = orderValues.reduce((sum, value) => sum + value, 0);
  const averageOrderValue = totalOrders > 0 ? totalOrderValue / totalOrders : 0;
  const minOrderValue = orderValues.length > 0 ? Math.min(...orderValues) : 0;
  const maxOrderValue = orderValues.length > 0 ? Math.max(...orderValues) : 0;

  // Calculate picklist statistics
  const totalPickLists = safePickLists.length;
  const pendingPickLists = safePickLists.filter(pickList => pickList.scanStatus === "Pending").length;
  const processedPickLists = safePickLists.filter(pickList => pickList.scanStatus === "Processing").length;
  const completedPickLists = safePickLists.filter(pickList => pickList.scanStatus === "Completed").length;

  // Calculate today's picklists
  const todaysPickLists = safePickLists.filter(pickList => {
    const pickListDate = new Date(pickList.createdAt);
    pickListDate.setHours(0, 0, 0, 0);
    return pickListDate.getTime() === today.getTime();
  }).length;

  // Calculate completion rates
  const orderCompletionRate = totalOrders > 0 ? (deliveredOrders / totalOrders) * 100 : 0;
  const picklistCompletionRate = totalPickLists > 0 ? (completedPickLists / totalPickLists) * 100 : 0;

  // Calculate active orders (pending + assigned + packed + shipped)
  const activeOrders = pendingOrders + assignedOrders + packedOrders + shippedOrders;

  return {
    totalOrders,
    pendingOrders,
    assignedOrders,
    packedOrders,
    shippedOrders,
    deliveredOrders,
    cancelledOrders,
    returnedOrders,
    totalPickLists,
    pendingPickLists,
    processedPickLists,
    completedPickLists,
    todaysOrders,
    todaysPickLists,
    totalOrderValue,
    averageOrderValue,
    minOrderValue,
    maxOrderValue,
    orderCompletionRate,
    picklistCompletionRate,
    totalRevenue: totalOrderValue,
    activeOrders,
    totalPicklistsGenerated: totalPickLists
  };
};
