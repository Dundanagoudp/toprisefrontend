export interface TicketResponse {
  success: boolean;
  message: string;
  data: Ticket | Ticket[];
}

export interface Ticket {
  _id: string;
  userRef: string;
  order_id: string | null;
  updated_by: string | null;
  status: TicketStatus;
  description: string;
  attachments: string[];
  ticketType: TicketType;
  assigned: boolean;
  assigned_to: string;
  involved_users: string[];
  remarks: string;
  remarks_updated_at: string | null;
  remarks_updated_by?: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  admin_notes?: string;
}

export type TicketStatus = 
  | "Open" 
  | "In Progress" 
  | "Closed" 
  | "Pending" 
  | "Resolved";

export type TicketType = 
  | "General" 
  | "Order" 
  | "Technical" 
  | "Billing" 
  | "Support";

export interface CreateTicketPayload {
  userRef: string;
  order_id?: string | null;
  description: string;
  attachments?: string[];
  ticketType: TicketType;
}

export interface UpdateTicketPayload {
  status?: TicketStatus;
  description?: string;
  assigned_to?: string;
  admin_notes?: string;
  involved_users?: string[];
}

export interface PurchaseOrder {
  _id: string;
  req_files: string[];
  description: string;
  status: PurchaseOrderStatus;
  user_id: string;
  rejection_reason?: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export type PurchaseOrderStatus = "Pending" | "Approved" | "Rejected";

export interface PurchaseOrdersResponse {
  success: boolean;
  message: string;
  data: {
    data: PurchaseOrder[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
}