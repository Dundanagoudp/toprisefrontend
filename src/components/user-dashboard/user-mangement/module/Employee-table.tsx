"use client"

import { MoreHorizontal, ChevronUp, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { useState, useEffect } from "react" 
import { useRouter } from "next/navigation"
import { getAllEmployees } from "@/service/employeeServices"
import type { Employee } from "@/types/employee-types"
import { Skeleton } from "@/components/ui/skeleton"
import Image from "next/image"
import { useAppSelector } from "@/store/hooks"

interface EmployeeTableProps {
  sortField?: string;
  sortDirection?: "asc" | "desc";
  onSort?: (field: string) => void;
}

export default function EmployeeTable({ 
  sortField = "", 
  sortDirection = "asc", 
  onSort 
}: EmployeeTableProps) {
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const [employees, setEmployees] = useState<Employee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const allowedRoles = ["Super-admin", "Inventory-admin"];
  const auth = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    const fetchEmployees = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await getAllEmployees()
        setEmployees(response.data || [])
      } catch (err: any) {
        setError(err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchEmployees()
  }, [])

  // Sort employees based on sortField and sortDirection
  const sortedEmployees = [...employees].sort((a, b) => {
    if (!sortField) return 0;
    
    let aValue: any;
    let bValue: any;
    
    switch (sortField) {
      case "name":
        aValue = a.First_name?.toLowerCase() || "";
        bValue = b.First_name?.toLowerCase() || "";
        break;
      case "id":
        aValue = a.employee_id?.toLowerCase() || "";
        bValue = b.employee_id?.toLowerCase() || "";
        break;
      case "email":
        aValue = a.email?.toLowerCase() || "";
        bValue = b.email?.toLowerCase() || "";
        break;
      case "phone":
        aValue = a.mobile_number?.toLowerCase() || "";
        bValue = b.mobile_number?.toLowerCase() || "";
        break;
      case "role":
        aValue = a.role?.toLowerCase() || "";
        bValue = b.role?.toLowerCase() || "";
        break;
      case "department":
        aValue = a.role?.toLowerCase() || "";
        bValue = b.role?.toLowerCase() || "";
        break;
      case "status":
        aValue = a.status?.toLowerCase() || "";
        bValue = b.status?.toLowerCase() || "";
        break;
      default:
        return 0;
    }
    
    if (sortDirection === "asc") {
      return aValue.localeCompare(bValue);
    } else {
      return bValue.localeCompare(aValue);
    }
  });

  const totalItems = sortedEmployees.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const paginatedData = sortedEmployees.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page)
  }

  const handleSort = (field: string) => {
    if (onSort) {
      onSort(field);
    }
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) {
      return <ChevronUp className="w-4 h-4 text-gray-400" />;
    }
    return sortDirection === "asc" ? 
      <ChevronUp className="w-4 h-4 text-[#C72920]" /> : 
      <ChevronDown className="w-4 h-4 text-[#C72920]" />;
  };

  if (error) {
    return (
      <div className="flex justify-center items-center h-64 text-red-500">
        Failed to load employees: {error.message}
      </div>
    )
  }

  // Role-based access control
  if (!auth || !allowedRoles.includes(auth.role)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-600 font-bold">
          You do not have permission to access this page.
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[800px]">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm">
              <Checkbox />
            </th>
            <th className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm">Profile</th>
            <th 
              className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm cursor-pointer hover:text-[#C72920] transition-colors"
              onClick={() => handleSort("name")}
            >
              <div className="flex items-center gap-1">
                Name
                {getSortIcon("name")}
              </div>
            </th>
            <th 
              className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm cursor-pointer hover:text-[#C72920] transition-colors"
              onClick={() => handleSort("id")}
            >
              <div className="flex items-center gap-1">
                ID
                {getSortIcon("id")}
              </div>
            </th>
            <th 
              className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm cursor-pointer hover:text-[#C72920] transition-colors"
              onClick={() => handleSort("email")}
            >
              <div className="flex items-center gap-1">
                Email
                {getSortIcon("email")}
              </div>
            </th>
            <th 
              className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm cursor-pointer hover:text-[#C72920] transition-colors"
              onClick={() => handleSort("phone")}
            >
              <div className="flex items-center gap-1">
                Phone
                {getSortIcon("phone")}
              </div>
            </th>
            <th 
              className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm cursor-pointer hover:text-[#C72920] transition-colors"
              onClick={() => handleSort("role")}
            >
              <div className="flex items-center gap-1">
                Role
                {getSortIcon("role")}
              </div>
            </th>
            <th 
              className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm cursor-pointer hover:text-[#C72920] transition-colors"
              onClick={() => handleSort("department")}
            >
              <div className="flex items-center gap-1">
                Department
                {getSortIcon("department")}
              </div>
            </th>
            <th 
              className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm cursor-pointer hover:text-[#C72920] transition-colors"
              onClick={() => handleSort("status")}
            >
              <div className="flex items-center gap-1">
                Status
                {getSortIcon("status")}
              </div>
            </th>
            <th className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm">Actions</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            // Skeleton loader rows
            Array.from({ length: itemsPerPage }).map((_, index) => (
              <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-3 md:p-4">
                  <Skeleton className="h-4 w-4" />
                </td>
                <td className="p-3 md:p-4">
                  <Skeleton className="w-8 h-8 md:w-10 md:h-10 object-cover" />
                </td>
                <td className="p-3 md:p-4">
                  <Skeleton className="h-4 w-24" />
                </td>
                <td className="p-3 md:p-4">
                  <Skeleton className="h-4 w-16" />
                </td>
                <td className="p-3 md:p-4">
                  <Skeleton className="h-4 w-32" />
                </td>
                <td className="p-3 md:p-4">
                  <Skeleton className="h-4 w-20" />
                </td>
                <td className="p-3 md:p-4">
                  <Skeleton className="h-4 w-16" />
                </td>
                <td className="p-3 md:p-4">
                  <Skeleton className="h-4 w-16" />
                </td>
                <td className="p-3 md:p-4">
                  <Skeleton className="h-6 w-16 rounded-full" />
                </td>
                <td className="p-3 md:p-4">
                  <Skeleton className="h-8 w-8 rounded-md" />
                </td>
              </tr>
            ))
          ) : (
            // Actual data rows
            paginatedData.map((employee) => (
              <tr key={employee._id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-3 md:p-4">
                  <Checkbox />
                </td>
                <td className="p-3 md:p-4">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-200 flex items-center justify-center">
  <Image
                  src="/assets/FAQ.png"
                  alt={employee.First_name}
                  width={40}
                  height={40}
                  className="w-8 h-8 md:w-10 md:h-10 object-cover"
                />                  </div>
                </td>
                <td className="p-3 md:p-4 font-medium text-gray-900 text-sm">{employee.First_name}</td>
                <td className="p-3 md:p-4 text-gray-600 text-sm">{employee.employee_id}</td>
                <td className="p-3 md:p-4 text-gray-600 text-sm">{employee.email}</td>
                <td className="p-3 md:p-4 text-gray-600 text-sm">{employee.mobile_number}</td>
                <td className="p-3 md:p-4 text-gray-600 text-sm">
                  {employee.role === "Sales"
                    ? "Sales"
                    : employee.role === "Fulfillment-Staff"
                      ? "Fulfillment"
                      : "General"}
                </td>
                <td className="p-3 md:p-4 text-gray-600 text-sm">
                  {employee.role === "Sales"
                    ? "Sales"
                    : employee.role === "Fulfillment-Staff"
                      ? "Fulfillment"
                      : "General"}
                </td>
                <td className="p-3 md:p-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      employee.status === "Active" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {employee.status || "Active"}
                  </span>
                </td>
                <td className="p-3 md:p-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {auth && allowedRoles.includes(auth.role) && (
                        <DropdownMenuItem onClick={() => router.push(`/dashboard/employees/edit-employee/${employee._id}`)}>
                          Edit
                        </DropdownMenuItem>
                      )}
                      {auth && allowedRoles.includes(auth.role) && (
                        <DropdownMenuItem>Delete</DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => router.push(`/user/dashboard/user/employeeview/${employee._id}`)}>
                        View Details
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      
      {/* Pagination - Show skeleton if loading */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center p-3 md:p-4 border-t border-gray-200 gap-2">
        {isLoading ? (
          <Skeleton className="h-4 w-48" />
        ) : (
          <span className="text-sm text-gray-500 md:text-left text-center w-full md:w-auto">
            Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, totalItems)} of{" "}
            {totalItems} employees
          </span>
        )}
        
        <div className="flex justify-center md:justify-end w-full md:w-auto">
          {isLoading ? (
            <div className="flex gap-2">
              <Skeleton className="h-9 w-9" />
              <Skeleton className="h-9 w-9" />
              <Skeleton className="h-9 w-9" />
              <Skeleton className="h-9 w-9" />
            </div>
          ) : (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={() => handlePageChange(currentPage - 1)}
                    aria-disabled={currentPage === 1}
                  />
                </PaginationItem>
                {[...Array(totalPages)].map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink href="#" isActive={currentPage === i + 1} onClick={() => handlePageChange(i + 1)}>
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={() => handlePageChange(currentPage + 1)}
                    aria-disabled={currentPage === totalPages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </div>
    </div>
  )
}