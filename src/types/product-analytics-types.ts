// Product Analytics Types for Reports

// Common interfaces
export interface ProductAnalyticsFilters {
  startDate?: string | null;
  endDate?: string | null;
  brand?: string | null;
  category?: string | null;
  subCategory?: string | null;
  model?: string | null;
  variant?: string | null;
  status?: string | null;
  qcStatus?: string | null;
  liveStatus?: string | null;
  productType?: string | null;
  isUniversal?: boolean | null;
  isConsumable?: boolean | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  createdBy?: string | null;
  createdByRole?: string | null;
  groupBy?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
}

// Product Analytics Types
export interface ProductAnalyticsSummary {
  totalProducts: number;
  totalMrp: number;
  avgMrp: number;
  minMrp: number;
  maxMrp: number;
  totalSellingPrice: number;
  avgSellingPrice: number;
  statusBreakdown: Record<string, number>;
}

export interface ProductAnalyticsItem {
  _id: string[] | null;
  count: number;
  totalMrp: number;
  avgMrp: number | null;
  minMrp: number | null;
  maxMrp: number | null;
  totalSellingPrice: number;
  avgSellingPrice: number;
  statusBreakdown: Array<{
    liveStatus: string;
  }>;
  products: Array<{
    productId: string;
    sku: string;
    productName: string;
    sellingPrice: number;
    liveStatus: string;
  }>;
}

export interface ProductAnalyticsResponse {
  success: boolean;
  message: string;
  data: {
    summary: ProductAnalyticsSummary;
    analytics: ProductAnalyticsItem[];
    filters: ProductAnalyticsFilters;
  };
}

// Product Performance Types
export interface ProductPerformanceSummary {
  totalProducts: number;
  totalMrp: number;
  totalSellingPrice: number;
  avgMrp: number;
  avgSellingPrice: number;
  avgDiscount: number;
}

export interface ProductPerformanceItem {
  _id: string;
  productId: string;
  sku: string;
  productName: string;
  manufacturerPartName: string;
  brand: string;
  category: string;
  subCategory: string;
  model: string;
  sellingPrice: number;
  liveStatus: string;
  productType: string;
  isUniversal: boolean;
  isConsumable: boolean;
  images: number;
  createdBy: string;
  createdByRole: string;
  priceDifference: number | null;
  discountPercentage: number | null;
  valueScore: number | null;
}

export interface ProductPerformanceResponse {
  success: boolean;
  message: string;
  data: {
    summary: ProductPerformanceSummary;
    performance: ProductPerformanceItem[];
    filters: ProductAnalyticsFilters;
  };
}

// Product Inventory Types
export interface ProductInventorySummary {
  totalProducts: number;
  totalMrp: number;
  avgMrp: number;
  minMrp: number;
  maxMrp: number;
  totalSellingPrice: number;
  avgSellingPrice: number;
  statusBreakdown: Record<string, number>;
}

export interface ProductInventoryItem {
  _id: string | null;
  count: number;
  totalMrp: number;
  avgMrp: number | null;
  minMrp: number | null;
  maxMrp: number | null;
  totalSellingPrice: number;
  avgSellingPrice: number;
  statusBreakdown: Array<{
    liveStatus: string;
  }>;
  products: Array<{
    productId: string;
    sku: string;
    productName: string;
    sellingPrice: number;
    liveStatus: string;
  }>;
}

export interface ProductInventoryResponse {
  success: boolean;
  message: string;
  data: {
    summary: ProductInventorySummary;
    inventory: ProductInventoryItem[];
    filters: ProductAnalyticsFilters;
  };
}

// Product Category Types
export interface ProductCategorySummary {
  totalProducts: number;
  totalMrp: number;
  avgMrp: number;
  minMrp: number;
  maxMrp: number;
  totalSellingPrice: number;
  avgSellingPrice: number;
  statusBreakdown: Record<string, number>;
}

export interface ProductCategoryItem {
  _id: {
    category: string;
    subCategory: string;
  };
  count: number;
  totalMrp: number;
  avgMrp: number | null;
  minMrp: number | null;
  maxMrp: number | null;
  totalSellingPrice: number;
  avgSellingPrice: number;
  brands: string[];
  models: string[];
  statusBreakdown: Array<{
    liveStatus: string;
  }>;
  products: Array<{
    productId: string;
    sku: string;
    productName: string;
    brand: string;
    model: string;
    sellingPrice: number;
    liveStatus: string;
  }>;
}

export interface ProductCategoryResponse {
  success: boolean;
  message: string;
  data: {
    summary: ProductCategorySummary;
    categoryReport: ProductCategoryItem[];
    filters: ProductAnalyticsFilters;
  };
}

// Filter Types
export interface ProductAnalyticsFilterOptions {
  startDate?: string;
  endDate?: string;
  brand?: string;
  category?: string;
  subCategory?: string;
  model?: string;
  variant?: string;
  status?: string;
  qcStatus?: string;
  liveStatus?: string;
  productType?: string;
  isUniversal?: boolean;
  isConsumable?: boolean;
  minPrice?: number;
  maxPrice?: number;
  createdBy?: string;
  createdByRole?: string;
  groupBy?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
}

// Export Types
export interface ProductExportOptions {
  format: 'csv' | 'pdf' | 'excel';
  includeFilters?: boolean;
  includeSummary?: boolean;
  includeDetails?: boolean;
}

// Status and Type Enums
export const PRODUCT_STATUSES = [
  'pending',
  'approved',
  'rejected',
  'draft',
  'active',
  'inactive'
] as const;

export const PRODUCT_TYPES = [
  'OE',
  'OES',
  'Aftermarket',
  'Universal'
] as const;

export const QC_STATUSES = [
  'pending',
  'approved',
  'rejected',
  'under_review'
] as const;

export const LIVE_STATUSES = [
  'Pending',
  'Approved',
  'Rejected',
  'Draft'
] as const;

export const PRODUCT_CATEGORIES = [
  'Powertrain',
  'Electrical',
  'Body & Chassis',
  'Suspension',
  'Braking System',
  'Cooling System',
  'Fuel System',
  'Exhaust System',
  'Transmission',
  'Steering System'
] as const;

export const CREATED_BY_ROLES = [
  'Super-admin',
  'Admin',
  'User',
  'Dealer',
  'Fulfillment-Staff',
  'Fulfillment-Admin'
] as const;
