import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { 
  addToCartRequest, 
  addToCartSuccess, 
  addToCartFailure,
  setCartData,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
  setCartLoading
} from '@/store/slice/cart/cartSlice';
import { addToCart, getCart, removeProductFromCart, increaseCartQuantity, decreaseCartQuantity } from '@/service/user/cartService';
import { Cart } from '@/types/User/cart-Types';

export const useCart = () => {
  const dispatch = useAppDispatch();
  const { cartData, loading, error, itemCount } = useAppSelector((state) => state.cart);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const pincode = useAppSelector((state) => state.pincode.value);
  const fetchCart = useCallback(async (overridePincode?: string) => {
    if (!isAuthenticated || !user?._id) {
      dispatch(clearCart());
      return;
    }

    try {
      dispatch(setCartLoading(true));
      // Use override pincode if provided, otherwise fall back to Redux state
      const pincodeToUse = overridePincode || pincode || '';
      const response = await getCart(user._id, pincodeToUse);

      if (response.success && response.data) {

        dispatch(setCartData(response.data));
      }
    } catch (err: any) {
      console.error('Failed to fetch cart:', err);

    } finally {
      dispatch(setCartLoading(false));
    }
  }, [dispatch, isAuthenticated, user?._id, pincode]);

  const addItemToCart = useCallback(async (productId: string, quantity: number = 1) => {
    if (!isAuthenticated || !user?._id) {
      throw new Error('User not authenticated');
    }

    try {
      dispatch(addToCartRequest());
      
      // Make API call
      const response = await addToCart({ userId: user._id, productId, quantity, pincode: pincode });
      
      // Check if response indicates failure or non-serviceability
      // API can return: { success: true, cart: {...} } or { success: false, message: "..." }
      if (!response.success) {
        const errorMessage = response.message || 'Failed to add item to cart';
        dispatch(addToCartFailure(errorMessage));
        throw new Error(errorMessage);
      }
      
      // Check for serviceability error
      if ('serviceable' in response.data && response.data.serviceable === false) {
        const errorMessage = response.data?.message || 'Product not serviceable';
        dispatch(addToCartFailure(errorMessage));
        throw new Error(errorMessage);
      } else {
        // Extract the actual cart data from the response
        // API returns: { success: true, cart: { actual cart data } }

        const responseData: any = response.data;
        const cartData = responseData.cart || responseData as Cart;

        
        // Validate response structure
        if (!cartData || !cartData.items || !Array.isArray(cartData.items)) {

          dispatch(addToCartFailure("Invalid cart data received"));
          throw new Error("Invalid cart data received from server");
        }
        
        // Update Redux state with the full cart data from API
        dispatch(addToCartSuccess(cartData));
        
        return cartData;
      }
    } catch (err: any) {
 
      const errorMessage = err.message || 'Failed to add item to cart';
      dispatch(addToCartFailure(errorMessage));
      throw err;
    }
  }, [dispatch, isAuthenticated, user?._id, pincode]);

  const increaseItemQuantity = useCallback(async (productId: string) => {
    if (!isAuthenticated || !user?._id) {
      throw new Error('User not authenticated');
    }

    try {
      const response = await increaseCartQuantity(user._id, productId);
      if (response.success && response.data) {
        dispatch(setCartData(response.data));
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to increase item quantity');
      }
    } catch (err: any) {
      console.error('Failed to increase item quantity:', err);
      throw err;
    }
  }, [dispatch, isAuthenticated, user?._id]);

  const decreaseItemQuantity = useCallback(async (productId: string) => {
    if (!isAuthenticated || !user?._id) {
      throw new Error('User not authenticated');
    }

    try {
      const response = await decreaseCartQuantity(user._id, productId);
      if (response.success && response.data) {
        dispatch(setCartData(response.data));
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to decrease item quantity');
      }
    } catch (err: any) {
      console.error('Failed to decrease item quantity:', err);
      throw err;
    }
  }, [dispatch, isAuthenticated, user?._id]);

  const removeItemFromCart = useCallback(async (productId: string) => {
    if (!isAuthenticated || !user?._id) {
      return;
    }

    try {
      // Optimistically remove from UI
      dispatch(removeFromCart(productId));
      
      // Call API to remove from server
      await removeProductFromCart(productId);
    } catch (err: any) {
      console.error('Failed to remove item from cart:', err);
      // Revert the optimistic update by refetching cart
      await fetchCart();
    }
  }, [dispatch, isAuthenticated, user?._id, fetchCart]);

  const clearCartData = useCallback(() => {
    dispatch(clearCart());
  }, [dispatch]);

  return {
    cartData,
    loading,
    error,
    itemCount,
    fetchCart,
    addItemToCart,
    increaseItemQuantity,
    decreaseItemQuantity,
    removeItemFromCart,
    clearCartData,
  };
};
