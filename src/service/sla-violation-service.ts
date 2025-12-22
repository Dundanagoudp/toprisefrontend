import apiClient from "@/apiClient"
import type {
  SlaViolationListResponse,
  SlaViolationFilters,
  AddRemarkRequest,
  CloseViolationRequest,
  ResolveViolationRequest,
  SlaViolationResponse,
} from "@/types/sla-violation-types"

export const slaViolationService = {
  // Get all SLA violations with pagination, search, and sorting
  getSlaViolations: async (
    filters?: SlaViolationFilters
  ): Promise<SlaViolationListResponse> => {
    const response = await apiClient.get<SlaViolationListResponse>(
      "/orders/api/sla-voilation-model",
      { params: filters }
    )
    return response.data
  },

  // Add remark to a violation
  addRemark: async (
    id: string,
    data: AddRemarkRequest
  ): Promise<SlaViolationResponse> => {
    const response = await apiClient.patch<SlaViolationResponse>(
      `/orders/api/sla-voilation-model/${id}/remark`,
      data
    )
    return response.data
  },

  // Close a violation
  closeViolation: async (
    id: string,
    data: CloseViolationRequest
  ): Promise<SlaViolationResponse> => {
    const response = await apiClient.patch<SlaViolationResponse>(
      `/orders/api/sla-voilation-model/${id}/close`,
      data
    )
    return response.data
  },

  // Resolve a violation
  resolveViolation: async (
    id: string,
    data: ResolveViolationRequest
  ): Promise<SlaViolationResponse> => {
    const response = await apiClient.patch<SlaViolationResponse>(
      `/orders/api/sla-voilation-model/${id}/resolve`,
      data
    )
    return response.data
  },

  // Get SLA violations for a specific dealer
  getSlaViolationsByDealer: async (
    dealerId: string,
    filters?: SlaViolationFilters
  ): Promise<SlaViolationListResponse> => {
    // Clean filters - remove empty strings and undefined values
    const cleanParams: Record<string, string | number> = {}
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        // Only include non-empty values
        if (value !== undefined && value !== null && value !== "") {
          cleanParams[key] = value
        }
      })
    }
    
    console.log("API Call - Dealer ID:", dealerId, "Params:", cleanParams)
    const response = await apiClient.get<SlaViolationListResponse>(
      `/orders/api/sla-voilation-model/dealer/${dealerId}`,
      { params: cleanParams }
    )
    console.log("API Response structure:", {
      hasData: !!response.data,
      hasDataData: !!response.data?.data,
      isArray: Array.isArray(response.data?.data),
      responseKeys: response.data ? Object.keys(response.data) : []
    })
    return response.data
  },
}

export default slaViolationService

