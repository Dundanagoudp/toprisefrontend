export interface Catalog {
  id: string;
  catalog_name: string;
  catalog_description: string;
  catalog_image?: string;
  catalog_created_by: string;
  catalog_brands: string[];
  catalog_models: string[];
  catalog_variants: string[];
  catalog_products?: string[];
  created_at: string;
  updated_at: string;
  statistics?: CatalogStatistics;
}

export interface CatalogStatistics {
  total_products: number;
  total_brands: number;
  total_models: number;
  total_variants: number;
  last_updated: string;
}

export interface Brand {
  id: string;
  brand_name: string;
  brand_logo?: string;
}

export interface Model {
  id: string;
  model_name: string;
  brand_id: string;
}

export interface Variant {
  id: string;
  variant_name: string;
  model_id: string;
}

export interface Product {
  id: string;
  product_name: string;
  sku_code: string;
  brand: Brand;
  model: Model;
  variant: Variant;
  mrp_with_gst: number;
  selling_price: number;
  images: string[];
  in_stock: boolean;
}

export interface CreateCatalogRequest {
  catalog_name: string;
  catalog_description: string;
  catalog_image?: string;
  catalog_brands: string[];
  catalog_models: string[];
  catalog_variants: string[];
}

export interface CatalogApiResponse {
  success: boolean;
  message: string;
  data: {
    catalogs: Catalog[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
}

export interface SingleCatalogApiResponse {
  success: boolean;
  message: string;
  data: Catalog;
}

export interface ProductsApiResponse {
  success: boolean;
  message: string;
  data: Product[];
}

export interface BrandsApiResponse {
  success: boolean;
  message: string;
  data: Brand[];
}

export interface ModelsApiResponse {
  success: boolean;
  message: string;
  data: Model[];
}

export interface VariantsApiResponse {
  success: boolean;
  message: string;
  data: Variant[];
}

export interface CatalogFilters {
  searchTerm?: string;
  createdBy?: string;
  brand?: string;
  model?: string;
  variant?: string;
}
