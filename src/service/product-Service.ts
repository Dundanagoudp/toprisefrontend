import { ProductResponse } from "@/types/product-Types";
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

export async function addProduct(productData: any): Promise<ProductResponse> {
  try {
    const response = await apiClient.post(`/category/products/v1/createProduct`, productData);
    return response.data;
  } catch (error) {
    console.error("Failed to add product:", error);
    throw error; 
  }
} 

export async function uploadBulkProducts(formData: FormData): Promise<ProductResponse> {
  try {
    const response = await apiClient.post(`/category/products/v1/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to upload bulk products:", error);
    throw error; 
  }
}
