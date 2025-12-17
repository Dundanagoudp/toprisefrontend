import apiClient from "../apiClient";

// Pincode types
export interface Pincode {
  _id?: string;
  pincode: string;
  city: string;
  state: string;
  district: string;
  area: string;
  borzo_availability: {
    standard: boolean;
    endOfDay: boolean;
  };
  shipRocket_availability: boolean;
  delivery_available: boolean;
  delivery_charges: number;
  estimated_delivery_days: number;
  cod_available: boolean;
  status: "active" | "inactive";
  created_by?: string;
  updated_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PincodeResponse {
  success: boolean;
  message: string;
  data: Pincode | Pincode[];
}

export interface PincodeListResponse {
  success: boolean;
  message: string;
  data: {
    pincodes: Pincode[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      limit: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      nextPage: number | null;
      prevPage: number | null;
    };
    appliedFilters: {
      search: string | null;
      city: string | null;
      state: string | null;
      district: string | null;
      area: string | null;
      delivery_available: string | null;
      cod_available: string | null;
      shipRocket_availability: string | null;
      borzo_standard: string | null;
      borzo_endOfDay: string | null;
      estimated_delivery_days: string | null;
      status: string | null;
      sortBy: string;
      sortOrder: string;
    };
  };
}

export interface PincodeFilters {
  search?: string;
  city?: string;
  state?: string;
  district?: string;
  area?: string;
  delivery_available?: string;
  cod_available?: string;
  shipRocket_availability?: string;
  borzo_standard?: string;
  borzo_endOfDay?: string;
  estimated_delivery_days?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  limit?: number;
}

// Create a new pincode
export async function createPincode(
  pincodeData: Omit<Pincode, "_id" | "created_at" | "updated_at">
): Promise<PincodeResponse> {
  try {
    const response = await apiClient.post(
      "/category/api/pincodes/",
      pincodeData
    );
    return response.data;
  } catch (error) {
    console.error("Failed to create pincode:", error);
    throw error;
  }
}

// Get all pincodes with pagination and filters
export async function getPincodes(
  filters: PincodeFilters = {}
): Promise<PincodeListResponse> {
  try {
    // Build query string from filters
    const queryParams = new URLSearchParams();
    
    // Add pagination
    if (filters.page) queryParams.append('page', filters.page.toString());
    if (filters.limit) queryParams.append('limit', filters.limit.toString());
    
    // Add search and location filters
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.city) queryParams.append('city', filters.city);
    if (filters.state) queryParams.append('state', filters.state);
    if (filters.district) queryParams.append('district', filters.district);
    if (filters.area) queryParams.append('area', filters.area);
    
    // Add availability filters
    if (filters.shipRocket_availability) queryParams.append('shipRocket_availability', filters.shipRocket_availability);
    if (filters.borzo_standard) queryParams.append('borzo_standard', filters.borzo_standard);
    if (filters.borzo_endOfDay) queryParams.append('borzo_endOfDay', filters.borzo_endOfDay);
    if (filters.delivery_available) queryParams.append('delivery_available', filters.delivery_available);
    if (filters.cod_available) queryParams.append('cod_available', filters.cod_available);
    
    // Add other filters
    if (filters.estimated_delivery_days) queryParams.append('estimated_delivery_days', filters.estimated_delivery_days);
    if (filters.status) queryParams.append('status', filters.status);
    
    // Add sorting
    if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
    if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder);

    const queryString = queryParams.toString();
    const url = `/category/api/pincodes${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch pincodes:", error);
    throw error;
  }
}

// Get a single pincode by ID
export async function getPincodeById(
  pincodeId: string
): Promise<PincodeResponse> {
  try {
    const response = await apiClient.get(`/category/api/pincodes/${pincodeId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch pincode:", error);
    throw error;
  }
}

// Update a pincode
export async function updatePincode(
  pincodeId: string,
  pincodeData: Partial<Pincode>
): Promise<PincodeResponse> {
  try {
    const response = await apiClient.put(
      `/category/api/pincodes/${pincodeId}`,
      pincodeData
    );
    return response.data;
  } catch (error) {
    console.error("Failed to update pincode:", error);
    throw error;
  }
}

// Delete a pincode
export async function deletePincode(
  pincodeId: string
): Promise<PincodeResponse> {
  try {
    const response = await apiClient.delete(
      `/category/api/pincodes/${pincodeId}`
    );
    return response.data;
  } catch (error) {
    console.error("Failed to delete pincode:", error);
    throw error;
  }
}

// Bulk delete pincodes
export async function bulkDeletePincodes(
  pincodeIds: string[]
): Promise<PincodeResponse> {
  try {
    const response = await apiClient.delete(
      `/category/api/pincodes/bulk/delete`,
      {
        data: { ids: pincodeIds }
      }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to bulk delete pincodes:", error);
    throw error;
  }
}

// Bulk upload pincodes from CSV
export async function bulkUploadPincodes(
  file: File
): Promise<{
  success: boolean;
  message: string;
  data: {
    totalRows: number;
    inserted: number;
    skipped: number;
    errors: string[];
  };
}> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post(
      '/category/api/pincodes/bulk-upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to bulk upload pincodes:", error);
    throw error;
  }
}

// Get pincode by pincode number
export async function getPincodeByNumber(
  pincode: string
): Promise<PincodeResponse> {
  try {
    const response = await apiClient.get(
      `/category/pincodes/pincode/${pincode}`
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch pincode by number:", error);
    throw error;
  }
}
