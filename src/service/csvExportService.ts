import { Employee } from "@/types/employee-types";
import { Dealer } from "@/types/dealer-types";
import { AppUser } from "@/types/user-types";

/**
 * CSV Export Service for User Management Data
 */

// Helper function to escape CSV values
function escapeCsvValue(value: any): string {
  if (value === null || value === undefined) {
    return "";
  }
  
  const stringValue = String(value);
  
  // If the value contains comma, newline, or quote, wrap it in quotes and escape quotes
  if (stringValue.includes(",") || stringValue.includes("\n") || stringValue.includes('"')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  
  return stringValue;
}

// Helper function to convert array to CSV string
function arrayToCsvString(array: any[], headers: string[]): string {
  if (array.length === 0) {
    return headers.join(",") + "\n";
  }
  
  const csvRows = [
    headers.join(","),
    ...array.map(row => 
      headers.map(header => escapeCsvValue(row[header])).join(",")
    )
  ];
  
  return csvRows.join("\n");
}

// Helper function to download CSV file
function downloadCsv(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the URL object
  URL.revokeObjectURL(url);
}

/**
 * Export Employee data to CSV
 */
export function exportEmployeesToCsv(employees: Employee[]): void {
  const headers = [
    "Employee ID",
    "First Name", 
    "Email",
    "Mobile Number",
    "Role",
    "Designation",
    "Department",
    "Status",
    "Assigned Regions",
    "Assigned Dealers Count",
    "Last Login",
    "Created At",
    "Updated At"
  ];
  
  const csvData = employees.map(employee => ({
    "Employee ID": employee.employee_id || employee._id,
    "First Name": employee.First_name || "",
    "Email": employee.email || "",
    "Mobile Number": employee.mobile_number || "",
    "Role": employee.role || "",
    "Designation": employee.designation || "",
    "Department": employee.department || "",
    "Status": employee.status || employee.currentStatus || "",
    "Assigned Regions": Array.isArray(employee.assigned_regions) 
      ? employee.assigned_regions.join("; ") 
      : "",
    "Assigned Dealers Count": Array.isArray(employee.assigned_dealers) 
      ? employee.assigned_dealers.length.toString() 
      : "0",
    "Last Login": employee.last_login ? new Date(employee.last_login).toLocaleString() : "",
    "Created At": employee.created_at ? new Date(employee.created_at).toLocaleString() : "",
    "Updated At": employee.updated_at ? new Date(employee.updated_at).toLocaleString() : ""
  }));
  
  const csvContent = arrayToCsvString(csvData, headers);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadCsv(csvContent, `employees_export_${timestamp}.csv`);
}

/**
 * Export Dealer data to CSV
 */
export function exportDealersToCsv(dealers: Dealer[]): void {
  const headers = [
    "Dealer ID",
    "Legal Name",
    "Trade Name", 
    "Email",
    "Phone Number",
    "GSTIN",
    "PAN",
    "Address",
    "Contact Person",
    "Is Active",
    "Upload Access Enabled",
    "Default Margin",
    "SLA Type",
    "Dispatch Time (hours)",
    "Categories Allowed",
    "Assigned Employees Count",
    "Onboarding Date",
    "Last Fulfillment Date",
    "Created At",
    "Updated At"
  ];
  
  const csvData = dealers.map(dealer => ({
    "Dealer ID": dealer.dealerId || dealer._id,
    "Legal Name": dealer.legal_name || "",
    "Trade Name": dealer.trade_name || "",
    "Email": dealer.user_id?.email || "",
    "Phone Number": dealer.user_id?.phone_Number || "",
    "GSTIN": dealer.GSTIN || "",
    "PAN": dealer.Pan || "",
    "Address": dealer.Address ? 
      `${dealer.Address.street || ""}, ${dealer.Address.city || ""}, ${dealer.Address.state || ""} - ${dealer.Address.pincode || ""}`.trim() 
      : "",
    "Contact Person": dealer.contact_person ? 
      `${dealer.contact_person.name || ""} (${dealer.contact_person.phone || ""})` 
      : "",
    "Is Active": dealer.is_active ? "Yes" : "No",
    "Upload Access Enabled": dealer.upload_access_enabled ? "Yes" : "No",
    "Default Margin": dealer.default_margin?.toString() || "",
    "SLA Type": dealer.SLA_type || "",
    "Dispatch Time (hours)": dealer.dealer_dispatch_time?.toString() || "",
    "Categories Allowed": Array.isArray(dealer.categories_allowed) 
      ? dealer.categories_allowed.join("; ") 
      : "",
    "Assigned Employees Count": Array.isArray(dealer.assigned_Toprise_employee) 
      ? dealer.assigned_Toprise_employee.length.toString() 
      : "0",
    "Onboarding Date": dealer.onboarding_date ? new Date(dealer.onboarding_date).toLocaleString() : "",
    "Last Fulfillment Date": dealer.last_fulfillment_date ? new Date(dealer.last_fulfillment_date).toLocaleString() : "",
    "Created At": dealer.created_at ? new Date(dealer.created_at).toLocaleString() : "",
    "Updated At": dealer.updated_at ? new Date(dealer.updated_at).toLocaleString() : ""
  }));
  
  const csvContent = arrayToCsvString(csvData, headers);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadCsv(csvContent, `dealers_export_${timestamp}.csv`);
}

/**
 * Export App Users data to CSV
 */
export function exportUsersToCsv(users: AppUser[]): void {
  const headers = [
    "User ID",
    "Email",
    "First Name",
    "Last Name", 
    "Username",
    "Phone Number",
    "Role",
    "Last Login",
    "Cart ID",
    "Wishlist ID",
    "Address Count",
    "Vehicle Details Count"
  ];
  
  const csvData = users.map(user => ({
    "User ID": user._id || "",
    "Email": user.email || "",
    "First Name": user.firstName || "",
    "Last Name": user.lastName || "",
    "Username": user.username || "",
    "Phone Number": user.phone_Number || user.phone || "",
    "Role": user.role || "",
    "Last Login": user.last_login ? new Date(user.last_login).toLocaleString() : "",
    "Cart ID": user.cartId || "",
    "Wishlist ID": user.wishlistId || "",
    "Address Count": Array.isArray(user.address) ? user.address.length.toString() : "0",
    "Vehicle Details Count": Array.isArray(user.vehicle_details) ? user.vehicle_details.length.toString() : "0"
  }));
  
  const csvContent = arrayToCsvString(csvData, headers);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadCsv(csvContent, `users_export_${timestamp}.csv`);
}

/**
 * Generic export function that determines the type and calls appropriate export function
 */
export function exportDataToCsv(data: any[], dataType: "employees" | "dealers" | "users"): void {
  try {
    switch (dataType) {
      case "employees":
        exportEmployeesToCsv(data as Employee[]);
        break;
      case "dealers":
        exportDealersToCsv(data as Dealer[]);
        break;
      case "users":
        exportUsersToCsv(data as AppUser[]);
        break;
      default:
        throw new Error(`Unsupported data type: ${dataType}`);
    }
  } catch (error) {
    console.error(`Error exporting ${dataType} to CSV:`, error);
    throw error;
  }
}
