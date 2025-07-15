"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react" // For the checkmark icon

// Placeholder data for employee details
const employeeDetails = {
  profileImage: "/images/employee-profile.png", // Path to the embedded image
  fullName: "Victoria",
  employeeId: "EMP203",
  mobileNumber: "+91 98765 43210",
  emailId: "mahesh@toprise.in",
  designation: "Sr. Fulfillment Agent",
  department: "Fulfillment",
  status: "Active",
  role: "Fulfillment Staff",
  accessLevel: "View Orders",
  roleDescription: "Can view & manage assigned orders",
  assignedDealer: "DLR102",
  assignedRegion: "Maharashtra",
  sendLoginInvite: true,
  temporaryPassword: "••••••••••",
  currentStatus: "Active",
  lastLogin: "2025-06-25 12:43",
  createdBy: "USR001",
  assignedOrdersPicklists: "ORD-9032, ORD-9044",
  slaType: "Standard / Priority",
  slaMaxDispatchTime: "24",
  remarks: "Temporarily suspended due to leave",
  auditTrail: "[Role changed on 2025-06-01 by USR019]",
}

export default function Viewemployee() {
  return (
    <div className="flex-1 p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Header for Employee Overview */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Employee Overview</h1>
          <p className="text-sm text-gray-500">See the employee details and access</p>
        </div>
        <Button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg shadow-sm">Edit</Button>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal & Contact Information */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-black-600 font-semibold text-lg">Personal & Contact Information</CardTitle>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {employeeDetails.status}
              </span>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-6">
              <img
                src={employeeDetails.profileImage || "/placeholder.svg"}
                alt="Employee Profile"
                className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 flex-grow">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-700">Full Name</span>
                  <span className="text-gray-900">{employeeDetails.fullName}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-700">Employee ID</span>
                  <span className="text-gray-900">{employeeDetails.employeeId}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-700">Mobile Number</span>
                  <span className="text-gray-900">{employeeDetails.mobileNumber}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-700">Email ID</span>
                  <span className="text-gray-900">{employeeDetails.emailId}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-700">Designation</span>
                  <span className="text-gray-900">{employeeDetails.designation}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-700">Department</span>
                  <span className="text-gray-900">{employeeDetails.department}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Login & Status */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-black-600 font-semibold text-lg">Login & Status</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              <div className="flex items-center gap-2">
                {employeeDetails.sendLoginInvite ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <div className="w-4 h-4 border border-gray-300 rounded" />
                )}
                <span className="text-sm font-medium text-gray-700">Send Login Invite</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-700">Set Temporary Password</span>
                <span className="text-gray-900">{employeeDetails.temporaryPassword}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-700">Current Status</span>
                <span className="text-gray-900">{employeeDetails.currentStatus}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-700">Last Login</span>
                <span className="text-gray-900">{employeeDetails.lastLogin}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-700">Created By</span>
                <span className="text-gray-900">{employeeDetails.createdBy}</span>
              </div>
            </CardContent>
          </Card>

          {/* Notes & Admin Controls */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-black-600 font-semibold text-lg">Notes & Admin Controls</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-x-6 gap-y-4">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-700">Remarks</span>
                <span className="text-gray-900">{employeeDetails.remarks}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-700">Audit Trail</span>
                <span className="text-gray-900">{employeeDetails.auditTrail}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-1 space-y-6">
          {/* Role & Access Permissions */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-black-600 font-semibold text-lg">Role & Access Permissions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-700">Role</span>
                <span className="text-gray-900">{employeeDetails.role}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-700">Access Level</span>
                <span className="text-gray-900">{employeeDetails.accessLevel}</span>
              </div>
              <div className="flex flex-col sm:col-span-2">
                <span className="text-sm font-medium text-gray-700">Role Description</span>
                <span className="text-gray-900">{employeeDetails.roleDescription}</span>
              </div>
            </CardContent>
          </Card>

          {/* Operational Scope Mapping */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-black-600 font-semibold text-lg">Operational Scope Mapping</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-700">Assigned Dealer</span>
                <span className="text-gray-900">{employeeDetails.assignedDealer}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-700">Assigned Region</span>
                <span className="text-gray-900">{employeeDetails.assignedRegion}</span>
              </div>
            </CardContent>
          </Card>

          {/* Assignment & Task Visibility */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-black-600 font-semibold text-lg">Assignment & Task Visibility</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-700">Assigned Orders / Picklists</span>
                <span className="text-gray-900">{employeeDetails.assignedOrdersPicklists}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-700">SLA Type</span>
                <span className="text-gray-900">{employeeDetails.slaType}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-700">SLA Max Dispatch Time</span>
                <span className="text-gray-900">{employeeDetails.slaMaxDispatchTime}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
