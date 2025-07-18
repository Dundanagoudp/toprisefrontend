import { createSlice } from "@reduxjs/toolkit";
interface ProductState {
  products: any[];
  loading: boolean;
  livestatus: string;
  error: string | null;

}
const initialState: ProductState = {
  products: [],
  loading: false,
  livestatus: 'Pending',
  error: null,
};

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    fetchLiveStatus: (state, action) => {
        state.products = action.payload; 
        state.livestatus = action.payload.map((product: { liveStatus: string }) => product.liveStatus);
        state.loading = false;
        state.error = null;
    },
    fetchProductsSuccess: (state, action) => {
      state.products = action.payload;
      state.loading = false;
      state.error = null;
    },
    fetchProductsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { fetchLiveStatus, fetchProductsSuccess, fetchProductsFailure } = productSlice.actions;
export default productSlice.reducer;