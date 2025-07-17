import { createSlice } from "@reduxjs/toolkit";

interface AuthState {
  isAuthenticated: boolean;
  user: any; 
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: false,
  error: null,
};
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginRequest(state, action) {
            state.loading = true;
            state.error = null;
        },
        loginSuccess(state, action) {
            state.isAuthenticated = true;
            state.user = action.payload;
            state.loading = false;
            state.error = null;
        }
    }
})
export const { loginRequest, loginSuccess } = authSlice.actions;
export default authSlice.reducer;