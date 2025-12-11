import { createAsyncThunk } from "@reduxjs/toolkit";
import { getDealerProductById, DealerProduct } from "@/service/dealer-products-service";

export const fetchDealerProductByIdThunk = createAsyncThunk<
  DealerProduct,
  string,
  { rejectValue: string }
>(
  "dealerProductById/fetchDealerProductById",
  async (productId, { rejectWithValue }) => {
    try {
      const productData = await getDealerProductById(productId);
      return productData;
    } catch (error: any) {
      console.error("Failed to fetch dealer product by ID:", error);
      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch dealer product details."
      );
    }
  }
);
