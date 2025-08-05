export interface User {
  _id?: string;
  email: string;
  password: string;
  phone_Number: string;
  role: string;
  address: any[];
  __v?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  // If your API accepts phone login too, add it:
  // phone_Number?: string
}

export interface LoginResponse {
  data: any;
  user: User;
  token: string;
  message?: string;
}
