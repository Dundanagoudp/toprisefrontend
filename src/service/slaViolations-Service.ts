import apiClient from "@/apiClient";

// TypeScript Interfaces for SLA Types
export interface SlaType {
  _id?: string;
  name: string;
  description: string;
  expected_hours: number;
  created_at?: string;
  updated_at?: string;
  __v?: number;
}

export interface SlaTypeFilters {
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface SlaTypeListResponse {
  success: boolean;
  message: string;
  data: {
    data: SlaType[];
    pagination: {
      totalItems: number;
      totalPages: number;
      currentPage: number;
      pageSize: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      nextPage: number | null;
      previousPage: number | null;
    };
  };
}

export interface SlaTypeResponse {
  success: boolean;
  message: string;
  data: SlaType;
}

// SLA Types Service
export const slaTypesService = {
  // Get all SLA types with pagination, search, and sorting
  getSlaTypes: async (filters?: SlaTypeFilters): Promise<SlaTypeListResponse> => {
    const response = await apiClient.get<SlaTypeListResponse>(
      "/orders/api/sla-types/all/pagination",
      { params: filters }
    );
    return response.data;
  },

  // Get single SLA type by ID
  getSlaTypeById: async (id: string): Promise<SlaTypeResponse> => {
    const response = await apiClient.get<SlaTypeResponse>(
      `/orders/api/sla-types/${id}`
    );
    return response.data;
  },

  // Create new SLA type
  createSlaType: async (
    data: Omit<SlaType, "_id" | "created_at" | "updated_at" | "__v">
  ): Promise<SlaTypeResponse> => {
    const response = await apiClient.post<SlaTypeResponse>(
      "/orders/api/sla-types/",
      data
    );
    return response.data;
  },

  // Update existing SLA type
  updateSlaType: async (
    id: string,
    data: Partial<Omit<SlaType, "_id" | "created_at" | "updated_at" | "__v">>
  ): Promise<SlaTypeResponse> => {
    const response = await apiClient.put<SlaTypeResponse>(
      `/orders/api/sla-types/${id}`,
      data
    );
    return response.data;
  },

  // Delete SLA type
  deleteSlaType: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      `/orders/api/sla-types/${id}`
    );
    return response.data;
  },
};

// SLA Violation Statistics Service
export const slaViolationsService = {
  // Get SLA Violation Statistics
  getStats: async (params?: {
    startDate?: string;
    endDate?: string;
    dealerId?: string;
    groupBy?: "dealer" | "date" | "month";
    includeDetails?: boolean;
    includeOrderDetails?: boolean;
  }) => {
    const response = await apiClient.get("/orders/api/sla-violations/stats/stats", {
      params,
    });
    return response.data;
  },

  // Get Dealers with Multiple Violations
  getDealersWithViolations: async (params?: {
    minViolations?: number;
    startDate?: string;
    endDate?: string;
    includeDisabled?: boolean;
  }) => {
    const response = await apiClient.get(
      "/orders/api/sla-violations/dealers-with-violations",
      { params }
    );
    return response.data;
  },

  // Disable Dealer for Violations
  disableDealer: async (
    dealerId: string,
    data: {
      reason: string;
      adminNotes: string;
    }
  ) => {
    const response = await apiClient.put(
      `/orders/api/sla-violations/disable-dealer/${dealerId}`,
      data
    );
    return response.data;
  },

  // Get SLA Violation Trends
  getTrends: async (params?: {
    period?: "7d" | "30d" | "90d" | "1y";
    dealerId?: string;
  }) => {
    const response = await apiClient.get("/orders/api/sla-violations/trends", {
      params,
    });
    return response.data;
  },

  // Get Top Violating Dealers
  getTopViolators: async (params?: {
    limit?: number;
    startDate?: string;
    endDate?: string;
    sortBy?: "violations" | "minutes" | "avgMinutes" | "recent";
  }) => {
    const response = await apiClient.get(
      "/orders/api/sla-violations/top-violators",
      {
        params,
      }
    );
    return response.data;
  },

  // Resolve SLA Violation
  resolveViolation: async (
    violationId: string,
    data: {
      resolutionNotes: string;
    }
  ) => {
    const response = await apiClient.put(
      `/orders/api/sla-violations/resolve/${violationId}`,
      data
    );
    return response.data;
  },

  // Get SLA Violation Dashboard
  getDashboard: async () => {
    const response = await apiClient.get(
      "/orders/api/sla-violations/dashboard"
    );
    return response.data;
  },

  // Get SLA Violation Alerts
  getAlerts: async () => {
    const response = await apiClient.get("/orders/api/sla-violations/alerts");
    return response.data;
  },

  // Bulk Disable Dealers
  bulkDisableDealers: async (data: {
    dealerIds: string[];
    reason: string;
    adminNotes: string;
  }) => {
    const response = await apiClient.post(
      "/orders/api/sla-violations/bulk-disable",
      data
    );
    return response.data;
  },
};

export default slaViolationsService;
