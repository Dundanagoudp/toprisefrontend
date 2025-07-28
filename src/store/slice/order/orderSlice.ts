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

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    fetchOrdersRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchOrdersSuccess: (state, action) => {
      state.orders = action.payload;
      state.loading = false;
      state.error = null;
    },
    fetchOrdersFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchOrdersRequest,
  fetchOrdersSuccess,
  fetchOrdersFailure,
} = orderSlice.actions;
export default orderSlice.reducer;