"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { employeeSchema, type EmployeeFormValues } from "@/lib/schemas/employee-schema"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { UploadCloud } from "lucide-react" 
import Image from "next/image"
import { useState } from "react"

export default function Addemployee() {
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [submitLoading, setSubmitLoading] = useState(false)

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setSelectedImage(null)
      setImagePreview(null)
    }
  }

  const removeImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    // Clear the file input value to allow selecting the same file again
    const input = document.getElementById("uploadImage") as HTMLInputElement
    if (input) {
      input.value = ""
    }
  }

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      fullName: "",
      mobileNumber: "",
      email: "",
      role: "",
      accessLevel: "",
      assignedDealer: "",
      assignedRegion: "",
      sendLoginInvite: false,
      temporaryPassword: "",
      currentStatus: "",
      lastLogin: "2025-06-25 12:43", // Example pre-filled
    },
  })

  const onSubmit = async (data: EmployeeFormValues) => {
    setSubmitLoading(true)
    try {
      // Handle form submission, e.g., send to API
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API
    } finally {
      setSubmitLoading(false)
    }
  }

  const sendLoginInvite = form.watch("sendLoginInvite")

  return (
    <div className="flex-1 p-4 md:p-6 bg-(neutral-100)-50 min-h-screen">
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
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
              Saving...
            </span>
          ) : "Save"}
        </Button>
      </div>

      <form id="add-employee-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Personal & Contact Information */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-red-600 font-semibold text-lg">Personal & Contact Information</CardTitle>
            <p className="text-sm text-gray-500">Basic information to uniquely identify the dealer in the system.</p>
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
              <label htmlFor="uploadImage" className="block text-sm font-medium text-gray-700 mb-1">
                Upload Image
              </label>
              <div className="flex flex-col gap-2">
                <input
                  id="uploadImage"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
                <label htmlFor="uploadImage">
                  <Button
                    asChild
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2 py-6 bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <UploadCloud className="w-5 h-5" />
                      {selectedImage ? "Change Image" : "Upload Image"}
                    </span>
                  </Button>
                </label>
                <span className="text-xs text-gray-500">Allowed file types: JPG, PNG, GIF. Max size: 2MB.</span>
                {imagePreview && (
                  <div className="flex items-center gap-4 mt-2">
                    <div className="relative w-20 h-20 rounded overflow-hidden border">
                      <Image src={imagePreview} alt="Preview" fill style={{objectFit: 'cover'}} />
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={removeImage} className="text-red-500 border border-red-200">
                      Remove
                    </Button>
                  </div>
                )}
              </div>
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

        {/* Role & Access Permissions */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-red-600 font-semibold text-lg">Role & Access Permissions</CardTitle>
            <p className="text-sm text-gray-500">Primary contact and communication details.</p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <Select
                onValueChange={(value) => form.setValue("role", value)}
                value={form.watch("role")} 
              >
                <SelectTrigger className="w-full bg-gray-50 border-gray-200">
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.role && (
                <p className="text-red-500 text-xs mt-1">{form.formState.errors.role.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="accessLevel" className="block text-sm font-medium text-gray-700 mb-1">
                Access Level
              </label>
              <Select
                onValueChange={(value) => form.setValue("accessLevel", value)}
                value={form.watch("accessLevel")} 
              >
                <SelectTrigger className="w-full bg-gray-50 border-gray-200">
                  <SelectValue placeholder="Select Access Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Full Access</SelectItem>
                  <SelectItem value="limited">Limited Access</SelectItem>
                  <SelectItem value="read-only">Read Only</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.accessLevel && (
                <p className="text-red-500 text-xs mt-1">{form.formState.errors.accessLevel.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Operational Scope Mapping */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-red-600 font-semibold text-lg">Operational Scope Mapping</CardTitle>
            <p className="text-sm text-gray-500">Primary contact and communication details.</p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="assignedDealer" className="block text-sm font-medium text-gray-700 mb-1">
                Assigned Dealer
              </label>
              <Select
                onValueChange={(value) => form.setValue("assignedDealer", value)}
                value={form.watch("assignedDealer")} 
              >
                <SelectTrigger className="w-full bg-gray-50 border-gray-200">
                  <SelectValue placeholder="Select Assigned Dealer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dealer1">Dealer 1</SelectItem>
                  <SelectItem value="dealer2">Dealer 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="assignedRegion" className="block text-sm font-medium text-gray-700 mb-1">
                Assigned Region
              </label>
              <Select
                onValueChange={(value) => form.setValue("assignedRegion", value)}
                value={form.watch("assignedRegion")} // Make it a controlled component
              >
                <SelectTrigger className="w-full bg-gray-50 border-gray-200">
                  <SelectValue placeholder="Select Assigned Region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="north">North</SelectItem>
                  <SelectItem value="south">South</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>


        {/* Login & Status */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-red-600 font-semibold text-lg">Login & Status</CardTitle>
            <p className="text-sm text-gray-500">Primary contact and communication details.</p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-2 md:col-span-2">
              <Checkbox
                id="sendLoginInvite"
                checked={sendLoginInvite}
                onCheckedChange={(checked) => form.setValue("sendLoginInvite", checked as boolean)}
              />
              <label htmlFor="sendLoginInvite" className="text-sm font-medium text-gray-700">
                Send Login Invite
              </label>
            </div>
            {sendLoginInvite && (
              <div>
                <label htmlFor="temporaryPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Set Temporary Password
                </label>
                <Input
                  id="temporaryPassword"
                  type="password"
                  placeholder="Enter Password"
                  {...form.register("temporaryPassword")}
                  className="bg-gray-50 border-gray-200"
                />
                {form.formState.errors.temporaryPassword && (
                  <p className="text-red-500 text-xs mt-1">{form.formState.errors.temporaryPassword.message}</p>
                )}
              </div>
            )}
            <div>
              <label htmlFor="currentStatus" className="block text-sm font-medium text-gray-700 mb-1">
                Current Status
              </label>
              <Select
                onValueChange={(value) => form.setValue("currentStatus", value)}
                value={form.watch("currentStatus")} // Make it a controlled component
              >
                <SelectTrigger className="w-full bg-gray-50 border-gray-200">
                  <SelectValue placeholder="Select Current Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.currentStatus && (
                <p className="text-red-500 text-xs mt-1">{form.formState.errors.currentStatus.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="lastLogin" className="block text-sm font-medium text-gray-700 mb-1">
                Last Login
              </label>
              <Input
                id="lastLogin"
                value={form.getValues("lastLogin")}
                disabled
                className="bg-gray-50 border-gray-200 text-gray-500"
              />
            </div>

          </CardContent>
        </Card>
      </form>
    </div>
  )
}
