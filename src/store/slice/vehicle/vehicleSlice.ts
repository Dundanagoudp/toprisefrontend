import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface VehicleState {
  vehicleType: "car" | "bike";
  typeId: string;
}

const vehicleTypeIds = {
  car: "68677819b4b3125a84f2b85c",
  bike: "68679c1b8450aff593d56fee"
};

const initialState: VehicleState = {
  vehicleType: "car",
  typeId: vehicleTypeIds.car,
};

const vehicleSlice = createSlice({
  name: "vehicle",
  initialState,
  reducers: {
    setVehicleType: (state, action: PayloadAction<"car" | "bike">) => {
      state.vehicleType = action.payload;
      state.typeId = vehicleTypeIds[action.payload];
    },
    toggleVehicleType: (state) => {
      const newType = state.vehicleType === "car" ? "bike" : "car";
      state.vehicleType = newType;
      state.typeId = vehicleTypeIds[newType];
    },
  },
});

// Selectors
export const selectVehicleType = (state: { vehicle: VehicleState }) => state.vehicle.vehicleType;
export const selectVehicleTypeId = (state: { vehicle: VehicleState }) => state.vehicle.typeId;

export const { setVehicleType, toggleVehicleType } = vehicleSlice.actions;

export default vehicleSlice.reducer;
