export interface ActionAuditLogUserId {
  _id: string
  email?: string
  phone_Number?: string
  role?: string
  address?: any[]
  __v?: number
  last_login?: string
  ticketsAssigned?: any[]
  vehicle_details?: any[]
  cartId?: string
  wishlistId?: string
}

export interface ActionAuditLog {
  _id: string
  actionName: string
  actionModule: string
  userId: ActionAuditLogUserId
  role: string
  ipAddress: string
  actionTime: string
  createdAt: string
  updatedAt: string
  __v?: number
}

export interface ActionAuditLogFilters {
  page?: number
  limit?: number
  search?: string
  module?: string
  role?: string
  startDate?: string
  endDate?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export interface ActionAuditLogPagination {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ActionAuditLogListResponse {
  success: boolean
  data: ActionAuditLog[]
  pagination: ActionAuditLogPagination
}

export interface CreateActionAuditLogRequest {
  actionName: string
  actionModule: string
}

export interface CreateActionAuditLogResponse {
  success: boolean
  message: string
  data: ActionAuditLog
}

