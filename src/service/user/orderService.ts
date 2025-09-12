import apiClient from "@/apiClient";

export interface OrderSKU {
  _id: string;
  sku: string;
  quantity: number;
  productId: string;
  productName: string;
  selling_price: number;
  gst_percentage?: string;
  mrp: number;
  mrp_gst_amount?: number;
  gst_amount?: number;
  product_total?: number;
  totalPrice?: number;
  dealerMapped?: Array<{
    dealerId: string;
    _id: string;
  }>;
  tracking_info: {
    status: string;
    borzo_event_datetime?: string;
    borzo_event_type?: string;
    borzo_last_updated?: string;
    borzo_order_status?: string;
    borzo_tracking_url?: string;
    timestamps?: {
      confirmedAt?: string;
      deliveredAt?: string;
      assignedAt?: string;
    };
  };
  return_info?: {
    is_returned?: boolean;
    return_id?: {
      _id: string;
      orderId: string;
      customerId: string;
      sku: string;
      quantity: number;
      returnReason: string;
      returnDescription: string;
      returnImages: string[];
      isEligible: boolean;
      eligibilityReason: string;
      returnWindowDays: number;
      returnStatus: string;
      inspection?: {
        skuMatch: boolean;
        inspectionImages: string[];
        isApproved: boolean;
        condition?: string;
        conditionNotes?: string;
        rejectionReason?: string;
        inspectedAt?: string;
        inspectedBy?: string;
      };
      refund: {
        refundAmount: number;
        refundMethod: string;
        refundStatus: string;
      };
      actionTaken: string;
      timestamps: {
        requestedAt: string;
        validatedAt: string;
        pickupScheduledAt?: string;
        pickupCompletedAt?: string;
        inspectionStartedAt?: string;
        inspectionCompletedAt?: string;
      };
      originalOrderDate: string;
      dealerId?: string;
      notes: any[];
      createdAt: string;
      updatedAt: string;
      __v: number;
      isProductReturnable: boolean;
      isWithinReturnWindow: boolean;
      pickupRequest?: {
        pickupId: string;
        scheduledDate: string;
        logisticsPartner: string;
        trackingNumber: string;
        pickupAddress: {
          address: string;
          city: string;
          pincode: string;
          state: string;
        };
        deliveryAddress: {
          address: string;
          city: string;
          pincode: string;
          state: string;
        };
        completedDate: string;
      };
    };
  };
}

export interface Order {
  _id: string;
  orderId: string;
  orderDate: string;
  deliveryCharges: number;
  GST: number;
  orderType: string;
  orderSource: string;
  skus: OrderSKU[];
  order_Amount: number;
  customerDetails: {
    userId: string;
    name: string;
    phone: string;
    address: string;
    pincode: string;
    email: string;
    userInfo: any;
  };
  paymentType: string;
  dealerMapping: Array<{
    sku: string;
    dealerId: string;
    status: string;
    _id: string;
    dealerInfo: any;
  }>;
  status: string;
  timestamps: {
    createdAt: string;
    assignedAt?: string;
    packedAt?: string;
  };
  type_of_delivery: string;
  delivery_type: string;
  payment_id?: string;
  ratting: number;
  purchaseOrderId?: string;
  auditLogs: Array<{
    action: string;
    actorId: string | null;
    role: string;
    timestamp: string;
    reason: string;
    _id: string;
  }>;
  createdAt: string;
  updatedAt: string;
  __v: number;
  review?: string;
  review_Date?: string;
  refund_id?: string;
  order_track_info?: {
    borzo_event_datetime: string;
    borzo_event_type: string;
    borzo_last_updated: string;
    borzo_order_status: string;
    borzo_tracking_url: string;
  };
  refund_status?: string;
  slaInfo?: {
    actualFulfillmentTime: string;
    expectedFulfillmentTime: string;
    isSLAMet: boolean;
    violationMinutes: number;
  };
}

export interface UserOrdersResponse {
  success: boolean;
  message: string;
  data: Order[];
}

export async function getUserOrders(userId: string): Promise<UserOrdersResponse> {
  try {
    const response = await apiClient.get(`/orders/api/orders/user/${userId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch user orders:", error);
    throw error;
  }
}
