"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { getDealerById, getAllCategories, getAllUsers } from "@/service/dealerServices"
import type { Dealer, Category, User } from "@/types/dealer-types"

export default function ViewDealer() {
  const params = useParams()
  const dealerId = params?.id as string
  const [dealer, setDealer] = useState<Dealer | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line
  }, [dealerId])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [dealerRes, catRes, userRes] = await Promise.all([
        getDealerById(dealerId),
        getAllCategories(),
        getAllUsers(),
      ])
      if (dealerRes.success && catRes.success && userRes.success) {
        setDealer(dealerRes.data)
        setCategories(catRes.data)
        setUsers(userRes.data)
      } else {
        setError("Failed to load dealer details.")
      }
    } catch (err) {
      setError("Failed to load dealer details.")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 p-4 md:p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading dealer details...</p>
        </div>
      </div>
    )
  }
  if (error || !dealer) {
    return (
      <div className="flex-1 p-4 md:p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">{error || "Dealer not found."}</div>
      </div>
    )
  }

  // Helper: get category names
  const categoryNames = dealer.categories_allowed.map(cid => {
    const cat = categories.find(c => c._id === cid)
    return cat ? cat.category_name : cid
  })
  // Helper: get assigned employee names
  const assignedEmployees = dealer.assigned_Toprise_employee.map(ae => {
    const user = users.find(u => u._id === ae.assigned_user)
    return user ? `${user.email} (${user.role})` : ae.assigned_user
  })

  return (
    <div className="flex-1 p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Header for Product Details */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Dealer Details</h1>
          <p className="text-sm text-gray-500">View all information about this dealer</p>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dealer Identification */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-black-600 font-semibold text-lg">Dealer Identification</CardTitle>
            <p className="text-sm text-gray-500">Basic information to uniquely identify the dealer in the system.</p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-700">Dealer ID</span>
              <span className="text-gray-900">{dealer._id}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-700">Legal Name</span>
              <span className="text-gray-900">{dealer.legal_name}</span>
            </div>
            <div className="flex flex-col sm:col-span-2">
              <span className="text-sm font-medium text-gray-700">Trade Name</span>
              <span className="text-gray-900">{dealer.trade_name}</span>
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
              <span className="text-gray-900">{dealer.GSTIN}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-700">PAN</span>
              <span className="text-gray-900">{dealer.Pan}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-700">State</span>
              <span className="text-gray-900">{dealer.Address.state}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-700">Pincode</span>
              <span className="text-gray-900">{dealer.Address.pincode}</span>
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
              <span className="text-gray-900">{dealer.Address.street}, {dealer.Address.city}, {dealer.Address.state} - {dealer.Address.pincode}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-700">Contact Person</span>
              <span className="text-gray-900">{dealer.contact_person.name}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-700">Mobile Number</span>
              <span className="text-gray-900">{dealer.contact_person.phone_number}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-700">Email</span>
              <span className="text-gray-900">{dealer.contact_person.email}</span>
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
              <span className="text-gray-900">{dealer.is_active ? "Active" : "Inactive"}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-700">Product Categories Allowed</span>
              <span className="text-gray-900">{categoryNames.join(", ")}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-700">Upload Access Enabled</span>
              <span className="text-gray-900">{dealer.upload_access_enabled ? "Yes" : "No"}</span>
            </div>
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
              <span className="text-gray-900">{dealer.default_margin}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-700">SLA Type</span>
              <span className="text-gray-900">{dealer.SLA_type}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-700">Dealer Dispatch Time</span>
              <span className="text-gray-900">{dealer.dealer_dispatch_time} hours</span>
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
              <span className="text-sm font-medium text-gray-700">Last Fulfilment Date</span>
              <span className="text-gray-900">{dealer.last_fulfillment_date ? dealer.last_fulfillment_date.split("T")[0] : "-"}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-700">Onboarding Date</span>
              <span className="text-gray-900">{dealer.onboarding_date ? dealer.onboarding_date.split("T")[0] : "-"}</span>
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
              <span className="text-sm font-medium text-gray-700">Assigned Toprise Employee(s)</span>
              <span className="text-gray-900">{assignedEmployees.join(", ")}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-700">Remarks</span>
              <span className="text-gray-900">{dealer.remarks}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
