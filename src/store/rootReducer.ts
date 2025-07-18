import { combineReducers } from "@reduxjs/toolkit";
import authReducer from './slice/auth/authSlice';
import productReducer from './slice/product/productSlice';
import productLiveStatusReducer from './slice/product/productLiveStatusSlice';



const rootReducer = combineReducers({

    auth: authReducer,
    product: productReducer,
    productLiveStatus: productLiveStatusReducer
    

})

export default rootReducer