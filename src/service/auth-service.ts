import apiClient from "@/apiClient";
import { LoginResponse, LoginRequest } from "@/types/authentication-Types";

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone_Number: string;
  role: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data?: {
    user: any;
    token?: string;
  };
}

export async function loginUser(data: LoginRequest): Promise<LoginResponse> {
     const response = await apiClient.post("/users/api/users/loginWeb", data, {
    withCredentials: true,
  });

  return response.data;
}

export async function registerUser(data: RegisterRequest): Promise<RegisterResponse> {
  try {
    const response = await apiClient.post("/users/api/users/createUserforWeb", data, {
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    console.error("Registration failed:", error);
    throw error;
  }
}
