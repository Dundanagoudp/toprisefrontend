// Return Claims Type Definitions

export interface ReturnRequestsResponse {
  success: boolean;
  message: string;
  data: {
    returnRequests: ReturnRequest[];
    pagination: ReturnPagination;
    userStats: UserStats;
  };
}

export interface SingleReturnResponse {
  success: boolean;
  message: string;
  data: ReturnRequest;
}

export interface ReturnRequest {
  _id: string;
  orderId: string | null;
  customerId: string;
  sku: string;
  quantity: number;
  returnReason: string;
  returnDescription?: string | null;
  returnImages: string[];
  isEligible: boolean;
  eligibilityReason?: string | null;
  returnWindowDays?: number | null;
  returnStatus?: string | null;
  inspection?: InspectionDetails | null;
  refund?: RefundDetails | null;
  actionTaken?: string | null;
  timestamps?: ReturnTimestamps | null;
  originalOrderDate?: string | null;
  dealerId?: string;
  notes?: any[];
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
  isProductReturnable?: boolean;
  isWithinReturnWindow?: boolean;
  pickupRequest?: PickupRequest | null;
  orderSku?: any | null;
  productDetails?: ProductDetails | null;
  timeSinceRequest?: number | null;
  processingTime?: number | null;
  isOverdue?: boolean;
  daysSinceRequest?: number | null;
  statusDisplay?: string | null;
}

export interface OrderInfo {
  _id: string;
  orderId: string;
  orderDate: string;
  customerDetails: CustomerDetails;
}

export interface CustomerDetails {
  userId: string;
  name: string;
  phone: string;
  address: string;
  pincode: string;
  email: string;
}

export interface PickupRequest {
  pickupId: string;
  pickupAddress: Address;
  deliveryAddress: Address;
  scheduledDate: string;
  logisticsPartner: string;
  trackingNumber?: string;
  completedDate?: string;
}

export interface Address {
  address: string;
  city: string;
  pincode: string;
  state: string;
}

export interface InspectionDetails {
  skuMatch?: boolean;
  inspectionImages?: string[];
  isApproved?: boolean;
  inspectedAt?: string | null;
  inspectedBy?: string | null;
  inspectedByUser?: InspectedByUser | null;
  condition?: string | null;
  conditionNotes?: string | null;
  rejectionReason?: string | null;
}

export interface RefundDetails {
  refundAmount?: number | null;
  refundMethod?: string | null;
  refundStatus?: string | null;
  refund_id?: string | null;
  processedByUser?: any | null;
}

export interface ReturnTimestamps {
  requestedAt: string;
  validatedAt?: string;
  pickupScheduledAt?: string;
  pickupCompletedAt?: string;
  inspectionStartedAt?: string;
  inspectionCompletedAt?: string;
}

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
  statusBreakdown: {
    [status: string]: number;
  };
}

export interface InspectedByUser {
  id: string;
  name: string;
  role?: string | null;
}

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

// Enums and Type Unions
export type ReturnStatus = 
  | "Requested"
  | "Validated" 
  | "Approved" 
  | "Rejected" 
  | "Pickup_Scheduled" 
  | "Pickup_Completed" 
  | "Approved"
  | "Refund_Processed"
  | "Completed"
  | "Under_Inspection";

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
  notes?: string[];
  inspection?: Partial<InspectionDetails>;
  refund?: Partial<RefundDetails>;
  pickupRequest?: Partial<PickupRequest>;
}

// API Response Types
export interface SingleReturnRequestResponse {
  success: boolean;
  message: string;
  data: ReturnRequest;
}

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

export interface ReturnRequestStatsResponse {
  success: boolean;
  message: string;
  data: ReturnRequestStats;
}

export interface ReturnStatsResponse {
  success: boolean;
  message: string;
  totalReturns: number;
  statusCounts: {
    Rejected: number;
    Validated: number;
    Requested: number;
    Inspection_Started: number;
    Inspection_Completed: number;
    Initiated_Refund: number;
    Refund_Completed: number;
  };
}