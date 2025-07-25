import { createSlice } from "@reduxjs/toolkit";
interface ProductState {
  products: any[];
  productDetails: any | null;
  loading: boolean;
  livestatus: string;
  error: string | null;
}
const initialState: ProductState = {
  products: [],
  productDetails: null,
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
    fetchProductDetailsSuccess: (state, action) => {
      state.productDetails = action.payload;
      state.loading = false;
      state.error = null;
    },
  },
});


export const selectProductById = (state: any, productId: string) =>
  state.product.products.find((product: any) => product._id === productId);

export const { fetchLiveStatus, fetchProductsSuccess, fetchProductsFailure, fetchProductDetailsSuccess } = productSlice.actions;
export default productSlice.reducer;