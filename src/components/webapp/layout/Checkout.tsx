"use client";

// Declare Razorpay type for TypeScript
declare global {
  interface Window {
    Razorpay: any;
  }
}

import {
  Package,
  FileText,
  CreditCard,
  Bell,
  User,
  Search,
  Trash2,
  Loader2,
  Plus,
  Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { paymentCreation } from "@/service/user/payment-service";
// Razorpay integration without react-razorpay package
import {
  addAddress,
  createOrders,
  getCart,
  removeProductFromCart,
  checkPincode,
  updateDeliveryType,
  increaseCartQuantity,
  decreaseCartQuantity,
} from "@/service/user/cartService";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { clearCart } from "@/store/slice/cart/cartSlice";
import { setPincode as setPincodeRedux } from "@/store/slice/pincode/pincodeSlice";
import { useToast as useGlobalToast } from "@/components/ui/toast";
import { getUserById, UpdateAddressRequest } from "@/service/user/userService";
import { Cart, CartItem, CartResponse } from "@/types/User/cart-Types";
import { ApiListResponse, AppUser } from "@/types/user-types";
import OrderConfirmationDialog from "@/service/user/PopUps/OrderPlaced";
import { useCart } from "@/hooks/use-cart";
import BillingAddressForm from "./BillingAddressForm";
import { StepProgressBar } from "@/components/common/StepProgressBar";
import type { Step } from "@/components/common/StepProgressBar";
import {
  prepareOrderBody,
  preparePaymentBody,
} from "../common/PaymentBodyType";
import { getOrderById } from "@/service/order-service";

export default function CheckoutPage() {
  const router = useRouter();
  const { cartData: cart, fetchCart, loading: cartLoading } = useCart();
  const { showToast } = useGlobalToast();
  const dispatch = useAppDispatch();
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOrderConfirmed, setIsOrderConfirmed] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [displayOrderId, setDisplayOrderId] = useState<string | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<any | null>(null);
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);

  // Steps: Address (0) -> Delivery (1) -> Review (2) -> Pay (3)
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Delivery type state - express delivery has two options: fast and regular
  const [deliveryType, setDeliveryType] = useState<
    "Standard" | "express-fast" | "express-regular"
  >("express-fast");
  const [pincode, setPincode] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    "COD" | "Prepaid"
  >("COD");
  const [pincodeData, setPincodeData] = useState<any>(null);
  const [checkingPincode, setCheckingPincode] = useState(false);
  const [expressAvailable, setExpressAvailable] = useState(false);
  const [isDeliveryValid, setIsDeliveryValid] = useState(false);
  const [deliveryError, setDeliveryError] = useState<string | null>(null);
  const [updatingQuantities, setUpdatingQuantities] = useState<Set<string>>(
    new Set()
  );
  const quantityUpdateTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;



// log the cart data




  // Load Razorpay dynamically
  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => {
        resolve(window.Razorpay);
      };
      script.onerror = () => {
        resolve(null);
      };
      document.body.appendChild(script);
    });
  };
  const checkoutSteps: Step[] = [
    { id: "address", label: "Address", icon: User },
    { id: "delivery", label: "Delivery", icon: Package },
    { id: "review", label: "Review", icon: FileText },
    { id: "pay", label: "Pay", icon: CreditCard },
  ];

  const getCompletedSteps = () => {
    const completed = [];
    for (let i = 0; i < currentStep; i++) {
      completed.push(i);
    }
    return completed;
  };

  const goToNextStep = () => {
    if (currentStep < checkoutSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < checkoutSteps.length) {
      setCurrentStep(stepIndex);
    }
  };

  // Pincode check (used in Delivery step)
  const handlePincodeCheck = async (autoPincode?: string) => {
    const pincodeToCheck = autoPincode || pincode;

    if (!pincodeToCheck || pincodeToCheck.length !== 6) {
      if (!autoPincode) {
        showToast("Please enter a valid 6-digit pincode", "error");
      }
      return;
    }

    setCheckingPincode(true);
    try {
      const response = await checkPincode(pincodeToCheck);
      if (response.success && response.data.available) {
        setPincodeData(response.data);
        setExpressAvailable(true);
        showToast(
          `express delivery available! Delivery charges`,
          "success"
        );
      } else {
        setExpressAvailable(false);
        setPincodeData(null);
        showToast("express delivery not available for this pincode", "error");
      }
    } catch (error) {
      console.error("Failed to check pincode:", error);
      showToast("Failed to check pincode availability", "error");
      setExpressAvailable(false);
      setPincodeData(null);
    } finally {
      setCheckingPincode(false);
    }
  };

  const handleDeliveryTypeSelect = async (
    type: "Standard" | "express-fast" | "express-regular"
  ) => {
    setDeliveryType(type);
    setDeliveryError(null); // Clear any previous errors

    if (type === "Standard") {
      // Standard delivery is disabled - coming soon
      setIsDeliveryValid(false);
      return;
    }

    // Validate express delivery options based on pincode data
    if (type === "express-fast") {
      if (pincodeData?.borzo_endOfDay === true) {
        setIsDeliveryValid(true);
      } else {
        setIsDeliveryValid(false);
        showToast("Fast delivery not available", "error");
        return; // Don't proceed with API call if not available
      }
    } else if (type === "express-regular") {
      if (pincodeData?.borzo_standard === true) {
        setIsDeliveryValid(true);
      } else {
        setIsDeliveryValid(false);
        showToast("No delivery available", "error");
        return; // Don't proceed with API call if not available
      }
    }

    if (cart?._id) {
      try {
        // Map the granular types to the API expected format
        const apiDeliveryType = type.startsWith("express") ? "express" : type;
        await updateDeliveryType(cart._id, apiDeliveryType);
        await fetchCart();
        // showToast(
        //   `Delivery type updated to ${type.replace("-", " ")}`,
        //   "success"
        // );
      } catch (error) {
        console.error("Failed to update delivery type:", error);
        setDeliveryError("Failed to update delivery type. Please try again.");
        setIsDeliveryValid(false); // Reset validity on error
      }
    }
  };

  const userId = useAppSelector((state) => state.auth.user?._id);
  const reduxPincode = useAppSelector((state) => state.pincode.value);

  const fetchData = async () => {
    if (!userId) {
      console.log("No userId available, skipping data fetch");
      return;
    }

    console.log("Fetching user and cart data for userId:", userId);
    setIsLoading(true);
    try {
      const [userResponse] = await Promise.all([getUserById(userId)]);
      console.log("User response:", userResponse);
      setUser(userResponse.data);
      // Only set selectedAddress if not already set (preserves user's selection)
      if (userResponse.data?.address && userResponse.data.address.length > 0) {
        if (!selectedAddress) {
          setSelectedAddress(userResponse.data.address[0]);
          console.log(
            "Auto-selected first address:",
            userResponse.data.address[0]
          );
        } else {
          console.log("Preserving existing selected address:", selectedAddress);
        }
      } else {
        console.log("No addresses found for user");
      }
      await fetchCart();
      console.log("Data fetch completed successfully");
    } catch (err) {
      console.error("Failed to fetch data:", err);
      showToast("Failed to fetch data", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async () => {
  
    try {
      if (isPlacingOrder) {
        console.log("Payment already in progress, ignoring click");
        return;
      }
      
      setIsPlacingOrder(true);
      if (!user || !cart || !selectedAddress) {
        showToast("Missing required data for payment", "error");
        return;
      }

      if (!cart.items || cart.items.length === 0) {
        console.log("Cart is empty");
        showToast("Your cart is empty. Please add items before placing an order.", "error");
        return;
      }

      if (!cart.itemTotal || cart.itemTotal <= 0) {
        console.log("No items in cart");
        showToast("Your cart is empty. Please add items before placing an order.", "error");
        return;
      }

      const paymentBody = preparePaymentBody(
        user,
        cart,
        deliveryType,
        selectedAddress,
        pincodeData
      );

      // Log the complete request body for Online Payment


      const responseData = await paymentCreation(paymentBody);
      console.log("API raw response:", responseData);
      // Handle API failure
      if (!responseData.success) {
        throw new Error(
          "Failed to create payment order",
          responseData.message || "Payment order creation failed"
        );
      }
      if (responseData.success) {
        console.log("Payment order created successfully:", responseData.data);
      }

      const order = responseData.data;
      console.log("Payment order response:", order);

      if (!order?.razorpayOrderId) {
        throw new Error("Invalid response: Missing Razorpay order ID");
      }

      const options = {
        key: RAZORPAY_KEY_ID || "",
        amount:
          order?.payment?.amount || Math.round((cart.grandTotal || 0) * 100), // Convert to paise
        currency: "INR",
        name: "Toprise",
        description: `Payment for order - ₹${Math.round(cart.grandTotal || 0)}`,
        order_id: order.razorpayOrderId,

        prefill: {
          name: user.username || "",
          email: user.email || "",
          contact: user.phone_Number || "",
        },

        notes:
          `${selectedAddress.street}, ${selectedAddress.city}, ${selectedAddress.state}`.trim(),

        theme: {
          color: "#C72920",
        },

        handler: function (response: any) {
          console.log("Payment successful:", response);
          showToast(
            "Payment successful! Your order is being processed.",
            "success"
          );

          // Order already created by backend, webhook will verify payment
          finalizeOrder(order, "Payment completed successfully!");
        },

        modal: {
          ondismiss: function () {
            console.log("Payment modal dismissed");
            showToast(
              "Payment cancelled. Your order was not placed.",
              "warning"
            );
          },
        },
      };

      // Load Razorpay dynamically and open payment modal
      const Razorpay = (await loadRazorpay()) as any;
      if (!Razorpay) {
        throw new Error("Failed to load Razorpay");
      }

      const rzpay = new Razorpay(options);
      rzpay.open();
      
      // Start polling for payment status from backend
      if (order?._id) {
        pollPaymentStatus(order._id);
      }
    } catch (err: any) {
      console.error("Payment error:", err);
      showToast(`Payment failed: ${err.message}`, "error");
    }
  };

  useEffect(() => {
    fetchData();
    console.log(" response of cart", cart);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      quantityUpdateTimeouts.current.forEach((timeout) => {
        clearTimeout(timeout);
      });
      quantityUpdateTimeouts.current.clear();
      
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, []);

  // Auto-check pincode when address is selected
  useEffect(() => {
    if (selectedAddress?.pincode && selectedAddress.pincode !== pincode) {
      // Update local state
      setPincode(selectedAddress.pincode);
      // Update Redux state
      dispatch(setPincodeRedux(selectedAddress.pincode));
      // Check delivery availability
      handlePincodeCheck(selectedAddress.pincode);
    }
  }, [selectedAddress, pincode, dispatch]);

  // Re-fetch cart when Redux pincode changes
  useEffect(() => {
    if (reduxPincode && userId) {
      fetchCart();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduxPincode, userId]);

  // Auto-select default delivery type when pincode data is available
  useEffect(() => {
    if (pincodeData && selectedAddress) {
      // Automatically select express-fast delivery type when pincode data is available
      handleDeliveryTypeSelect("express-fast");
    }
  }, [pincodeData, selectedAddress]);

  const handleProceed = async () => {
    console.log("=== HANDLE PROCEED DEBUG ===");
    console.log("Current step:", currentStep);
    console.log("User:", user);
    console.log("Cart:", cart);
    console.log("Selected address:", selectedAddress);
    console.log("Is placing order:", isPlacingOrder);

    if (currentStep === 0) {
      // Address step -> must have address selected before going to Delivery
      if (!selectedAddress) {
        showToast("Please select an address for your order", "error");
        return;
      }
      goToNextStep();
    } else if (currentStep === 1) {
      // Delivery step
      // Block Standard delivery since it's coming soon
      await fetchCart();
      

      if (deliveryType === "Standard") {
        setDeliveryError(
          "Standard delivery coming soon - not available at this time"
        );
        return;
      }
      // ensure delivery option is valid when applicable
      if (!isDeliveryValid) {
        setDeliveryError("Selected delivery option is not available");
        return;
      }
      setDeliveryError(null); // Clear any errors when proceeding
      goToNextStep();
    } else if (currentStep === 2) {
      // Review step -> Payment
      // Check cart availability before proceeding
      const hasUnavailableItems = cart?.items?.some((item: any) => !item.is_available);
  
      if (hasUnavailableItems) {
        showToast("Some items in your cart are no longer available", "error");
        await fetchCart();
      }
      goToNextStep();
    } else if (currentStep === 3) {
      // Payment step -> Place order
      await handlePlaceOrder();
    }
  };

  const handlePlaceOrder = async (isAfterPayment = false) => {
    console.log("=== HANDLE PLACE ORDER DEBUG ===");
    console.log("Payment method:", selectedPaymentMethod);
    console.log("Is after payment:", isAfterPayment);

    if (isPlacingOrder) {
      console.log("Order placement already in progress, ignoring click");
      return;
    }

    if (!user || !cart) {
      console.log("Missing user or cart data");
      showToast("User or cart data is not available", "error");
      return;
    }

    if (!cart.items || cart.items.length === 0) {
      console.log("Cart is empty");
      showToast("Your cart is empty. Please add items before placing an order.", "error");
      return;
    }

    if (!cart.itemTotal || cart.itemTotal <= 0) {
      console.log("No items in cart");
      showToast("Your cart is empty. Please add items before placing an order.", "error");
      return;
    }

    if (!selectedAddress) {
      console.log("No address selected");
      showToast("Please select an address for your order", "error");
      return;
    }

    // For online payments, redirect to payment processing
    if (selectedPaymentMethod === "Prepaid" && !isAfterPayment) {
      console.log("Online payment selected, redirecting to payment processing");
      await handlePayment();
      return;
    }

    // If payment is Prepaid and after payment, order is already created during payment
    // if (selectedPaymentMethod === 'Prepaid' && isAfterPayment) {
    //   console.log("Prepaid payment completed, order already created");
    //   showToast("Order placed successfully! Payment completed.", "success");

    //   // Navigate to shop page after successful order placement
    //   setTimeout(() => {
    //     router.push('/');
    //   }, 2000);
    //   return;
    // }

    // Only create order for COD payments
    // passing the isAvailable flag to the order body

    setIsPlacingOrder(true);
    const orderBody = prepareOrderBody(
      user,
      cart,
      deliveryType,
      selectedPaymentMethod,
      selectedAddress,
      pincodeData,
      
    );

    try {
      console.log("=== MAKING API CALL (COD) ===");
      console.log("Calling createOrders with body:", orderBody);
      const response = await createOrders(orderBody);
      console.log("Order creation response:", response);

      // Only proceed if response is successful
      if (response.success) {
        setOrderId(response.data._id);
        setDisplayOrderId(response.data.orderId);
        setIsOrderConfirmed(true);

        finalizeOrder(response.data, "Order placed successfully!");

        showToast("Order placed successfully!", "success");

        // Navigate to shop page after successful order placement
        // setTimeout(() => {
        //   router.push("/");
        // }, 2000);
      } else {
        throw new Error(response.message || "Order creation failed");
      }
    } catch (error: any) {
      if (error.response?.status === 403) {
        showToast("Access denied. Please check your login status.", "error");
      } else if (error.response?.status === 400) {
        showToast(
          "Invalid order data. Please check your cart and try again.",
          "error"
        );
      } else if (error.response?.status === 500) {
        showToast("Server error. Please try again later.", "error");
      } else {
        showToast(
          `Failed to create order: ${error.message || "Unknown error"}`,
          "error"
        );
      }
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // const removeItem = async (productId: string) => {
  //   try {
  //     const data = {
  //       userId: userId,
  //       productId: productId,
  //     }
  //     const response = await removeProductFromCart(data);
  //     console.log("Item removed from cart", response);

  //     await fetchCart();
  //     showToast("Item removed from cart", "success");
  //   } catch(error) {
  //     console.error("Failed to remove item:", error);
  //     showToast("Failed to remove item from cart", "error");
  //   }
  // }
  const removeItem = async (productId: string) => {
    try {
      const data = {
        userId: userId,
        productId: productId,
      };
      const response = await removeProductFromCart(data);
      console.log("Item removed from cart", response);

      await fetchCart(); // Refresh the cart data
      showToast("Item removed from cart", "success");

      const updatedCart = await getCart(userId, pincode || ''); // Get the very latest cart
      if (!updatedCart.data.items || updatedCart.data.items.length === 0) {
        showToast(
          "Your cart is empty. Redirecting you to the shop.",
          "warning"
        );
        router.push("/");
      }
    } catch (error) {
      console.error("Failed to remove item:", error);
      showToast("Failed to remove item from cart", "error");
    }
  };
  const updateItemQuantity = async (productId: string, quantity: number) => {
    if (!userId) {
      showToast("Unable to update quantity: user not available", "error");
      return;
    }

    try {
      await fetchCart(); // optimistic refresh - replace with API call for production
    } catch (err) {
      console.error("Failed to update quantity:", err);
      showToast("Failed to update quantity", "error");
    }
  };
  const changeItemQuantity = async (
    productId: string,
    newQty: number,
    setLocalLoading?: (v: boolean) => void
  ) => {
    if (newQty < 1) return;
    if (setLocalLoading) setLocalLoading(true);

    try {
      await updateItemQuantity(productId, newQty);
      showToast("Quantity updated", "success");
      // Ensure fresh data
      await fetchCart();
    } catch (err) {
      console.error("Error changing quantity:", err);
      showToast("Could not update quantity", "error");
    } finally {
      if (setLocalLoading) setLocalLoading(false);
    }
  };

  const handleIncreaseQuantity = async (productId: string) => {
    setUpdatingQuantities((prev) => new Set(prev).add(productId));
    try {
      await increaseCartQuantity(userId!, productId);
      await fetchCart();

      // Update delivery type after quantity change
      if (cart?._id) {
        const apiDeliveryType = deliveryType.startsWith("express")
          ? "express"
          : deliveryType;
        await updateDeliveryType(cart._id, apiDeliveryType);
        await fetchCart();
      }
    } catch (error) {
      console.error("Failed to increase quantity:", error);
    } finally {
      setUpdatingQuantities((prev) => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const handleDecreaseQuantity = async (
    productId: string,
    currentQuantity: number
  ) => {
    if (currentQuantity <= 1) return;
    setUpdatingQuantities((prev) => new Set(prev).add(productId));
    try {
      await decreaseCartQuantity(userId!, productId);
      await fetchCart();

      // Update delivery type after quantity change
      if (cart?._id) {
        const apiDeliveryType = deliveryType.startsWith("express")
          ? "express"
          : deliveryType;
        await updateDeliveryType(cart._id, apiDeliveryType);
        await fetchCart();
      }
    } catch (error) {
      console.error("Failed to decrease quantity:", error);
    } finally {
      setUpdatingQuantities((prev) => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  
  //   if (newQuantity < 1 || newQuantity > 99 || !userId) return;

  //   // Clear any existing timeout for this product
  //   const existingTimeout = quantityUpdateTimeouts.current.get(productId);
  //   if (existingTimeout) {
  //     clearTimeout(existingTimeout);
  //   }

  //   // Set a timeout to debounce the API call
  //   const timeout = setTimeout(async () => {
  //     setUpdatingQuantities(prev => new Set(prev).add(productId));

  //     try {
  //       const currentItem = cart?.items.find(item => item.productId === productId);
  //       if (!currentItem) return;

  //       const difference = newQuantity - currentItem.quantity;
  //       let originalQuantity = currentItem.quantity;

  //       try {
  //         if (difference > 0) {
  //           // Need to increase - make API calls sequentially
  //           for (let i = 0; i < difference; i++) {
  //             await increaseCartQuantity(userId, productId);
  //           }
  //         } else if (difference < 0) {
  //           // Need to decrease - make API calls sequentially
  //           for (let i = 0; i < Math.abs(difference); i++) {
  //             await decreaseCartQuantity(userId, productId);
  //           }
  //         }

  //         await fetchCart();
  //       } catch (apiError) {
  //         console.error("API call failed during quantity update:", apiError);

  //         // Try to revert to original quantity if possible
  //         try {
  //           const currentCart = await getCart(userId);
  //           const currentItemInCart = currentCart.data.items.find((item: any) => item.productId === productId);

  //           if (currentItemInCart) {
  //             const revertDifference = originalQuantity - currentItemInCart.quantity;
  //             if (revertDifference > 0) {
  //               for (let i = 0; i < revertDifference; i++) {
  //                 await increaseCartQuantity(userId, productId);
  //               }
  //             } else if (revertDifference < 0) {
  //               for (let i = 0; i < Math.abs(revertDifference); i++) {
  //                 await decreaseCartQuantity(userId, productId);
  //               }
  //             }
  //             await fetchCart();
  //           }
  //         } catch (revertError) {
  //           console.error("Failed to revert quantity:", revertError);
  //         }

  //         showToast("Failed to update quantity", "error");
  //       }
  //     } catch (error) {
  //       console.error("Failed to update quantity:", error);
  //       showToast("Failed to update quantity", "error");
  //     } finally {
  //       setUpdatingQuantities(prev => {
  //         const newSet = new Set(prev);
  //         newSet.delete(productId);
  //         return newSet;
  //       });
  //     }
  //   }, 500); // 500ms debounce

  //   quantityUpdateTimeouts.current.set(productId, timeout);
  // };
  const onSubmit = async (data: UpdateAddressRequest) => {
    try {
      const response = await addAddress(userId, data);

      showToast("Address added successfully", "success");

      // Refresh user data and auto-select the new address
      try {
        const userResponse = await getUserById(userId);
        setUser(userResponse.data);
        if (
          userResponse.data?.address &&
          userResponse.data.address.length > 0
        ) {
          const newAddress =
            userResponse.data.address[userResponse.data.address.length - 1];
          setSelectedAddress(newAddress);
        }
      } catch (error) {
        console.error("Failed to refresh user data:", error);
      }
    } catch (error) {
      showToast("Failed to add address", "error");
    }
  };

  const finalizeOrder = (
    responseData: any,
    successMessage = "Order placed successfully!"
  ) => {
    if (isOrderConfirmed) {
      console.log("Order already confirmed, ignoring duplicate call");
      return;
    }
    
    // Stop polling if active
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
      pollingInterval.current = null;
    }

    dispatch(clearCart());

    try {
      localStorage.removeItem("cart"); // adapt key if different
    } catch (e) {}

    showToast(successMessage, "success");
    setOrderId(responseData._id);
    setDisplayOrderId(responseData.orderId);
    setIsOrderConfirmed(true);

    // setTimeout(() => {
    //   router.push("/");
    // }, 1500);
  };

  const pollPaymentStatus = async (orderId: string) => {
    // Clear any existing interval
    if (pollingInterval.current) clearInterval(pollingInterval.current);

    pollingInterval.current = setInterval(async () => {
      try {
        const response = await getOrderById(orderId);
        // getOrderById returns { data: Order[] } based on search results
        // but typically getById should return single object.
        // Checking data[0] if array, or data if object.
        const orderData = Array.isArray(response.data) ? response.data[0] : response.data;
        
        if (orderData) {
          const status = (orderData.status || "").toLowerCase();
          // Check for success statuses
          if (["confirmed", "processing", "paid"].includes(status)) {
             console.log("Payment confirmed via polling");
             finalizeOrder(orderData, "Payment confirmed by server!");
          }
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 3000); // Poll every 3 seconds

    // Stop polling after 5 minutes
    setTimeout(() => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
        pollingInterval.current = null;
      }
    }, 5 * 60 * 1000);
  };

  return (
    <div className="bg-gray-50">
      <StepProgressBar
        steps={checkoutSteps}
        currentStep={currentStep}
        completedSteps={getCompletedSteps()}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Step Content */}
          <div className="lg:col-span-2">
            {/* STEP 0: Address (was previously step 1) */}
            {currentStep === 0 && (
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                  Delivery Address
                </h2>

                <BillingAddressForm
                  onSubmit={onSubmit}
                  onAddressSelect={setSelectedAddress}
                  selectedAddressId={selectedAddress?._id}
                  showSelection={true}
                  isLoading={isLoading}
                />

                <div className="flex justify-between mt-6">
                  <Button
                    variant="outline"
                    onClick={() => router.push("/")}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    ← Back to Shop
                  </Button>
                  {/* <Button
                    onClick={handleProceed}
                    className="bg-[#C72920] hover:bg-[#A0221A] text-white"
                  >
                    Continue to Delivery
                  </Button> */}
                </div>

                {/* Quick preview of selected address while still on Address step */}
                {selectedAddress && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800 font-medium">
                      Selected Address Preview:
                    </p>
                    <p className="text-sm text-green-700">
                      {selectedAddress.nick_name || "Address"} —{" "}
                      {selectedAddress.street}, {selectedAddress.city},{" "}
                      {selectedAddress.state} - {selectedAddress.pincode}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* STEP 1: Delivery (was previously step 0) */}
            {currentStep === 1 && (
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                  Select Delivery Type
                </h2>

                {/* Pincode status - auto-checked from selected address */}
                {checkingPincode && (
                  <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                      <span className="text-sm text-blue-800">
                        Checking delivery availability for pincode {pincode}...
                      </span>
                    </div>
                  </div>
                )}

                {pincodeData && !checkingPincode && (
                  <div
                    className={`mb-4 p-4 rounded-lg border ${
                      expressAvailable
                        ? "bg-green-50 border-green-200"
                        : "bg-red-50 border-red-200"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Package
                        className={`w-5 h-5 ${
                          expressAvailable ? "text-green-600" : "text-red-600"
                        }`}
                      />
                      <span
                        className={`font-medium ${
                          expressAvailable ? "text-green-800" : "text-red-800"
                        }`}
                      >
                        {expressAvailable
                          ? "Express Delivery Available!"
                          : "Express Delivery Not Available"}
                      </span>
                    </div>
                    <div
                      className={`text-sm ${
                        expressAvailable ? "text-green-700" : "text-red-700"
                      } space-y-1`}
                    >
                      <p>
                        <strong>Location:</strong> {pincodeData.city},{" "}
                        {pincodeData.state}
                      </p>
                      {expressAvailable && (
                        <>
                          {/* Only show delivery charges if cart has items and item total > 0 */}
                          {cart?.items && cart.items.length > 0 && cart?.itemTotal && cart.itemTotal > 0 && (
                            <p>
                              <strong>Delivery Charges:</strong>{" "}
                              {cart?.deliveryCharge === 0 || !cart?.deliveryCharge ? "Free Delivery" : `₹${cart.deliveryCharge}`}
                            </p>
                          )}
                          {/* <p>
                            <strong>Estimated Delivery:</strong>{" "}
                            {pincodeData.estimated_delivery_days} days
                          </p> */}
                          {/* <p>
                            <strong>COD Available:</strong>{" "}
                            {pincodeData.cod_available ? "Yes" : "No"}
                          </p> */}
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Delivery Error Display */}
                {deliveryError && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-red-600 text-xs font-bold">
                          !
                        </span>
                      </div>
                      <p className="text-sm text-red-800 font-medium">
                        {deliveryError}
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Choose Delivery Type
                  </h3>

                  {/* Express Delivery Section */}
                  <div className="border-2 rounded-lg p-4 transition-all border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded-full border-2 ${
                            deliveryType.startsWith("express")
                              ? "border-[#C72920] bg-[#C72920]"
                              : "border-gray-300"
                          }`}
                        >
                          {deliveryType.startsWith("express") && (
                            <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            Express Delivery
                          </h4>
                          <p className="text-sm text-gray-600">
                            {expressAvailable
                              ? "Fast delivery options"
                              : "Express delivery not available in your selected pincode"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Express Delivery Sub-options */}
                    {expressAvailable && (
                      <div className="ml-7 space-y-2">
                        <div
                          className={`border rounded-lg p-3 cursor-pointer transition-all ${
                            deliveryType === "express-regular"
                              ? "border-[#C72920] bg-red-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() =>
                            handleDeliveryTypeSelect("express-regular")
                          }
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-medium text-gray-900">
                                Fast Delivery
                              </h5>
                              <p className="text-sm text-gray-600">
                                Super fast delivery
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-gray-900">
                                {cart?.deliveryCharge === 0 || !cart?.deliveryCharge ? "Free Delivery" : `₹${cart.deliveryCharge}`}
                              </p>
                              <p className="text-sm text-gray-600">
                                Arrival in 2-3 hours
                              </p>
                            </div>
                          </div>
                        </div>

                        <div
                          className={`border rounded-lg p-3 cursor-pointer transition-all ${
                            deliveryType === "express-fast"
                              ? "border-[#C72920] bg-red-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() =>
                            handleDeliveryTypeSelect("express-fast")
                          }
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-medium text-gray-900">
                                Regular Delivery
                              </h5>
                              <p className="text-sm text-gray-600">
                                Express regular delivery
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-gray-900">
                                {cart?.deliveryCharge === 0 || !cart?.deliveryCharge ? "Free Delivery" : `₹${cart.deliveryCharge}`}
                              </p>
                              <p className="text-sm text-gray-600">
                                 {new Date().getHours() >= 18 ? "Arrival Next Day" : "Arrival EOD or Next Day"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {!expressAvailable && pincodeData && (
                      <div className="ml-7 mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-800">
                          Express delivery is not available in your selected
                          pincode
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Standard Delivery Section */}
                  <div
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      deliveryType === "Standard"
                        ? "border-[#C72920] bg-red-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => {
                      handleDeliveryTypeSelect("Standard");
                      showToast("Standard delivery coming soon!", "warning");
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded-full border-2 ${
                            deliveryType === "Standard"
                              ? "border-[#C72920] bg-[#C72920]"
                              : "border-gray-300"
                          }`}
                        >
                          {deliveryType === "Standard" && (
                            <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            Standard Delivery
                          </h4>
                          <p className="text-sm text-gray-600">
                            Regular delivery service
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">₹0</p>
                        <p className="text-sm text-gray-600">5-7 days</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-end mt-8">
                  {deliveryType === "Standard" ? (
                    <Button
                      variant="outline"
                      onClick={() => goToStep(0)}
                      className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      ← Back to Address
                    </Button>
                  ) : (
                    <div></div> // Empty div for spacing
                  )}

                  <div className="flex flex-col items-end gap-2">
                    {/* <Button
                      onClick={() => goToStep(2)}
                      className="bg-[#C72920] hover:bg-[#A0221A] text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
                      disabled={deliveryType === 'Standard' || (deliveryType.startsWith('express') && !expressAvailable)}
                    >
                      Continue to Review
                    </Button> */}
                    {deliveryType === "Standard" && (
                      <p className="text-xs text-red-600 text-right">
                        Standard delivery coming soon - not available at this
                        time
                      </p>
                    )}
                    {deliveryType.startsWith("express") &&
                      !expressAvailable && (
                        <p className="text-xs text-red-600 text-right">
                          Express delivery not available for your selected
                          pincode
                        </p>
                      )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Review */}
            {currentStep === 2 && (
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                  Review Your Order
                </h2>

                <div className="space-y-6">
                  <div className="border-b pb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                      Delivery Type
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">
                            {deliveryType === "Standard"
                              ? "Standard Delivery"
                              : deliveryType === "express-fast"
                              ? "Express Fast Delivery"
                              : deliveryType === "express-regular"
                              ? "Express Regular Delivery"
                              : deliveryType}
                          </p>
                          <p className="text-sm text-gray-600">
                            {deliveryType === "Standard"
                              ? "Estimated delivery: 2-3 hours"
                              : deliveryType === "express-fast"
                              ? "Estimated delivery: Arrival EOD  or Next Day"
                              : deliveryType === "express-regular"
                              ? "Estimated delivery: 2-3 hours"
                              : "Estimated delivery: 2-3 hours"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            {deliveryType === "Standard" || cart?.deliveryCharge === 0 || !cart?.deliveryCharge
                              ? "Free Delivery"
                              : `₹${cart.deliveryCharge}`}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => goToStep(1)}
                      >
                        Change Delivery Type
                      </Button>
                    </div>
                  </div>

                  <div className="border-b pb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                      Delivery Address
                    </h3>
                    {selectedAddress && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="font-medium text-gray-900">
                          {selectedAddress.nick_name || "Selected Address"}
                        </p>
                        <p className="text-gray-600">
                          {selectedAddress.street}
                        </p>
                        <p className="text-gray-600">
                          {selectedAddress.city}, {selectedAddress.state} -{" "}
                          {selectedAddress.pincode}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => goToStep(0)}
                        >
                          Change Address
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="border-b pb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                      Order Items ({cart?.items?.length ?? 0} items)
                    </h3>
                    {cart?.items && cart.items.length > 0 && (
                      <div className="space-y-4">
                        {cart.items.map((item: any) => (
                          <div
                            key={item._id}
                            className={`flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 border rounded-lg ${
                              item.is_available === false
                                ? "opacity-50 bg-gray-50 border-gray-300"
                                : "border-gray-200"
                            }`}
                          >
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-md shrink-0 mx-auto sm:mx-0">
                              {item.product_image && item.product_image[0] && (
                                <img
                                  src={item.product_image[0]}
                                  alt={item.product_name}
                                  className="w-full h-full object-cover rounded-md"
                                />
                              )}
                            </div>
                            <div className="flex-1 min-w-0 text-center sm:text-left">
                              <h4 className="font-medium text-gray-900 text-sm sm:text-base">
                                {item.product_name}
                              </h4>
                              <p className="text-xs sm:text-sm text-gray-500">
                                SKU: {item.sku}
                              </p>
                              {item.is_available === false && (
                                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800">
                                  Product cannot be delivered to selected address
                                </div>
                              )}
                              <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                                <span className="text-xs sm:text-sm text-gray-500 font-medium">
                                  Qty:
                                </span>
                                <div className="flex items-center border border-gray-300 rounded-md bg-white h-7 sm:h-8">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-gray-100 rounded-l-md border-r border-gray-300"
                                    onClick={() =>
                                      handleDecreaseQuantity(
                                        item.productId,
                                        item.quantity
                                      )
                                    }
                                    disabled={
                                      item.quantity <= 1 ||
                                      updatingQuantities.has(item.productId) ||
                                      item.is_available === false
                                    }
                                  >
                                    {updatingQuantities.has(item.productId) ? (
                                      <Loader2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 animate-spin" />
                                    ) : (
                                      <Minus className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                    )}
                                  </Button>
                                  <span className="w-8 sm:w-10 h-7 sm:h-8 flex items-center justify-center text-xs sm:text-sm font-medium">
                                    {item.quantity}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-gray-100 rounded-r-md border-l border-gray-300"
                                    onClick={() =>
                                      handleIncreaseQuantity(item.productId)
                                    }
                                    disabled={
                                      updatingQuantities.has(item.productId) ||
                                      item.is_available === false
                                    }
                                  >
                                    {updatingQuantities.has(item.productId) ? (
                                      <Loader2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 animate-spin" />
                                    ) : (
                                      <Plus className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center justify-between sm:justify-end gap-3 sm:flex-col sm:items-end sm:gap-1">
                              <div className="text-center sm:text-right flex-1 sm:flex-initial">
                                {item.mrp && item.mrp > item.selling_price ? (
                                  <>
                                    <div className="flex items-center gap-1 justify-center sm:justify-end">
                                      {/* <span className="text-xs sm:text-sm text-gray-500 line-through">
                                        ₹{(item.mrp / item.quantity).toFixed(2)}
                                      </span> */}
                                      <span className="font-medium text-gray-900 text-sm sm:text-base">
                                        ₹
                                        {(
                                          Math.round(item.totalPrice  || 0)
                                        ).toFixed(2)}
                                      </span>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                      <span className="line-through">
                                        ₹{(item.mrp / item.quantity).toFixed(2)}
                                      </span>{" "}
                                      ₹{(item.selling_price / item.quantity).toFixed(2)} each
                                    </p>
                                  </>
                                ) : (
                                  <>
                                    <p className="font-medium text-gray-900 text-sm sm:text-base">
                                      ₹
                                      {(
                                        item.selling_price * item.quantity
                                      ).toFixed(2)}
                                    </p>
                                    <p className="text-xs sm:text-sm text-gray-500">
                                      ₹{item.selling_price} each
                                    </p>
                                  </>
                                )}
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 shrink-0"
                                onClick={() => removeItem(item.productId)}
                              >
                                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                      Payment Method
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <RadioGroup
                        value={selectedPaymentMethod}
                        onValueChange={(value) =>
                          setSelectedPaymentMethod(value as "COD" | "Prepaid")
                        }
                        className="space-y-3"
                      >
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="COD" id="COD" />
                          <Label
                            htmlFor="cod"
                            className="flex-1 cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <Package className="w-5 h-5 text-green-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  Cash on Delivery (COD)
                                </p>
                                <p className="text-sm text-gray-600">
                                  Pay when your order is delivered
                                </p>
                              </div>
                            </div>
                          </Label>
                        </div>

                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="Prepaid" id="Prepaid" />
                          <Label
                            htmlFor="online"
                            className="flex-1 cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <CreditCard className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  Online Payment
                                </p>
                                <p className="text-sm text-gray-600">
                                  Pay securely with card, UPI, or net banking
                                </p>
                              </div>
                            </div>
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Payment & Confirmation */}
            {currentStep === 3 && (
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                  Payment & Confirmation
                </h2>

                <div className="space-y-6">
                  <div className="border-b pb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                      Payment Method
                    </h3>
                    <div
                      className={`${
                        selectedPaymentMethod === "COD"
                          ? "bg-green-50 border-green-200"
                          : "bg-blue-50 border-blue-200"
                      } border p-4 rounded-lg`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-12 h-12 ${
                            selectedPaymentMethod === "COD"
                              ? "bg-green-100"
                              : "bg-blue-100"
                          } rounded-full flex items-center justify-center`}
                        >
                          {selectedPaymentMethod === "COD" ? (
                            <Package className="w-6 h-6 text-green-600" />
                          ) : (
                            <CreditCard className="w-6 h-6 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {selectedPaymentMethod === "COD"
                              ? "Cash on Delivery (COD)"
                              : "Online Payment"}
                          </p>
                          <p className="text-sm text-gray-600">
                            {selectedPaymentMethod === "COD"
                              ? `Pay ₹${Math.round(
                                  cart?.grandTotal || 0
                                )} when your order is delivered`
                              : "Pay securely online with card, UPI, or net banking"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-b pb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                      Order Summary
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          Item Total ({cart?.items?.length ?? 0} items):
                        </span>
                        <span className="font-medium">
                          ₹{Math.round(cart?.itemTotal  || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">GST:</span>
                        <span className="font-medium">
                          ₹{Math.round(cart?.gst_amount || 0)}
                        </span>
                      </div>
                      {/* Only show delivery charge if cart has items and item total > 0 */}
                      {cart?.items && cart.items.length > 0 && cart?.itemTotal && cart.itemTotal > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            Delivery Charge ({cart?.delivery_type || "Standard"}):
                          </span>
                          <span className="font-medium">
                            {cart?.deliveryCharge === 0 || !cart?.deliveryCharge ? "Free Delivery" : `₹${Math.round(cart.deliveryCharge)}`}
                          </span>
                        </div>
                      )}
                      <hr className="border-gray-300" />
                      <div className="flex justify-between text-lg font-semibold">
                        <span className="text-gray-900">Total (Inclusive of GST):</span>
                        <span className="text-gray-900">
                          ₹{Math.round(cart?.grandTotal || 0)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                      Delivery Address
                    </h3>
                    {selectedAddress && (
                      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                        <p className="font-medium text-gray-900">
                          {selectedAddress.nick_name || "Delivery Address"}
                        </p>
                        <p className="text-gray-600">
                          {selectedAddress.street}
                        </p>
                        <p className="text-gray-600">
                          {selectedAddress.city}, {selectedAddress.state} -{" "}
                          {selectedAddress.pincode}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Bell className="w-5 h-5 text-yellow-600" />
                      <p className="text-sm text-yellow-800 font-medium">
                        Please confirm your order details before proceeding
                      </p>
                    </div>
                    <p className="text-xs text-yellow-700 mt-1">
                      By clicking "Confirm & Place Order", you agree to our
                      terms and conditions.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Order Summary & Selected Address Preview */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Your Order
                </h2>

                {cart?.items && cart.items.length > 0 && (
                  <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                    {cart.items.map((item: any) => (
                      <div
                        key={item._id}
                        className={`p-2 border-b last:border-b-0 ${
                          item.is_available === false
                            ? "opacity-50 bg-gray-50 border-gray-200"
                            : "border-gray-100"
                        }`}
                      >
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-md shrink-0">
                              {item.product_image && item.product_image[0] && (
                                <img
                                  src={item.product_image[0]}
                                  alt={item.product_name}
                                  className="w-full h-full object-cover rounded-md"
                                />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                                {item.product_name}
                              </h4>
                              {item.is_available === false && (
                                <p className="text-xs text-red-600 mt-1">
                                  Not deliverable
                                </p>
                              )}
                              <div className="text-xs text-gray-600">
                                {item.mrp && item.mrp > item.selling_price ? (
                                  <div className="flex items-center gap-1">
                                    <span className="text-gray-500 line-through">
                                      ₹{(item.mrp / item.quantity).toFixed(2)}
                                    </span>
                                    <span className="font-medium text-gray-900">
                                      ₹
                                      {(
                                        item.selling_price / item.quantity
                                      ).toFixed(2)}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="font-medium text-gray-900">
                                    ₹
                                    {(
                                      item.selling_price * item.quantity
                                    ).toFixed(2)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs text-gray-500 font-medium">
                              Qty:
                            </span>
                            <div className="flex items-center border border-gray-300 rounded-md bg-white h-6">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 hover:bg-gray-50 rounded-l border-r border-gray-200"
                                onClick={() =>
                                  handleDecreaseQuantity(
                                    item.productId,
                                    item.quantity
                                  )
                                }
                                disabled={
                                  item.quantity <= 1 ||
                                  updatingQuantities.has(item.productId) ||
                                  item.is_available === false
                                }
                              >
                                {updatingQuantities.has(item.productId) ? (
                                  <Loader2 className="h-2 w-2 animate-spin" />
                                ) : (
                                  <Minus className="h-2 w-2" />
                                )}
                              </Button>
                              <span className="w-6 sm:w-8 h-6 flex items-center justify-center text-xs font-medium">
                                {item.quantity}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 hover:bg-gray-50 rounded-r border-l border-gray-200"
                                onClick={() =>
                                  handleIncreaseQuantity(item.productId)
                                }
                                disabled={
                                  updatingQuantities.has(item.productId) ||
                                  item.is_available === false
                                }
                              >
                                {updatingQuantities.has(item.productId) ? (
                                  <Loader2 className="h-2 w-2 animate-spin" />
                                ) : (
                                  <Plus className="h-2 w-2" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">
                      Item Total ({cart?.items?.length ?? 0} items):
                    </span>
                    <span className="font-medium">
                      ₹{Math.round(cart?.itemTotal || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">GST:</span>
                    <span className="font-medium">
                      ₹{Math.round(cart?.gst_amount || 0)}
                    </span>
                  </div>
                  {/* Only show delivery charge if cart has items and item total > 0 */}
                  {cart?.items && cart.items.length > 0 && cart?.itemTotal && cart.itemTotal > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">
                        Delivery Charge ({cart?.delivery_type || "Standard"}):
                      </span>
                      <span className="font-medium">
                        {cart?.deliveryCharge === 0 || !cart?.deliveryCharge ? "Free Delivery" : `₹${Math.round(cart.deliveryCharge)}`}
                      </span>
                    </div>
                  )}
                  <hr className="border-gray-300" />
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span className="text-gray-900">Total (Inclusive of GST):</span>
                    <span className="text-gray-900">
                      ₹{Math.round(cart?.grandTotal || 0)}
                    </span>
                  </div>
                </div>

                {/* Show selected address preview in right column at all times */}
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Deliver to
                  </h3>
                  {selectedAddress ? (
                    <div className="p-3 bg-green-50 border border-green-200 rounded">
                      <p className="text-sm font-medium text-green-800">
                        {selectedAddress.nick_name || "Address"}
                      </p>
                      <p className="text-xs text-green-700 truncate">
                        {selectedAddress.street}
                      </p>
                      <p className="text-xs text-green-700">
                        {selectedAddress.city}, {selectedAddress.state} -{" "}
                        {selectedAddress.pincode}
                      </p>
                      <div className="mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => goToStep(0)}
                        >
                          Change
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-gray-50 border border-gray-100 rounded text-sm text-gray-500">
                      No address selected
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  {(currentStep === 1 ||
                    currentStep === 2 ||
                    currentStep === 3) && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={goToPreviousStep}
                    >
                      {currentStep === 1 ? "Back to Address" : "Back"}
                    </Button>
                  )}

                  {/* {process.env.NODE_ENV === 'development' && (
                    <div className="text-xs text-gray-500 p-2 bg-gray-100 rounded">
                      <div>Step: {currentStep}</div>
                      <div>User: {user ? '✓' : '✗'}</div>
                      <div>Cart: {cart ? '✓' : '✗'}</div>
                      <div>Address: {selectedAddress ? '✓' : '✗'}</div>
                      <div>Placing: {isPlacingOrder ? '✓' : '✗'}</div>
                    </div>
                  )}
                   */}
                  <Button
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-3 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                    onClick={() => {
                      if (!isPlacingOrder) {
                        handleProceed();
                      }
                    }}
                    disabled={
                      isPlacingOrder ||
                      isOrderConfirmed ||
                      isLoading ||
                      cartLoading ||
                      !cart ||
                      !cart.items ||
                      cart.items.length === 0 ||
                      !cart.itemTotal ||
                      cart.itemTotal <= 0 ||
                      !cart.grandTotal ||
                      cart.grandTotal <= 0 ||
                      (currentStep === 0 && !selectedAddress) ||
                      (currentStep === 3 &&
                        (!user || !cart || !selectedAddress)) ||
                      ((currentStep === 1 || currentStep === 2) &&
                        !isDeliveryValid) 
                    }
                  >
                    {(currentStep === 1 || currentStep === 2) &&
                      deliveryType === "Standard" && (
                        <span className="text-xs block mb-1">
                          Standard delivery coming soon - not available at this
                          time
                        </span>
                      )}
                    {(currentStep === 1 || currentStep === 2) &&
                      deliveryType.startsWith("express") &&
                      !expressAvailable && (
                        <span className="text-xs block mb-1">
                          Express delivery not available for your selected
                          pincode
                        </span>
                      )}
             
                    {isPlacingOrder ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Placing Order...
                      </>
                    ) : currentStep === 0 ? (
                      "Continue to Delivery"
                    ) : currentStep === 1 ? (
                      "Proceed To Review"
                    ) : currentStep === 2 ? (
                      "Proceed To Payment"
                    ) : (
                      "Confirm & Place Order"
                    )}
                  </Button>

                  {/* Show message when cart is empty or loading */}
                  {(!isPlacingOrder && currentStep === 3 && (
                    (!cart || !cart.items || cart.items.length === 0 || !cart.itemTotal || cart.itemTotal <= 0) ? (
                      <div className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200 mt-2">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4" />
                          <span>Your cart is empty. Add items before placing an order.</span>
                        </div>
                      </div>
                    ) : (isLoading || cartLoading) ? (
                      <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded border border-blue-200 mt-2">
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Loading your cart data...</span>
                        </div>
                      </div>
                    ) : null
                  ))}

                  {!isPlacingOrder &&
                    currentStep === 3 &&
                    (!user || !cart || !selectedAddress !|| !user.username || !user.phone_Number || !user.email) && (
                      <div className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
                        {!user && <div>• User data not loaded</div>}
                        {!cart && <div>• Cart data not loaded</div>}
                        {!selectedAddress && <div>• No address selected</div>}
                        {!user.username && <div>• Username not loaded</div>}
                        {!user.phone_Number && <div>• Phone number not loaded</div>}
                        {!user.email && <div>• Email not loaded</div>}
                        {/* <div className="mt-2 flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => {
                              if (userId) fetchData();
                            }}
                          >
                            Retry
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => window.location.reload()}
                          >
                            Refresh Page
                          </Button>
                        </div> */}
                      </div>
                    )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <OrderConfirmationDialog
        open={isOrderConfirmed}
        onClose={() => setIsOrderConfirmed(false)}
        orderId={orderId || ""}
        displayOrderId={displayOrderId || ""}
      />
    </div>
  );
}

