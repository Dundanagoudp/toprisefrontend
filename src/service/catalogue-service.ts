import apiClient from "@/apiClient";
import axios from "axios";
import { 
  CatalogApiResponse, 
  SingleCatalogApiResponse,
  Catalog, 
  CreateCatalogRequest,
  CatalogFilters,
  BrandsApiResponse,
  ModelsApiResponse,
  VariantsApiResponse,
  ProductsApiResponse,
  Brand,
  Model,
  Variant,
  Product
} from "@/types/catalogue-types";

// Create a separate axios instance for model API without authentication
const modelApiClient = axios.create({
  baseURL: "https://api.toprise.in/products/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000000,
});

// Catalog CRUD operations (WITH authentication)
export const getCatalogs = async (filters?: CatalogFilters): Promise<CatalogApiResponse> => {
  try {
    const params = new URLSearchParams();
    
    if (filters?.searchTerm) params.append('search', filters.searchTerm);
    if (filters?.createdBy) params.append('created_by', filters.createdBy);
    if (filters?.brand) params.append('brand', filters.brand);
    if (filters?.model) params.append('model', filters.model);
    if (filters?.variant) params.append('variant', filters.variant);

    // Uses authenticated apiClient
    const response = await apiClient.get(`https://api.toprise.in/products/api/catalogs?${params.toString()}`);
    console.log("Raw API response for catalogs:", response);
    console.log("Response data:", response.data);
    
    // Ensure the response has the expected structure
    if (response.data && typeof response.data === 'object') {
      return response.data;
    } else {
      console.error("Unexpected API response structure:", response.data);
      throw new Error("Invalid API response structure");
    }
  } catch (error) {
    console.error("Error fetching catalogs:", error);
    throw error;
  }
};

export const getCatalogById = async (id: string): Promise<SingleCatalogApiResponse> => {
  try {
    const response = await apiClient.get(`https://api.toprise.in/products/api/catalogs/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching catalog by ID:", error);
    throw error;
  }
};

export const createCatalog = async (catalog: CreateCatalogRequest): Promise<SingleCatalogApiResponse> => {
  try {
    const response = await apiClient.post('https://api.toprise.in/products/api/catalogs', catalog);
    return response.data;
  } catch (error) {
    console.error("Error creating catalog:", error);
    throw error;
  }
};

export const updateCatalog = async (id: string, catalog: Partial<CreateCatalogRequest>): Promise<SingleCatalogApiResponse> => {
  try {
    const response = await apiClient.put(`https://api.toprise.in/products/api/catalogs/${id}`, catalog);
    return response.data;
  } catch (error) {
    console.error("Error updating catalog:", error);
    throw error;
  }
};

export const deleteCatalog = async (id: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await apiClient.delete(`https://api.toprise.in/products/api/catalogs/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting catalog:", error);
    throw error;
  }
};

// Product assignment operations
export const assignProductsToCatalog = async (catalogId: string, productIds: string[]): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await apiClient.post(`https://api.toprise.in/products/api/catalogs/${catalogId}/assign-products`, {
      product_ids: productIds
    });
    return response.data;
  } catch (error) {
    console.error("Error assigning products to catalog:", error);
    throw error;
  }
};

export const removeProductsFromCatalog = async (catalogId: string, productIds: string[]): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await apiClient.delete(`https://api.toprise.in/products/api/catalogs/${catalogId}/remove-products`, {
      data: { product_ids: productIds }
    });
    return response.data;
  } catch (error) {
    console.error("Error removing products from catalog:", error);
    throw error;
  }
};

export const reassignProductsToCatalog = async (catalogId: string, productIds: string[]): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await apiClient.post(`https://api.toprise.in/products/api/catalogs/${catalogId}/reassign-products`, {
      product_ids: productIds
    });
    return response.data;
  } catch (error) {
    console.error("Error reassigning products to catalog:", error);
    throw error;
  }
};

// Preview and statistics
export const getCatalogProductsPreview = async (): Promise<ProductsApiResponse> => {
  try {
    const response = await apiClient.get('https://api.toprise.in/products/api/catalogs/preview/products');
    return response.data;
  } catch (error) {
    console.error("Error fetching catalog products preview:", error);
    throw error;
  }
};

export const getCatalogStatistics = async (catalogId: string): Promise<{ success: boolean; data: any; message: string }> => {
  try {
    const response = await apiClient.get(`https://api.toprise.in/products/api/catalogs/${catalogId}/statistics`);
    return response.data;
  } catch (error) {
    console.error("Error fetching catalog statistics:", error);
    throw error;
  }
};

// Brands, Models, Variants APIs
// Brands API (WITH authentication)
export const getBrands = async (): Promise<BrandsApiResponse> => {
  try {
    // Uses authenticated apiClient
    const response = await apiClient.get('https://api.toprise.in/products/api/brands');
    return response.data;
  } catch (error) {
    console.error("Error fetching brands:", error);
    throw error;
  }
};

// Models API (WITHOUT authentication)
export const getModels = async (brandId?: string): Promise<ModelsApiResponse> => {
  try {
    if (!brandId) {
      // If no brandId provided, return empty response or fetch all models
      console.log("No brandId provided for models API");
      return { success: true, message: "No brand selected", data: [] };
    }
    
    // Use modelApiClient (without authentication) for models API
    // Brand ID is part of the URL path, not query parameter
    const response = await modelApiClient.get(`https://api.toprise.in/products/api/model/brand/${brandId}`);
    console.log("Models API response for brandId:", brandId, response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching models:", error);
    throw error;
  }
};

// Variants API (WITH authentication)
export const getVariants = async (modelId?: string): Promise<VariantsApiResponse> => {
  try {
    if (!modelId) {
      // If no modelId provided, return empty response or fetch all variants
      console.log("No modelId provided for variants API");
      return { success: true, message: "No model selected", data: [] };
    }
    
    // Uses authenticated apiClient
    // Model ID is part of the URL path, not query parameter
    const response = await apiClient.get(`https://api.toprise.in/products/variants/model/${modelId}`);
    console.log("Variants API response for modelId:", modelId, response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching variants:", error);
    throw error;
  }
};

// Get Product by ID API (WITH authentication)
export const getProductById = async (productId: string): Promise<any> => {
  try {
    console.log("Fetching product by ID:", productId);
    // Uses authenticated apiClient
    const response = await apiClient.get(`https://api.toprise.in/products/api/products/${productId}`);
    console.log("Product API response for ID:", productId, response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching product:", error);
    throw error;
  }
};

// Mock data for development/testing
export const getMockCatalogs = (): Catalog[] => {
  return [
    {
      id: "1",
      catalog_name: "Honda Civic Parts Catalog",
      catalog_description: "All parts for Honda Civic models including sedan and hatchback variants",
      catalog_image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=300&fit=crop",
      catalog_created_by: "admin@toprise.in",
      catalog_brands: ["honda_brand_id"],
      catalog_models: ["civic_model_id"],
      catalog_variants: ["civic_sedan_variant_id", "civic_hatchback_variant_id"],
      created_at: "2024-01-15T10:00:00Z",
      updated_at: "2024-01-15T10:00:00Z",
      statistics: {
        total_products: 150,
        total_brands: 1,
        total_models: 1,
        total_variants: 2,
        last_updated: "2024-01-15T10:00:00Z"
      }
    },
    {
      id: "2",
      catalog_name: "Toyota Camry Parts Catalog",
      catalog_description: "Complete parts catalog for Toyota Camry hybrid and standard models",
      catalog_image: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400&h=300&fit=crop",
      catalog_created_by: "admin@toprise.in",
      catalog_brands: ["toyota_brand_id"],
      catalog_models: ["camry_model_id"],
      catalog_variants: ["camry_hybrid_variant_id", "camry_standard_variant_id"],
      created_at: "2024-01-16T10:00:00Z",
      updated_at: "2024-01-16T10:00:00Z",
      statistics: {
        total_products: 200,
        total_brands: 1,
        total_models: 1,
        total_variants: 2,
        last_updated: "2024-01-16T10:00:00Z"
      }
    },
    {
      id: "3",
      catalog_name: "BMW 3 Series Parts Catalog",
      catalog_description: "Premium parts catalog for BMW 3 Series luxury sedans",
      catalog_image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&h=300&fit=crop",
      catalog_created_by: "admin@toprise.in",
      catalog_brands: ["bmw_brand_id"],
      catalog_models: ["3series_model_id"],
      catalog_variants: ["330i_variant_id", "320i_variant_id"],
      created_at: "2024-01-17T10:00:00Z",
      updated_at: "2024-01-17T10:00:00Z",
      statistics: {
        total_products: 180,
        total_brands: 1,
        total_models: 1,
        total_variants: 2,
        last_updated: "2024-01-17T10:00:00Z"
      }
    }
  ];
};

export const getMockBrands = (): Brand[] => {
  return [
    { id: "honda_brand_id", brand_name: "Honda", brand_logo: "https://logo.clearbit.com/honda.com" },
    { id: "toyota_brand_id", brand_name: "Toyota", brand_logo: "https://logo.clearbit.com/toyota.com" },
    { id: "bmw_brand_id", brand_name: "BMW", brand_logo: "https://logo.clearbit.com/bmw.com" },
    { id: "mercedes_brand_id", brand_name: "Mercedes-Benz", brand_logo: "https://logo.clearbit.com/mercedes-benz.com" },
    { id: "audi_brand_id", brand_name: "Audi", brand_logo: "https://logo.clearbit.com/audi.com" }
  ];
};

export const getMockModels = (): Model[] => {
  return [
    { id: "civic_model_id", model_name: "Civic", brand_id: "honda_brand_id" },
    { id: "camry_model_id", model_name: "Camry", brand_id: "toyota_brand_id" },
    { id: "3series_model_id", model_name: "3 Series", brand_id: "bmw_brand_id" },
    { id: "cclass_model_id", model_name: "C-Class", brand_id: "mercedes_brand_id" },
    { id: "a4_model_id", model_name: "A4", brand_id: "audi_brand_id" }
  ];
};

export const getMockVariants = (): Variant[] => {
  return [
    { id: "civic_sedan_variant_id", variant_name: "Sedan", model_id: "civic_model_id" },
    { id: "civic_hatchback_variant_id", variant_name: "Hatchback", model_id: "civic_model_id" },
    { id: "camry_hybrid_variant_id", variant_name: "Hybrid", model_id: "camry_model_id" },
    { id: "camry_standard_variant_id", variant_name: "Standard", model_id: "camry_model_id" },
    { id: "330i_variant_id", variant_name: "330i", model_id: "3series_model_id" },
    { id: "320i_variant_id", variant_name: "320i", model_id: "3series_model_id" }
  ];
};
