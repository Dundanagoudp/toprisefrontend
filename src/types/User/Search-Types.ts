// Search API Response Types

// Base change log interface used in multiple places
export interface ChangeLog {
  iteration_number: number;
  old_value?: string;
  new_value?: string;
  modified_At: string;
  modified_by: string;
  changes: string;
  _id: string;
}

// Update entry for variant
export interface VariantUpdateEntry {
  updated_by: string;
  change_logs: string;
  _id: string;
  updated_at: string;
}

// Brand interface
export interface Brand {
  _id: string;
  brand_name: string;
  brand_code: string;
  type: string;
  created_by: string;
  updated_by: string;
  brand_logo: string;
  status: string;
  created_at: string;
  updated_at: string;
  __v: number;
  featured_brand: boolean;
}

// Model interface
export interface Model {
  _id: string;
  model_name: string;
  model_code: string;
  brand_ref: string;
  model_image: string;
  created_by: string;
  updated_by: string;
  status: string;
  created_at: string;
  updated_at: string;
  __v: number;
}

// Variant interface
export interface Variant {
  _id: string;
  variant_name: string;
  variant_code: string;
  Year: string[];
  model: string;
  created_by: string;
  updated_by: VariantUpdateEntry[];
  variant_status: string;
  variant_Description: string;
  created_at: string;
  updated_at: string;
  __v: number;
}

// Available dealer interface for products
export interface AvailableDealer {
  _id: string;
  dealers_Ref: string;
  inStock: boolean;
  quantity_per_dealer?: number;
  dealer_margin?: number;
  dealer_priority_override?: number;
  last_stock_update?: string;
}

// Product interface
export interface Product {
  addedByDealer: boolean;
  addedByDealerId: string | null;
  _id: string;
  sku_code: string;
  manufacturer_part_name: string;
  no_of_stock: number;
  product_name: string;
  brand: string;
  hsn_code: string;
  out_of_stock: boolean;
  category: string;
  sub_category: string;
  product_type: string;
  is_universal: boolean;
  is_consumable: boolean;
  make: string[];
  model: string;
  year_range: string[];
  variant: string[];
  fitment_notes: string;
  fulfillment_priority: number;
  product_Version: string;
  admin_notes: string;
  key_specifications: string;
  weight: number;
  certifications: string;
  warranty: number;
  images: string[];
  brochure_available: boolean;
  seo_title: string;
  seo_description: string;
  seo_metaData: string;
  search_tags: string[];
  mrp_with_gst: number;
  selling_price: number;
  gst_percentage: number;
  is_returnable: boolean;
  return_policy: string;
  live_status: string;
  Qc_status: string;
  created_by: string;
  iteration_number: number;
  available_dealers: AvailableDealer[];
  last_stock_inquired: string;
  created_at: string;
  updated_at: string;
  rejection_state: any[]; // You might want to define this more specifically if you know the structure
  change_logs: ChangeLog[];
  __v: number;
}

// Search results interface
export interface SearchResults {
  brand: Brand;
  model: Model;
  variant: Variant;
  products: Product[];
}

// Main search response interface
export interface SearchApiResponse {
  success: boolean;
  searchQuery: string;
  is_brand: boolean;
  is_model: boolean;
  is_variant: boolean;
  is_product: boolean;
  data: SearchResults;
}

// Additional utility types for common statuses
export type LiveStatus = 'Pending' | 'Approved' | 'Rejected';
export type QcStatus = 'Pending' | 'Approved' | 'Rejected';
export type ProductType = 'OE' | 'Aftermarket' | 'Universal';
export type BrandStatus = 'active' | 'inactive';
export type ModelStatus = 'Created' | 'Active' | 'Inactive';
export type VariantStatus = 'active' | 'inactive';

// Search request types (for making API calls)
export interface SearchRequest {
  query: string;
  filters?: {
    brand?: string;
    model?: string;
    variant?: string;
    category?: string;
    sub_category?: string;
    product_type?: ProductType;
    price_range?: {
      min?: number;
      max?: number;
    };
  };
  pagination?: {
    page?: number;
    limit?: number;
  };
}

// Search error response
export interface SearchErrorResponse {
  success: false;
  error: string;
  message?: string;
}

// Union type for all possible search responses
export type SearchResponse = SearchApiResponse | SearchErrorResponse;
