import { createSlice } from "@reduxjs/toolkit";

interface ProductState {
  products: any[];
  loading: boolean;
  error: string | null;
}

const initialState: ProductState = {
  products: [],
  loading: false,
  error: null,
};

const productByIdSlice = createSlice({
  name: "productById",
  initialState,
  reducers: {
    fetchProductByIdRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchProductByIdSuccess: (state, action) => {
      state.products = action.payload;
      state.loading = false;
      state.error = null;
    },
    fetchProductByIdFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchProductByIdRequest,
  fetchProductByIdSuccess,
  fetchProductByIdFailure,
} = productByIdSlice.actions;

export default productByIdSlice.reducer;




