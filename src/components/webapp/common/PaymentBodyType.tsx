// utils/order-helpers.ts

import { AppUser } from "@/types/user-types";
import { Cart } from "@/types/User/cart-Types";

// maps UI deliveryType to API delivery_type
export const mapDeliveryTypeForApi = (
  deliveryType: string
): "endofday" | "standard" => {
  switch (deliveryType) {
    case "express-fast":
      return "standard"; // your mapping for fast delivery
    case "express-regular":
      return "endofday"; // your mapping for regular delivery
    default:
      return "standard";
  }
};

// full order body (COD or Online)
export const prepareOrderBody = (
  user: AppUser,
  cart: Cart,
  deliveryType: string,
  selectedPaymentMethod: "COD" | "Prepaid",
  selectedAddress?: any,
  pincodeData?: any
) => {
  const address = selectedAddress || user.address?.[0] || {};
  const delivery_type = mapDeliveryTypeForApi(deliveryType);
  const isOnline = selectedPaymentMethod === "Prepaid";

  return {
    orderType: "Online",
    orderSource: "Web",
    order_Amount: Math.round(cart.grandTotal || 0),
    skus: cart.items.map((item) => ({
      sku: item.sku || "",
      quantity: item.quantity,
      productId: item.productId || item._id,
      productName: item.product_name,
      mrp: item.mrp || item.selling_price || 0,
      mrp_gst_amount: item.mrp_gst_amount || 0,
      gst_percentage: item.gst_percentage ?? "0",
      gst_amount: item.gst_amount || 0,
      product_total:
        item.product_total ?? item.selling_price * item.quantity,
      totalPrice:
        item.totalPrice ?? item.selling_price * item.quantity,
    })),
    customerDetails: {
      userId: user._id,
      name: user.username || "",
      phone: user.phone_Number || "",
      address: `${address.street || ""}${address.city ? ", " + address.city : ""}${address.state ? ", " + address.state : ""}${address.country ? ", " + address.country : ""}`.trim(),
      pincode: address.pincode || "",
      email: user.email || "",
    },
    paymentType: selectedPaymentMethod === "COD" ? "COD" : "Prepaid",
    deliveryCharges: deliveryType.startsWith("express")
      ? pincodeData?.delivery_charges ?? cart.deliveryCharge ?? 0
      : cart.deliveryCharge ?? 0,
    GST: cart.total_mrp_gst_amount ?? 0,
    typeOfDelivery: isOnline
      ? "Express"
      : deliveryType === "Standard"
      ? "Standard"
      : "Express",
    delivery_type,
  };
};

// minimal body for payment API
export const preparePaymentBody = (
  user: AppUser,
  cart: Cart,
  deliveryType: string,
  selectedAddress?: any
) => {
  const address = selectedAddress || user.address?.[0] || {};
  const delivery_type = mapDeliveryTypeForApi(deliveryType);

  return {
    userId: user._id,
    amount: Math.round(cart.grandTotal || 0),
    orderType: "Online",
    orderSource: "Web",
    customerDetails: {
      userId: user._id,
      name: user.username || "",
      phone: user.phone_Number || "",
      address: `${address.street || ""}${address.city ? ", " + address.city : ""}${address.state ? ", " + address.state : ""}${address.country ? ", " + address.country : ""}`.trim(),
      pincode: address.pincode || "",
      email: user.email || "",
    },
    type_of_delivery: "Express", // always Express for Online payments
    delivery_type, // "endofday" | "standard"
  };
};
