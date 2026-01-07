import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "./slice/auth/authSlice";
import productReducer from "./slice/product/productSlice";
import productLiveStatusReducer from "./slice/product/productLiveStatusSlice";
import orderReducer from "./slice/order/orderSlice";
import  orderByIdReducer from "./slice/order/orderByIdSlice";
import productByIdReducer from "./slice/product/productByIdSlice";
import dealerReducer from "./slice/dealer/dealer";
import contentReducer from "./slice/content/contentSlice"
import productIdForBulkActionReducer from './slice/product/productIdForBulkAction'
import cartReducer from "./slice/cart/cartSlice"
import searchReducer from "./slice/search/searchSlice"
import vehicleReducer from "./slice/vehicle/vehicleSlice"
import dealerProductByIdReducer from "./slice/dealer-product/dealerProductByIdSlice"
import pincodeReducer from "./slice/pincode/pincodeSlice"

const rootReducer = combineReducers({
  auth: authReducer,
  product: productReducer,
  productLiveStatus: productLiveStatusReducer,
  order: orderReducer,
  orderById: orderByIdReducer,
  productById: productByIdReducer,
  dealer: dealerReducer,
  content: contentReducer,
  productIdForBulkAction: productIdForBulkActionReducer,
  cart: cartReducer,
  search: searchReducer,
  vehicle: vehicleReducer,
  dealerProductById: dealerProductByIdReducer,
  pincode: pincodeReducer,
});

export default rootReducer;
