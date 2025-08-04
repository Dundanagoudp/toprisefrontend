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

export async function getCategories(): Promise<ProductResponse> {
  try {
    const response = await apiClient.get(`/category/api/category`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    throw error;
  }
}
export async function createCategory():Promise<any>{
  try{
    const response = await apiClient.post(`/category/`)
    return response.data
  }
  catch(err:any){
    console.error("Failed to create category:", err);
    throw err
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

export async function addProduct(productData:FormData | any): Promise<ProductResponse> {
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

export async function editBulkProducts(
  formData: FormData
): Promise<ProductResponse> {
  try {
    const response = await apiClient.put(`/category/products/v1/bulk-edit`, formData, {
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


export async function uploadLogs(
): Promise<ProductResponse> {
  try {
    const response = await apiClient.get(`/category/products/v1/get-all-productLogs`);
    return response.data;
  } catch (error) {
    console.error("Failed to upload logs:", error);
    throw error;
  }
}
