import { createSlice } from "@reduxjs/toolkit";
import { DealerProduct } from "@/service/dealer-products-service";
import { fetchDealerProductByIdThunk } from "./dealerProductByIdThunks";

interface DealerProductState {
  product: DealerProduct | null;
  loading: boolean;
  error: string | null;
}

const initialState: DealerProductState = {
  product: null,
  loading: false,
  error: null,
};

const dealerProductByIdSlice = createSlice({
  name: "dealerProductById",
  initialState,
  reducers: {
    clearDealerProduct: (state) => {
      state.product = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDealerProductByIdThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDealerProductByIdThunk.fulfilled, (state, action) => {
        state.product = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchDealerProductByIdThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch dealer product";
      });
  },
});

export const { clearDealerProduct } = dealerProductByIdSlice.actions;

// Selectors
export const selectDealerProduct = (state: any) => state.dealerProductById.product;
export const selectDealerProductLoading = (state: any) => state.dealerProductById.loading;
export const selectDealerProductError = (state: any) => state.dealerProductById.error;

export default dealerProductByIdSlice.reducer;
