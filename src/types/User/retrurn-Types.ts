// types/returnRequests.ts

export interface ReturnRequestsResponse {
    success: boolean;
    message: string;
    data: {
      returnRequests: ReturnRequest[];
      pagination: Pagination;
      userStats: UserStats;
    };
  }
  
  /** Single return request */
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
    inspection?: Inspection | null;
    refund?: Refund | null;
    actionTaken?: string | null;
    timestamps?: RequestTimestamps | null;
    tracking_info?: Tracking_info | null;
    originalOrderDate?: string | null;
    notes?: any[]; // keep flexible
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
    borzoShipmentInitiatedAt?: string | null;
    borzoShipmentCompletedAt?: string | null;
    courrierScheduledAt?: string | null;
  }
  
  /** Inspection details */
  export interface Inspection {
    skuMatch?: boolean;
    inspectionImages?: string[]; // may be base64 or urls
    isApproved?: boolean;
    inspectedAt?: string | null;
    inspectedBy?: string | null;
    inspectedByUser?: InspectedByUser | null;
    // Additional optional inspection fields seen in some items:
    condition?: string | null;
    conditionNotes?: string | null;
    rejectionReason?: string | null;
  }
  /** Tracking info */
  export interface Tracking_info {
    courrierScheduledAt?: string | null;
    courrierDepartedAt?: string | null;
    courrier_departed?: string | null;
    courrier_delivered?: string | null;
  }
  /** User who inspected */
  export interface InspectedByUser {
    id: string;
    name: string;
    role?: string | null;
  }
  
  /** Refund block */
  export interface Refund {
    refundAmount?: number | null;
    refundMethod?: string | null;
    refundStatus?: string | null;
    refund_id?: string | null;
    processedByUser?: any | null;
  }
  
  /** Request timestamps */
  export interface RequestTimestamps {
    requestedAt?: string | null;
    validatedAt?: string | null;
    pickupScheduledAt?: string | null;
    pickupCompletedAt?: string | null;
    inspectionStartedAt?: string | null;
    inspectionCompletedAt?: string | null;
    courrierScheduledAt?: string | null;
    courrierDepartedAt?: string | null;
    courrierDeliveredAt?: string | null;
    rejectedAt?: string | null;
    borzoShipmentInitiatedAt?: string | null;
    refundCompletedAt?: string | null;
    // include any other timestamp keys present
  }
  
  /** Pickup / logistics information */
  export interface PickupRequest {
    pickupId?: string | null;
    scheduledDate?: string | null;
    logisticsPartner?: string | null;
    trackingNumber?: string | null;
    pickupAddress?: Address | null;
    deliveryAddress?: Address | null;
    completedDate?: string | null;
    shipmentInitiatedAt?: string | null;
    shipmentCompletedAt?: string | null;
  }
  
  /** Simple address */
  export interface Address {
    address?: string | null;
    city?: string | null;
    pincode?: string | null;
    state?: string | null;
  }
  
  /** Product details attached to the return */
  export interface ProductDetails {
    sku?: string | null;
    productName?: string | null;
    brand?: string | null;
    category?: string | null;
    subcategory?: string | null;
    images?: string[]; // may be empty
    isReturnable?: boolean;
    returnPolicy?: string | null;
  }
  
  /** Pagination metadata */
  export interface Pagination {
    page: number;
    limit: number;
    total: number;
    pages: number;
  }
  
  /** Aggregated user stats */
  export interface UserStats {
    totalReturns: number;
    totalRefundAmount: number;
    averageProcessingTime?: number | null;
    statusBreakdown: {
      [status: string]: number; // e.g. { "Approved": 1, "Requested": 4 }
    };
  }
  