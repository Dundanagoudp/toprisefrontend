import apiClient from "@/apiClient"
import type {
  ActionAuditLogListResponse,
  ActionAuditLogFilters,
  CreateActionAuditLogRequest,
  CreateActionAuditLogResponse,
} from "@/types/audit-log-types"

export const auditLogService = {
  // Get all action audit logs with pagination, search, and sorting
  getActionAuditLogs: async (
    filters?: ActionAuditLogFilters
  ): Promise<ActionAuditLogListResponse> => {
    const response = await apiClient.get<ActionAuditLogListResponse>(
      "/users/api/action-audit-logs/",
      { params: filters }
    )
    return response.data
  },

  // Create a new action audit log
  createActionAuditLog: async (
    data: CreateActionAuditLogRequest
  ): Promise<CreateActionAuditLogResponse> => {
    console.log("🔔 Audit Log Service: Calling API with data:", data);
    const response = await apiClient.post<CreateActionAuditLogResponse>(
      "/users/api/action-audit-logs/create",
      data
    )
    console.log("🔔 Audit Log Service: API Response:", response.data);
    return response.data
  },
}

export default auditLogService

