"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { getDealerById, getAllCategories, getAllUsers, getAllCSlaTypes } from "@/service/dealerServices"
import { User, Mail, Phone, Calendar, MapPin, Building, Clock, Clock3 } from "lucide-react"
import type { Dealer, User as UserType } from "@/types/dealer-types"
import type { SlaType } from "@/types/sla-types"
import { getBrand } from "@/service/product-Service"
import { Brand } from "@/types/product-Types"

// Utility function to format role for display
// Maps "Fulfillment-Admin" -> "Fullfillment-Admin" and "Fulfillment-Staff" -> "Fullfillment-Staff"
const formatRoleForDisplay = (role: string | undefined | null): string => {
  if (!role) return role || "";
  if (role === "Fulfillment-Admin") return "Fullfillment-Admin";
  if (role === "Fulfillment-Staff") return "Fullfillment-Staff";
  return role;
};

export default function ViewDealer() {
  const params = useParams()
  const dealerId = params?.id as string
  const [dealer, setDealer] = useState<any | null>(null)
  const [brands, setBrands] = useState<Brand[]>([])
  const [users, setUsers] = useState<UserType[]>([])
  const [slaTypes, setSlaTypes] = useState<SlaType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showBrandModal, setShowBrandModal] = useState(false)

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line
  }, [dealerId])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [dealerRes, brandRes, userRes, slaRes] = await Promise.all([
        getDealerById(dealerId),
        getBrand(),
        getAllUsers(),
        getAllCSlaTypes(),
      ])
      if (dealerRes.success && brandRes.success && userRes.success) {
        setDealer(dealerRes.data)
        console.log("🔍 Dealer data:", dealerRes.data)
        setBrands(brandRes.data as unknown as Brand[])
        setUsers(userRes.data)
        // Handle SLA types response
        if (slaRes.success && slaRes.data) {
          setSlaTypes(slaRes.data)
        }
      } else {
        setError("Failed to load dealer details.")
      }
    } catch (err) {
      setError("Failed to load dealer details.")
    } finally {
      setLoading(false)
    }
  }

  const openBrandModal = () => {
    setShowBrandModal(true)
  }

  const closeBrandModal = () => {
    setShowBrandModal(false)
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
  const brandNames = dealer.brands_allowed?.map(bid => {
    const brand = brands.find(b => b._id === bid)
    return brand ? brand.brand_name : bid
  }) || []

  // Helper: get SLA type information
  const getSlaTypeInfo = () => {
    if (!dealer.SLA_type) return { name: "-", description: "-", expectedHours: "-" }
    const slaType = slaTypes.find(sla => sla._id === dealer.SLA_type)
    return slaType ? {
      name: slaType.name,
      description: slaType.description,
      expectedHours: slaType.expected_hours
    } : {
      name: dealer.SLA_type, // Fallback to ID if not found
      description: "-",
      expectedHours: "-"
    }
  }

  const slaTypeInfo = getSlaTypeInfo()

  // Helper: format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "-"
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateString
    }
  }

  // Helper: get assigned employee information
  const getAssignedEmployees = () => {
    if (!dealer.assigned_Toprise_employee || !Array.isArray(dealer.assigned_Toprise_employee)) {
      return []
    }
    
    return dealer.assigned_Toprise_employee
      .filter(assignment => assignment.assigned_user && assignment.assigned_user._id)
      .map(assignment => {
        const employee = assignment.assigned_user
        const employeeDetails = assignment.employee_details || employee
        
        return {
          id: employee._id,
          employeeId: employeeDetails.employee_id || "-",
          firstName: employeeDetails.First_name || "-",
          email: employeeDetails.email || employee.user_id?.email || "-",
          phone: employeeDetails.mobile_number || employee.user_id?.phone_Number || "-",
          role: employeeDetails.role || employee.user_id?.role || "-",
          username: employee.user_id?.username || "-",
          profileImage: employeeDetails.profile_image || null,
          assignedAt: assignment.assigned_at,
          status: assignment.status || "Active",
          assignedDealers: employeeDetails.assigned_dealers || [],
          assignedRegions: employeeDetails.assigned_regions || [],
          lastLogin: employeeDetails.last_login,
          createdAt: employeeDetails.created_at,
          updatedAt: employeeDetails.updated_at
        }
      })
  }

  const assignedEmployees = getAssignedEmployees()

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
            <CardTitle className="text-black-600 font-semibold text-lg">Operational Access & Brands</CardTitle>
            <p className="text-sm text-gray-500">Define what the dealer can access and what they're allowed to sell</p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-700">Is Active</span>
              <span className="text-gray-900">{dealer.is_active ? "Active" : "Inactive"}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-700">Product Brands Allowed</span>
              <div className="flex flex-wrap gap-1 mt-1 max-w-full">
                {brandNames.length === 0 ? (
                  <span className="text-gray-500 text-sm">No brands assigned</span>
                ) : (
                  <>
                    {brandNames.slice(0, 3).map((brandName: string, idx: number) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="bg-red-100 text-red-800 hover:bg-red-200 text-xs px-2 py-1"
                        title={brandName}
                      >
                        {brandName}
                      </Badge>
                    ))}
                    {brandNames.length > 3 && (
                      <Badge
                        variant="secondary"
                        className="bg-gray-100 text-gray-600 hover:bg-gray-200 hover:cursor-pointer text-xs px-2 py-1"
                        title={`Click to view all ${brandNames.length} brands`}
                        onClick={openBrandModal}
                      >
                        +{brandNames.length}
                      </Badge>
                    )}
                  </>
                )}
              </div>
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
            <CardTitle className="text-black-600 font-semibold text-lg flex items-center gap-2">
              <Clock3 className="h-5 w-5" />
              Margins & Service Level
            </CardTitle>
            <p className="text-sm text-gray-500">Business logic for pricing and fulfillment commitments.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-700">Default Margin %</span>
                <span className="text-gray-900">{dealer.default_margin}%</span>
              </div>
            </div>
            
            {/* SLA Type Information */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Clock3 className="h-4 w-4" />
                SLA Type Information
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-700">SLA Type Name</span>
                  <span className="text-gray-900 font-semibold">{slaTypeInfo.name}</span>
                </div>
                {slaTypeInfo.description !== "-" && (
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700">Description</span>
                    <span className="text-gray-900">{slaTypeInfo.description}</span>
                  </div>
                )}
                {slaTypeInfo.expectedHours !== "-" && (
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700">Expected Minutes</span>
                    <span className="text-gray-900">{slaTypeInfo.expectedHours} minutes</span>
                  </div>
                )}
              </div>
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
              <span className="text-sm font-medium text-gray-700">Last Fulfillment Date</span>
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
            <CardTitle className="text-black-600 font-semibold text-lg flex items-center gap-2">
              <Building className="h-5 w-5" />
              Account Management
            </CardTitle>
            <p className="text-sm text-gray-500">Internal assignment and monitoring of dealer performance</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Assigned Toprise Employees */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="h-4 w-4" />
                Assigned Toprise Employees ({assignedEmployees.length})
              </h3>
              
              {assignedEmployees.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {assignedEmployees.map((employee, index) => (
                    <div key={employee.id || index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      {/* Employee Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            {employee.profileImage ? (
                              <img 
                                src={employee.profileImage} 
                                alt={employee.firstName}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <User className="h-5 w-5 text-blue-600" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{employee.firstName}</h4>
                            <p className="text-sm text-gray-600">ID: {employee.employeeId}</p>
                          </div>
                        </div>
                        <Badge 
                          variant={employee.status === "Active" ? "default" : "secondary"}
                          className={employee.status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                        >
                          {employee.status}
                        </Badge>
                      </div>

                      {/* Employee Details */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-700">{employee.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-700">{employee.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-700">@{employee.username}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Building className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-700">{formatRoleForDisplay(employee.role)}</span>
                        </div>
                      </div>

                      {/* Assignment Details */}
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-center gap-2 text-sm mb-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">Assigned:</span>
                          <span className="text-gray-900">{formatDate(employee.assignedAt)}</span>
                        </div>
                        {employee.lastLogin && (
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">Last Login:</span>
                            <span className="text-gray-900">{formatDate(employee.lastLogin)}</span>
                          </div>
                        )}
                      </div>

                      {/* Additional Info */}
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="text-xs text-gray-500">
                          <div>Assigned Dealers: {employee.assignedDealers.length}</div>
                          <div>Assigned Regions: {employee.assignedRegions.length}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <User className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No employees assigned to this dealer</p>
                </div>
              )}
            </div>

            {/* Remarks */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Remarks</h3>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                {dealer.remarks || "No remarks available"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Brand Details Modal */}
      <Dialog open={showBrandModal} onOpenChange={setShowBrandModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Product Brands Allowed</DialogTitle>
            <DialogDescription>
              All brands that this dealer is authorized to sell ({brandNames.length} total)
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto">
              {brandNames.map((brandName: string, idx: number) => (
                <Badge
                  key={idx}
                  variant="secondary"
                  className="bg-red-100 text-red-800 hover:bg-red-200 text-xs px-3 py-1"
                >
                  {brandName}
                </Badge>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
