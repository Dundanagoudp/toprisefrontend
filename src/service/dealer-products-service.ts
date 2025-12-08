import apiClient from "@/apiClient";
import { getDealerIdFromUserId } from "./dealerServices";
import axios from "axios";
import { getAuthToken } from "@/utils/auth";
export interface ProductPricing {
  mrp_with_gst: number;
  base_selling_price: number;
  dealer_selling_price: number;
  dealer_margin: number;
  gst_percentage: number;
}

export interface ProductBrand {
  _id: string;
  brand_name: string;
}

export interface ProductCategory {
  _id: string;
  category_name: string;
}

export interface ProductSubCategory {
  _id: string;
  subcategory_name: string;
}

export interface ProductModel {
  _id: string;
  model_name: string;
}

export interface ProductVariant {
  _id: string;
  variant_name: string;
}

export interface ProductDealerInfo {
  in_stock: boolean;
  quantity_available: number;
  dealer_margin: number;
  dealer_priority: number;
}

export interface PermissionMatrix {
  canEdit: {
    product_name: boolean;
    description: boolean;
    mrp_with_gst: boolean;
    selling_price: boolean;
    gst_percentage: boolean;
    dimensions: boolean;
    weight: boolean;
    certifications: boolean;
    warranty: boolean;
    images: boolean;
    video_url: boolean;
    brochure_available: boolean;
    is_returnable: boolean;
    return_policy: boolean;
    seo_title: boolean;
    seo_description: boolean;
    seo_metaData: boolean;
    search_tags: boolean;
  };
  canView: {
    all_fields: boolean;
    competitor_prices: boolean;
    internal_notes: boolean;
    admin_notes: boolean;
  };
  canManage: {
    stock: boolean;
    pricing: boolean;
    availability: boolean;
    dealer_margin: boolean;
    dealer_priority: boolean;
  };
}

export interface DealerProduct {
  _id: string;
  sku_code: string;
  product_name: string;
  pricing: ProductPricing;
  brand: ProductBrand;
  category: ProductCategory;
  sub_category: ProductSubCategory;
  model: ProductModel;
  variant: ProductVariant[];
  dealer_info: ProductDealerInfo;
  images: string[];
  created_at: string;
  updated_at: string;
  permission_matrix?: PermissionMatrix;
}

export interface ProductsSummary {
  totalProducts: number;
  totalInStock: number;
  totalOutOfStock: number;
  averagePrice: number;
  minPrice: number;
  maxPrice: number;
}

export interface ProductsPagination {
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage: number | null;
  prevPage: number | null;
}

export interface ProductsFilters {
  category: string | null;
  brand: string | null;
  search: string | null;
  sortBy: string;
  sortOrder: string;
}

export interface DealerProductsResponse {
  success: boolean;
  message: string;
  data: {
    dealerId: string;
    products: DealerProduct[];
    summary: ProductsSummary;
    pagination: ProductsPagination;
    filters: ProductsFilters;
    debug?: any;
  };
}

// Get products for a dealer
export async function getDealerProducts(
  dealerId?: string,
  page: number = 1,
  limit: number = 10,
  filters?: {
    category?: string;
    brand?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  }
): Promise<DealerProductsResponse> {
  try {
    let id = dealerId;
    
    // If dealerId is not provided, get it from dealer services
    if (!id) {
      try {
       
        id = await getDealerIdFromUserId();
       
      } catch (dealerServiceError) {
        console.error("Failed to get dealer ID from dealer services:", dealerServiceError);
        throw new Error("Unable to determine dealer ID");
      }
    }
    

    
    // Build query parameters
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      includePermissionMatrix: 'true',
    });
    
    if (filters) {
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.brand) queryParams.append('brand', filters.brand);
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
      if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder);
    }
    
    const url = `/category/products/v1/dealer/${id}?${queryParams.toString()}`;
    console.log(`[getDealerProducts] API URL: ${url}`);
    
    const response = await apiClient.get(url);
    
    if (response.data && response.data.success) {
      console.log(`[getDealerProducts] Successfully fetched products for dealer ID: ${id}`);
      return response.data;
    } else {
      throw new Error("Invalid response from products endpoint");
    }
  } catch (error) {
    console.error("Error fetching dealer products:", error);
    throw error;
  }
}

// Get a single product by ID
export async function getDealerProductById(productId: string): Promise<DealerProduct> {
  try {

    
    const response = await apiClient.get(`/category/products/v1/get-ProductById/${productId}`);
    
    if (response.data && response.data.success) {
      console.log(`[getDealerProductById] Successfully fetched product: ${productId}`);
      return response.data.data;
    } else {
      throw new Error("Invalid response from product endpoint");
    }
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    throw error;
  }
}

// Update stock by dealer
export async function updateStockByDealer(
  productId: string,
  dealerId: string,
  quantity: number
): Promise<any> {
  try {
    const response = await axios.put(`https://api.toprise.in/products/products/v1/update-stockByDealer/${productId}`, {
      dealerId,
      quantity,
    },{
      headers: {
        "Content-Type": "application/json",
        "Authorization": getAuthToken() ? `Bearer ${getAuthToken()}` : "",
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error updating stock by dealer:", error);
    throw error;
  }
}

// Format currency for display
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Format date for display
export function formatProductDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return 'Invalid Date';
  }
}

// Get stock status color
export function getStockStatusColor(inStock: boolean, quantity: number): string {
  if (!inStock || quantity === 0) {
    return 'bg-red-100 text-red-800 border-red-200';
  } else if (quantity < 10) {
    return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  } else {
    return 'bg-green-100 text-green-800 border-green-200';
  }
}

// Get stock status text
export function getStockStatusText(inStock: boolean, quantity: number): string {
  if (!inStock || quantity === 0) {
    return 'Out of Stock';
  } else if (quantity < 10) {
    return 'Low Stock';
  } else {
    return 'In Stock';
  }
}

// Check if user can edit a specific field
export function canEditField(permissionMatrix: PermissionMatrix | undefined, field: string): boolean {
  if (!permissionMatrix || !permissionMatrix.canEdit) {
    return false;
  }
  return permissionMatrix.canEdit[field as keyof typeof permissionMatrix.canEdit] || false;
}

// Check if user can manage a specific aspect
export function canManage(permissionMatrix: PermissionMatrix | undefined, aspect: string): boolean {
  if (!permissionMatrix || !permissionMatrix.canManage) {
    return false;
  }
  return permissionMatrix.canManage[aspect as keyof typeof permissionMatrix.canManage] || false;
}

// Get priority color
export function getPriorityColor(priority: number): string {
  if (priority <= 2) {
    return 'bg-red-100 text-red-800 border-red-200';
  } else if (priority <= 5) {
    return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  } else {
    return 'bg-green-100 text-green-800 border-green-200';
  }
}

// Get priority text
export function getPriorityText(priority: number): string {
  if (priority <= 2) {
    return 'High';
  } else if (priority <= 5) {
    return 'Medium';
  } else {
    return 'Low';
  }
}

// Check if user can view a specific field based on read permissions
export function canViewField(
  allowedFields: string[] | null | undefined,
  fieldName: string,
  isEnabled: boolean
): boolean {
  // If permissions are disabled, show all fields
  if (!isEnabled) {
    return true;
  }
  
  // If allowedFields is null or undefined, show all fields (no restrictions)
  if (!allowedFields) {
    return true;
  }
  
  // If allowedFields is empty array, show all fields (no restrictions)
  if (allowedFields.length === 0) {
    return true;
  }
  
  // Check if the field is in the allowed fields array
  return allowedFields.includes(fieldName);
}