import apiClient from "@/apiClient";

// add-users
export async function addEmployee(data: any): Promise<any> {
    try {
        const response = await apiClient.post("/users/api/users/createUser", data);
        return response.data;
    } catch (error) {
        console.error("Failed to add employee:", error);
        throw error;
    }
}

// get all users
export async function getAllEmployees(): Promise<any> {
    try {
        const response = await apiClient.get("/users/api/users");
        return response.data;
    } catch (error) {
        console.error("Failed to fetch employees:", error);
        throw error;
    }
}

// get user by id
export async function getEmployeeById(id: string): Promise<any> {
    try {
        const response = await apiClient.get(`/users/api/users/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch employee with id ${id}:`, error);
        throw error;
    }
}

// role revoke 
export async function revokeRole(id: string, data: any): Promise<any> {
    try {
        const response = await apiClient.put(`/users/api/users/revoke-role/${id}`, data);
        return response.data;
    } catch (error) {
        console.error(`Failed to revoke role for employee with id ${id}:`, error);
        throw error;
    }
}

// // update user by id
// export async function updateEmployeeById(id: string, data: any): Promise<any> {
//     try {
//         const response = await apiClient.put(`/users/api/users/${id}`, data);
//         return response.data;
//     } catch (error) {
//         console.error(`Failed to update employee with id ${id}:`, error);
//         throw error;
//     }
// }