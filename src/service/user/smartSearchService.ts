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
    return response.data;
  } catch (error) {
    console.error("Failed to perform smart search:", error);
    throw error;
  }
}
  
  