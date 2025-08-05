import { ApiResponse } from "@/types/apiReponses-Types";
import apiClient from "@/apiClient";
import { User, LoginResponse } from "@/types/authentication-Types";

export async function loginUser(data: User): Promise<LoginResponse> {
  const response = await apiClient.post("/users/api/users/loginWeb", data, {
    withCredentials: true,
  });

  return response.data;
}
