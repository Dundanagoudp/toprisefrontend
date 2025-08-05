import { ApiResponse } from "@/types/apiReponses-Types";
import apiClient from "@/apiClient";
import { LoginRequest, LoginResponse } from "@/types/auth-types";

export async function loginUser(data: LoginRequest): Promise<LoginResponse> {
  const response = await apiClient.post("/users/api/users/loginWeb", data, {
    withCredentials: true,
  });

  return response.data;
}
