import apiClient from "@/apiClient";
import {
  ProductAnalyticsResponse,
  ProductPerformanceResponse,
  ProductInventoryResponse,
  ProductCategoryResponse,
  ProductAnalyticsFilterOptions,
} from "@/types/product-analytics-types";

/**
 * Product Analytics Service for Reports
 */

// Base URL for product analytics API
const PRODUCT_ANALYTICS_BASE_URL = "https://api.toprise.in/products/api/reports";

/**
 * Fetch Product Analytics
 */
export async function fetchProductAnalytics(
  filters: ProductAnalyticsFilterOptions = {}
): Promise<ProductAnalyticsResponse> {
  try {
    const queryParams = new URLSearchParams();
    
    // Add filters to query params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const url = `${PRODUCT_ANALYTICS_BASE_URL}/analytics${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching product analytics:", error);
    throw new Error("Failed to fetch product analytics");
  }
}

/**
 * Fetch Product Performance Analytics
 */
export async function fetchProductPerformanceAnalytics(
  filters: ProductAnalyticsFilterOptions = {}
): Promise<ProductPerformanceResponse> {
  try {
    const queryParams = new URLSearchParams();
    
    // Add filters to query params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const url = `${PRODUCT_ANALYTICS_BASE_URL}/performance${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching product performance analytics:", error);
    throw new Error("Failed to fetch product performance analytics");
  }
}

/**
 * Fetch Product Inventory Analytics
 */
export async function fetchProductInventoryAnalytics(
  filters: ProductAnalyticsFilterOptions = {}
): Promise<ProductInventoryResponse> {
  try {
    const queryParams = new URLSearchParams();
    
    // Add filters to query params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const url = `${PRODUCT_ANALYTICS_BASE_URL}/inventory${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching product inventory analytics:", error);
    throw new Error("Failed to fetch product inventory analytics");
  }
}

/**
 * Fetch Product Category Analytics
 */
export async function fetchProductCategoryAnalytics(
  filters: ProductAnalyticsFilterOptions = {}
): Promise<ProductCategoryResponse> {
  try {
    const queryParams = new URLSearchParams();
    
    // Add filters to query params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const url = `${PRODUCT_ANALYTICS_BASE_URL}/category${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching product category analytics:", error);
    throw new Error("Failed to fetch product category analytics");
  }
}

/**
 * Fetch All Product Analytics Data
 */
export async function fetchAllProductAnalytics(
  filters: ProductAnalyticsFilterOptions = {}
): Promise<{
  analytics: ProductAnalyticsResponse;
  performance: ProductPerformanceResponse;
  inventory: ProductInventoryResponse;
  category: ProductCategoryResponse;
}> {
  try {
    const [analytics, performance, inventory, category] = await Promise.allSettled([
      fetchProductAnalytics(filters),
      fetchProductPerformanceAnalytics(filters),
      fetchProductInventoryAnalytics(filters),
      fetchProductCategoryAnalytics(filters),
    ]);

    return {
      analytics: analytics.status === 'fulfilled' ? analytics.value : {
        success: false,
        message: "Failed to fetch product analytics",
        data: {
          summary: {
            totalProducts: 0,
            totalMrp: 0,
            avgMrp: 0,
            minMrp: 0,
            maxMrp: 0,
            totalSellingPrice: 0,
            avgSellingPrice: 0,
            statusBreakdown: {}
          },
          analytics: [],
          filters: {}
        }
      },
      performance: performance.status === 'fulfilled' ? performance.value : {
        success: false,
        message: "Failed to fetch product performance analytics",
        data: {
          summary: {
            totalProducts: 0,
            totalMrp: 0,
            totalSellingPrice: 0,
            avgMrp: 0,
            avgSellingPrice: 0,
            avgDiscount: 0
          },
          performance: [],
          filters: {}
        }
      },
      inventory: inventory.status === 'fulfilled' ? inventory.value : {
        success: false,
        message: "Failed to fetch product inventory analytics",
        data: {
          summary: {
            totalProducts: 0,
            totalMrp: 0,
            avgMrp: 0,
            minMrp: 0,
            maxMrp: 0,
            totalSellingPrice: 0,
            avgSellingPrice: 0,
            statusBreakdown: {}
          },
          inventory: [],
          filters: {}
        }
      },
      category: category.status === 'fulfilled' ? category.value : {
        success: false,
        message: "Failed to fetch product category analytics",
        data: {
          summary: {
            totalProducts: 0,
            totalMrp: 0,
            avgMrp: 0,
            minMrp: 0,
            maxMrp: 0,
            totalSellingPrice: 0,
            avgSellingPrice: 0,
            statusBreakdown: {}
          },
          categoryReport: [],
          filters: {}
        }
      }
    };
  } catch (error) {
    console.error("Error fetching all product analytics:", error);
    throw new Error("Failed to fetch product analytics data");
  }
}

/**
 * Export Product Analytics Data to CSV
 */
export function exportProductAnalyticsToCSV(
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
 * Get Default Product Analytics Filters
 */
export function getDefaultProductAnalyticsFilters(): ProductAnalyticsFilterOptions {
  return {
    startDate: null,
    endDate: null,
    brand: null,
    category: null,
    subCategory: null,
    model: null,
    variant: null,
    status: null,
    qcStatus: null,
    liveStatus: null,
    productType: null,
    isUniversal: null,
    isConsumable: null,
    minPrice: null,
    maxPrice: null,
    createdBy: null,
    createdByRole: null,
    groupBy: 'brand',
    sortBy: 'count',
    sortOrder: 'desc',
    limit: 100
  };
}

/**
 * Get Default Product Performance Filters
 */
export function getDefaultProductPerformanceFilters(): ProductAnalyticsFilterOptions {
  return {
    startDate: null,
    endDate: null,
    brand: null,
    category: null,
    subCategory: null,
    model: null,
    variant: null,
    status: null,
    qcStatus: null,
    liveStatus: null,
    productType: null,
    isUniversal: null,
    isConsumable: null,
    minPrice: null,
    maxPrice: null,
    createdBy: null,
    createdByRole: null,
    sortBy: 'totalValue',
    sortOrder: 'desc',
    limit: 50
  };
}

/**
 * Get Default Product Inventory Filters
 */
export function getDefaultProductInventoryFilters(): ProductAnalyticsFilterOptions {
  return {
    startDate: null,
    endDate: null,
    brand: null,
    category: null,
    subCategory: null,
    model: null,
    variant: null,
    status: null,
    qcStatus: null,
    liveStatus: null,
    productType: null,
    isUniversal: null,
    isConsumable: null,
    minPrice: null,
    maxPrice: null,
    createdBy: null,
    createdByRole: null,
    groupBy: 'status',
    sortBy: 'count',
    sortOrder: 'desc',
    limit: 100
  };
}

/**
 * Get Default Product Category Filters
 */
export function getDefaultProductCategoryFilters(): ProductAnalyticsFilterOptions {
  return {
    startDate: null,
    endDate: null,
    brand: null,
    category: null,
    subCategory: null,
    model: null,
    variant: null,
    status: null,
    qcStatus: null,
    liveStatus: null,
    productType: null,
    isUniversal: null,
    isConsumable: null,
    minPrice: null,
    maxPrice: null,
    createdBy: null,
    createdByRole: null,
    sortBy: 'count',
    sortOrder: 'desc',
    limit: 100
  };
}
