import { createSlice } from "@reduxjs/toolkit";
import { Product } from "@/types/product-Types";
import { fetchProductByIdThunk } from "./productByIdThunks";

interface ProductState {
  product: Product | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProductState = {
  product: null,
  loading: false,
  error: null,
};

const productByIdSlice = createSlice({
  name: "productById",
  initialState,
  reducers: {
    clearProduct: (state) => {
      state.product = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductByIdThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductByIdThunk.fulfilled, (state, action) => {
        state.product = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchProductByIdThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch product";
      });
  },
});

export const { clearProduct } = productByIdSlice.actions;

// Selectors
export const selectCurrentProduct = (state: any) => state.productById.product;
export const selectProductLoading = (state: any) => state.productById.loading;
export const selectProductError = (state: any) => state.productById.error;

export default productByIdSlice.reducer;




