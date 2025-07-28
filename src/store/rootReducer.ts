import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "./slice/auth/authSlice";
import productReducer from "./slice/product/productSlice";
import productLiveStatusReducer from "./slice/product/productLiveStatusSlice";
import orderReducer from "./slice/order/orderSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  product: productReducer,
  productLiveStatus: productLiveStatusReducer,
  order: orderReducer,
});

export default rootReducer;
