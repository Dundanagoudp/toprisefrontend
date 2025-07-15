"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Placeholder data for dealer details
const dealerDetails = {
  dealerId: "DLR302",
  legalName: "Shree Auto Spares Pvt Ltd",
  tradeName: "ShreeAuto",
  gstin: "27ABCDE1234FIZ2",
  pan: "ABCDE1234F",
  state: "Maharashtra",
  pincode: "411026",
  address: "Plot 14, MIDC Bhosari, Pune",
  contactPerson: "Rakesh Jadhav",
  mobileNumber: "+91 98200 12345",
  email: "dealer@shreeauto.in",
  isActive: "True",
  productCategoriesAllowed: "Braking",
  uploadAccessEnabled: "True",
  certifications: "ISO 9001", // Example, not in screenshot but good to have
  defaultMargin: "18.0",
  slaType: "SLA Type",
  slaMaxDispatchTime: "24",
  lastUploadDate: "2025-04-30 10:15",
  lastFulfillmentDate: "2025-04-29 14:22",
  assignedTopriseEmployee: "USR019",
  onboardingDate: "2024-11-12",
  remarks: "Slow with suspension items",
}

export default function ViewDealer() {
  return (
    <div className="flex-1 p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Header for Product Details */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Product Details</h1>
          <p className="text-sm text-gray-500">Add your product description</p>
        </div>
        <Button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg shadow-sm">Edit</Button>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dealer Identification */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-bla-600 font-semibold text-lg">Dealer Identification</CardTitle>
            <p className="text-sm text-gray-500">Basic information to uniquely identify the dealer in the system.</p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-700">Dealer ID</span>
              <span className="text-gray-900">{dealerDetails.dealerId}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-700">Legal Name</span>
              <span className="text-gray-900">{dealerDetails.legalName}</span>
            </div>
            <div className="flex flex-col sm:col-span-2">
              <span className="text-sm font-medium text-gray-700">Trade Name</span>
              <span className="text-gray-900">{dealerDetails.tradeName}</span>
            </div>
          </CardContent>
        </Card>

        {/* Legal & Tax Information */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-black-600 font-semibold text-lg">Legal & Tax Information</CardTitle>
            <p className="text-sm text-gray-500">Compliance details needed for GST and invoicing.</p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-700">GSTIN</span>
              <span className="text-gray-900">{dealerDetails.gstin}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-700">PAN</span>
              <span className="text-gray-900">{dealerDetails.pan}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-700">State</span>
              <span className="text-gray-900">{dealerDetails.state}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-700">Pincode</span>
              <span className="text-gray-900">{dealerDetails.pincode}</span>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-black-600 font-semibold text-lg">Contact Information</CardTitle>
            <p className="text-sm text-gray-500">Primary contact and communication details.</p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <div className="flex flex-col sm:col-span-2">
              <span className="text-sm font-medium text-gray-700">Address</span>
              <span className="text-gray-900">{dealerDetails.address}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-700">Contact Person</span>
              <span className="text-gray-900">{dealerDetails.contactPerson}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-700">Mobile Number</span>
              <span className="text-gray-900">{dealerDetails.mobileNumber}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-700">Email</span>
              <span className="text-gray-900">{dealerDetails.email}</span>
            </div>
          </CardContent>
        </Card>

        {/* Operational Access & Categories */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-black-600 font-semibold text-lg">Operational Access & Categories</CardTitle>
            <p className="text-sm text-gray-500">Define what the dealer can access and what they're allowed to sell</p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-700">Is Active</span>
              <span className="text-gray-900">{dealerDetails.isActive}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-700">Product Categories Allowed</span>
              <span className="text-gray-900">{dealerDetails.productCategoriesAllowed}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-700">Upload Access Enabled</span>
              <span className="text-gray-900">{dealerDetails.uploadAccessEnabled}</span>
            </div>
            {/* Certifications not in screenshot, but can be added if needed */}
            {/* <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-700">Certifications</span>
              <span className="text-gray-900">{dealerDetails.certifications}</span>
            </div> */}
          </CardContent>
        </Card>

        {/* Margins & Service Level */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-black-600 font-semibold text-lg">Margins & Service Level</CardTitle>
            <p className="text-sm text-gray-500">Business logic for pricing and fulfillment commitments.</p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-700">Default Margin %</span>
              <span className="text-gray-900">{dealerDetails.defaultMargin}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-700">SLA Type</span>
              <span className="text-gray-900">{dealerDetails.slaType}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-700">SLA Max Dispatch Time</span>
              <span className="text-gray-900">{dealerDetails.slaMaxDispatchTime}</span>
            </div>
          </CardContent>
        </Card>

        {/* Activity Tracking */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-black-600 font-semibold text-lg">Activity Tracking</CardTitle>
            <p className="text-sm text-gray-500">Recent actions to monitor dealer performance and engagement</p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-700">Last Upload Date</span>
              <span className="text-gray-900">{dealerDetails.lastUploadDate}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-700">Last Fulfilment Date</span>
              <span className="text-gray-900">{dealerDetails.lastFulfillmentDate}</span>
            </div>
          </CardContent>
        </Card>

        {/* Account Management - Spans full width */}
        <Card className="border-gray-200 shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-black-600 font-semibold text-lg">Account Management</CardTitle>
            <p className="text-sm text-gray-500">Internal assignment and monitoring of dealer performance</p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-700">Assigned Toprise Employee</span>
              <span className="text-gray-900">{dealerDetails.assignedTopriseEmployee}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-700">Onboarding Date</span>
              <span className="text-gray-900">{dealerDetails.onboardingDate}</span>
            </div>
            <div className="flex flex-col sm:col-span-2">
              <span className="text-sm font-medium text-gray-700">Remarks</span>
              <span className="text-gray-900">{dealerDetails.remarks}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
