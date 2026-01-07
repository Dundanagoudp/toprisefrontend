import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PincodeValidationData {
  available: boolean;
  pincode: string;
  city: string;
  state: string;
  district: string;
  area: string;
  delivery_available: boolean;
  delivery_charges: number;
  borzo_standard: boolean;
  borzo_endOfDay: boolean;
  shipRocket_availability: boolean;
  estimated_delivery_days: number;
  cod_available: boolean;
  status: string;
  message: string;
}

interface PincodeState {
  value: string | null;
  data: PincodeValidationData | null;
  loading: boolean;
  error: string | null;
}

const initialState: PincodeState = {
  value: null,
  data: null,
  loading: false,
  error: null,
};

const pincodeSlice = createSlice({
  name: 'pincode',
  initialState,
  reducers: {
    setPincode(state, action: PayloadAction<string>) {
      state.value = action.payload;
      state.error = null;
    },
    setPincodeData(state, action: PayloadAction<PincodeValidationData>) {
      state.data = action.payload;
      state.error = null;
    },
    setPincodeLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setPincodeError(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.loading = false;
    },
    clearPincode(state) {
      state.value = null;
      state.data = null;
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  setPincode,
  setPincodeData,
  setPincodeLoading,
  setPincodeError,
  clearPincode
} = pincodeSlice.actions;

export default pincodeSlice.reducer;
