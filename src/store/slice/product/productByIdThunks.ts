import { createAsyncThunk } from "@reduxjs/toolkit";
import { getProductById } from "@/service/product-Service";
import { Product } from "@/types/product-Types";

export const fetchProductByIdThunk = createAsyncThunk<
  Product,
  string,
  { rejectValue: string }
>(
  "productById/fetchProductById",
  async (productId, { rejectWithValue }) => {
    try {
      const response = await getProductById(productId);

      if (response.success && response.data) {
        // Handle both array and object responses
        const productData = response.data as unknown;

        // Try different response structures
        if (Array.isArray(productData) && productData.length > 0) {
          return productData[0] as Product;
        }

        // Handle object with products array
        const dataWithProducts = productData as { products?: Product[] };
        if (dataWithProducts.products && Array.isArray(dataWithProducts.products) && dataWithProducts.products.length > 0) {
          return dataWithProducts.products[0] as Product;
        }

        // Handle direct object response
        const directProduct = productData as Product;
        if (directProduct && typeof directProduct === 'object' && directProduct._id) {
          return directProduct;
        }

        return rejectWithValue("Product not found or invalid response structure");
      } else {
        return rejectWithValue("Product not found or invalid response structure");
      }
    } catch (error: any) {
      console.error("Failed to fetch product by ID:", error);
      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch product details."
      );
    }
  }
);
