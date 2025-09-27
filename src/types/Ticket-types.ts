export interface TicketResponse {
  success: boolean;
  message: string;
  data: Ticket[];
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
  userDetails: Record<string, UserDetail>;
  userRefDetails: UserDetail;
  assignedToDetails: UserDetail;
  updatedByDetails?: UserDetail;
  remarksUpdatedByDetails?: UserDetail;
}

export interface UserDetail {
  _id: string;
  username?: string;
  email: string;
  role: UserRole;
}

export type UserRole = "User" | "Customer-Support" | "Super-admin" | "Admin";

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
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export type PurchaseOrderStatus = "Pending" | "Approved";

export interface PurchaseOrdersResponse {
  success: boolean;
  message: string;
  data: PurchaseOrder[];
}