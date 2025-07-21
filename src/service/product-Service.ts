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
export async function aproveProduct(productId: string): Promise<ProductResponse> {
  try {
    const response = await apiClient.patch(`/category/products/v1/approve/${productId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to approve product:", error);
    throw error; 
  }
}


export async function deactivateProduct(productId: string): Promise<ProductResponse> {
  try {
    const response = await apiClient.patch(`/category/products/v1/deactivate/${productId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to approve product:", error);
    throw error; 
  }
}

export async function getCategories(): Promise<ProductResponse> {
  try {
    const response = await apiClient.get(`/category/api/category`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    throw error; 
  }
}



export async function getSubCategories(): Promise<ProductResponse> {
  try {
    const response = await apiClient.get(`/subCategory/api/subCategory`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch categories:", error);
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




export async function getProductById(productId: string): Promise<ProductResponse> {
  try {
    const response = await apiClient.get(`/category/products/v1/get-ProductById/${productId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch product by ID:", error);
    throw error; 
  }
}