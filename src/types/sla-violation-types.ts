export interface OrderId {
  _id: string
  orderId: string
  orderDate: string
  deliveryCharges: number
  GST: number
  orderType: string
  orderSource: string
  skus: any[]
  order_Amount: number
  customerDetails: {
    userId: string
    name: string
    phone: string
    address: string
    pincode: string
    email: string
  }
  paymentType: string
  dealerMapping: any[]
  status: string
  timestamps: {
    createdAt: string
    assignedAt: string
  }
  type_of_delivery: string
  delivery_type: string
  payment_id: string
  ratting: number
  purchaseOrderId: string | null
  invoiceUrl: string
  auditLogs: any[]
  createdAt: string
  updatedAt: string
  __v: number
  invoiceNumber: string
  order_track_info: {
    borzo_order_id: string
  }
}

export interface ViolationNotes {
  resolve?: {
    added_at: string
    notes?: string
    added_by?: string
  }
  remark?: {
    added_at: string
    notes?: string
    added_by?: string
  }
  closed?: {
    added_at: string
    notes?: string
    added_by?: string
  }
}

export interface SlaViolation {
  _id: string
  dealer_id: string
  order_id: OrderId | string
  sku: string
  violation_minutes: number
  status: "pending" | "remarked" | "resolved" | "closed"
  notes: ViolationNotes
  created_at: string
  updated_at: string
  __v: number
}

export interface SlaViolationFilters {
  page?: number
  limit?: number
  search?: string
  status?: string
  dealer_id?: string
  order_id?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export interface PaginationInfo {
  totalItems: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  nextPage: number | null
  previousPage: number | null
}

export interface SlaViolationListResponse {
  success: boolean
  message: string
  data: {
    data: SlaViolation[]
    pagination: PaginationInfo
  }
}

export interface AddRemarkRequest {
  notes: string
  added_by: string
}

export interface CloseViolationRequest {
  notes: string
  added_by: string
}

export interface ResolveViolationRequest {
  notes: string
  added_by: string
}

export interface SlaViolationResponse {
  success: boolean
  message: string
  data: SlaViolation
}

