import { ApiResponse } from "@/types/apiReponses-Types";
import { User, LoginRequest } from "@/types/auth-Types";
import apiClient from "@/apiClient";


export async function loginUser(data: LoginRequest): Promise<ApiResponse<User>> {
     const response = await apiClient.post("/users/api/users/loginWeb", data, {
    withCredentials: true,
  });

  return{
    success: response.data.success,
    data: response.data,
  }


}