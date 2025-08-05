
import apiClient from "@/apiClient";
import { LoginResponse, LoginRequest } from "@/types/authentication-Types";

export async function loginUser(data: LoginRequest): Promise<LoginResponse> {
     const response = await apiClient.post("/users/api/users/loginWeb", data, {
    withCredentials: true,
  });

  return response.data;
}
