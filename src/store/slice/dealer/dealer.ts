import { createSlice } from "@reduxjs/toolkit";


interface DealerState {
  dealers: any[];
  loading: boolean;
  error: string | null;
}

const initialState: DealerState = {
    dealers: [],
    loading: false,
    error: null,
};

const dealerSlice = createSlice({
  name: "dealer",
  initialState,
  reducers: {
    fetchDealersRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchDealersSuccess: (state, action) => {
      state.dealers = action.payload;
      state.loading = false;
      state.error = null;
    },
    fetchDealersFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchDealersRequest,
  fetchDealersSuccess,
  fetchDealersFailure,
} = dealerSlice.actions;

export default dealerSlice.reducer;