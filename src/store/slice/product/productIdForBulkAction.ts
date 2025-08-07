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

const productIdForBulkActionSlice = createSlice({
    name: "productIdBulkAction",
    initialState,
    reducers:{
        fetchProductIdForBulkActionRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        fetchProductIdForBulkActionSuccess: (state, action) => {
            state.loading = false;
            state.products = action.payload;
        },
        fetchProductIdForBulkActionFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
    }
})
export const {
    fetchProductIdForBulkActionRequest,
    fetchProductIdForBulkActionSuccess,
    fetchProductIdForBulkActionFailure,
} = productIdForBulkActionSlice.actions;
export default productIdForBulkActionSlice.reducer;