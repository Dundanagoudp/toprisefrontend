import apiClient from "../apiClient";

// Pincode types
export interface Pincode {
  _id?: string;
  pincode: string;
  city: string;
  state: string;
  district: string;
  area: string;
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
      totalPincodes: number;
      limit: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
      nextPage: number | null;
      prevPage: number | null;
    };
    filters: {
      search: string | null;
      city: string | null;
      state: string | null;
      district: string | null;
      delivery_available: boolean | null;
      status: string | null;
      sortBy: string;
      sortOrder: string;
    };
  };
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

// Get all pincodes with pagination
export async function getPincodes(
  page: number = 1,
  limit: number = 10,
  search?: string
): Promise<PincodeListResponse> {
  try {

    const response = await apiClient.get(`/category/api/pincodes/?page=${page}&limit=${limit}&search=${search}`);
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
