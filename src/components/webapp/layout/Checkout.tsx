"use client";
import {
  Package,
  FileText,
  CreditCard,
  Bell,
  User,
  Search,
  Trash2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  addAddress,
  createOrders,
  getCart,
  removeProductFromCart,
  checkPincode,
  updateDeliveryType,
} from "@/service/user/cartService";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { clearCart } from "@/store/slice/cart/cartSlice";
import { useToast as useGlobalToast } from "@/components/ui/toast";
import { getUserById } from "@/service/user/userService";
import { Cart, CartItem, CartResponse } from "@/types/User/cart-Types";
import { ApiListResponse, AppUser } from "@/types/user-types";
import OrderConfirmationDialog from "@/service/user/PopUps/OrderPlaced";
import { useCart } from "@/hooks/use-cart";
import BillingAddressForm, { AddressFormValues } from "./BillingAddressForm";
import { StepProgressBar } from "@/components/common/StepProgressBar";
import type { Step } from "@/components/common/StepProgressBar";

export default function CheckoutPage() {
  const router = useRouter();
  const { cartData: cart, fetchCart } = useCart();
  const { showToast } = useGlobalToast();
  const dispatch = useAppDispatch();
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOrderConfirmed, setIsOrderConfirmed] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<any | null>(null);

  // Steps: Address (0) -> Delivery (1) -> Review (2) -> Pay (3)
  const [currentStep, setCurrentStep] = useState(0); 
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Delivery type state - express delivery has two options: fast and regular
  const [deliveryType, setDeliveryType] = useState<'Standard' | 'express-fast' | 'express-regular'>('express-fast');
  const [pincode, setPincode] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'cod' | 'online'>('cod');
  const [pincodeData, setPincodeData] = useState<any>(null);
  const [checkingPincode, setCheckingPincode] = useState(false);
  const [expressAvailable, setExpressAvailable] = useState(false);
  const [deliveryError, setDeliveryError] = useState<string | null>(null);

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
      if (response.success && response.data.delivery_available) {
        setPincodeData(response.data);
        setExpressAvailable(true);
        showToast(`express delivery available! Delivery charges: ₹${response.data.delivery_charges}`, "success");
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

  const handleDeliveryTypeSelect = async (type: 'Standard' | 'express-fast' | 'express-regular') => {
    setDeliveryType(type);
    setDeliveryError(null); // Clear any previous errors

    if (type === 'Standard') {
      // Standard delivery is disabled - error will be shown in UI
      return;
    }

    // Clear error for valid express delivery selections
    setDeliveryError(null);

    if (cart?._id) {
      try {
        // Map the granular types to the API expected format
        const apiDeliveryType = type.startsWith('express') ? 'express' : type;
        await updateDeliveryType(cart._id, apiDeliveryType);
        await fetchCart();
        showToast(`Delivery type updated to ${type.replace('-', ' ')}`, "success");
      } catch (error) {
        console.error("Failed to update delivery type:", error);
        setDeliveryError("Failed to update delivery type. Please try again.");
      }
    }
  };

  const userId = useAppSelector((state) => state.auth.user?._id);

  const fetchData = async () => {
    if (!userId) {
      console.log("No userId available, skipping data fetch");
      return;
    }
    
    console.log("Fetching user and cart data for userId:", userId);
    setIsLoading(true);
    try {
      const [userResponse] = await Promise.all([ getUserById(userId) ]);
      console.log("User response:", userResponse);
      setUser(userResponse.data);
      if (userResponse.data?.address && userResponse.data.address.length > 0) {
        setSelectedAddress(userResponse.data.address[0]);
        console.log("Auto-selected first address:", userResponse.data.address[0]);
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

  useEffect(() => {
    fetchData();
  }, [userId, fetchCart]);

  // Auto-check pincode when address is selected
  useEffect(() => {
    if (selectedAddress?.pincode && selectedAddress.pincode !== pincode) {
      setPincode(selectedAddress.pincode);
      handlePincodeCheck(selectedAddress.pincode);
    }
  }, [selectedAddress]);

  // Use currently selected delivery type in the order body
  const prepareOrderBody = (user: AppUser, cart: Cart) => {
    const address = selectedAddress || user.address?.[0] || {};

    const orderBody = {
      orderId: `ORD${Math.floor(Math.random() * 100000)}`,
      orderType: "Online",
      orderSource: "Web",
      order_Amount: (Math.round(cart.total_mrp || 0)).toString(),
      skus: cart.items.map((item) => ({
        sku: item.sku || "",
        quantity: item.quantity,
        productId: item.productId || item._id,
        productName: item.product_name,
        mrp: item.mrp || item.selling_price || 0,
        mrp_gst_amount: item.mrp_gst_amount || 0,
        gst_percentage: item.gst_percentage || "0",
        gst_amount: item.gst_amount || 0,
        product_total: item.product_total || item.selling_price * item.quantity,
        totalPrice: item.totalPrice || item.selling_price * item.quantity,
      })),
      customerDetails: {
        userId: user._id,
        name: user.username || "",
        phone: user.phone_Number || "",
        address: `${address.street || ""}, ${address.city || ""}, ${address.state || ""}, ${address.country || ""}`.trim(),
        pincode: address.pincode || "",
        email: user.email || "",
      },
      paymentType: selectedPaymentMethod === 'cod' ? 'COD' : 'Online',
      delivery_type: deliveryType.startsWith('express') ? 'express' : deliveryType.toLowerCase(), // map granular types to API format
      deliveryCharges: deliveryType.startsWith('express') ? (pincodeData?.delivery_charges || cart.deliveryCharge || 0) : (cart.deliveryCharge || 0),
      GST: cart.total_mrp_gst_amount || 0,
    };
    return orderBody;
  };

  const handleProceed = async () => {
    console.log("=== HANDLE PROCEED DEBUG ===");
    console.log("Current step:", currentStep);
    console.log("User:", user);
    console.log("Cart:", cart);
    console.log("Selected address:", selectedAddress);
    console.log("Is placing order:", isPlacingOrder);
    
    if (currentStep === 0) { // Address step -> must have address selected before going to Delivery
      if (!selectedAddress) {
        showToast("Please select an address for your order", "error");
        return;
      }
      goToNextStep();
    } else if (currentStep === 1) { // Delivery step
      // Block Standard delivery since it's coming soon
      if (deliveryType === 'Standard') {
        setDeliveryError("Standard delivery coming soon - not available at this time");
        return;
      }
      // if express selected ensure PIN checked/available when applicable
      if (deliveryType.startsWith('express') && !expressAvailable) {
        setDeliveryError("Express delivery not available for selected pincode");
        return;
      }
      setDeliveryError(null); // Clear any errors when proceeding
      goToNextStep();
    } else if (currentStep === 2) { // Review step -> Payment
      goToNextStep();
    } else if (currentStep === 3) { // Payment step -> Place order
      await handlePlaceOrder();
    }
  };

  const handlePlaceOrder = async () => {
    console.log("=== HANDLE PLACE ORDER DEBUG ===");
    console.log("User:", user);
    console.log("Cart:", cart);
    console.log("Selected address:", selectedAddress);
    console.log("Is placing order:", isPlacingOrder);
    
    if (isPlacingOrder) {
      console.log("Order placement already in progress, ignoring click");
      return;
    }
    
    if (!user || !cart) {
      console.log("Missing user or cart data");
      showToast("User or cart data is not available", "error");
      return;
    }

    if (!selectedAddress) {
      console.log("No address selected");
      showToast("Please select an address for your order", "error");
      return;
    }

    setIsPlacingOrder(true);
    const orderBody = prepareOrderBody(user, cart);

    try {
      console.log("=== MAKING API CALL ===");
      console.log("Calling createOrders with body:", orderBody);
      
      const response = await createOrders(orderBody);
      console.log("Order creation response:", response);
      
      setOrderId(response.data.orderId || response.data._id); 
      setIsOrderConfirmed(true);
      
      // Clear cart from Redux after successful order
      dispatch(clearCart());

      showToast("Order created successfully", "success");
      
      // Navigate to shop page after successful order placement
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (error: any) {
      console.error("Full Error Object:", error);
      console.error("Error response:", error.response);
      console.error("Error message:", error.message);
      
      if (error.response?.status === 403) {
        showToast("Access denied. Please check your login status.", "error");
      } else if (error.response?.status === 400) {
        showToast("Invalid order data. Please check your cart and try again.", "error");
      } else if (error.response?.status === 500) {
        showToast("Server error. Please try again later.", "error");
      } else {
        showToast(`Failed to create order: ${error.message || "Unknown error"}`, "error");
      }
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const removeItem = async (productId: string) => {
    try {
      const data = {
        userId: userId,
        productId: productId,
      }
      const response = await removeProductFromCart(data);
      console.log("Item removed from cart", response);
  
      await fetchCart();
      showToast("Item removed from cart", "success");
    } catch(error) {
      console.error("Failed to remove item:", error);
      showToast("Failed to remove item from cart", "error");
    }
  }

  const onSubmit = async (data: AddressFormValues) => {
    try {
      const addressData = {
        address: [
          {
            nick_name: "Home",
            street:
              data.addressLine1 +
              (data.addressLine2 ? `, ${data.addressLine2}` : ""),
            city: data.city,
            pincode: data.pinCode,
            state: data.state,
          },
        ],
      };

      const response = await addAddress(userId, addressData);

      showToast("Address added successfully", "success");
      
      // Refresh user data and auto-select the new address
      try {
        const userResponse = await getUserById(userId);
        setUser(userResponse.data);
        if (userResponse.data?.address && userResponse.data.address.length > 0) {
          const newAddress = userResponse.data.address[userResponse.data.address.length - 1];
          setSelectedAddress(newAddress);
        }
      } catch (error) {
        console.error("Failed to refresh user data:", error);
      }
    } catch (error) {
      showToast("Failed to add address", "error");
    }
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
                    onClick={() => router.push('/shop')}
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
                    <p className="text-sm text-green-800 font-medium">Selected Address Preview:</p>
                    <p className="text-sm text-green-700">
                      {selectedAddress.nick_name || "Address"} — {selectedAddress.street}, {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
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
                      <span className="text-sm text-blue-800">Checking delivery availability for pincode {pincode}...</span>
                    </div>
                  </div>
                )}

                {pincodeData && !checkingPincode && (
                  <div className={`mb-4 p-4 rounded-lg border ${
                    expressAvailable
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Package className={`w-5 h-5 ${expressAvailable ? 'text-green-600' : 'text-red-600'}`} />
                      <span className={`font-medium ${expressAvailable ? 'text-green-800' : 'text-red-800'}`}>
                        {expressAvailable ? 'Express Delivery Available!' : 'Express Delivery Not Available'}
                      </span>
                    </div>
                    <div className={`text-sm ${expressAvailable ? 'text-green-700' : 'text-red-700'} space-y-1`}>
                      <p><strong>Location:</strong> {pincodeData.city}, {pincodeData.state}</p>
                      {expressAvailable && (
                        <>
                          <p><strong>Delivery Charges:</strong> ₹{pincodeData.delivery_charges}</p>
                          <p><strong>Estimated Delivery:</strong> {pincodeData.estimated_delivery_days} days</p>
                          <p><strong>COD Available:</strong> {pincodeData.cod_available ? "Yes" : "No"}</p>
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
                        <span className="text-red-600 text-xs font-bold">!</span>
                      </div>
                      <p className="text-sm text-red-800 font-medium">{deliveryError}</p>
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
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          deliveryType.startsWith('express')
                            ? 'border-[#C72920] bg-[#C72920]'
                            : 'border-gray-300'
                        }`}>
                          {deliveryType.startsWith('express') && (
                            <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Express Delivery</h4>
                          <p className="text-sm text-gray-600">
                            {expressAvailable ? "Fast delivery options" : "Express delivery not available in your selected pincode"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Express Delivery Sub-options */}
                    {expressAvailable && (
                      <div className="ml-7 space-y-2">
                        <div
                          className={`border rounded-lg p-3 cursor-pointer transition-all ${
                            deliveryType === 'express-fast'
                              ? 'border-[#C72920] bg-red-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => handleDeliveryTypeSelect('express-fast')}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-medium text-gray-900">Fast Delivery</h5>
                              <p className="text-sm text-gray-600">Super fast delivery</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-gray-900">₹{pincodeData?.delivery_charges || 0}</p>
                              <p className="text-sm text-gray-600">Arrival in 2-3 hours</p>
                            </div>
                          </div>
                        </div>

                        <div
                          className={`border rounded-lg p-3 cursor-pointer transition-all ${
                            deliveryType === 'express-regular'
                              ? 'border-[#C72920] bg-red-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => handleDeliveryTypeSelect('express-regular')}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-medium text-gray-900">Regular Delivery</h5>
                              <p className="text-sm text-gray-600">Express regular delivery</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-gray-900">₹{pincodeData?.delivery_charges || 0}</p>
                              <p className="text-sm text-gray-600">{pincodeData?.estimated_delivery_days || 3} days</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {!expressAvailable && pincodeData && (
                      <div className="ml-7 mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-800">Express delivery is not available in your selected pincode</p>
                      </div>
                    )}
                  </div>

                  {/* Standard Delivery Section */}
                  <div
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      deliveryType === 'Standard'
                        ? 'border-[#C72920] bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => {
                      handleDeliveryTypeSelect('Standard');
                      showToast("Standard delivery coming soon!", "warning");
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          deliveryType === 'Standard'
                            ? 'border-[#C72920] bg-[#C72920]'
                            : 'border-gray-300'
                        }`}>
                          {deliveryType === 'Standard' && (
                            <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Standard Delivery</h4>
                          <p className="text-sm text-gray-600">Regular delivery service</p>
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
                  {deliveryType === 'Standard' ? (
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
                    {deliveryType === 'Standard' && (
                      <p className="text-xs text-red-600 text-right">
                        Standard delivery coming soon - not available at this time
                      </p>
                    )}
                    {deliveryType.startsWith('express') && !expressAvailable && (
                      <p className="text-xs text-red-600 text-right">
                        Express delivery not available for your selected pincode
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
                            {deliveryType === 'Standard' ? 'Standard Delivery' :
                             deliveryType === 'express-fast' ? 'Express Fast Delivery' :
                             deliveryType === 'express-regular' ? 'Express Regular Delivery' : deliveryType}
                          </p>
                          <p className="text-sm text-gray-600">
                            {deliveryType === 'Standard'
                              ? 'Estimated delivery: 5-7 days'
                              : deliveryType === 'express-fast'
                              ? 'Estimated delivery: 1-2 days'
                              : `Estimated delivery: ${pincodeData?.estimated_delivery_days || 3} days`
                            }
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            {deliveryType === 'Standard'
                              ? '₹0'
                              : `₹${pincodeData?.delivery_charges || 0}`
                            }
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
                          {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
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
                            className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg"
                          >
                            <div className="w-16 h-16 bg-gray-100 rounded-md flex-shrink-0">
                              {item.product_image && item.product_image[0] && (
                                <img
                                  src={item.product_image[0]}
                                  alt={item.product_name}
                                  className="w-full h-full object-cover rounded-md"
                                />
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">
                                {item.product_name}
                              </h4>
                              <p className="text-sm text-gray-500">
                                SKU: {item.sku}
                              </p>
                              <p className="text-sm text-gray-500">
                                Quantity: {item.quantity}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                {item.mrp && item.mrp > item.selling_price ? (
                                  <>
                                    <div className="flex items-center gap-1 justify-end">
                                      <span className="text-sm text-gray-500 line-through">₹{(item.mrp * item.quantity).toFixed(2)}</span>
                                      <span className="font-medium text-gray-900">₹{(item.selling_price * item.quantity).toFixed(2)}</span>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                      <span className="line-through">₹{item.mrp}</span> ₹{item.selling_price} each
                                    </p>
                                  </>
                                ) : (
                                  <>
                                    <p className="font-medium text-gray-900">
                                      ₹{(item.selling_price * item.quantity).toFixed(2)}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      ₹{item.selling_price} each
                                    </p>
                                  </>
                                )}
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                onClick={() => removeItem(item.productId)}
                              >
                                <Trash2 className="h-4 w-4" />
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
                        onValueChange={(value) => setSelectedPaymentMethod(value as 'cod' | 'online')}
                        className="space-y-3"
                      >
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="cod" id="cod" />
                          <Label htmlFor="cod" className="flex-1 cursor-pointer">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <Package className="w-5 h-5 text-green-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">Cash on Delivery (COD)</p>
                                <p className="text-sm text-gray-600">Pay when your order is delivered</p>
                              </div>
                            </div>
                          </Label>
                        </div>

                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="online" id="online" />
                          <Label htmlFor="online" className="flex-1 cursor-pointer">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <CreditCard className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">Online Payment</p>
                                <p className="text-sm text-gray-600">Pay securely with card, UPI, or net banking</p>
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
                    <div className={`${selectedPaymentMethod === 'cod' ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'} border p-4 rounded-lg`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 ${selectedPaymentMethod === 'cod' ? 'bg-green-100' : 'bg-blue-100'} rounded-full flex items-center justify-center`}>
                          {selectedPaymentMethod === 'cod' ? (
                            <Package className="w-6 h-6 text-green-600" />
                          ) : (
                            <CreditCard className="w-6 h-6 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {selectedPaymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Online Payment'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {selectedPaymentMethod === 'cod'
                              ? `Pay ₹${Math.round(cart?.grandTotal || 0)} when your order is delivered`
                              : 'Pay securely online with card, UPI, or net banking'
                            }
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
                        <span className="text-gray-600">Item Total ({cart?.items?.length ?? 0} items):</span>
                        <span className="font-medium">₹{Math.round(cart?.itemTotal || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">GST:</span>
                        <span className="font-medium">₹{Math.round(cart?.gst_amount || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Delivery Charge ({cart?.delivery_type || 'Standard'}):</span>
                        <span className="font-medium">₹{Math.round(cart?.deliveryCharge || 0)}</span>
                      </div>
                      <hr className="border-gray-300" />
                      <div className="flex justify-between text-lg font-semibold">
                        <span className="text-gray-900">Total:</span>
                        <span className="text-gray-900">₹{Math.round(cart?.grandTotal || 0)}</span>
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
                          {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
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
                      By clicking "Confirm & Place Order", you agree to our terms and conditions.
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
                        className="flex items-center gap-3 p-2 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="w-12 h-12 bg-gray-100 rounded-md flex-shrink-0">
                          {item.product_image && item.product_image[0] && (
                            <img
                              src={item.product_image[0]}
                              alt={item.product_name}
                              className="w-full h-full object-cover rounded-md"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {item.product_name}
                          </h4>
                          <p className="text-xs text-gray-500">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-sm">
                            {item.mrp && item.mrp > item.selling_price ? (
                              <div className="flex items-center gap-1">
                                <span className="text-gray-500 line-through">₹{(item.mrp * item.quantity).toFixed(2)}</span>
                                <span className="font-medium text-gray-900">₹{(item.selling_price * item.quantity).toFixed(2)}</span>
                              </div>
                            ) : (
                              <span className="font-medium text-gray-900">₹{(item.selling_price * item.quantity).toFixed(2)}</span>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => removeItem(item._id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Item Total ({cart?.items?.length ?? 0} items):</span>
                    <span className="font-medium">₹{Math.round(cart?.itemTotal || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">GST:</span>
                    <span className="font-medium">₹{Math.round(cart?.gst_amount || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Delivery Charge ({cart?.delivery_type || 'Standard'}):</span>
                    <span className="font-medium">₹{typeof cart?.deliveryCharge === 'number' ? Math.round(cart.deliveryCharge) : 0}</span>
                  </div>
                  <hr className="border-gray-300" />
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span className="text-gray-900">Total:</span>
                    <span className="text-gray-900">₹{Math.round(cart?.grandTotal || 0)}</span>
                  </div>
                </div>

                {/* Show selected address preview in right column at all times */}
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Deliver to</h3>
                  {selectedAddress ? (
                    <div className="p-3 bg-green-50 border border-green-200 rounded">
                      <p className="text-sm font-medium text-green-800">{selectedAddress.nick_name || "Address"}</p>
                      <p className="text-xs text-green-700 truncate">{selectedAddress.street}</p>
                      <p className="text-xs text-green-700">{selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}</p>
                      <div className="mt-2">
                        <Button variant="outline" size="sm" className="text-xs" onClick={() => goToStep(0)}>
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
                  {(currentStep === 1 || currentStep === 2 || currentStep === 3) && (
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
                    onClick={handleProceed}
                    disabled={
                      isPlacingOrder ||
                      (currentStep === 0 && !selectedAddress) ||
                      (currentStep === 3 && (!user || !cart || !selectedAddress)) ||
                      ((currentStep === 1 || currentStep === 2) && (deliveryType === 'Standard' || (deliveryType.startsWith('express') && !expressAvailable)))
                    }
                  >
                    {(currentStep === 1 || currentStep === 2) && deliveryType === 'Standard' && (
                      <span className="text-xs block mb-1">
                        Standard delivery coming soon - not available at this time
                      </span>
                    )}
                    {(currentStep === 1 || currentStep === 2) && deliveryType.startsWith('express') && !expressAvailable && (
                      <span className="text-xs block mb-1">
                        Express delivery not available for your selected pincode
                      </span>
                    )}
                    {isPlacingOrder ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Placing Order...
                      </>
                    ) : currentStep === 0 ? "Continue to Delivery" : 
                       currentStep === 1 ? "Proceed To Review" : 
                       currentStep === 2 ? "Proceed To Payment" :
                       "Confirm & Place Order"}
                  </Button>
                  
                  {!isPlacingOrder && currentStep === 3 && (!user || !cart || !selectedAddress) && (
                    <div className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
                      {!user && <div>• User data not loaded</div>}
                      {!cart && <div>• Cart data not loaded</div>}
                      {!selectedAddress && <div>• No address selected</div>}
                      <div className="mt-2 flex gap-2">
                        <Button variant="outline" size="sm" className="text-xs" onClick={() => {
                            if (userId) fetchData();
                          }}>
                          Retry
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs" onClick={() => window.location.reload()}>
                          Refresh Page
                        </Button>
                      </div>
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
        orderId={orderId ?? undefined}
      />
    </div>
  );
}
