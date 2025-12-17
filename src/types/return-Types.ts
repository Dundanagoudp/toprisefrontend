// Return Claims Type Definitions

// Base Response Types
export interface BaseApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ReturnRequestsResponse extends BaseApiResponse<{
  returnRequests: ReturnRequest[];
  pagination: ReturnPagination;
  userStats: UserStats;
}> {}

export interface SingleReturnResponse extends BaseApiResponse<ReturnRequest> {}

// Core Return Request Type
export interface ReturnRequest {
  _id: string;
  orderId: OrderInfo | null;
  customerId: string;
  sku: string;
  quantity: number;
  returnReason: string;
  returnDescription?: string | null;
  returnImages: string[];
  isEligible: boolean;
  eligibilityReason?: string | null;
  returnWindowDays?: number | null;
  returnStatus: ReturnStatus;
  inspection?: InspectionDetails | null;
  refund?: RefundDetails | null;
  actionTaken?: ReturnAction | null;
  timestamps?: ReturnTimestamps | null;
  originalOrderDate?: string | null;
  dealerId?: string;
  notes?: ReturnNote[];
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
  isProductReturnable?: boolean;
  isWithinReturnWindow?: boolean;
  pickupRequest?: PickupRequest | null;
  tracking_info?: TrackingInfo | null;  // Add this line
  orderSku?: any | null;
  productDetails?: ProductDetails | null;
  timeSinceRequest?: number | null;
  processingTime?: number | null;
  isOverdue?: boolean;
  daysSinceRequest?: number | null;
  statusDisplay?: string | null;
}

// Order and Customer Types
export interface OrderInfo {
  _id: string;
  orderId: string | null;
  orderDate: string;
  customerDetails: CustomerDetails;
}
export interface TrackingInfo {
  status: string;
  borzo_delivery_fee_amount?: number;
  borzo_last_updated?: string;
  borzo_order_id?: string;
  borzo_payment_amount?: number;
  borzo_tracking_status?: string;
  borzo_tracking_url?: string;
  borzo_weight_fee_amount?: number;
  timestamps?: {
    confirmedAt?: string;
    assignedAt?: string;
    shippedAt?: string;
    deliveredAt?: string;
    onTheWayToNextDeliveryPointAt?: string;
    outForDeliveryAt?: string;
  };
}
export interface CustomerDetails {
  userId: string;
  name: string;
  phone: string;
  address: string;
  pincode: string;
  email: string;
}

// Pickup Request Types
export interface PickupRequest {
  pickupId: string;
  pickupAddress: Address;
  deliveryAddress: Address;
  scheduledDate: string;
  logisticsPartner: string;
  trackingNumber?: string;
  completedDate?: string;
  status?: PickupStatus;
}

export interface Address {
  address: string;
  city: string;
  pincode: string;
  state: string;
}

// Inspection Types
export interface InspectionDetails {
  skuMatch?: boolean;
  inspectionImages?: string[];
  isApproved?: boolean;
  inspectedAt?: string | null;
  inspectedBy?: string | null;
  inspectedByUser?: InspectedByUser | null;
  condition?: InspectionCondition | null;
  conditionNotes?: string | null;
  rejectionReason?: string | null;
}

export interface InspectedByUser {
  id: string;
  name: string;
  role?: string | null;
}

// Refund Types
export interface RefundDetails {
  refundAmount?: number | null;
  refundMethod?: RefundMethod | null;
  refundStatus?: RefundStatus | null;
  refund_id?: string | null;
  processedByUser?: any | null;
  transactionId?: string;
  initiatedAt?: string;
  completedAt?: string;
  expectedDate?: string;
}

// Timestamps
export interface ReturnTimestamps {
  requestedAt: string;
  validatedAt?: string;
  borzoShipmentInitiatedAt?: string;
  borzoShipmentCompletedAt?: string;
  inspectionStartedAt?: string;
  inspectionCompletedAt?: string;
  refundInitiatedAt?: string;
  refundCompletedAt?: string;
  // Legacy/alternative names (keep for backward compatibility if needed)
  pickupScheduledAt?: string;
  pickupCompletedAt?: string;
  shipmentInitiatedAt?: string;
  shipmentCompletedAt?: string;
  
}

// Pagination and Stats
export interface ReturnPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface UserStats {
  totalReturns: number;
  totalRefundAmount: number;
  averageProcessingTime?: number | null;
  statusBreakdown: Record<ReturnStatus, number>;
}

// Product Details
export interface ProductDetails {
  sku?: string | null;
  productName?: string | null;
  brand?: string | null;
  category?: string | null;
  subcategory?: string | null;
  images?: string[];
  isReturnable?: boolean;
  returnPolicy?: string | null;
}

// Note Type
export interface ReturnNote {
  id: string;
  text: string;
  createdAt: string;
  createdBy?: string;
  isInternal?: boolean;
}

// Enums and Type Unions
export type ReturnStatus = 
  | "Requested"
  | "Validated" 
  | "Pickup_Scheduled" 
  | "Pickup_Completed" 
  | "Inspection_Started"
  | "Inspection_Completed"
  | "Approved"
  | "Rejected"
  | "Refund_Initiated"
  | "Refund_Completed"
  | "Completed";

export type ReturnAction = 
  | "Pending" 
  | "Approved" 
  | "Rejected" 
  | "Refund" 
  | "Replacement" 
  | "Store_Credit";

export type InspectionCondition = 
  | "New" 
  | "Good" 
  | "Fair" 
  | "Damaged" 
  | "Defective";

export type RefundMethod = 
  | "Original_Payment_Method" 
  | "Bank_Transfer" 
  | "Store_Credit" 
  | "Cash";

export type RefundStatus = 
  | "Pending" 
  | "Processing" 
  | "Completed" 
  | "Failed" 
  | "Cancelled";

export type PickupStatus = 
  | "Scheduled"
  | "In_Progress"
  | "Completed"
  | "Failed"
  | "Cancelled";

// Filter and Search Types
export interface ReturnRequestFilters {
  returnStatus?: ReturnStatus[];
  actionTaken?: ReturnAction[];
  customerId?: string;
  orderId?: string;
  sku?: string;
  dealerId?: string;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  refundStatus?: RefundStatus[];
  inspectionCondition?: InspectionCondition[];
  logisticsPartner?: string;
  isOverdue?: boolean;
}

export interface ReturnRequestSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: ReturnRequestFilters;
}

// Create/Update Types
export interface CreateReturnRequestPayload {
  orderId: string;
  customerId: string;
  sku: string;
  quantity: number;
  returnReason: string;
  returnDescription: string;
  returnImages: string[];
  dealerId?: string;
}

export interface UpdateReturnRequestPayload {
  returnStatus?: ReturnStatus;
  actionTaken?: ReturnAction;
  notes?: ReturnNote[];
  inspection?: Partial<InspectionDetails>;
  refund?: Partial<RefundDetails>;
  pickupRequest?: Partial<PickupRequest>;
}

// API Response Types
export interface ReturnRequestActionResponse {
  success: boolean;
  message: string;
  data?: {
    returnRequest: ReturnRequest;
    actionDetails?: any;
  };
}

// Statistics and Analytics Types
export interface ReturnRequestStats {
  totalReturns: number;
  pendingReturns: number;
  approvedReturns: number;
  rejectedReturns: number;
  totalRefundAmount: number;
  avgProcessingTime: number;
  returnsByReason: Record<string, number>;
  returnsByStatus: Record<ReturnStatus, number>;
}

export interface ReturnRequestStatsResponse extends BaseApiResponse<ReturnRequestStats> {}

export interface ReturnStatsResponse {
  success: boolean;
  message: string;
  totalReturns: number;
  statusCounts: Record<ReturnStatus, number>;
}