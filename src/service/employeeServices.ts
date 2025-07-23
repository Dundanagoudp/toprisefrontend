import apiClient from "@/apiClient"
import type { ApiResponse, Employee } from "@/types/employee-types"

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
    const response = await apiClient.get(`/users/api/users/employee/${id}`)
    return response.data
  } catch (error) {
    console.error(`Failed to fetch employee with id ${id}:`, error)
    throw error
  }
}
