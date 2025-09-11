// Analytics Types for Reports

// Common interfaces
export interface AnalyticsFilters {
  startDate?: string | null;
  endDate?: string | null;
  status?: string | null;
  isActive?: boolean | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  createdBy?: string | null;
  groupBy?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
}

export interface UserInfo {
  _id: string;
  email: string;
  username?: string;
  password: string;
  phone_Number: string;
  role: string;
  address?: any[];
  last_login?: string;
  cartId?: string | null;
  fcmToken?: string | null;
  wishlistId?: string | null;
  ticketsAssigned?: any[];
  vehicle_details?: any[];
  __v: number;
}

// Dealer Analytics Types
export interface DealerInfo {
  _id: string;
  user_id: string;
  dealerId: string;
  legal_name: string;
  trade_name: string;
  GSTIN: string;
  Pan: string;
  Address: {
    street: string;
    city: string;
    pincode: string;
    state: string;
  };
  contact_person: {
    name: string;
    email: string;
    phone_number: string;
  };
  is_active: boolean;
  categories_allowed: string[];
  upload_access_enabled: boolean;
  default_margin: number;
  last_fulfillment_date?: string;
  assigned_Toprise_employee?: Array<{
    assigned_user: string;
    status: string;
    _id: string;
    assigned_at: string;
  }>;
  SLA_type: string;
  SLA_max_dispatch_time?: number;
  dealer_dispatch_time?: number;
  dispatch_hours?: {
    start: number;
    end: number;
  };
  onboarding_date: string;
  remarks?: string;
  created_at: string;
  updated_at: string;
  __v: number;
}

export interface DealerAnalyticsItem {
  dealerId: string;
  legalName: string;
  categoriesAllowed: string[];
  userInfo: UserInfo;
  dealerInfo?: DealerInfo[];
}

export interface DealerAnalyticsGroup {
  _id: string | null;
  count: number;
  activeDealers: number;
  inactiveDealers: number;
  totalCategories: number;
  avgCategories: number;
  dealers: DealerAnalyticsItem[];
}

export interface DealerAnalyticsSummary {
  totalDealers: number;
  activeDealers: number;
  inactiveDealers: number;
  totalCategories: number;
  avgCategories: number;
  statusBreakdown: Record<string, number>;
}

export interface DealerAnalyticsResponse {
  success: boolean;
  message: string;
  data: {
    summary: DealerAnalyticsSummary;
    analytics: DealerAnalyticsGroup[];
    filters: AnalyticsFilters;
  };
}

// Employee Analytics Types
export interface EmployeeAnalyticsItem {
  employeeId: string;
  assignedDealers: string[];
  userInfo: UserInfo;
  dealerInfo: DealerInfo[];
}

export interface EmployeeAnalyticsGroup {
  _id: string | null;
  count: number;
  activeEmployees: number;
  inactiveEmployees: number;
  totalAssignedDealers: number;
  avgAssignedDealers: number;
  employees: EmployeeAnalyticsItem[];
}

export interface EmployeeAnalyticsSummary {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  totalAssignedDealers: number;
  avgAssignedDealers: number;
  statusBreakdown: Record<string, number>;
}

export interface EmployeeAnalyticsResponse {
  success: boolean;
  message: string;
  data: {
    summary: EmployeeAnalyticsSummary;
    analytics: EmployeeAnalyticsGroup[];
    filters: AnalyticsFilters;
  };
}

// User Performance Types
export interface UserPerformanceItem {
  _id: string;
  userId: string;
  email: string;
  role: string;
  daysSinceCreation?: number | null;
  daysSinceLastLogin?: number | null;
  activityScore?: number | null;
}

export interface RoleBreakdown {
  count: number;
  totalLogins: number;
  avgLogins: number;
}

export interface UserPerformanceSummary {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  avgLoginCount: number;
  maxLoginCount: number;
  minLoginCount: number;
  totalLoginCount: number;
  roleBreakdown: Record<string, RoleBreakdown>;
}

export interface UserPerformanceResponse {
  success: boolean;
  message: string;
  data: {
    summary: UserPerformanceSummary;
    performance: UserPerformanceItem[];
    filters: AnalyticsFilters;
  };
}

// Filter Types
export interface AnalyticsFilterOptions {
  startDate?: string;
  endDate?: string;
  status?: string;
  isActive?: boolean;
  city?: string;
  state?: string;
  pincode?: string;
  role?: string;
  groupBy?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
}

// Export Types
export interface ExportOptions {
  format: 'csv' | 'pdf' | 'excel';
  includeFilters?: boolean;
  includeSummary?: boolean;
  includeDetails?: boolean;
}
