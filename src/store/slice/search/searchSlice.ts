import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SearchApiResponse, SearchErrorResponse, Product } from "@/types/User/Search-Types";

interface SearchState {
  query: string;
  results: Product[];
  loading: boolean;
  error: string | null;
  hasSearched: boolean;
  totalResults: number;
  searchMeta: {
    is_brand: boolean;
    is_model: boolean;
    is_variant: boolean;
    is_product: boolean;
  } | null;
}

const initialState: SearchState = {
  query: "",
  results: [],
  loading: false,
  error: null,
  hasSearched: false,
  totalResults: 0,
  searchMeta: null,
};

const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.query = action.payload;
    },
    
    searchRequest: (state, action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
      state.query = action.payload;
    },
    
    searchSuccess: (state, action: PayloadAction<SearchApiResponse>) => {
      state.loading = false;
      state.error = null;
      state.hasSearched = true;
      state.results = action.payload.results.products || [];
      state.totalResults = action.payload.results.products?.length || 0;
      state.searchMeta = {
        is_brand: action.payload.is_brand,
        is_model: action.payload.is_model,
        is_variant: action.payload.is_variant,
        is_product: action.payload.is_product,
      };
    },
    
    searchFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      state.hasSearched = true;
      state.results = [];
      state.totalResults = 0;
      state.searchMeta = null;
    },
    
    clearSearch: (state) => {
      state.query = "";
      state.results = [];
      state.loading = false;
      state.error = null;
      state.hasSearched = false;
      state.totalResults = 0;
      state.searchMeta = null;
    },
    
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

// Selectors
export const selectSearchQuery = (state: { search: SearchState }) => state.search.query;
export const selectSearchResults = (state: { search: SearchState }) => state.search.results;
export const selectSearchLoading = (state: { search: SearchState }) => state.search.loading;
export const selectSearchError = (state: { search: SearchState }) => state.search.error;
export const selectHasSearched = (state: { search: SearchState }) => state.search.hasSearched;
export const selectTotalResults = (state: { search: SearchState }) => state.search.totalResults;
export const selectSearchMeta = (state: { search: SearchState }) => state.search.searchMeta;

export const {
  setSearchQuery,
  searchRequest,
  searchSuccess,
  searchFailure,
  clearSearch,
  setLoading,
} = searchSlice.actions;

export default searchSlice.reducer; 