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

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated || !user?._id) {
      dispatch(clearCart());
      return;
    }

    try {
      dispatch(setCartLoading(true));
      const response = await getCart(user._id);
      if (response.success && response.data) {
        dispatch(setCartData(response.data));
      }
    } catch (err: any) {
      console.error('Failed to fetch cart:', err);
     
    } finally {
      dispatch(setCartLoading(false));
    }
  }, [dispatch, isAuthenticated, user?._id]);

  const addItemToCart = useCallback(async (productId: string, quantity: number = 1) => {
    if (!isAuthenticated || !user?._id) {
      throw new Error('User not authenticated');
    }

    try {
      dispatch(addToCartRequest());
      const response = await addToCart({ userId: user._id, productId, quantity });
      
      if (response.success && response.data) {
        dispatch(addToCartSuccess(response.data));
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to add item to cart');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to add item to cart';
      dispatch(addToCartFailure(errorMessage));
      throw err;
    }
  }, [dispatch, isAuthenticated, user?._id]);

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
