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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { use, useEffect, useState } from "react";
import {
  addAddress,
  createOrders,
  getCart,
  removeProductFromCart,
} from "@/service/user/cartService";
import { useAppSelector } from "@/store/hooks";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useToast as useGlobalToast } from "@/components/ui/toast";
import { assert } from "console";
import { getUserById } from "@/service/user/userService";
import { Cart, CartItem, CartResponse } from "@/types/User/cart-Types";
import { ApiListResponse, AppUser } from "@/types/user-types";
import OrderConfirmationDialog from "@/service/user/PopUps/OrderPlaced";
import { useCart } from "@/hooks/use-cart";

// Define the schema for the address form
const addressSchema = z.object({
  firstName: z.string().min(1, "First Name is required"),
  lastName: z.string().min(1, "Last Name is required"),
  mobile: z.object({
    countryCode: z.string().min(1, "Country code is required"),
    number: z.string().min(10, "Mobile number must be at least 10 digits"),
  }),
  email: z.string().email("Invalid email address"),
  addressLine1: z.string().min(1, "Address Line 1 is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  pinCode: z.string().min(1, "Pin Code is required"),
  country: z.string().min(1, "Country is required"),
  notes: z.string().optional(),
});

type AddressFormValues = z.infer<typeof addressSchema>;

export default function CheckoutPage() {
  const { cartData: cart, fetchCart } = useCart();
  const { showToast } = useGlobalToast();
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOrderConfirmed, setIsOrderConfirmed] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      mobile: {
        countryCode: "+91",
        number: "",
      },
    },
  });
  const userId = useAppSelector((state) => state.auth.user._id);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [userResponse] = await Promise.all([
          getUserById(userId),
        ]);
        setUser(userResponse.data);
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
    const address = user.address?.[0] || {};

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
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        phone: user.phone || "",
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

    if (!user.address || user.address.length === 0) {
      showToast("Please add an address before checkout", "error");
      return;
    }

    const orderBody = prepareOrderBody(user, cart);
    try {
      const response = await createOrders(orderBody);
      setOrderId(response.data.orderId || response.data._id); 
      setIsOrderConfirmed(true);
      console.log("order", response.data);

      showToast("Order created successfully", "success");
    } catch (error) {
      console.error("Failed to create order:", error);
      showToast("Failed to create order", "error");
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

      reset();
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
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Billing Address Details
              </h2>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium text-gray-700"
                    >
                      First Name
                    </label>
                    <Input
                      id="firstName"
                      {...register("firstName")}
                      placeholder="First Name"
                      className="mt-1"
                    />
                    {errors.firstName && (
                      <p className="text-red-600 text-sm">
                        {errors.firstName.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Last Name
                    </label>
                    <Input
                      id="lastName"
                      {...register("lastName")}
                      placeholder="Last Name"
                      className="mt-1"
                    />
                    {errors.lastName && (
                      <p className="text-red-600 text-sm">
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="addressLine1"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Address Line 1
                  </label>
                  <Input
                    id="addressLine1"
                    {...register("addressLine1")}
                    placeholder="Address Line 1"
                    className="mt-1"
                  />
                  {errors.addressLine1 && (
                    <p className="text-red-600 text-sm">
                      {errors.addressLine1.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="addressLine2"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Address Line 2 (Optional)
                  </label>
                  <Input
                    id="addressLine2"
                    {...register("addressLine2")}
                    placeholder="Address Line 2"
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label
                      htmlFor="city"
                      className="block text-sm font-medium text-gray-700"
                    >
                      City
                    </label>
                    <Input
                      id="city"
                      {...register("city")}
                      placeholder="City"
                      className="mt-1"
                    />
                    {errors.city && (
                      <p className="text-red-600 text-sm">
                        {errors.city.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="state"
                      className="block text-sm font-medium text-gray-700"
                    >
                      State
                    </label>
                    <Input
                      id="state"
                      {...register("state")}
                      placeholder="State"
                      className="mt-1"
                    />
                    {errors.state && (
                      <p className="text-red-600 text-sm">
                        {errors.state.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="pinCode"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Pin Code
                    </label>
                    <Input
                      id="pinCode"
                      {...register("pinCode")}
                      placeholder="Pin Code"
                      className="mt-1"
                    />
                    {errors.pinCode && (
                      <p className="text-red-600 text-sm">
                        {errors.pinCode.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="country"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Country
                  </label>
                  <Input
                    id="country"
                    {...register("country")}
                    placeholder="Country"
                    className="mt-1"
                  />
                  {errors.country && (
                    <p className="text-red-600 text-sm">
                      {errors.country.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="notes"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Notes (Optional)
                  </label>
                  <Textarea
                    id="notes"
                    {...register("notes")}
                    placeholder="Additional notes"
                    className="mt-1"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-2"
                >
                  Add Address
                </Button>
              </form>
            </div>
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
                    !user || !cart || !user.address || user.address.length === 0
                  }
                >
                  Proceed To Checkout
                </Button>
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
