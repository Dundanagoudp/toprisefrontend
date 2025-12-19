import apiClient from "@/apiClient";
import { getAuthToken } from "@/utils/auth";

export interface UserAddress {
  index?: number;
  building_no?: string;
  nick_name?: string;
  street?: string;
  city?: string;
  pincode?: string;
  state?: string;
}

export interface UserBankDetails {
  account_number?: string;
  ifsc_code?: string;
  account_type?: string;
  bank_account_holder_name?: string;
  bank_name?: string;
}

export interface UserVehicleDetails {
  _id?: string;
  brand?: string;
  vehicle_type?: string;
  model?: string;
  variant?: string;
  year_Range?: string;
  selected_vehicle?: boolean;
}

export interface UserProfile {
  _id: string;
  email?: string;
  username?: string;
  bank_details?: UserBankDetails;
  password?: string;
  last_login?: string;
  address?: UserAddress[];
  phone_Number?: string;
  role?: "Super-admin" | "Fulfillment-Admin" | "Fulfillment-Staff" | "Inventory-Admin" | "Inventory-Staff" | "Dealer" | "User" | "Customer-Support";
  ticketsAssigned?: string[];
  vehicle_details?: UserVehicleDetails[];
  cartId?: string;
  fcmToken?: string;
  wishlistId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserProfileResponse {
  success: boolean;
  message: string;
  data: UserProfile;
}

export async function getUserProfile(userId: string): Promise<UserProfileResponse> {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await apiClient.get(`/users/api/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch user profile:", error);
    throw error;
  }
}

// Alias for getUserProfile to maintain backward compatibility
export const getUserById = getUserProfile;

export interface UpdateProfileRequest {
  email?: string;
  username?: string;
  phone_Number?: string;
  bank_details?: UserBankDetails;
  address?: UserAddress[];
  vehicle_details?: UserVehicleDetails[];
  [key: string]: any; // Allow any additional fields
}

export interface UpdateProfileResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface UpdateAddressRequest {
  address: UserAddress[];
}

export interface UpdateAddressResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface EditAddressRequest {
  index: number;
  updatedAddress: UserAddress;
}

export interface EditAddressResponse {
  success: boolean;
  message: string;
  data?: any;
}

export async function updateUserProfile(userId: string, profileData: UpdateProfileRequest): Promise<UpdateProfileResponse> {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    console.log("Updating profile with token:", token ? "Token found" : "No token");
    console.log("Profile data:", profileData);

    const response = await apiClient.put(`/users/api/users/profile/${userId}`, profileData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log("Profile update response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Failed to update user profile:", error);
    throw error;
  }
}

export async function AddAddress(userId: string, addressData: UpdateAddressRequest): Promise<UpdateAddressResponse> {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error("No authentication token found");
    }
    const response = await apiClient.put(`/users/api/users/updateAddress/${userId}`, addressData);
    return response.data;
  } catch (error) {
    console.error("Failed to update user address:", error);
    throw error;
  }
}

export async function editUserAddress(userId: string, addressData: EditAddressRequest): Promise<EditAddressResponse> {
  try {



    const response = await apiClient.put(`/users/api/users/address/${userId}`, addressData);
    
    console.log("Address edit response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Failed to edit user address:", error);
    throw error;
  }
}
export async function deleteUserAddress(
  userId: string,
  index: number
): Promise<any> {
  try {
    const response = await apiClient.delete(
      `/users/api/users/address/${userId}?index=${index}`,
      
    );
    return response.data;
  } catch (error) {
    console.error("Failed to delete user address:", error);
    throw error;
  }
}

export interface BankDetailsResponse {
  success: boolean;
  message: string;
  data?: UserBankDetails;
}

export async function getBankDetails(userId: string): Promise<BankDetailsResponse> {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await apiClient.get(`/users/api/users/${userId}/bank-details`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch bank details:", error);
    throw error;
  }
}

export async function createBankDetails(userId: string, bankDetails: UserBankDetails): Promise<BankDetailsResponse> {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    console.log("Creating bank details with token:", token ? "Token found" : "No token");
    console.log("Bank details data:", bankDetails);

    const response = await apiClient.post(`/users/api/users/${userId}/bank-details`, bankDetails, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log("Bank details create response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Failed to create bank details:", error);
    throw error;
  }
}

export async function updateBankDetails(userId: string, bankDetails: UserBankDetails): Promise<BankDetailsResponse> {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    console.log("Updating bank details with token:", token ? "Token found" : "No token");
    console.log("Bank details data:", bankDetails);

    const response = await apiClient.put(`/users/api/users/${userId}/bank-details`, bankDetails, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log("Bank details update response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Failed to update bank details:", error);
    throw error;
  }
}