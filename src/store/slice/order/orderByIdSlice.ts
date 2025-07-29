import { createSlice } from "@reduxjs/toolkit";

interface OrderState {
  orders: any[];
  loading: boolean;
  error: string | null;
}


const initialState: OrderState = {
  orders: [],
  loading: false,
  error: null,
};

const orderByIdSlice = createSlice({
  name: "orderById",
  initialState,
  reducers: {
    fetchOrderByIdRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchOrderByIdSuccess: (state, action) => {
      state.orders = action.payload;
      state.loading = false;
      state.error = null;
    },
    fetchOrderByIdFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { fetchOrderByIdRequest, fetchOrderByIdSuccess, fetchOrderByIdFailure } = orderByIdSlice.actions;
export default orderByIdSlice.reducer;