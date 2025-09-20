import apiClient from "@/apiClient";

// Vehicle Info API Response Types
export interface VehicleApiData {
  description: string;
  registrationYear: string;
  make: string;
  model: string;
  variant: string;
  engineSize: string;
  fuelType: string;
  registrationDate: string;
  owner: string;
  fitnessExpiry: string;
  insuranceExpiry: string;
  vehicleType: string;
  location: string;
  imageUrl: string;
}

export interface VehicleBrand {
  _id: string;
  brand_name: string;
  brand_code: string;
  type: string;
  created_by: string;
  updated_by: string;
  brand_logo: string;
  status: string;
  created_at: string;
  updated_at: string;
  __v: number;
  featured_brand: boolean;
}

export interface VehicleModel {
  _id: string;
  model_name: string;
  model_code: string;
  brand_ref: string;
  model_image: string;
  created_by: string;
  updated_by: string;
  status: string;
  created_at: string;
  updated_at: string;
  __v: number;
}

export interface VehicleVariant {
  _id: string;
  variant_name: string;
  variant_code: string;
  Year: string[];
  model: string;
  created_by: string;
  updated_by: any[];
  variant_status: string;
  variant_Description: string;
  created_at: string;
  updated_at: string;
  __v: number;
}

export interface VehicleDbMatches {
  brand: VehicleBrand;
  model: VehicleModel;
  variant: VehicleVariant;
}

export interface VehicleInfoResponse {
  success: boolean;
  data: {
    apiData: VehicleApiData;
    dbMatches: VehicleDbMatches;
    message: string;
  };
}

export async function getVehicleInfo(registrationNumber: string): Promise<VehicleInfoResponse> {
  try {
    // Convert registration number to uppercase
    const upperCaseRegNumber = registrationNumber.toUpperCase();
    
    const response = await apiClient.get(`/products/api/vehicleInfo/getInfo/${upperCaseRegNumber}`);
    
    // Validate response data
    if (!response || !response.data) {
      throw new Error('Invalid response from vehicle info API');
    }
    
    return response.data;
  } catch (error) {
    console.error("Failed to get vehicle info:", error);
    throw error;
  }
}
