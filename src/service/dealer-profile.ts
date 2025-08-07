import apiClient from "@/apiClient"
import type { DealerProfileApiResponse, DealerProfile } from "@/types/dealer-profiletypes"
import { getAuthToken } from "@/utils/auth"

// Get dealer profile by ID
export async function getDealerProfileById(id: string): Promise<DealerProfile> {
  try {
    const response = await apiClient.get<DealerProfileApiResponse>(`/users/api/users/${id}`)
    return response.data.data
  } catch (error) {
    console.error(`Failed to fetch dealer profile with id ${id}:`, error)
    throw error
  }
}

// Get current dealer profile (extracts ID from token)
export async function getCurrentDealerProfile(): Promise<DealerProfile> {
  try {
    // Get dealer ID from token
    const token = getAuthToken()
    if (!token) {
      throw new Error("No authentication token found")
    }

    // Decode token to get dealer ID
    const payloadBase64 = token.split(".")[1]
    if (!payloadBase64) {
      throw new Error("Invalid token format")
    }

    const base64 = payloadBase64.replace(/-/g, "+").replace(/_/g, "/")
    const paddedBase64 = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=")
    const payloadJson = atob(paddedBase64)
    const payload = JSON.parse(payloadJson)
    
    // Try dealerId, fallback to id
    const dealerId = payload.dealerId || payload.id
    if (!dealerId) {
      throw new Error("Dealer ID not found in token")
    }

    return await getDealerProfileById(dealerId)
  } catch (error) {
    console.error("Error fetching current dealer profile:", error)
    throw error
  }
}
