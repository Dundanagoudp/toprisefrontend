import { createSlice } from "@reduxjs/toolkit";


type TabType = 'Category' | 'Subcategory' | 'Model';

interface ContentState {
  content: any[];
  loading: boolean;
  error: string | null;
  ActiveTab: TabType;
}

const initialState: ContentState = {
  content: ['Category'],
  loading: false,
  error: null,
ActiveTab: 'Category',
};

const contentSlice = createSlice({
  name: "content",
  initialState,
  reducers: {
    fetchContentRequest: (state) => {
        state.loading = true;
        state.error = null;
    },
    fetchContentSuccess: (state, action) => {
      state.content = action.payload;
      state.loading = false;
      state.error = null;
    },
    fetchContentFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
       setActiveTab: (state, action: { payload: TabType }) => {
      state.ActiveTab = action.payload;
    }

  },
});

export const { fetchContentRequest, fetchContentSuccess, fetchContentFailure } = contentSlice.actions;
export default contentSlice.reducer;