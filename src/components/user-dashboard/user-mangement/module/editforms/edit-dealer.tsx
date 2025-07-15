"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { dealerSchema, type DealerFormValues } from "@/lib/schemas/dealer-schema"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function EditDealer() {
  const form = useForm<DealerFormValues>({
    resolver: zodResolver(dealerSchema),
    defaultValues: {
      // Pre-fill with example data for editing
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
      isActive: "yes",
      productCategoriesAllowed: "Braking",
      uploadAccessEnabled: "yes",
      certifications: "ISO 9001",
      defaultMargin: "18.0",
      slaType: "typeA",
      slaMaxDispatchTime: "24",
      lastUploadDate: "2025-04-30 10:15",
      lastFulfillmentDate: "2025-04-29 14:22",
      assignedTopriseEmployee: "USR019",
      onboardingDate: "2024-11-12",
      remarks: "Slow with suspension items",
    },
  })

  const onSubmit = (data: DealerFormValues) => {
    console.log("Updating dealer:", data)
    // Handle form submission for update, e.g., send to API
  }

  return (
    <div className="flex-1 p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Edit Dealer</h1>
          <p className="text-sm text-gray-500">Update dealer details</p>
        </div>
        <Button
          type="submit"
          form="edit-dealer-form"
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg shadow-sm"
        >
          Update
        </Button>
      </div>

      <form id="edit-dealer-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Dealer Identification */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-red-600 font-semibold text-lg">Dealer Identification</CardTitle>
            <p className="text-sm text-gray-500">Basic information to uniquely identify the dealer in the system.</p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="dealerId" className="block text-sm font-medium text-gray-700 mb-1">
                Dealer ID
              </label>
              <Input
                id="dealerId"
                placeholder="Internal identifier for each dealer"
                {...form.register("dealerId")}
                className="bg-gray-50 border-gray-200"
              />
              {form.formState.errors.dealerId && (
                <p className="text-red-500 text-xs mt-1">{form.formState.errors.dealerId.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="legalName" className="block text-sm font-medium text-gray-700 mb-1">
                Legal Name
              </label>
              <Input
                id="legalName"
                placeholder="Full registered entity name"
                {...form.register("legalName")}
                className="bg-gray-50 border-gray-200"
              />
              {form.formState.errors.legalName && (
                <p className="text-red-500 text-xs mt-1">{form.formState.errors.legalName.message}</p>
              )}
            </div>
            <div className="md:col-span-2">
              <label htmlFor="tradeName" className="block text-sm font-medium text-gray-700 mb-1">
                Trade Name
              </label>
              <Input
                id="tradeName"
                placeholder="Business-facing name"
                {...form.register("tradeName")}
                className="bg-gray-50 border-gray-200"
              />
              {form.formState.errors.tradeName && (
                <p className="text-red-500 text-xs mt-1">{form.formState.errors.tradeName.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Legal & Tax Information */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-red-600 font-semibold text-lg">Legal & Tax Information</CardTitle>
            <p className="text-sm text-gray-500">Compliance details needed for GST and invoicing.</p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="gstin" className="block text-sm font-medium text-gray-700 mb-1">
                GSTIN
              </label>
              <Input
                id="gstin"
                placeholder="GST registration number"
                {...form.register("gstin")}
                className="bg-gray-50 border-gray-200"
              />
            </div>
            <div>
              <label htmlFor="pan" className="block text-sm font-medium text-gray-700 mb-1">
                PAN
              </label>
              <Input
                id="pan"
                placeholder="Taxpayer identity number"
                {...form.register("pan")}
                className="bg-gray-50 border-gray-200"
              />
            </div>
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                State
              </label>
              <Input
                id="state"
                placeholder="State (used for GST & regional logic)"
                {...form.register("state")}
                className="bg-gray-50 border-gray-200"
              />
            </div>
            <div>
              <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-1">
                Pincode
              </label>
              <Input
                id="pincode"
                placeholder="Geographic location"
                {...form.register("pincode")}
                className="bg-gray-50 border-gray-200"
              />
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
            <div className="md:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <Input
                id="address"
                placeholder="Full address of operations"
                {...form.register("address")}
                className="bg-gray-50 border-gray-200"
              />
              {form.formState.errors.address && (
                <p className="text-red-500 text-xs mt-1">{form.formState.errors.address.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700 mb-1">
                Contact Person
              </label>
              <Input
                id="contactPerson"
                placeholder="Primary contact name"
                {...form.register("contactPerson")}
                className="bg-gray-50 border-gray-200"
              />
              {form.formState.errors.contactPerson && (
                <p className="text-red-500 text-xs mt-1">{form.formState.errors.contactPerson.message}</p>
              )}
            </div>
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

        {/* Operational Access & Categories */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-red-600 font-semibold text-lg">Operational Access & Categories</CardTitle>
            <p className="text-sm text-gray-500">Define what the dealer can access and what they're allowed to sell</p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="isActive" className="block text-sm font-medium text-gray-700 mb-1">
                Is Active
              </label>
              <Select onValueChange={(value) => form.setValue("isActive", value)} value={form.watch("isActive")}>
                <SelectTrigger className="w-full bg-gray-50 border-gray-200">
                  <SelectValue placeholder="Whether the dealer is approved and live" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.isActive && (
                <p className="text-red-500 text-xs mt-1">{form.formState.errors.isActive.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="productCategoriesAllowed" className="block text-sm font-medium text-gray-700 mb-1">
                Product Categories Allowed
              </label>
              <Input
                id="productCategoriesAllowed"
                placeholder="Categories dealer is authorized to supply"
                {...form.register("productCategoriesAllowed")}
                className="bg-gray-50 border-gray-200"
              />
            </div>
            <div>
              <label htmlFor="uploadAccessEnabled" className="block text-sm font-medium text-gray-700 mb-1">
                Upload Access Enabled
              </label>
              <Select
                onValueChange={(value) => form.setValue("uploadAccessEnabled", value)}
                value={form.watch("uploadAccessEnabled")}
              >
                <SelectTrigger className="w-full bg-gray-50 border-gray-200">
                  <SelectValue placeholder="Whether dealer has backend access to update their stock" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.uploadAccessEnabled && (
                <p className="text-red-500 text-xs mt-1">{form.formState.errors.uploadAccessEnabled.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="certifications" className="block text-sm font-medium text-gray-700 mb-1">
                Certifications
              </label>
              <Input
                id="certifications"
                placeholder="Enter Sku Code"
                {...form.register("certifications")}
                className="bg-gray-50 border-gray-200"
              />
            </div>
          </CardContent>
        </Card>

        {/* Margins & Service Level */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-red-600 font-semibold text-lg">Margins & Service Level</CardTitle>
            <p className="text-sm text-gray-500">Business logic for pricing and fulfillment commitments.</p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="defaultMargin" className="block text-sm font-medium text-gray-700 mb-1">
                Default Margin %
              </label>
              <Input
                id="defaultMargin"
                placeholder="Agreed margin for most SKUs unless overridden"
                {...form.register("defaultMargin")}
                className="bg-gray-50 border-gray-200"
              />
            </div>
            <div>
              <label htmlFor="slaType" className="block text-sm font-medium text-gray-700 mb-1">
                SLA Type
              </label>
              <Select onValueChange={(value) => form.setValue("slaType", value)} value={form.watch("slaType")}>
                <SelectTrigger className="w-full bg-gray-50 border-gray-200">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="typeA">Type A</SelectItem>
                  <SelectItem value="typeB">Type B</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="slaMaxDispatchTime" className="block text-sm font-medium text-gray-700 mb-1">
                SLA Max Dispatch Time
              </label>
              <Input
                id="slaMaxDispatchTime"
                placeholder="Time from assignment to package readiness"
                {...form.register("slaMaxDispatchTime")}
                className="bg-gray-50 border-gray-200"
              />
            </div>
          </CardContent>
        </Card>

        {/* Activity Tracking */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-red-600 font-semibold text-lg">Activity Tracking</CardTitle>
            <p className="text-sm text-gray-500">Recent actions to monitor dealer performance and engagement</p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="lastUploadDate" className="block text-sm font-medium text-gray-700 mb-1">
                Last Upload Date
              </label>
              <Input
                id="lastUploadDate"
                value={form.getValues("lastUploadDate")}
                disabled
                className="bg-gray-50 border-gray-200 text-gray-500"
              />
            </div>
            <div>
              <label htmlFor="lastFulfillmentDate" className="block text-sm font-medium text-gray-700 mb-1">
                Last Fulfilment Date
              </label>
              <Input
                id="lastFulfillmentDate"
                value={form.getValues("lastFulfillmentDate")}
                disabled
                className="bg-gray-50 border-gray-200 text-gray-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Account Management */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-red-600 font-semibold text-lg">Account Management</CardTitle>
            <p className="text-sm text-gray-500">Internal assignment and monitoring of dealer performance</p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="assignedTopriseEmployee" className="block text-sm font-medium text-gray-700 mb-1">
                Assigned Toprise Employee
              </label>
              <Input
                id="assignedTopriseEmployee"
                placeholder="Internal account responsible for dealer"
                {...form.register("assignedTopriseEmployee")}
                className="bg-gray-50 border-gray-200"
              />
            </div>
            <div>
              <label htmlFor="onboardingDate" className="block text-sm font-medium text-gray-700 mb-1">
                Onboarding Date
              </label>
              <Input
                id="onboardingDate"
                placeholder="Date dealer was added to system"
                {...form.register("onboardingDate")}
                className="bg-gray-50 border-gray-200"
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 mb-1">
                Remarks
              </label>
              <Input
                id="remarks"
                placeholder="Internal operational notes"
                {...form.register("remarks")}
                className="bg-gray-50 border-gray-200"
              />
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
