export interface CartItem {
  _id: string;
  productId: string;
  sku: string;
  product_name: string;
  product_image: string[];
  quantity: number;
  selling_price: number;
  gst_percentage: string;
  mrp: number;
  mrp_gst_amount: number;
  total_mrp: number;
  gst_amount: number;
  product_total: number;
  totalPrice: number;
}

export interface Cart {
  _id: string;
  userId: string;
  items: CartItem[];
  itemTotal: number;
  totalPrice: number;
  is_available: boolean;
  handlingCharge: number;
  deliveryCharge: number;
  delivery_type?: string;
  gst_amount: number;
  total_mrp: number;
  total_mrp_gst_amount: number;
  total_mrp_with_gst: number;
  grandTotal: number;
  success: boolean;
  message: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface CartResponse {
  success: boolean;
  message: string;
  data: Cart;
}

export interface AddToCartResponse {
  success: boolean;
  message: string;
  data: Cart | CartServiceabilityError;
}

export interface CartServiceabilityError {
  success: false;
  productId: string;
  serviceable: false;
  message: string;
}

export interface AddToCartPayload {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemPayload {
  itemId: string;
  quantity: number;
}

export interface RemoveFromCartPayload {
  itemId: string;
}
