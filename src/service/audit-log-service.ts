import apiClient from "@/apiClient"
import type {
  ActionAuditLogListResponse,
  ActionAuditLogFilters,
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
}

export default auditLogService

