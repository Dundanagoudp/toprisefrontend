import apiClient from "@/apiClient";
import { SearchApiResponse } from "@/types/User/Search-Types";

export async function smartSearch(
  query: string,
  type?: string,
  nameSortBy?: string,
  priceSortBy?: string,
  minPrice?: number,
  maxPrice?: number
): Promise<SearchApiResponse> {
  try {
    let url = `/subCategory/api/search/smart-search?query=${query}`;
    if (type) url += `&type=${type}`;
    if (nameSortBy) url += `&name_sort_by=${nameSortBy}`;
    if (priceSortBy) url += `&price_sort_by=${priceSortBy}`;
    if (minPrice) url += `&min_price=${minPrice}`;
    if (maxPrice) url += `&max_price=${maxPrice}`;

    const response = await apiClient.get(url);
    
    // Validate response data
    if (!response || !response.data) {
      throw new Error('Invalid response from smart search API');
    }
    
    return response.data;
  } catch (error) {
    console.error("Failed to perform smart search:", error);
    
    // Return a default response structure to prevent crashes
    return {
      success: false,
      searchQuery: query,
      is_brand: false,
      is_model: false,
      is_variant: false,
      is_product: false,
      data: {
        brand: null,
        model: null,
        variant: null,
        products: []
      }
    };
  }
}

export async function smartSearchWithCategory(
  query: string,
  category: string,
  nameSortBy?: string,
  priceSortBy?: string,
  minPrice?: number,
  maxPrice?: number
): Promise<SearchApiResponse> {
  try {
    let url = `/api/search/smart-search?query=${encodeURIComponent(query)}&category=${encodeURIComponent(category)}`;
    if (nameSortBy) url += `&name_sort_by=${nameSortBy}`;
    if (priceSortBy) url += `&price_sort_by=${priceSortBy}`;
    if (minPrice) url += `&min_price=${minPrice}`;
    if (maxPrice) url += `&max_price=${maxPrice}`;

    console.log('Smart search with category URL:', url);
    const response = await apiClient.get(url);
    
    // Validate response data
    if (!response || !response.data) {
      throw new Error('Invalid response from smart search with category API');
    }
    
    console.log('Smart search with category response:', response.data);
    return response.data;
  } catch (error) {
    console.error("Failed to perform smart search with category:", error);
    
    // Return a default response structure to prevent crashes
    return {
      success: false,
      searchQuery: query,
      is_brand: false,
      is_model: false,
      is_variant: false,
      is_product: false,
      data: {
        brand: null,
        model: null,
        variant: null,
        products: []
      }
    };
  }
}
  
  