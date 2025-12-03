import { PaymentDetailsResponse, PaymentDetailByIdResponse, PaymentSummary } from "@/types/paymentDetails-Types";
import apiClient from "@/apiClient";




export async function getPaymentDetails(
  page: number, 
  limit: number,
  filters: {
    payment_status?: string;
    payment_method?: string;
    startDate?: string | null;
    endDate?: string | null;
    sort?: string;
  }
): Promise<PaymentDetailsResponse> {
  try {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      payment_status: filters.payment_status || "all",
      payment_method: filters.payment_method || "all"
    });

    // If date range filters exist, add them
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);
    if (filters.sort) params.append("sort", filters.sort);

    const response = await apiClient.get(
      `orders/api/payments/all?${params.toString()}`
    );

    return response.data;
  } catch (error) {
    console.log("error in payment service", error);
    throw error;
  }
}

export async function getPaymentDetailsById(id: string): Promise<PaymentDetailByIdResponse> {
    try {
      const response = await apiClient.get(`orders/api/payments/by-id/${id}`);
      return response.data;
    } catch (error) {
      console.log("error in payment service",error)
      throw error;
    }
  }

export async function getPaymentStats(): Promise<{ success: boolean; data: PaymentSummary }> {
    try {
      const response = await apiClient.get(`orders/api/payments/stats`);
      return response.data;
    } catch (error) {
      console.log("error in payment stats service", error);
      // Return fallback data if API fails
      return {
        success: false,
        data: {
          total_payments: 0,
          total_amount: 0,
          successful_payments: 0,
          failed_payments: 0,
          pending_payments: 0,
          refunded_payments: 0
        }
      };
    }
  }

export async function getComprehensivePaymentStats(): Promise<{ success: boolean; data: any }> {
    try {
      const response = await apiClient.get(`orders/api/orders/payment-stats`);
      return response.data;
    } catch (error) {
      console.log("error in comprehensive payment stats service", error);
      throw error;
    }
  }