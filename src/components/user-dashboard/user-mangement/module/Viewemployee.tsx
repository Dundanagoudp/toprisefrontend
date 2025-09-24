"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, MapPin, Phone, Mail, Hash } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import { getEmployeeById } from "@/service/employeeServices"
import type { Employee, AssignedDealer } from "@/types/employee-types"
import Image from "next/image"
import { Skeleton } from "@/components/ui/skeleton"
import { useBreadcrumb } from "@/contexts/BreadcrumbContext"

export default function ViewEmployee() {
  const router = useRouter()
  const params = useParams()
  const employeeId = params.id as string
  const { updateLabel } = useBreadcrumb()

  const [employee, setEmployee] = useState<Employee | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const breadcrumbUpdatedRef = useRef(false)

  useEffect(() => {
    if (!employeeId) {
      setIsLoading(false)
      return
    }

    const fetchEmployee = async () => {
      try {
        setIsLoading(true)
        const response = await getEmployeeById(employeeId)
        const employeeData = response.data || null
        setEmployee(employeeData)
        
        // Update breadcrumb with employee name only once
        if (employeeData && employeeData.First_name && !breadcrumbUpdatedRef.current) {
          updateLabel(employeeId, employeeData.First_name)
          breadcrumbUpdatedRef.current = true
        }
      } catch (err) {
        setError(err as Error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchEmployee()
  }, [employeeId, updateLabel])

  // const handleEdit = () => {
  //   router.push(`/dashboard/employees/edit-employee/${employeeId}`)
  // }

  if (isLoading) {
    return (
      <div className="flex-1 p-4 md:p-6 bg-gray-50 min-h-screen">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-24" />
        </div>

        {/* Main content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column Skeleton */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information Skeleton */}
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-6 w-20" />
              </CardHeader>
              <CardContent className="flex flex-col sm:flex-row gap-6">
                <Skeleton className="w-24 h-24 rounded-lg" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 flex-grow">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-6 w-full" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Login Information Skeleton */}
            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                <div className="flex items-center gap-2">
                  <Skeleton className="w-4 h-4 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column Skeleton */}
          <div className="lg:col-span-1 space-y-6">
            {/* Role Information Skeleton */}
            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-full" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        Failed to load employee: {error.message}
      </div>
    )
  }

  if (!employee) {
    return <div className="flex justify-center items-center h-screen text-gray-500">Employee not found</div>
  }

  return (
    <div className="flex-1 p-4 md:p-6 bg-(neutral-100)-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Employee Overview</h1>
          <p className="text-sm text-gray-500">View employee details</p>
        </div>
        {/* <Button 
          onClick={handleEdit}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg shadow-sm"
        >
          Edit
        </Button> */}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold">Personal Information</CardTitle>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  employee.status === "Active" 
                    ? "bg-green-100 text-green-800" 
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {employee.status || "Active"}
              </span>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-6">
              {/* <Image
                src="/assets/FAQ.png"
                alt="Profile"
                width={96}
                height={96}
                className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
              /> */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 flex-grow">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-700">Full Name</span>
                  <span className="text-gray-900">{employee.First_name}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-700">Employee ID</span>
                  <span className="text-gray-900">{employee.employee_id}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-700">Mobile</span>
                  <span className="text-gray-900">{employee.mobile_number || "N/A"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-700">Email</span>
                  <span className="text-gray-900">{employee.email}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-700">Role</span>
                  <span className="text-gray-900">{employee.role}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Login Information */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Login Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-x-6 gap-y-4">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-700">Last Login</span>
                <span className="text-gray-900">
                  {employee.last_login 
                    ? new Date(employee.last_login).toLocaleString() 
                    : "Never logged in"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-1 space-y-6">
          {/* Role Information */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Role Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-700">Access Level</span>
                <span className="text-gray-900">{employee.accessLevel || "Standard"}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-700">Assigned Dealers ({employee.assigned_dealers?.length || 0})</span>
                <div className="text-gray-900">
                  {employee.assigned_dealers?.length 
                    ? (
                      <div className="space-y-3">
                        {employee.assigned_dealers.map((dealer, index) => (
                          <div key={dealer._id || index} className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center gap-2">
                                <Building2 className="h-5 w-5 text-blue-600" />
                                <div className="font-semibold text-gray-900 text-base">{dealer.legal_name}</div>
                              </div>
                              <div className="text-xs text-gray-500 bg-white px-2 py-1 rounded border">
                                <Hash className="h-3 w-3 inline mr-1" />
                                {dealer.dealerId}
                              </div>
                            </div>
                            
                            {dealer.trade_name && (
                              <div className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-gray-400" />
                                <span className="font-medium">Trade Name:</span> {dealer.trade_name}
                              </div>
                            )}
                            
                            <div className="text-sm text-gray-600 mb-2 flex items-start gap-2">
                              <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                              <div>
                                <span className="font-medium">Address:</span> {dealer.Address?.street}, {dealer.Address?.city}, {dealer.Address?.state} - {dealer.Address?.pincode}
                              </div>
                            </div>
                            
                            <div className="text-sm text-gray-600 mb-2">
                              <span className="font-medium">GSTIN:</span> {dealer.GSTIN}
                            </div>
                            
                            <div className="text-sm text-gray-600 mb-2">
                              <span className="font-medium">PAN:</span> {dealer.Pan}
                            </div>
                            
                            {dealer.assigned_categories?.length > 0 && (
                              <div className="text-sm text-gray-600 mt-3">
                                <span className="font-medium">Categories:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {dealer.assigned_categories.map((cat, catIndex) => (
                                    <span key={catIndex} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                      {cat.category_name}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            <div className="text-xs text-gray-500 mt-3 pt-2 border-t border-gray-200 flex items-center gap-4">
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {dealer.user_details?.email}
                              </div>
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {dealer.user_details?.phone_Number}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                    : (
                      <div className="text-gray-500 italic text-sm">
                        No dealers assigned to this employee
                      </div>
                    )}
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-700">Assigned Regions</span>
                <span className="text-gray-900">
                  {employee.assigned_regions?.length 
                    ? employee.assigned_regions.join(", ") 
                    : "None assigned"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
