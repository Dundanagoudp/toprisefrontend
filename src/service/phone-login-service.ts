import apiClient from '@/apiClient';

export interface PhoneLoginRequest {
  firebaseToken: string;
}

export interface PhoneLoginResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      _id: string;
      email: string;
      phone_Number: string;
      role: string;
      address: any[];
      vehicle_details: any[];
      __v: number;
      last_login: string;
    };
    token: string;
  };
}

/**
 * Login using Firebase token
 */
export async function loginWithFirebaseToken(firebaseToken: string): Promise<PhoneLoginResponse> {
  try {
    const response = await apiClient.post('/users/api/users/login', {
      firebaseToken
    });
    
    return response.data;
  } catch (error: any) {
    console.error('Phone login failed:', error);
    throw new Error(
      error?.response?.data?.message || 
      error?.message || 
      'Login failed'
    );
  }
}
