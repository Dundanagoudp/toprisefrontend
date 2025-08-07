export interface DealerProfile {
  _id: string
  email: string
  username: string
  address: any[]
  phone_Number: string
  role: string
  ticketsAssigned: any[]
  cartId: string | null
  fcmToken: string | null
  wishlistId: string | null
  last_login: string
  vehicle_details: any[]
  __v: number
}

export interface DealerProfileApiResponse {
  success: boolean
  message: string
  data: DealerProfile
}

// Extended interface for the dealer profile display
export interface DealerProfileDisplay {
  dealer_id: string
  legal_name: string
  trade_name: string
  gstin: string
  pan: string
  state: string
  pincode: string
  address: string
  contact_person: string
  mobile_number: string
  email: string
  default_margin_percent: number
  sla_type: string
  sla_max_dispatch_time: number
}
