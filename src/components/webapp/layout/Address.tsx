"use client";
import {
  ShoppingCart,
  Package,
  FileText,
  CreditCard,
  Bell,
  User,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import {
  addAddress,
  createOrders,
  getCart,
  removeProductFromCart,
} from "@/service/user/cartService";
import { useAppSelector } from "@/store/hooks";
import { useToast as useGlobalToast } from "@/components/ui/toast";
import { getUserById } from "@/service/user/userService";
import { Cart, CartItem, CartResponse } from "@/types/User/cart-Types";
import { ApiListResponse, AppUser } from "@/types/user-types";
import OrderConfirmationDialog from "@/service/user/PopUps/OrderPlaced";
import { useCart } from "@/hooks/use-cart";
import BillingAddressForm, { AddressFormValues } from "./BillingAddressForm";

export default function CheckoutPage() {
  const { cartData: cart, fetchCart } = useCart();
  const { showToast } = useGlobalToast();
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOrderConfirmed, setIsOrderConfirmed] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<any | null>(null);


  const userId = useAppSelector((state) => state.auth.user._id);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [userResponse] = await Promise.all([
          getUserById(userId),
        ]);
        console.log("userResponse", userResponse);
        setUser(userResponse.data);
        // Set the first address as selected by default if available
        if (userResponse.data?.address && userResponse.data.address.length > 0) {
          setSelectedAddress(userResponse.data.address[0]);
        }
        // Cart data is now managed by Redux, so we don't need to fetch it here
        await fetchCart();
      } catch (err) {
        console.error("Failed to fetch data:", err);
        showToast("Failed to fetch data", "error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [userId, fetchCart]);
  const prepareOrderBody = (user: AppUser, cart: Cart) => {
    const address = selectedAddress || user.address?.[0] || {};

    const orderBody = {
      orderId: `ORD${Math.floor(Math.random() * 100000)}`,
      orderType: "Online",
      orderSource: "Web",
      order_Amount: cart.total_mrp_with_gst?.toFixed(2) || "0.00",
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
        address: `${address.street || ""}, ${address.city || ""}, ${
          address.state || ""
        }, ${address.country || ""}`.trim(),
        pincode: address.pincode || "",
        email: user.email || "",
      },
      paymentType: "COD",
      delivery_type: "standard",
      deliveryCharges: cart.deliveryCharge || 0,
      GST: cart.total_mrp_gst_amount || 0,
    };
    return orderBody;
  };

  const handleCheckOut = async () => {
    if (!user || !cart) {
      showToast("User or cart data is not available", "error");
      return;
    }

    if (!selectedAddress) {
      showToast("Please select an address for your order", "error");
      return;
    }

    const orderBody = prepareOrderBody(user, cart);
    console.log("=== ORDER BODY ===");
    console.log("Full Order Body:", JSON.stringify(orderBody, null, 2));
    console.log("Selected Address:", selectedAddress);
    console.log("Cart Data:", cart);
    console.log("User Data:", user);
    console.log("================");
    
    // Debug authentication state
    console.log("=== AUTHENTICATION DEBUG ===");
    console.log("User ID from Redux:", userId);
    console.log("User Role:", user.role);
    console.log("User from state:", user);
    
    // Check for authentication tokens/cookies
    const cookies = document.cookie;
    console.log("Document Cookies:", cookies);
    console.log("Local Storage Auth:", localStorage.getItem('authToken'));
    console.log("Session Storage Auth:", sessionStorage.getItem('authToken'));
    console.log("=============================");
    
    try {
      console.log("=== MAKING API CALL ===");
      console.log("Calling createOrders with body:", orderBody);
      
      const response = await createOrders(orderBody);
      
      setOrderId(response.data.orderId || response.data._id); 
      setIsOrderConfirmed(true);
      console.log("=== ORDER RESPONSE ===");
      console.log("Order Response:", JSON.stringify(response.data, null, 2));
      console.log("===================");

      showToast("Order created successfully", "success");
    } catch (error: any) {
      console.error("=== ORDER ERROR ===");
      console.error("Full Error Object:", error);
      console.error("Error Response:", error.response);
      console.error("Error Status:", error.response?.status);
      console.error("Error Data:", error.response?.data);
      console.error("Error Config:", error.response?.config);
      console.error("Request Headers:", error.response?.config?.headers);
      console.error("==================");
      
      if (error.response?.status === 403) {
        showToast("Access denied. Please check your login status.", "error");
      } else {
        showToast("Failed to create order", "error");
      }
    }
  };
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
        // Select the newly added address (last one in the array)
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
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-center space-x-8">
            {/* Cart Step */}
            <div className="flex items-center">
              <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <div className="ml-2 text-sm font-medium text-red-600">Cart</div>
            </div>

            {/* Connector */}
            <div className="flex-1 h-0.5 bg-red-600 max-w-24"></div>

            {/* Address Step */}
            <div className="flex items-center">
              <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div className="ml-2 text-sm font-medium text-red-600">
                Address
              </div>
            </div>

            {/* Connector */}
            <div className="flex-1 h-0.5 bg-gray-300 max-w-24"></div>

            {/* Review Step */}
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <FileText className="w-5 h-5 text-gray-500" />
              </div>
              <div className="ml-2 text-sm font-medium text-gray-500">
                Review
              </div>
            </div>

            {/* Connector */}
            <div className="flex-1 h-0.5 bg-gray-300 max-w-24"></div>

            {/* Pay Step */}
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-gray-500" />
              </div>
              <div className="ml-2 text-sm font-medium text-gray-500">Pay</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Billing Details */}
          <div className="lg:col-span-2">
            <BillingAddressForm 
              onSubmit={onSubmit}
              onAddressSelect={setSelectedAddress}
              selectedAddressId={selectedAddress?._id}
              showSelection={true}
              isLoading={isLoading}
            />
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Your Order
                </h2>

                {/* Cart Items */}
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
                        <div className="text-sm font-medium text-gray-900">
                          ₹{(item.selling_price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Order Summary */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">
                      Subtotal ({cart?.items?.length ?? 0} items):
                    </span>
                    <span className="font-medium">
                      ₹{cart?.total_mrp?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">GST + Tax:</span>
                    <span className="font-medium">
                      ₹{cart?.total_mrp_gst_amount?.toFixed(2) || "0.00"}
                    </span>
                  </div>

                  {cart?.deliveryCharge && cart.deliveryCharge > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Delivery:</span>
                      <span className="font-medium">
                        ₹{cart.deliveryCharge.toFixed(2)}
                      </span>
                    </div>
                  )}

                  {cart?.handlingCharge && cart.handlingCharge > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Handling:</span>
                      <span className="font-medium">
                        ₹{cart.handlingCharge.toFixed(2)}
                      </span>
                    </div>
                  )}

                  <hr className="border-gray-200" />

                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-lg">Total</div>
                      <div className="text-xs text-gray-500">
                        (includes ₹
                        {cart?.total_mrp_gst_amount?.toFixed(2) || "0.00"} GST)
                      </div>
                    </div>
                    <span className="text-xl font-bold text-gray-900">
                      ₹{cart?.total_mrp_with_gst?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                </div>

                <Button
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-3 font-medium"
                  onClick={handleCheckOut}
                  disabled={
                    !user || !cart || !selectedAddress
                  }
                >
                  Proceed To Checkout
                </Button>
                {selectedAddress && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800 font-medium">Selected Address:</p>
                    <p className="text-sm text-green-700">
                      {selectedAddress.street}, {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
                    </p>
                  </div>
                )}
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
