import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the product type
interface Product {
  id: string;
  image: string;
  name: string;
  category: string;
  subCategory: string;
  brand: string;
  productType: string;
  qcStatus: string;
  liveStatus: string;
}

interface ProductLiveStatusState {
  products: Product[];
  loading: boolean;
  error: string | null;
}

const initialState: ProductLiveStatusState = {
  products: [],
  loading: false,
  error: null,
};

const productLiveStatusSlice = createSlice({
  name: "productLiveStatus",
  initialState,
  reducers: {
 
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    // Fetch products with live status
    fetchProductsWithLiveStatus: (state, action: PayloadAction<Product[]>) => {
      state.products = action.payload;
      state.loading = false;
      state.error = null;
    },
    
    // Update a specific product's live status
    updateProductLiveStatus: (state, action: PayloadAction<{ id: string; liveStatus: string }>) => {
      const { id, liveStatus } = action.payload;
      const productIndex = state.products.findIndex(product => product.id === id);
      if (productIndex !== -1) {
        state.products[productIndex].liveStatus = liveStatus;
      }
    },
    
    // Filter products by live status
    getProductsByLiveStatus: (state, action: PayloadAction<string>) => {
      
    },
    
    // Set error state
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
    
    // Reset state
    resetState: (state) => {
      state.products = [];
      state.loading = false;
      state.error = null;
    },
  },
});

// Selectors
export const selectAllProducts = (state: { productLiveStatus: ProductLiveStatusState }) => 
  state.productLiveStatus.products;

export const selectProductsByLiveStatus = (state: { productLiveStatus: ProductLiveStatusState }, status: string) => 
  state.productLiveStatus.products.filter(product => product.liveStatus === status);

export const selectProductsLoading = (state: { productLiveStatus: ProductLiveStatusState }) => 
  state.productLiveStatus.loading;

export const selectProductsError = (state: { productLiveStatus: ProductLiveStatusState }) => 
  state.productLiveStatus.error;

export const {
  setLoading,
  fetchProductsWithLiveStatus,
  updateProductLiveStatus,
  getProductsByLiveStatus,
  setError,
  clearError,
  resetState,
} = productLiveStatusSlice.actions;

export default productLiveStatusSlice.reducer;
