import { ProductResponse, SubCategoryResponse } from "@/types/product-Types";
import { ApiResponse } from "@/types/apiReponses-Types";
import { BrandsApiResponse } from "@/types/catalogue-types";
import type { Category as ProductCategory } from "@/types/product-Types";
import apiClient from "@/apiClient";

export async function getProducts(): Promise<ProductResponse> {
  try {
    const response = await apiClient.get(`/category/products/v1`);
    return response.data;
  } catch (error) {
    console.error(" Failed to fetch products:", error);
    throw error;
  }
}

export async function getProductsByPage(
  page: number,
  limit: number,
  status?: string,
  searchQuery?: string,
  categoryFilter?: string,
  subCategoryFilter?: string
): Promise<ProductResponse> {
  try {
    // Validate input parameters
    if (page < 1) page = 1;
    if (limit < 1) limit = 10;

    let url = `/category/products/v1/get-all-products/pagination?page=${page}&limit=${limit}`;

    if (status && status.trim() !== "") {
      url += `&status=${encodeURIComponent(status.trim())}`;
    }

    if (searchQuery && searchQuery.trim() !== "") {
      // Sanitize search query to prevent potential issues
      const sanitizedQuery = searchQuery.trim().replace(/[<>]/g, "");
      if (sanitizedQuery.length > 0) {
        url += `&query=${encodeURIComponent(sanitizedQuery)}`;
      }
    }

    if (categoryFilter && categoryFilter.trim() !== "") {
      // Check if it's an ID (24 character hex string) or a name
      const isId = /^[0-9a-fA-F]{24}$/.test(categoryFilter.trim());
      if (isId) {
        url += `&categoryId=${encodeURIComponent(categoryFilter.trim())}`;
      } else {
        url += `&category=${encodeURIComponent(categoryFilter.trim())}`;
      }
    }

    if (subCategoryFilter && subCategoryFilter.trim() !== "") {
      // Check if it's an ID (24 character hex string) or a name
      const isId = /^[0-9a-fA-F]{24}$/.test(subCategoryFilter.trim());
      if (isId) {
        url += `&subCategoryId=${encodeURIComponent(subCategoryFilter.trim())}`;
      } else {
        url += `&subCategory=${encodeURIComponent(subCategoryFilter.trim())}`;
      }
    }

    console.log("🔍 API URL for getProductsByPage:", url);
    console.log("🔍 Search parameters - query:", searchQuery, "categoryFilter:", categoryFilter, "subCategoryFilter:", subCategoryFilter);
    console.log("🔍 Full search query details:", {
      searchQuery,
      searchQueryType: typeof searchQuery,
      searchQueryLength: searchQuery?.length,
      isSearchQueryEmpty: !searchQuery || searchQuery.trim() === "",
      sanitizedQuery: searchQuery
        ? searchQuery.trim().replace(/[<>]/g, "")
        : "",
    });

    const response = await apiClient.get(url);
    console.log("API response for getProductsByPage:", response.data);
    console.log("API response pagination:", response.data?.data?.pagination);
    console.log(
      "API response totalItems:",
      response.data?.data?.pagination?.totalItems
    );
    console.log(
      "API response totalPages:",
      response.data?.data?.pagination?.totalPages
    );

    // Validate response structure
    if (!response.data) {
      throw new Error("Invalid API response: No data received");
    }

    return response.data;
  } catch (error: any) {
    console.error("Failed to fetch products:", error);

    // Return a safe fallback response structure
    const fallbackResponse: ProductResponse = {
      success: false,
      message: error.message || "Failed to fetch products",
      data: {
        products: [],
        pagination: {
          currentPage: page,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: limit,
          hasNextPage: false,
          hasPreviousPage: page > 1,
        },
      },
    };

    // If it's a network error or server error, return fallback
    if (error.code === "NETWORK_ERROR" || error.response?.status >= 500) {
      return fallbackResponse;
    }

    // For other errors, still throw to let the component handle it
    throw error;
  }
}

//get products by dealer added
export async function getDealerProductsByPage(
  page: number,
  limit: number,
  status?: string
): Promise<ProductResponse> {
  try {
    // Get dealer ID from token
    const { getAuthToken } = await import("@/utils/auth");
    const token = getAuthToken();
    let dealerId = null;

    console.log("[getDealerProductsByPage] Starting dealer ID extraction...");

    if (token) {
      try {
        const payloadBase64 = token.split(".")[1];
        if (payloadBase64) {
          const base64 = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
          const paddedBase64 = base64.padEnd(
            base64.length + ((4 - (base64.length % 4)) % 4),
            "="
          );
          const payloadJson = atob(paddedBase64);
          const payload = JSON.parse(payloadJson);

          console.log("[getDealerProductsByPage] Token payload:", payload);

          // Try dealerId, fallback to id
          dealerId = payload.dealerId || payload.id;
          console.log(
            `[getDealerProductsByPage] Extracted dealer ID: ${dealerId} (from ${
              payload.dealerId ? "dealerId" : "id"
            })`
          );
        }
      } catch (err) {
        console.error("Failed to decode token for dealerId:", err);
      }
    } else {
      console.error("[getDealerProductsByPage] No authentication token found");
    }

    if (!dealerId) {
      throw new Error("Dealer ID not found in token");
    }

    let url = `/category/products/v1/getProducts/byDealer/${dealerId}?pageNumber=${page}&limitNumber=${limit}`;
    if (status) {
      url += `&status=${status}`;
    }

    console.log(
      `[getDealerProductsByPage] Fetching products for dealer ID: ${dealerId}`
    );
    console.log(`[getDealerProductsByPage] API URL: ${url}`);

    const response = await apiClient.get(url);
    console.log(
      `[getDealerProductsByPage] Successfully fetched products for dealer ${dealerId}`
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch products:", error);
    throw error;
  }
}

export async function uploadBulkProducts(
  formData: FormData
): Promise<ProductResponse> {
  try {
    const response = await apiClient.post(`/category/products/v1/`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to upload bulk products:", error);
    throw error;
  }
}
export async function exportCSV(): Promise<any> {
  try {
    const response = await apiClient.get(`/category/products/v1/export`);
    return response.data;
  } catch (error) {
    console.error("Failed to export CSV:", error);
    throw error;
  }
}
export async function aproveProduct(
  productId: string
): Promise<ProductResponse> {
  try {
    const response = await apiClient.patch(
      `/category/products/v1/approve/${productId}`
    );
    return response.data;
  } catch (error) {
    console.error("Failed to approve product:", error);
    throw error;
  }
}
/**
 * Rejects a product by sending a PATCH request with rejection details
 * @param data - FormData containing rejection information
 * @param productId - Unique identifier of the product to reject
 * @returns Promise resolving to the product rejection response
 * @throws Re-throws any API errors after logging
 */
export async function rejectProduct(
  data: FormData,
  productId: string
): Promise<ProductResponse> {
  try {
    const { data: responseData } = await apiClient.patch(
      `/category/products/v1/reject/${productId}`,
      data
    );
    return responseData;
  } catch (error) {
    console.error(`Failed to reject product ${productId}:`, error);
    throw error;
  }
}

export async function deactivateProduct(
  productId: string
): Promise<ProductResponse> {
  try {
    const response = await apiClient.patch(
      `/category/products/v1/deactivate/${productId}`
    );
    return response.data;
  } catch (error) {
    console.error("Failed to approve product:", error);
    throw error;
  }
}
export async function approveBulkProducts(
  data: string | any
): Promise<ProductResponse> {
  try {
    const response = await apiClient.patch(
      `/category/products/v1/bulk/approve`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Failed to approve product:", error);
    throw error;
  }
}
export async function deactivateBulkProducts(
  data: string | any
): Promise<ProductResponse> {
  try {
    const response = await apiClient.patch(
      `/category/products/v1/deactivateProduct/bulk`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Failed to  deactivate product:", error);
    throw error;
  }
}
export async function rejectBulkProducts(
  data: string | any
): Promise<ProductResponse> {
  try {
    const response = await apiClient.patch(
      `/category/products/v1/bulk/reject`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Failed to reject product:", error);
    throw error;
  }
}

// New endpoints for product approval requests
export async function getPendingProducts(
  page?: number,
  limit?: number
): Promise<ProductResponse> {
  try {
    let url = `/category/products/v1/pending`;
    if (page && limit) {
      url += `?page=${page}&limit=${limit}`;
    }
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch pending products:", error);
    throw error;
  }
}

export async function approveSingleProduct(
  productId: string
): Promise<ProductResponse> {
  try {
    const response = await apiClient.patch(
      `/category/products/v1/approve/${productId}`
    );
    return response.data;
  } catch (error) {
    console.error("Failed to approve product:", error);
    throw error;
  }
}

export async function rejectSingleProduct(
  productId: string,
  rejectionReason?: string
): Promise<ProductResponse> {
  try {
    const data = rejectionReason ? { rejectionReason } : {};
    const response = await apiClient.patch(
      `/category/products/v1/reject/${productId}`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Failed to reject product:", error);
    throw error;
  }
}

// Categories API returns an array of categories
export async function getCategories(): Promise<ApiResponse<ProductCategory[]>> {
  try {
    const response = await apiClient.get(`/category/api/category`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    throw error;
  }
}

export async function getBrand(): Promise<ProductResponse> {
  try {
    const response = await apiClient.get(`/category/api/brands`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch brands:", error);
    throw error;
  }
}

export async function getCategoriesByType(
  typeId: string,
  mainCategory?: boolean
): Promise<ApiResponse<ProductCategory[]>> {
  try {
    const params: Record<string, string | boolean> = { type: typeId };

    // only include main_category when caller supplies it
    if (typeof mainCategory !== "undefined") {
      params.main_category = mainCategory;
    }

    const response = await apiClient.get(`/category/api/category/application`, {
      params,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch categories by type:", error);
    throw error;
  }
}

export async function createCategory(data: FormData): Promise<any> {
  try {
    const response = await apiClient.post(`/category/api/category`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (err: any) {
    console.error("Failed to create category:", err);
    throw err;
  }
}
export async function createSubCategory(data: FormData): Promise<any> {
  try {
    const response = await apiClient.post(
      `/subCategory/api/subCategory`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (err: any) {
    console.error("Failed to create category:", err);
    throw err;
  }
}

export async function createModel(data: FormData): Promise<any> {
  try {
    const response = await apiClient.post(`/category/api/model`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (err: any) {
    console.error("Failed to create category:", err);
    throw err;
  }
}
export async function createBrand(data: FormData): Promise<any> {
  try {
    const response = await apiClient.post(`/category/api/brands`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (err: any) {
    console.error("Failed to create category:", err);
    throw err;
  }
}
export async function createVariant(data: FormData): Promise<any> {
  try {
    const response = await apiClient.post(`/subCategory/variants/`, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (err: any) {
    console.error("Failed to create category:", err);
    throw err;
  }
}

export async function createVariants(data: FormData): Promise<ProductResponse> {
  try {
    const response = await apiClient.post(`/subCategory/variants/`, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (err: any) {
    console.error("Failed to create category:", err);
    throw err;
  }
}

export async function getSubCategories(): Promise<SubCategoryResponse> {
  try {
    const response = await apiClient.get(`/subCategory/api/subCategory`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch subcategories:", error);
    throw error;
  }
}
export async function getModels(): Promise<ProductResponse> {
  try {
    const response = await apiClient.get(`/category/api/model`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    throw error;
  }
}

export async function getvarient(): Promise<ProductResponse> {
  try {
    // Updated endpoint to valid variants route
    const response = await apiClient.get(`/category/variants`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch variants:", error);
    throw error;
  }
}

export async function getSubcategories(): Promise<ProductResponse> {
  try {
    const response = await apiClient.get(`/category/api/subcategory`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch subcategories:", error);
    throw error;
  }
}
export async function getTypes(): Promise<ProductResponse> {
  try {
    const response = await apiClient.get(`/category/api/types`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    throw error;
  }
}

export async function getProductById(
  productId: string
): Promise<ProductResponse> {
  try {
    const response = await apiClient.get(
      `/category/products/v1/get-ProductById/${productId}`
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch product by ID:", error);
    throw error;
  }
}

export async function getBrandByType(id: string): Promise<ProductResponse> {
  try {
    const response = await apiClient.get(
      `/category/api/brands/brandByType/${id}`
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    throw error;
  }
}

export async function getModelByBrand(id: string): Promise<ProductResponse> {
  try {
    const response = await apiClient.get(`/category/api/model/brand/${id}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    throw error;
  }
}
export async function getYearRange(): Promise<ProductResponse> {
  try {
    const response = await apiClient.get(`/category/api/year`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch year range:", error);
    throw error;
  }
}

export async function getvarientByModel(id: string): Promise<ProductResponse> {
  try {
    const response = await apiClient.get(`/category/variants/model/${id}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch varients:", error);
    throw error;
  }
}

// New API functions for the updated endpoints
export async function getBrandsByType(
  typeId: string
): Promise<BrandsApiResponse> {
  try {
    const response = await apiClient.get(
      `/category/api/brands/brandByType/${typeId}`
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch brands by type:", error);
    throw error;
  }
}

export async function getModelsByBrand(
  brandId: string
): Promise<ProductResponse> {
  try {
    const response = await apiClient.get(
      `/category/api/model/brand/${brandId}`
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch models by brand:", error);
    throw error;
  }
}

export async function getVariantsByModel(
  modelId: string
): Promise<ProductResponse> {
  try {
    const response = await apiClient.get(`/category/variants/model/${modelId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch variants by model:", error);
    throw error;
  }
}

export async function editProduct(
  productId: string,
  data: FormData | any
): Promise<ProductResponse> {
  try {
    const response = await apiClient.put(
      `/category/products/v1/updateProduct/${productId}`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Failed to edit product:", error);
    throw error;
  }
}

export async function addProduct(
  productData: FormData | any
): Promise<ProductResponse> {
  try {
    const response = await apiClient.post(
      `/category/products/v1/createProduct`,
      productData
    );
    return response.data;
  } catch (error) {
    console.error("Failed to add product:", error);
    throw error;
  }
}

// dealer dashboard product add
// api/category/products/v1/createProductByDealer

export async function addProductByDealer(
  productData: FormData | any
): Promise<ProductResponse> {
  try {
    const response = await apiClient.post(
      `/category/products/v1/createProductByDealer`,
      productData
    );
    return response.data;
  } catch (error) {
    console.error("Failed to add product by dealer:", error);
    throw error;
  }
}

export async function editBulkProducts(
  formData: FormData
): Promise<ProductResponse> {
  try {
    const response = await apiClient.put(
      `/category/products/v1/bulk-edit`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to upload bulk products:", error);
    throw error;
  }
}

export async function uploadLogs(): Promise<ProductResponse> {
  try {
    const response = await apiClient.get(
      `/category/products/v1/get-all-productLogs`
    );
    return response.data;
  } catch (error) {
    console.error("Failed to upload logs:", error);
    throw error;
  }
}

// Content Management Bulk Upload APIs
export async function uploadBulkCategories(
  formData: FormData
): Promise<ProductResponse> {
  try {
    const response = await apiClient.post(
      `/category/api/category/bulk-upload/categories`,
      formData
    );
    return response.data;
  } catch (error) {
    console.error("Failed to upload bulk categories:", error);
    throw error;
  }
}

export async function uploadBulkSubCategories(
  formData: FormData
): Promise<ProductResponse> {
  try {
    const response = await apiClient.post(
      `/category/api/subCategory/bulk-upload/subcategories`,
      formData
    );
    return response.data;
  } catch (error) {
    console.error("Failed to upload bulk subcategories:", error);
    throw error;
  }
}

export async function uploadBulkBrands(
  formData: FormData
): Promise<ProductResponse> {
  try {
    const response = await apiClient.post(
      `/category/api/brands/bulk-upload/brands`,
      formData
    );
    return response.data;
  } catch (error) {
    console.error("Failed to upload bulk brands:", error);
    throw error;
  }
}

export async function uploadBulkModels(
  formData: FormData
): Promise<ProductResponse> {
  try {
    const response = await apiClient.post(
      `/category/api/model/bulk-upload/models`,
      formData
    );
    return response.data;
  } catch (error) {
    console.error("Failed to upload bulk models:", error);
    throw error;
  }
}

export async function uploadBulkVariants(
  formData: FormData
): Promise<ProductResponse> {
  try {
    const response = await apiClient.post(
      `/category/variants/bulk-upload/varients`,
      formData
    );
    return response.data;
  } catch (error) {
    console.error("Failed to upload bulk variants:", error);
    throw error;
  }
}

// Content Management Stats Functions
export async function getContentStats(): Promise<{
  categories: number;
  subcategories: number;
  brands: number;
  models: number;
  variants: number;
}> {
  // Fetch all content types in parallel and tolerate individual failures
  const results = await Promise.allSettled([
    getCategories(),
    getBrand(),
    getModels(),
    getvarient(),
    getSubcategories(),
  ]);

  const [categoriesRes, brandsRes, modelsRes, variantsRes, subcategoriesRes] = results;

  const safeCount = (res: any): number => {
    if (res?.status !== "fulfilled") return 0;
    const data = res.value?.data;
    if (Array.isArray(data)) return data.length;
    if (Array.isArray(data?.products)) return data.products.length;
    if (Array.isArray(data?.data)) return data.data.length;
    if (typeof data?.count === "number") return data.count;
    return 0;
  };

  return {
    categories: safeCount(categoriesRes),
    subcategories: safeCount(subcategoriesRes),
    brands: safeCount(brandsRes),
    models: safeCount(modelsRes),
    variants: safeCount(variantsRes),
  };
}

export async function getProductsByCategory(
  categoryId: string,
  product_type?: string,
  brand?: string
): Promise<ProductResponse> {
  try {
    let url = `/category/products/v1?categoryId=${categoryId}`;

    if (product_type) {
      url += `&product_type=${product_type}`;
    }
    if (brand) {
      url += `&brand=${brand}`;
    }

    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch category products:", error);
    throw error;
  }
}

// Assign dealers to a product
export async function assignDealersToProduct(
  productId: string,
  dealerData: {
    dealerData: Array<{
      dealers_Ref: string;
      quantity_per_dealer: number;
      dealer_margin: number;
      dealer_priority_override: number;
    }>;
  }
): Promise<ApiResponse<any>> {
  try {
    const response = await apiClient.post(
      `/category/products/v1/assign/dealerforProduct/${productId}`,
      dealerData
    );
    return response.data;
  } catch (error) {
    console.error("Failed to assign dealers to product:", error);
    throw error;
  }
}

export async function getPopularVehicles(
  vehicle_type: string
): Promise<ApiResponse<any>> {
  try {
    const params: Record<string, string> = { vehicle_type };
    const response = await apiClient.get(`/category/api/popularVehicle`, {
      params,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch popular vehicles:", error);
    throw error;
  }
}
export async function getRandomBanners(vehicleTypeId: string): Promise<ApiResponse<any>> {
  try {
    const res = await apiClient.get(
      `/category/api/banner/get/randomBanners?vehicle_type=${vehicleTypeId}`
    );
    return res.data;
  } catch (err) {
    console.error("Failed to fetch random banners:", err);
    throw err;
  }
}