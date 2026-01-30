import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { 
  addToCartRequest, 
  addToCartSuccess, 
  addToCartFailure,
  setCartData,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
  setCartLoading,
  addToGuestCart,
  loadGuestCart,
  clearGuestCart,
  updateGuestCartQuantity,
  removeFromGuestCart
} from '@/store/slice/cart/cartSlice';
import { setPincode } from '@/store/slice/pincode/pincodeSlice';
import { addToCart, getCart, removeProductFromCart, increaseCartQuantity, decreaseCartQuantity, syncGuestCartToUser } from '@/service/user/cartService';
import { getProductById } from '@/service/product-Service';
import { Cart, CartItem } from '@/types/User/cart-Types';

export const useCart = () => {
  const dispatch = useAppDispatch();
  const { cartData, loading, error, itemCount, isGuestCart } = useAppSelector((state) => state.cart);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const pincode = useAppSelector((state) => state.pincode.value);

  // Load guest cart from local storage on mount if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      const storedCart = localStorage.getItem('guest_cart');
      if (storedCart) {
        try {
          const { items, pincode: savedPincode } = JSON.parse(storedCart);
          if (items && Array.isArray(items)) {
            dispatch(loadGuestCart({ items, pincode: savedPincode }));
            if (savedPincode) {
              dispatch(setPincode(savedPincode));
            }
          }
        } catch (e) {
          console.error("Failed to parse guest cart from local storage", e);
        }
      }
    }
  }, [isAuthenticated, dispatch]);

  const fetchCart = useCallback(async (overridePincode?: string) => {
    if (!isAuthenticated || !user?._id) {
      // If guest, we already have data in Redux from localStorage or initial load
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

  // Sync guest cart to user account after login
  useEffect(() => {
    const syncGuestCart = async () => {
      const storedCart = localStorage.getItem('guest_cart');
      
      if (isAuthenticated && user?._id && storedCart) {
        try {
          const parsedCart = JSON.parse(storedCart);
          const items = parsedCart.items;
          const savedPincode = parsedCart.pincode;

          if (items && Array.isArray(items) && items.length > 0) {
            dispatch(setCartLoading(true));
            const products = items.map((item: any) => ({
              productId: item.productId || item._id,
              quantity: item.quantity
            }));
            
            const pincodeToUse = savedPincode || pincode || '';
            
            const response = await syncGuestCartToUser(user._id, pincodeToUse, products);
            
            if (response.success) {
              // Clear guest cart from storage
              localStorage.removeItem('guest_cart');
              dispatch(clearGuestCart());
              
              // Update with server cart
              if (response.data && response.data.cart) {
                 dispatch(setCartData(response.data.cart));
              } else {
                 await fetchCart();
              }
            }
          } else {
            // If guest cart is empty in storage, just clean it up
            localStorage.removeItem('guest_cart');
            dispatch(clearGuestCart());
          }
        } catch (err) {
          console.error("Failed to sync guest cart:", err);
        } finally {
          dispatch(setCartLoading(false));
        }
      }
    };

    syncGuestCart();
  }, [isAuthenticated, user?._id, dispatch, fetchCart, pincode]);

  // Clear authenticated cart when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      const storedCart = localStorage.getItem('guest_cart');
      
      // If user logged out and no guest cart exists, clear authenticated cart
      // This prevents showing previous user's cart data after logout
      if (!storedCart && cartData && !isGuestCart) {
        dispatch(clearCart());
      }
    }
  }, [isAuthenticated, isGuestCart, dispatch, cartData]);

  const addItemToCart = useCallback(async (productId: string, quantity: number = 1) => {
    if (!isAuthenticated) {
      // Guest User Logic
      try {
        dispatch(addToCartRequest());
        
        // Fetch product details to construct CartItem
        const productResponse = await getProductById(productId);
        let productData: any = null;
        
        if (productResponse.data) {
             // Handle different response structures if needed (similar to ViewProduct)
             const data: any = productResponse.data;
             if (data.products && Array.isArray(data.products) && data.products.length > 0) {
                 productData = data.products[0];
             } else if (Array.isArray(data) && data.length > 0) {
                 productData = data[0];
             } else if (data._id) {
                 productData = data;
             }
        }

        if (!productData) {
            throw new Error("Product details not found");
        }

        // Construct CartItem
        const price = productData.selling_price || 0;
        const mrp = productData.mrp_with_gst || 0;
        const gst_percentage = productData.gst_percentage || "0";
        
        const cartItem: CartItem = {
            _id: productData._id, // Use product ID as item ID for guest
            productId: productData._id,
            sku: productData.sku_code || '',
            product_name: productData.product_name,
            product_image: productData.images || [],
            quantity: quantity,
            selling_price: price,
            gst_percentage: String(gst_percentage),
            mrp: mrp,
            mrp_gst_amount: 0, // Simplified for guest
            total_mrp: mrp * quantity,
            gst_amount: 0, // Simplified
            product_total: price * quantity,
            totalPrice: price * quantity
        };

        dispatch(addToGuestCart(cartItem));
        
        // Update localStorage
        // We need to access the updated state, but we can't easily here.
        // So we'll read the current items from state (which might be stale in this closure) 
        // OR construct the new state manually to save.
        // Better: use a selector or just re-read store? React hooks don't allow accessing store directly easily without useStore.
        // Instead, we can assume the reducer works and we just append to what we know is in local storage or read from cartData if available.
        // BUT cartData in this scope is from the render cycle.
        
        // Let's rely on cartData from closure, but we need to handle the update.
        // Actually, we can just read the current localStorage, update it and save back.
        
        const currentStorage = localStorage.getItem('guest_cart');
        let currentItems: CartItem[] = [];
        let currentPincode = pincode;
        
        if (currentStorage) {
            try {
                const parsed = JSON.parse(currentStorage);
                currentItems = parsed.items || [];
                // currentPincode = parsed.pincode; // Keep existing pincode
            } catch(e) {}
        }
        
        // Check maximum quantity limit (10 per product)
        const existingItem = currentItems.find(item => item.productId === productId);
        const currentQty = existingItem?.quantity || 0;
        const newTotalQty = currentQty + quantity;
        
        if (newTotalQty > 10) {
            const maxAllowed = 10 - currentQty;
            if (currentQty > 0) {
                throw new Error(`You already have ${currentQty} of this item. Cannot add ${quantity} more (maximum 10 per product). You can add up to ${maxAllowed} more.`);
            } else {
                throw new Error(`Cannot add more than 10 of this item. Maximum quantity per product is 10.`);
            }
        }
        
        const existingIndex = currentItems.findIndex(item => item.productId === productId);
        if (existingIndex >= 0) {
            currentItems[existingIndex].quantity += quantity;
            currentItems[existingIndex].product_total = currentItems[existingIndex].quantity * currentItems[existingIndex].selling_price;
            currentItems[existingIndex].totalPrice = currentItems[existingIndex].product_total;
        } else {
            currentItems.push(cartItem);
        }
        
        localStorage.setItem('guest_cart', JSON.stringify({
            items: currentItems,
            pincode: pincode
        }));
        
        dispatch(addToCartSuccess({ items: currentItems } as any)); // reusing success action to turn off loading? No, addToGuestCart updates state.
        // Actually addToGuestCart updates the state, we just need to stop loading.
        dispatch(setCartLoading(false));
        
        return { success: true, cart: { items: currentItems } }; // Mock response
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to add item to guest cart';
        dispatch(addToCartFailure(errorMessage));
        throw err;
      }
    }

    try {
      dispatch(addToCartRequest());
      
      // Check maximum quantity limit (10 per product) before API call
      const existingItem = cartData?.items?.find(item => item.productId === productId);
      const currentQty = existingItem?.quantity || 0;
      const newTotalQty = currentQty + quantity;
      
      if (newTotalQty > 10) {
        const maxAllowed = 10 - currentQty;
        if (currentQty > 0) {
          const errorMessage = `You already have ${currentQty} of this item. Cannot add ${quantity} more (maximum 10 per product). You can add up to ${maxAllowed} more.`;
          dispatch(addToCartFailure(errorMessage));
          throw new Error(errorMessage);
        } else {
          const errorMessage = `Cannot add more than 10 of this item. Maximum quantity per product is 10.`;
          dispatch(addToCartFailure(errorMessage));
          throw new Error(errorMessage);
        }
      }
      
      // Make API call
      const response = await addToCart({ userId: user!._id, productId, quantity, pincode: pincode });
      
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
    if (!isAuthenticated) {
      // Guest Logic
      const storedCart = localStorage.getItem('guest_cart');
      if (storedCart) {
        try {
          const parsed = JSON.parse(storedCart);
          const items: CartItem[] = parsed.items || [];
          const itemIndex = items.findIndex(item => item.productId === productId || item._id === productId);
          
          if (itemIndex >= 0) {
            const currentQty = items[itemIndex].quantity;
            if (currentQty >= 10) {
              throw new Error('Maximum quantity of 10 reached for this product');
            }
            const newQuantity = Math.min(10, currentQty + 1);
            items[itemIndex].quantity = newQuantity;
            items[itemIndex].product_total = newQuantity * items[itemIndex].selling_price;
            items[itemIndex].totalPrice = items[itemIndex].product_total;
            
            // Update Redux
            dispatch(updateGuestCartQuantity({ itemId: productId, quantity: newQuantity }));
            
            // Update Local Storage
            parsed.items = items;
            localStorage.setItem('guest_cart', JSON.stringify(parsed));
            
            // Return updated structure mimicking API response
            return {
              success: true,
              data: {
                items: items,
                totalPrice: items.reduce((sum, item) => sum + item.product_total, 0),
                itemTotal: items.reduce((sum, item) => sum + item.quantity, 0)
              }
            };
          }
        } catch (e) {
          console.error("Failed to update guest cart", e);
        }
      }
      return;
    }

    if (!user?._id) {
      throw new Error('User not authenticated');
    }

    // Check maximum quantity limit (10 per product) before API call
    const existingItem = cartData?.items?.find(item => item.productId === productId);
    if (existingItem && existingItem.quantity >= 10) {
      throw new Error('Maximum quantity of 10 reached for this product');
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
  }, [dispatch, isAuthenticated, user?._id, cartData]);

  const decreaseItemQuantity = useCallback(async (productId: string) => {
    if (!isAuthenticated) {
      // Guest Logic
      const storedCart = localStorage.getItem('guest_cart');
      if (storedCart) {
        try {
          const parsed = JSON.parse(storedCart);
          const items: CartItem[] = parsed.items || [];
          const itemIndex = items.findIndex(item => item.productId === productId || item._id === productId);
          
          if (itemIndex >= 0) {
            const newQuantity = Math.max(1, items[itemIndex].quantity - 1);
            items[itemIndex].quantity = newQuantity;
            items[itemIndex].product_total = newQuantity * items[itemIndex].selling_price;
            items[itemIndex].totalPrice = items[itemIndex].product_total;
            
            // Update Redux
            dispatch(updateGuestCartQuantity({ itemId: productId, quantity: newQuantity }));
            
            // Update Local Storage
            parsed.items = items;
            localStorage.setItem('guest_cart', JSON.stringify(parsed));
            
            return {
              success: true,
              data: {
                items: items,
                totalPrice: items.reduce((sum, item) => sum + item.product_total, 0),
                itemTotal: items.reduce((sum, item) => sum + item.quantity, 0)
              }
            };
          }
        } catch (e) {
          console.error("Failed to update guest cart", e);
        }
      }
      return;
    }

    if (!user?._id) {
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
    if (!isAuthenticated) {
      // Guest Logic
      dispatch(removeFromGuestCart(productId));
      
      const storedCart = localStorage.getItem('guest_cart');
      if (storedCart) {
        try {
          const parsed = JSON.parse(storedCart);
          let items: CartItem[] = parsed.items || [];
          items = items.filter(item => item.productId !== productId && item._id !== productId);
          parsed.items = items;
          localStorage.setItem('guest_cart', JSON.stringify(parsed));
        } catch (e) {
          console.error("Failed to remove from guest cart storage", e);
        }
      }
      return;
    }

    if (!user?._id) {
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
    if (!isAuthenticated) {
        dispatch(clearGuestCart());
        localStorage.removeItem('guest_cart');
    } else {
        dispatch(clearCart());
    }
  }, [dispatch, isAuthenticated]);

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
