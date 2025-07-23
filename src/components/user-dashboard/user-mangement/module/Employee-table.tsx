"use client"

import { MoreHorizontal } from "lucide-react"
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

export default function EmployeeTable() {
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const [employees, setEmployees] = useState<Employee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

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

  const totalItems = employees.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const paginatedData = employees.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page)
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64 text-red-500">
        Failed to load employees: {error.message}
      </div>
    )
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
            <th className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm">Name</th>
            <th className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm">ID</th>
            <th className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm">Email</th>
            <th className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm">Phone</th>
            <th className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm">Role</th>
            <th className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm">Department</th>
            <th className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm">Status</th>
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
                      <DropdownMenuItem onClick={() => router.push(`/dashboard/employees/edit-employee/${employee._id}`)}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem>Delete</DropdownMenuItem>
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