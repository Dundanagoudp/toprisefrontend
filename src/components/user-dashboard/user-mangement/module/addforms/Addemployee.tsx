"use client"

import type React from "react"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { employeeSchema, type EmployeeFormValues } from "@/lib/schemas/employee-schema"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"
import { addEmployee } from "@/service/employeeServices"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

export default function Addemployee() {
  const [submitLoading, setSubmitLoading] = useState(false)
  const { toast } = useToast()

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
      mobileNumber: "",
      role: "",
      employeeId: "",
      fullName: "",
    },
  })

  const onSubmit = async (data: EmployeeFormValues) => {
    setSubmitLoading(true)
    try {
      const payload = {
        email: data.email,
        username: data.username,
        password: data.password,
        phone_Number: data.mobileNumber,
        role: data.role,
        employee_id: data.employeeId,
        First_name: data.fullName,
        mobile_number: data.mobileNumber,
        employeeRole: data.role,
      }
      const response = await addEmployee(payload)
      toast({
        title: "Success!",
        description: response.message || "Employee added successfully.",
        variant: "default",
      })
      form.reset()
    } catch (error: any) {
      console.error("Failed to add employee:", error)
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add employee. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitLoading(false)
    }
  }

  return (
    <div className="flex-1 p-4 md:p-6 bg-neutral-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Add employee</h1>
          <p className="text-sm text-gray-500">Add your employee details</p>
        </div>
        <Button
          type="submit"
          form="add-employee-form"
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg shadow-sm"
          disabled={submitLoading}
        >
          {submitLoading ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
              Saving...
            </span>
          ) : (
            "Save"
          )}
        </Button>
      </div>
      <form id="add-employee-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Personal & Contact Information */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-red-600 font-semibold text-lg">Personal & Contact Information</CardTitle>
            <p className="text-sm text-gray-500">Basic information to uniquely identify the employee in the system.</p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <Input
                id="fullName"
                placeholder="Full Name"
                {...form.register("fullName")}
                className="bg-gray-50 border-gray-200"
              />
              {form.formState.errors.fullName && (
                <p className="text-red-500 text-xs mt-1">{form.formState.errors.fullName.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700 mb-1">
                Employee ID
              </label>
              <Input
                id="employeeId"
                placeholder="Employee ID"
                {...form.register("employeeId")}
                className="bg-gray-50 border-gray-200"
              />
              {form.formState.errors.employeeId && (
                <p className="text-red-500 text-xs mt-1">{form.formState.errors.employeeId.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <Input
                id="username"
                placeholder="Username"
                {...form.register("username")}
                className="bg-gray-50 border-gray-200"
              />
              {form.formState.errors.username && (
                <p className="text-red-500 text-xs mt-1">{form.formState.errors.username.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter Password"
                {...form.register("password")}
                className="bg-gray-50 border-gray-200"
              />
              {form.formState.errors.password && (
                <p className="text-red-500 text-xs mt-1">{form.formState.errors.password.message}</p>
              )}
            </div>
          </CardContent>
        </Card>
        {/* Contact Information */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-red-600 font-semibold text-lg">Contact Information</CardTitle>
            <p className="text-sm text-gray-500">Primary contact and communication details.</p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Mobile Number
              </label>
              <Input
                id="mobileNumber"
                placeholder="Official contact (can be WhatsApp)"
                {...form.register("mobileNumber")}
                className="bg-gray-50 border-gray-200"
              />
              {form.formState.errors.mobileNumber && (
                <p className="text-red-500 text-xs mt-1">{form.formState.errors.mobileNumber.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <Input
                id="email"
                placeholder="Registered email ID"
                {...form.register("email")}
                className="bg-gray-50 border-gray-200"
              />
              {form.formState.errors.email && (
                <p className="text-red-500 text-xs mt-1">{form.formState.errors.email.message}</p>
              )}
            </div>
          </CardContent>
        </Card>
        {/* Role Information */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-red-600 font-semibold text-lg">Role Information</CardTitle>
            <p className="text-sm text-gray-500">Define the employee's role.</p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <Select
                value={form.watch("role")}
                onValueChange={value => form.setValue("role", value, { shouldValidate: true })}
                name="role"
              >
                <SelectTrigger className="bg-gray-50 border-gray-200 w-full rounded-md px-3 py-2 text-sm">
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Super-admin">Super-admin</SelectItem>
                  <SelectItem value="Fulfillment-Admin">Fulfillment-Admin</SelectItem>
                  <SelectItem value="Fulfillment-Staff">Fulfillment-Staff</SelectItem>
                  <SelectItem value="Inventory-Admin">Inventory-Admin</SelectItem>
                  <SelectItem value="Inventory-Staff">Inventory-Staff</SelectItem>
                  <SelectItem value="Dealer">Dealer</SelectItem>
                  <SelectItem value="User">User</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.role && (
                <p className="text-red-500 text-xs mt-1">{form.formState.errors.role.message}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
