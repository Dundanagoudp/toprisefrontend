import apiClient from "@/apiClient"
import type { Dealer, CreateDealerRequest, ApiResponse, User, Category } from "@/types/dealer-types"
import { SlaTypesResponse } from "@/types/sla-types"

// Create a dealer
export async function createDealer(data: CreateDealerRequest): Promise<ApiResponse<Dealer>> {
  try {
    const response = await apiClient.post("/users/api/users/dealer", data)
    return response.data
  } catch (error) {
    console.error("Failed to create dealer:", error)
    throw error
  }
}

// Get all dealers
export async function getAllDealers(): Promise<ApiResponse<Dealer[]>> {
  try {
    const response = await apiClient.get("/users/api/users/dealers")
    return response.data
  } catch (error) {
    console.error("Failed to fetch dealers:", error)
    throw error
  }
}

// Get dealer by id
export async function getDealerById(id: string): Promise<ApiResponse<Dealer>> {
  try {
    const response = await apiClient.get(`/users/api/users/dealer/${id}`)
    return response.data
  } catch (error) {
    console.error(`Failed to fetch dealer with id ${id}:`, error)
    throw error
  }
}

// Update dealer by id
export async function updateDealerById(id: string, data: Partial<CreateDealerRequest>): Promise<ApiResponse<Dealer>> {
  try {
    const response = await apiClient.put(`/users/api/users/dealer/${id}`, data)
    return response.data
  } catch (error) {
    console.error(`Failed to update dealer with id ${id}:`, error)
    throw error
  }
}

// Get all users for assignment
export async function getAllUsers(): Promise<ApiResponse<User[]>> {
  try {
    const response = await apiClient.get("/users/api/users")
    return response.data
  } catch (error) {
    console.error("Failed to fetch users:", error)
    throw error
  }
}

// get all categories
export async function getAllCategories(): Promise<ApiResponse<Category[]>> {
  try {
    const response = await apiClient.get("/category/api/category")
    return response.data
  } catch (error) {
    console.error("Failed to fetch categories:", error)
    throw error
  }
}

export async function uploadDealerBulk(  data: FormData): Promise<ApiResponse<Dealer>> {
  try {
    const response = await apiClient.post("/users/api/users/dealers/bulk", data)
    return response.data
  } catch (error) {
    console.error("Failed to upload dealer:", error)
    throw error
  }
}

export async function getAllCSlaTypes(): Promise<SlaTypesResponse> {
  try {
    const response = await apiClient.get("/orders/api/orders/sla/types")
    return response.data
  } catch (error) {
    console.error("Failed to fetch SLA types:", error)
    throw error
  }
}

export async function setSlaType(dealerId: string, data: any): Promise<SlaTypesResponse> {
  try {
    const response = await apiClient.post(`/orders/api/orders/dealers/${dealerId}/sla`, data)
    return response.data
  } catch (error) {
    console.error("Failed to upload dealer:", error)
    throw error
  }
}

// patch disble dealer 

export async function disableDealer(dealerId: string): Promise<ApiResponse<Dealer>> {
  try {
    const response = await apiClient.patch(`/users/api/users/disable-dealer/${dealerId}`)
    return response.data
  } catch (error) {
    console.error(`Failed to disable dealer with id ${dealerId}:`, error)
    throw error
  }
}

export async function enableDealer(dealerId: string): Promise<ApiResponse<Dealer>> {
  try {
    const response = await apiClient.patch(`/users/api/users/enable-dealer/${dealerId}`)
    return response.data
  } catch (error) {
    console.error(`Failed to enable dealer with id ${dealerId}:`, error)
    throw error
  }
}

// Add allowed categories for dealer
export async function addAllowedCategories(dealerId: string, categories: string[]): Promise<ApiResponse<any>> {
  try {
    const response = await apiClient.patch(`/users/api/users/updateDealer/addAllowedCategores/${dealerId}`, {
      categories
    })
    return response.data
  } catch (error) {
    console.error(`Failed to add allowed categories for dealer ${dealerId}:`, error)
    throw error
  }
}

// Remove allowed categories for dealer
export async function removeAllowedCategories(dealerId: string, categories: string[]): Promise<ApiResponse<any>> {
  try {
    const response = await apiClient.patch(`/users/api/users/updateDealer/removeAllowedCategores/${dealerId}`, {
      categories
    })
    return response.data
  } catch (error) {
    console.error(`Failed to remove allowed categories for dealer ${dealerId}:`, error)
    throw error
  }
}

// Assign employees to a dealer
export async function assignEmployeesToDealer(
  dealerId: string,
  payload: { employeeIds: string[]; assignmentNotes?: string }
): Promise<ApiResponse<any>> {
  try {
    console.log("[assignEmployeesToDealer] dealerId:", dealerId)
    console.log("[assignEmployeesToDealer] payload:", payload)
    const response = await apiClient.post(
      `/users/api/users/dealers/${dealerId}/assign-employees`,
      payload
    )
    console.log("[assignEmployeesToDealer] response:", response?.data)
    return response.data
  } catch (error) {
    console.error(`Failed to assign employees to dealer ${dealerId}:`, error)
    throw error
  }
}