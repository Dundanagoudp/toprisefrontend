
/**
 * Represents a user object, often nested within an Employee object.
 */
export type User = {
  _id: string
  email: string
  phone_Number: string
  role: string
  username?: string
}

/**
 * Represents an Employee object as returned by the API.
 */
export type Employee = {
  _id: string
  user_id: string | User
  employee_id: string
  First_name: string
  profile_image: string
  mobile_number: string
  email: string
  role: string
  assigned_dealers: string[]
  assigned_regions: string[]
  last_login: string
  updated_at: string
  created_at: string
  __v: number
  designation?: string
  department?: string
  status?: string
  accessLevel?: string
  roleDescription?: string
  sendLoginInvite?: boolean
  temporaryPassword?: string
  currentStatus?: string
  createdBy?: string
  assignedOrdersPicklists?: string
  slaType?: string
  slaMaxDispatchTime?: string
  remarks?: string
  auditTrail?: string
}

/**
 * Generic API response structure.
 * T will be the type of the 'data' payload (e.g., Employee, Employee[], string).
 */
export type ApiResponse<T> = {
  success?: boolean
  message: string
  token?: string
  user?: User
  employee?: Employee
  data?: T
}
