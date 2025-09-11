// Order Analytics Types for Reports

// Common interfaces
export interface OrderAnalyticsFilters {
  startDate?: string | null;
  endDate?: string | null;
  status?: string | null;
  orderType?: string | null;
  paymentType?: string | null;
  orderSource?: string | null;
  deliveryType?: string | null;
  typeOfDelivery?: string | null;
  minAmount?: number | null;
  maxAmount?: number | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  groupBy?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
}

// Sales Analytics Types
export interface SalesAnalyticsSummary {
  totalOrders: number;
  totalAmount: number;
  avgAmount: number;
  minAmount: number;
  maxAmount: number;
  totalGST: number;
  avgGST: number;
  totalDeliveryCharges: number;
  avgDeliveryCharges: number;
  totalRevenue: number;
  avgRevenue: number;
  statusBreakdown: Record<string, number>;
}

export interface SalesAnalyticsItem {
  _id: string | null;
  count: number;
  totalAmount: number;
  avgAmount: number;
  minAmount: number;
  maxAmount: number;
  totalGST: number;
  avgGST: number;
  totalDeliveryCharges: number;
  avgDeliveryCharges: number;
  totalRevenue: number;
  avgRevenue: number;
  orders?: any[]; // Detailed order data if available
}

export interface SalesAnalyticsResponse {
  success: boolean;
  message: string;
  data: {
    summary: SalesAnalyticsSummary;
    salesAnalytics: SalesAnalyticsItem[];
    filters: OrderAnalyticsFilters;
  };
}

// Order Analytics Types
export interface OrderAnalyticsSummary {
  totalOrders: number;
  totalAmount: number;
  avgAmount: number;
  minAmount: number;
  maxAmount: number;
  totalGST: number;
  avgGST: number;
  totalDeliveryCharges: number;
  avgDeliveryCharges: number;
  statusBreakdown: Record<string, number>;
}

export interface OrderAnalyticsItem {
  _id: string | null;
  count: number;
  totalAmount: number;
  avgAmount: number;
  minAmount: number;
  maxAmount: number;
  totalGST: number;
  avgGST: number;
  totalDeliveryCharges: number;
  avgDeliveryCharges: number;
  orders?: any[]; // Detailed order data if available
}

export interface OrderAnalyticsResponse {
  success: boolean;
  message: string;
  data: {
    summary: OrderAnalyticsSummary;
    analytics: OrderAnalyticsItem[];
    filters: OrderAnalyticsFilters;
  };
}

// Order Performance Types
export interface OrderPerformanceSummary {
  totalOrders: number;
  totalAmount: number;
  avgAmount: number;
  minAmount: number;
  maxAmount: number;
  totalGST: number;
  avgGST: number;
  totalDeliveryCharges: number;
  avgDeliveryCharges: number;
  totalRevenue: number;
  avgRevenue: number;
  statusBreakdown: Record<string, number>;
}

export interface OrderPerformanceItem {
  _id: string;
  orderId: string;
  orderAmount: number;
  gstAmount: number;
  deliveryCharges: number;
  totalAmount: number;
  status: string;
  orderType: string;
  paymentType: string;
  orderSource: string;
  deliveryType: string;
  typeOfDelivery: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    address: {
      city: string;
      state: string;
      pincode: string;
    };
  };
  dealerInfo: {
    dealerId: string;
    legalName: string;
    tradeName: string;
  };
  createdAt: string;
  updatedAt: string;
  // Add more fields as needed based on actual API response
}

export interface OrderPerformanceResponse {
  success: boolean;
  message: string;
  data: {
    summary: OrderPerformanceSummary;
    performance: OrderPerformanceItem[];
    filters: OrderAnalyticsFilters;
  };
}

// Picklist Analytics Types
export interface PicklistAnalyticsSummary {
  totalPicklists: number;
  totalAmount: number;
  avgAmount: number;
  minAmount: number;
  maxAmount: number;
  totalGST: number;
  avgGST: number;
  totalDeliveryCharges: number;
  avgDeliveryCharges: number;
  statusBreakdown: Record<string, number>;
}

export interface PicklistAnalyticsItem {
  _id: string | null;
  count: number;
  totalAmount: number;
  avgAmount: number | null;
  minAmount: number | null;
  maxAmount: number | null;
  totalGST: number;
  avgGST: number | null;
  totalDeliveryCharges: number;
  avgDeliveryCharges: number | null;
  picklists: any[]; // Detailed picklist data
}

export interface PicklistAnalyticsResponse {
  success: boolean;
  message: string;
  data: {
    summary: PicklistAnalyticsSummary;
    analytics: PicklistAnalyticsItem[];
    filters: OrderAnalyticsFilters;
  };
}

// Filter Types
export interface OrderAnalyticsFilterOptions {
  startDate?: string;
  endDate?: string;
  status?: string;
  orderType?: string;
  paymentType?: string;
  orderSource?: string;
  deliveryType?: string;
  typeOfDelivery?: string;
  minAmount?: number;
  maxAmount?: number;
  city?: string;
  state?: string;
  pincode?: string;
  groupBy?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
}

// Export Types
export interface OrderExportOptions {
  format: 'csv' | 'pdf' | 'excel';
  includeFilters?: boolean;
  includeSummary?: boolean;
  includeDetails?: boolean;
}

// Status and Type Enums
export const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'returned',
  'refunded'
] as const;

export const ORDER_TYPES = [
  'standard',
  'express',
  'bulk',
  'subscription'
] as const;

export const PAYMENT_TYPES = [
  'cash_on_delivery',
  'online',
  'wallet',
  'card',
  'upi',
  'net_banking'
] as const;

export const ORDER_SOURCES = [
  'website',
  'mobile_app',
  'api',
  'admin_panel',
  'dealer_portal'
] as const;

export const DELIVERY_TYPES = [
  'standard',
  'express',
  'same_day',
  'scheduled'
] as const;

export const TYPE_OF_DELIVERY = [
  'home_delivery',
  'pickup',
  'store_pickup',
  'locker_delivery'
] as const;
