import apiClient from "@/apiClient";
import {
  SalesAnalyticsResponse,
  OrderAnalyticsResponse,
  OrderPerformanceResponse,
  PicklistAnalyticsResponse,
  OrderAnalyticsFilterOptions,
} from "@/types/order-analytics-types";

/**
 * Order Analytics Service for Reports
 */

// Base URL for order analytics API
const ORDER_ANALYTICS_BASE_URL = "https://api.toprise.in/api/orders/api/reports";

/**
 * Fetch Sales Analytics
 */
export async function fetchSalesAnalytics(
  filters: OrderAnalyticsFilterOptions = {}
): Promise<SalesAnalyticsResponse> {
  try {
    const queryParams = new URLSearchParams();
    
    // Add filters to query params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const url = `${ORDER_ANALYTICS_BASE_URL}/sales${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching sales analytics:", error);
    throw new Error("Failed to fetch sales analytics");
  }
}

/**
 * Fetch Order Analytics
 */
export async function fetchOrderAnalytics(
  filters: OrderAnalyticsFilterOptions = {}
): Promise<OrderAnalyticsResponse> {
  try {
    const queryParams = new URLSearchParams();
    
    // Add filters to query params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const url = `${ORDER_ANALYTICS_BASE_URL}/analytics${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching order analytics:", error);
    throw new Error("Failed to fetch order analytics");
  }
}

/**
 * Fetch Order Performance Analytics
 */
export async function fetchOrderPerformanceAnalytics(
  filters: OrderAnalyticsFilterOptions = {}
): Promise<OrderPerformanceResponse> {
  try {
    const queryParams = new URLSearchParams();
    
    // Add filters to query params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const url = `${ORDER_ANALYTICS_BASE_URL}/performance${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching order performance analytics:", error);
    throw new Error("Failed to fetch order performance analytics");
  }
}

/**
 * Fetch Picklist Analytics
 */
export async function fetchPicklistAnalytics(
  filters: OrderAnalyticsFilterOptions = {}
): Promise<PicklistAnalyticsResponse> {
  try {
    const queryParams = new URLSearchParams();
    
    // Add filters to query params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const url = `${ORDER_ANALYTICS_BASE_URL}/picklists${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching picklist analytics:", error);
    throw new Error("Failed to fetch picklist analytics");
  }
}

/**
 * Fetch All Order Analytics Data
 */
export async function fetchAllOrderAnalytics(
  filters: OrderAnalyticsFilterOptions = {}
): Promise<{
  sales: SalesAnalyticsResponse;
  analytics: OrderAnalyticsResponse;
  performance: OrderPerformanceResponse;
  picklists: PicklistAnalyticsResponse;
}> {
  try {
    const [sales, analytics, performance, picklists] = await Promise.allSettled([
      fetchSalesAnalytics(filters),
      fetchOrderAnalytics(filters),
      fetchOrderPerformanceAnalytics(filters),
      fetchPicklistAnalytics(filters),
    ]);

    return {
      sales: sales.status === 'fulfilled' ? sales.value : {
        success: false,
        message: "Failed to fetch sales analytics",
        data: {
          summary: {
            totalOrders: 0,
            totalAmount: 0,
            avgAmount: 0,
            minAmount: 0,
            maxAmount: 0,
            totalGST: 0,
            avgGST: 0,
            totalDeliveryCharges: 0,
            avgDeliveryCharges: 0,
            totalRevenue: 0,
            avgRevenue: 0,
            statusBreakdown: {}
          },
          salesAnalytics: [],
          filters: {}
        }
      },
      analytics: analytics.status === 'fulfilled' ? analytics.value : {
        success: false,
        message: "Failed to fetch order analytics",
        data: {
          summary: {
            totalOrders: 0,
            totalAmount: 0,
            avgAmount: 0,
            minAmount: 0,
            maxAmount: 0,
            totalGST: 0,
            avgGST: 0,
            totalDeliveryCharges: 0,
            avgDeliveryCharges: 0,
            statusBreakdown: {}
          },
          analytics: [],
          filters: {}
        }
      },
      performance: performance.status === 'fulfilled' ? performance.value : {
        success: false,
        message: "Failed to fetch order performance analytics",
        data: {
          summary: {
            totalOrders: 0,
            totalAmount: 0,
            avgAmount: 0,
            minAmount: 0,
            maxAmount: 0,
            totalGST: 0,
            avgGST: 0,
            totalDeliveryCharges: 0,
            avgDeliveryCharges: 0,
            totalRevenue: 0,
            avgRevenue: 0,
            statusBreakdown: {}
          },
          performance: [],
          filters: {}
        }
      },
      picklists: picklists.status === 'fulfilled' ? picklists.value : {
        success: false,
        message: "Failed to fetch picklist analytics",
        data: {
          summary: {
            totalPicklists: 0,
            totalAmount: 0,
            avgAmount: 0,
            minAmount: 0,
            maxAmount: 0,
            totalGST: 0,
            avgGST: 0,
            totalDeliveryCharges: 0,
            avgDeliveryCharges: 0,
            statusBreakdown: {}
          },
          analytics: [],
          filters: {}
        }
      }
    };
  } catch (error) {
    console.error("Error fetching all order analytics:", error);
    throw new Error("Failed to fetch order analytics data");
  }
}

/**
 * Export Order Analytics Data to CSV
 */
export function exportOrderAnalyticsToCSV(
  data: any[],
  filename: string,
  headers: string[]
): void {
  try {
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header] || '';
          // Escape CSV values
          return `"${value.toString().replace(/"/g, '""')}"`;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Error exporting to CSV:", error);
    throw new Error("Failed to export data to CSV");
  }
}

/**
 * Format Currency for Display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format Number for Display
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-IN').format(num);
}

/**
 * Format Date for API
 */
export function formatDateForAPI(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Parse Date from API
 */
export function parseDateFromAPI(dateString: string): Date {
  return new Date(dateString);
}

/**
 * Get Default Order Analytics Filters
 */
export function getDefaultOrderAnalyticsFilters(): OrderAnalyticsFilterOptions {
  return {
    groupBy: 'date',
    sortBy: 'totalAmount',
    sortOrder: 'desc',
    limit: 100
  };
}

/**
 * Get Default Order Performance Filters
 */
export function getDefaultOrderPerformanceFilters(): OrderAnalyticsFilterOptions {
  return {
    sortBy: 'orderAmount',
    sortOrder: 'desc',
    limit: 50
  };
}

/**
 * Get Default Picklist Analytics Filters
 */
export function getDefaultPicklistAnalyticsFilters(): OrderAnalyticsFilterOptions {
  return {
    groupBy: 'status',
    sortBy: 'count',
    sortOrder: 'desc',
    limit: 100
  };
}
