import { ProductResponse } from "@/types/product-Types";
import apiClient from "@/apiClient";

export async function getProducts(): Promise<ProductResponse> {
   try {
    const response = await apiClient.get("/category/products/v1");
    return response.data;
  } catch (error) {
    console.error(" Failed to fetch products:", error);
    throw error; 
  }
}
