import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Cart, CartItem } from '@/types/User/cart-Types';

interface CartState {
  cartData: Cart | null;
  loading: boolean;
  error: string | null;
  itemCount: number;
  isGuestCart: boolean;
  guestPincode: string | null;
}

const initialState: CartState = {
  cartData: null,
  loading: false,
  error: null,
  itemCount: 0,
  isGuestCart: false,
  guestPincode: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCartRequest(state) {
      state.loading = true;
      state.error = null;
    },
    addToCartSuccess(state, action: PayloadAction<Cart>) {
      const itemsCount = action.payload.items?.length || 0;
  
      state.cartData = action.payload;
      state.loading = false;
      state.error = null;
      state.itemCount = itemsCount;
    },
    addToCartFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    setCartData(state, action: PayloadAction<Cart>) {
      state.cartData = action.payload;
      state.itemCount = action.payload.items?.length || 0;
      state.error = null;
    },
    updateCartItemQuantity(state, action: PayloadAction<{ itemId: string; quantity: number }>) {
      if (state.cartData) {
        const { itemId, quantity } = action.payload;
        const itemIndex = state.cartData.items.findIndex(item => item._id === itemId);
        if (itemIndex !== -1) {
          state.cartData.items[itemIndex].quantity = quantity;
          // Recalculate totals
          state.cartData.itemTotal = state.cartData.items.reduce((total, item) => total + item.quantity, 0);
          state.cartData.totalPrice = state.cartData.items.reduce((total, item) => total + item.product_total, 0);
        }
      }
    },
    removeFromCart(state, action: PayloadAction<string>) {
      if (state.cartData) {
        state.cartData.items = state.cartData.items.filter(item => item._id !== action.payload);
        state.itemCount = state.cartData.items.length;
        // Recalculate totals
        state.cartData.itemTotal = state.cartData.items.reduce((total, item) => total + item.quantity, 0);
        state.cartData.totalPrice = state.cartData.items.reduce((total, item) => total + item.product_total, 0);
      }
    },
    clearCart(state) {
      state.cartData = null;
      state.loading = false;
      state.error = null;
      state.itemCount = 0;
      state.isGuestCart = false;
      state.guestPincode = null;
    },
    setCartLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setGuestPincode(state, action: PayloadAction<string | null>) {
      state.guestPincode = action.payload;
    },
    addToGuestCart(state, action: PayloadAction<CartItem>) {
      state.isGuestCart = true;
      if (!state.cartData) {
        state.cartData = {
          items: [],
          totalPrice: 0,
          itemTotal: 0,
          _id: 'guest_cart',
          userId: 'guest',
          __v: 0,
          is_available: true,
          handlingCharge: 0,
          deliveryCharge: 0,
          gst_amount: 0,
          total_mrp: 0,
          total_mrp_gst_amount: 0,
          total_mrp_with_gst: 0,
          grandTotal: 0,
          success: true,
          message: 'Guest Cart',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      }
      
      const existingItemIndex = state.cartData.items.findIndex(
        item => item.productId === action.payload.productId
      );

      if (existingItemIndex !== -1) {
        state.cartData.items[existingItemIndex].quantity += action.payload.quantity;
        state.cartData.items[existingItemIndex].product_total = 
          state.cartData.items[existingItemIndex].quantity * state.cartData.items[existingItemIndex].selling_price;
      } else {
        state.cartData.items.push(action.payload);
      }
      
      state.itemCount = state.cartData.items.length;
      state.cartData.itemTotal = state.cartData.items.reduce((total, item) => total + item.quantity, 0);
      state.cartData.totalPrice = state.cartData.items.reduce((total, item) => total + item.product_total, 0);
    },
    updateGuestCartQuantity(state, action: PayloadAction<{ itemId: string; quantity: number }>) {
      if (state.cartData && state.isGuestCart) {
        const { itemId, quantity } = action.payload;
        // itemId matches item._id (which we set to productId for guest items typically) or productId directly
        const itemIndex = state.cartData.items.findIndex(item => item._id === itemId || item.productId === itemId);
        
        if (itemIndex !== -1) {
          state.cartData.items[itemIndex].quantity = quantity;
          state.cartData.items[itemIndex].product_total = quantity * state.cartData.items[itemIndex].selling_price;
          
          state.cartData.itemTotal = state.cartData.items.reduce((total, item) => total + item.quantity, 0);
          state.cartData.totalPrice = state.cartData.items.reduce((total, item) => total + item.product_total, 0);
        }
      }
    },
    removeFromGuestCart(state, action: PayloadAction<string>) {
      if (state.cartData && state.isGuestCart) {
        state.cartData.items = state.cartData.items.filter(
          item => item._id !== action.payload && item.productId !== action.payload
        );
        state.itemCount = state.cartData.items.length;
        state.cartData.itemTotal = state.cartData.items.reduce((total, item) => total + item.quantity, 0);
        state.cartData.totalPrice = state.cartData.items.reduce((total, item) => total + item.product_total, 0);
      }
    },
    clearGuestCart(state) {
      if (state.isGuestCart) {
        state.cartData = null;
        state.itemCount = 0;
        state.isGuestCart = false;
        state.guestPincode = null;
      }
    },
    loadGuestCart(state, action: PayloadAction<{ items: CartItem[], pincode: string | null }>) {
       state.isGuestCart = true;
       state.guestPincode = action.payload.pincode;
       state.cartData = {
          items: action.payload.items,
          totalPrice: action.payload.items.reduce((total, item) => total + item.product_total, 0),
          itemTotal: action.payload.items.reduce((total, item) => total + item.quantity, 0),
          _id: 'guest_cart',
          userId: 'guest',
          __v: 0,
          is_available: true,
          handlingCharge: 0,
          deliveryCharge: 0,
          gst_amount: 0,
          total_mrp: 0,
          total_mrp_gst_amount: 0,
          total_mrp_with_gst: 0,
          grandTotal: 0,
          success: true,
          message: 'Guest Cart',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
       };
       state.itemCount = action.payload.items.length;
    }
  },
});

export const { 
  addToCartRequest, 
  addToCartSuccess, 
  addToCartFailure,
  setCartData,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
  setCartLoading,
  setGuestPincode,
  addToGuestCart,
  updateGuestCartQuantity,
  removeFromGuestCart,
  clearGuestCart,
  loadGuestCart
} = cartSlice.actions;

export default cartSlice.reducer;
