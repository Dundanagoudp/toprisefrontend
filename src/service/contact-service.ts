import apiClient from "@/apiClient"
import { contactReponse } from "@/types/contact-Types"


export async function contactUs(  data: any): Promise<contactReponse>{
  try {
    const response = await apiClient.post("/users/api/contact/contact", data)
    return response.data
  } catch (error) {
    console.error("Failed to upload dealer:", error)
    throw error
  }
}

