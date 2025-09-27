import apiClient from "@/apiClient";

interface CustomerDetails {
  userId: string;
  name: string;
  phone: string;
  address: string;
  pincode: string;
  email: string;
}

interface PaymentCreationPayload {
  userId: string;
  amount: number;
  orderType: string;
  orderSource: string;
  customerDetails: CustomerDetails;
}

export async function paymentCreation(paymentData: PaymentCreationPayload): Promise<any> {
  try {
    const response = await apiClient.post(`/orders/api/payments`, paymentData, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to create payment:", error);
    throw error;
  }
}