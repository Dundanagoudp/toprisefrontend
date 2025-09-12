import apiClient from "@/apiClient";

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  address?: Array<{
    _id: string;
    nick_name: string;
    street: string;
    city: string;
    pincode: string;
    state: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfileResponse {
  success: boolean;
  message: string;
  data: UserProfile;
}

export async function getUserProfile(userId: string): Promise<UserProfileResponse> {
  try {
    const response = await apiClient.get(`/users/api/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch user profile:", error);
    throw error;
  }
}