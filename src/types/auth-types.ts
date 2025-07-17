

export interface LoginRequest {
  email: string
  password: string
}

export interface User {
  _id: string
  email: string
  password: string
  phone_Number: string
  role: string
  address: any[]
  __v: number
  last_login: string
  vehicle_details: any[]
}

export interface LoginResponse {

  success: number
  message: string
    data: {
    token: string
    user: User
  }
}

