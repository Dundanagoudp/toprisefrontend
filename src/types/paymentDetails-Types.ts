// Payment Details Types
export interface PaymentDetailsResponse {
  success: boolean;
  message: string;
  data: {
    data: PaymentDetail[];
    pagination: PaymentPagination;
  };
}

export interface PaymentDetail {
  _id: string;
  order_id: OrderDetails | null;
  razorpay_order_id: string;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  razorpay_payment_method: PaymentMethod;
  amount: number;
  created_at: string;
  is_refund: boolean;
  refund_successful: boolean;
  __v: number;
  acquirer_data?: AcquirerData;
  payment_id?: string;
  orderDetails?: OrderDetails | null;
  paymentSummary?: PaymentSummaryData;
}

export interface OrderDetails {
  _id: string;
  orderId: string;
  orderDate: string;
  orderType: string;
  orderSource: string;
  status: string;
  customerDetails: CustomerDetails;
  paymentType: string;
  skus: SKU[];
  order_Amount: number;
  GST: number;
  deliveryCharges: number;
  timestamps: {
    createdAt: string;
  };
  trackingInfo: any;
  purchaseOrderId: string | null;
  slaInfo: any;
  order_track_info: any;
  skuCount: number;
  totalSKUs: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  dealers: any[];
}

export interface CustomerDetails {
  userId: string;
  name: string;
  phone: string;
  address: string;
  pincode: string;
  email: string;
}

export interface SKU {
  tracking_info: {
    status: string;
  };
  return_info: {
    is_returned: boolean;
    return_id: string | null;
  };
  sku: string;
  quantity: number;
  productId: string;
  productName: string;
  selling_price: number;
  gst_percentage: string;
  mrp: number;
  mrp_gst_amount: number;
  gst_amount: number;
  product_total: number;
  totalPrice: number;
  dealerMapped: any[];
  _id: string;
}

export interface PaymentSummaryData {
  paymentId: string;
  razorpayOrderId: string;
  paymentMethod: string;
  paymentStatus: string;
  amount: number;
  razorpayPaymentId: string;
  createdAt: string;
  isRefund: boolean;
  refundSuccessful: boolean;
  acquirerData: AcquirerData;
}

export interface AcquirerData {
  bank_transaction_id?: string;
  rrn?: string;
  upi_transaction_id?: string;
}

export type PaymentMethod = 
  | "netbanking"
  | "upi"
  | "Razorpay"
  | "card"
  | "wallet";

export type PaymentStatus = 
  | "paid"
  | "created"
  | "Created"
  | "failed"
  | "refunded"
  | "pending";

// Additional utility types for payment filtering and management
export interface PaymentFilters {
  payment_method?: PaymentMethod;
  payment_status?: PaymentStatus;
  date_from?: string;
  date_to?: string;
  amount_min?: number;
  amount_max?: number;
  is_refund?: boolean;
}

export interface PaymentSummary {
  total_payments: number;
  total_amount: number;
  successful_payments: number;
  failed_payments: number;
  pending_payments: number;
  refunded_payments: number;
}

// Pagination interface for payment details
export interface PaymentPagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Single Payment Detail Response (for getPaymentDetailsById)
export interface PaymentDetailByIdResponse {
  success: boolean;
  message: string;
  data: PaymentDetail;
}

// For creating/updating payment records (if needed)
export type CreatePaymentPayload = Omit<PaymentDetail, '_id' | 'created_at' | '__v'>;
export type UpdatePaymentPayload = Partial<Pick<PaymentDetail, 'payment_status' | 'is_refund' | 'refund_successful' | 'acquirer_data' | 'payment_id'>>;

// Comprehensive Payment Statistics Types
export interface ComprehensivePaymentStats {
  overview: {
    totalPayments: number;
    totalAmount: number;
    averageAmount: number;
    successRate: number;
    refundRate: number;
    growthRate: number;
  };
  statusBreakdown: StatusBreakdown[];
  methodBreakdown: MethodBreakdown[];
  dailyTrends: DailyTrend[];
  monthlyTrends: MonthlyTrend[];
  topDealers: TopDealer[];
  recentPayments: RecentPayment[];
  refunds: RefundStats;
  filters: {
    groupBy: string;
  };
}

export interface StatusBreakdown {
  status: string;
  count: number;
  totalAmount: number;
  averageAmount: number;
  percentage: number;
}

export interface MethodBreakdown {
  method: string;
  count: number;
  totalAmount: number;
  averageAmount: number;
  percentage: number;
}

export interface DailyTrend {
  date: string;
  count: number;
  totalAmount: number;
  averageAmount: number;
}

export interface MonthlyTrend {
  month: string;
  count: number;
  totalAmount: number;
  averageAmount: number;
}

export interface TopDealer {
  dealerId: string | null;
  dealerName: string;
  dealerCode: string;
  count: number;
  totalAmount: number;
  averageAmount: number;
}

export interface RecentPayment {
  paymentId: string;
  amount: number;
  status: string;
  method: string;
  createdAt: string;
  razorpayOrderId: string;
  orderId?: string;
  customerName?: string;
  customerEmail?: string;
}

export interface RefundStats {
  _id: string | null;
  totalRefunds: number;
  totalRefundAmount: number;
  successfulRefunds: number;
  pendingRefunds: number;
}
