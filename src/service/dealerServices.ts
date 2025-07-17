import apiClient from "@/apiClient"
import type { Dealer, CreateDealerRequest, ApiResponse, User, Category } from "@/types/dealer-types"

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
