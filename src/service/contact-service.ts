import apiClient from "@/apiClient"
import { contactReponse } from "@/types/contact-Types"


export interface ContactUsPayload {
  enquiry_name: string;
  enquiry_phone: string;
  enquiry_email: string;
  enquiry_message: string;
}

export async function contactUs(payload: ContactUsPayload): Promise<contactReponse> {
  try {
    const response = await apiClient.post("/users/api/contact/contact", payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    return response.data
  } catch (error) {
    console.error("Failed to upload dealer:", error)
    throw error
  }
}

