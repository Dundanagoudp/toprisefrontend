import apiClient from "@/apiClient";
import {
  DealerAnalyticsResponse,
  EmployeeAnalyticsResponse,
  UserPerformanceResponse,
  AnalyticsFilterOptions,
} from "@/types/analytics-types";

/**
 * Analytics Service for Reports
 */

// Base URL for analytics API
const ANALYTICS_BASE_URL = "https://api.toprise.in/api/users/api/reports/";

/**
 * Fetch Dealer Analytics
 */
export async function fetchDealerAnalytics(
  filters: AnalyticsFilterOptions = {}
): Promise<DealerAnalyticsResponse> {
  try {
    const queryParams = new URLSearchParams();

    // Add filters to query params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, value.toString());
      }
    });

    const url = `${ANALYTICS_BASE_URL}/dealers${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching dealer analytics:", error);
    throw new Error("Failed to fetch dealer analytics");
  }
}

/**
 * Fetch Employee Analytics
 */
export async function fetchEmployeeAnalytics(
  filters: AnalyticsFilterOptions = {}
): Promise<EmployeeAnalyticsResponse> {
  try {
    const queryParams = new URLSearchParams();

    // Add filters to query params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, value.toString());
      }
    });

    const url = `${ANALYTICS_BASE_URL}/employees${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching employee analytics:", error);
    throw new Error("Failed to fetch employee analytics");
  }
}

/**
 * Fetch User Performance Analytics
 */
export async function fetchUserPerformanceAnalytics(
  filters: AnalyticsFilterOptions = {}
): Promise<UserPerformanceResponse> {
  try {
    const queryParams = new URLSearchParams();

    // Add filters to query params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, value.toString());
      }
    });

    const url = `${ANALYTICS_BASE_URL}/performance${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching user performance analytics:", error);
    throw new Error("Failed to fetch user performance analytics");
  }
}

/**
 * Fetch All Analytics Data
 */
export async function fetchAllAnalytics(
  filters: AnalyticsFilterOptions = {}
): Promise<{
  dealers: DealerAnalyticsResponse;
  employees: EmployeeAnalyticsResponse;
  performance: UserPerformanceResponse;
}> {
  try {
    const [dealers, employees, performance] = await Promise.allSettled([
      fetchDealerAnalytics(filters),
      fetchEmployeeAnalytics(filters),
      fetchUserPerformanceAnalytics(filters),
    ]);

    return {
      dealers:
        dealers.status === "fulfilled"
          ? dealers.value
          : {
              success: false,
              message: "Failed to fetch dealer analytics",
              data: {
                summary: {
                  totalDealers: 0,
                  activeDealers: 0,
                  inactiveDealers: 0,
                  totalCategories: 0,
                  avgCategories: 0,
                  statusBreakdown: {},
                },
                analytics: [],
                filters: {},
              },
            },
      employees:
        employees.status === "fulfilled"
          ? employees.value
          : {
              success: false,
              message: "Failed to fetch employee analytics",
              data: {
                summary: {
                  totalEmployees: 0,
                  activeEmployees: 0,
                  inactiveEmployees: 0,
                  totalAssignedDealers: 0,
                  avgAssignedDealers: 0,
                  statusBreakdown: {},
                },
                analytics: [],
                filters: {},
              },
            },
      performance:
        performance.status === "fulfilled"
          ? performance.value
          : {
              success: false,
              message: "Failed to fetch user performance analytics",
              data: {
                summary: {
                  totalUsers: 0,
                  activeUsers: 0,
                  inactiveUsers: 0,
                  avgLoginCount: 0,
                  maxLoginCount: 0,
                  minLoginCount: 0,
                  totalLoginCount: 0,
                  roleBreakdown: {},
                },
                performance: [],
                filters: {},
              },
            },
    };
  } catch (error) {
    console.error("Error fetching all analytics:", error);
    throw new Error("Failed to fetch analytics data");
  }
}

/**
 * Export Analytics Data to CSV
 */
export function exportAnalyticsToCSV(
  data: any[],
  filename: string,
  headers: string[]
): void {
  try {
    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header] || "";
            // Escape CSV values
            return `"${value.toString().replace(/"/g, '""')}"`;
          })
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `${filename}_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Error exporting to CSV:", error);
    throw new Error("Failed to export data to CSV");
  }
}

/**
 * Format Date for API
 */
export function formatDateForAPI(date: Date): string {
  return date.toISOString().split("T")[0];
}

/**
 * Parse Date from API
 */
export function parseDateFromAPI(dateString: string): Date {
  return new Date(dateString);
}

/**
 * Get Default Filters
 */
export function getDefaultFilters(): AnalyticsFilterOptions {
  return {
    groupBy: "status",
    sortBy: "count",
    sortOrder: "desc",
    limit: 100,
  };
}
