import apiClient from "@/apiClient"
import type { ApiResponse, Employee } from "@/types/employee-types"
import Cookies from "js-cookie"

/**
 * Adds a new employee to the system.
 * @param data Object containing employee details (no file upload).
 * @returns A Promise that resolves to the API response containing the new employee data.
 */
export async function addEmployee(data: any): Promise<ApiResponse<Employee>> {
  try {
    const response = await apiClient.post("/users/api/users/create-Employee", data)
    return response.data
  } catch (error) {
    console.error("Failed to add employee:", error)
    throw error
  }
}

/**
 * Fetches all employees from the system.
 * @returns A Promise that resolves to the API response containing an array of employees.
 */
export async function getAllEmployees(): Promise<ApiResponse<Employee[]>> {
  try {
    const response = await apiClient.get("/users/api/users/getemployees")
    return response.data
  } catch (error) {
    console.error("Failed to fetch employees:", error)
    throw error
  }
}

/**
 * Fetches a single employee by their ID.
 * @param id The unique identifier of the employee.
 * @returns A Promise that resolves to the API response containing the employee data.
 */
export async function getEmployeeById(id: string): Promise<ApiResponse<Employee>> {
  try {

    
    // Check if token exists


    
    const response = await apiClient.get(`/users/api/users/employee/${id}`)

    return response.data
  } catch (error: any) {
    console.error(`Failed to fetch employee with id ${id}:`, error)
    console.error("Error details:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers
    });

    throw error
  }
}

/**
 * Fetch dealer assignments for a given employee.
 * Mirrors GET /users/api/users/employees/:employeeId/dealer-assignments
 */
export async function getDealerAssignmentsForEmployee(
  employeeId: string
): Promise<ApiResponse<any>> {
  try {
    const response = await apiClient.get(
      `/users/api/users/employees/${employeeId}/dealer-assignments`
    )
    return response.data
  } catch (error) {
    console.error(
      `Failed to fetch dealer assignments for employee ${employeeId}:`,
      error
    )
    throw error
  }
}

/**
 * Revokes a role from an employee.
 * @param id The unique identifier of the employee.
 * @param data Object containing role revocation details.
 * @returns A Promise that resolves to the API response.
 */
export async function revokeRole(id: string, data: any): Promise<any> {
  try {
    const response = await apiClient.put(`/users/api/users/revoke-role/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Failed to revoke role for employee with id ${id}:`, error);
    throw error;
  }
}

/**
 * Reactivates an employee's role.
 * @param employeeId The unique identifier of the employee.
 * @param updatedBy The ID of the user performing the reactivation.
 * @returns A Promise that resolves to the API response.
 */
export async function reactivateRole(employeeId: string, updatedBy: string): Promise<any> {
  try {
    console.log("Reactivating employee:", employeeId);
    console.log("Updated by:", updatedBy);
    console.log("API endpoint: /users/api/users/employee/reactivate-role");
    
    const response = await apiClient.put(`/users/api/users/employee/reactivate-role`, {
      employeeId,
      updatedBy
    });
    
    console.log("Reactivate role response:", response.data);
    return response.data;
  } catch (error) {
    console.error(`Failed to reactivate role for employee with id ${employeeId}:`, error);
    throw error;
  }
}

// New API functions for region and dealer filtering

/**
 * Get employees by dealer
 * @param dealerId ID of the dealer
 * @param filters Optional filters (role, page, limit)
 * @returns A Promise that resolves to the API response containing employees assigned to the dealer
 */
export async function getEmployeesByDealer(
  dealerId: string,
  filters: { role?: string; page?: number; limit?: number } = {}
): Promise<ApiResponse<any>> {
  try {
    const queryParams = new URLSearchParams();
    if (filters.role) queryParams.append('role', filters.role);
    if (filters.page) queryParams.append('page', filters.page.toString());
    if (filters.limit) queryParams.append('limit', filters.limit.toString());

    const url = `/users/api/users/employees/dealer/${dealerId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch employees by dealer ${dealerId}:`, error);
    throw error;
  }
}

/**
 * Get employees by region
 * @param region Name of the region
 * @param filters Optional filters (role, page, limit, includeNoDealer)
 * @returns A Promise that resolves to the API response containing employees assigned to the region
 */
export async function getEmployeesByRegion(
  region: string,
  filters: { role?: string; page?: number; limit?: number; includeNoDealer?: boolean } = {}
): Promise<ApiResponse<any>> {
  try {
    const queryParams = new URLSearchParams();
    if (filters.role) queryParams.append('role', filters.role);
    if (filters.page) queryParams.append('page', filters.page.toString());
    if (filters.limit) queryParams.append('limit', filters.limit.toString());
    if (filters.includeNoDealer !== undefined) queryParams.append('includeNoDealer', filters.includeNoDealer.toString());

    const url = `/users/api/users/employees/region/${region}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch employees by region ${region}:`, error);
    throw error;
  }
}

/**
 * Get employees by region and dealer
 * @param region Name of the region
 * @param dealerId ID of the dealer
 * @param filters Optional filters (role, page, limit)
 * @returns A Promise that resolves to the API response containing employees assigned to both region and dealer
 */
export async function getEmployeesByRegionAndDealer(
  region: string,
  dealerId: string,
  filters: { role?: string; page?: number; limit?: number } = {}
): Promise<ApiResponse<any>> {
  try {
    const queryParams = new URLSearchParams();
    if (filters.role) queryParams.append('role', filters.role);
    if (filters.page) queryParams.append('page', filters.page.toString());
    if (filters.limit) queryParams.append('limit', filters.limit.toString());

    const url = `/users/api/users/employees/region/${region}/dealer/${dealerId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch employees by region ${region} and dealer ${dealerId}:`, error);
    throw error;
  }
}

/**
 * Get fulfillment staff by region (specialized endpoint)
 * @param region Name of the region
 * @param filters Optional filters (page, limit, includeNoDealer)
 * @returns A Promise that resolves to the API response containing fulfillment staff assigned to the region
 */
export async function getFulfillmentStaffByRegion(
  region: string,
  filters: { page?: number; limit?: number; includeNoDealer?: boolean } = {}
): Promise<ApiResponse<any>> {
  try {
    const queryParams = new URLSearchParams();
    if (filters.page) queryParams.append('page', filters.page.toString());
    if (filters.limit) queryParams.append('limit', filters.limit.toString());
    if (filters.includeNoDealer !== undefined) queryParams.append('includeNoDealer', filters.includeNoDealer.toString());

    const url = `/users/api/users/employees/fulfillment/region/${region}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch fulfillment staff by region ${region}:`, error);
    throw error;
  }
}

/**
 * Get available regions from employee data
 * This function extracts unique regions from existing employees
 * @returns A Promise that resolves to an array of available regions
 */
export async function getAvailableRegions(): Promise<string[]> {
  try {
    const response = await getAllEmployees();
    const employees = response.data || [];
    
    // Extract unique regions from employee data
    const regions = new Set<string>();
    employees.forEach(employee => {
      if (employee.assigned_regions && Array.isArray(employee.assigned_regions)) {
        employee.assigned_regions.forEach(region => {
          if (region && typeof region === 'string') {
            regions.add(region);
          }
        });
      }
    });
    
    // Convert to array and sort
    return Array.from(regions).sort();
  } catch (error) {
    console.error("Failed to fetch available regions:", error);
    // Return default regions if API fails
    return ["North", "South", "East", "West", "Central", "Northeast", "Northwest", "Southeast", "Southwest"];
  }
}

/**
 * Fetches all fulfillment staff with their details including assigned dealers and regions
 * @param filters Optional filters (page, limit, sortBy, sortOrder)
 * @returns A Promise that resolves to the API response containing fulfillment staff data
 */
export async function getAllFulfillmentStaff(
  filters: { page?: number; limit?: number; sortBy?: string; sortOrder?: string } = {}
): Promise<ApiResponse<any>> {
  try {
    const queryParams = new URLSearchParams();
    if (filters.page) queryParams.append('page', filters.page.toString());
    if (filters.limit) queryParams.append('limit', filters.limit.toString());
    if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
    if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder);

    const url = `/users/api/users/fulfillment-staff${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch fulfillment staff:", error);
    throw error;
  }
}


//get all fulfillment staff  wihtout pagination
export async function getAllFulfillmentStaffWithoutPagination(): Promise<ApiResponse<any>> {
  try {
    const response = await apiClient.get("/users/api/users/fulfillment/get/allEmployees");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch fulfillment staff without pagination:", error);
    throw error;
  }
}

// get fulfillment staff by dealer id who's not assigned to any dealer
export async function getFulfillmentStaffByDealer(dealerId: string): Promise<ApiResponse<any>> {
  try {
    const response = await apiClient.get(`/users/api/users/get/fulfillment/staff/byDealer/${dealerId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch fulfillment staff by dealer:", error);
    throw error;
  }
}