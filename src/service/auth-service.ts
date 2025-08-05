import { ApiResponse } from "@/types/apiReponses-Types";
import { User,  LoginResponse } from "@/types/auth-Types";
import apiClient from "@/apiClient";


export async function loginUser(data: User): Promise<LoginResponse> {
     const response = await apiClient.post("/users/api/users/loginWeb", data, {
    withCredentials: true,
  });

return response.data;
}
