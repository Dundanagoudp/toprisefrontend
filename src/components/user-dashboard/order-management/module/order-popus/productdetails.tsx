"use client"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogOverlay } from "@/components/ui/dialog"

interface DealerPopupModalProps {
  isOpen: boolean
  onClose: () => void
  dealerData?: {
    dealerId: string
    legalName: string
    tradeName: string
    gstin: string
    pan: string
    state: string
    pincode: string
    address: string
    mobileNumber: string
    contactPerson: string
    email: string
    isActive: boolean
    productCategoriesAllowed: string
    uploadAccessEnabled: boolean
    defaultMargin: number
    slaType: string
    lastUploadDate: string
    lastFulfilmentDate: string
    slaMaxDispatchTime: number
    assignedTopriseEmployee: string
    onboardingDate: string
    remarks: string
  }
}

export default function DealerPopupModal({
  isOpen,
  onClose,
  dealerData = {
    dealerId: "DLR302",
    legalName: "Three Auto Spares Pvt Ltd",
    tradeName: "ThreeAuto",
    gstin: "27ABCDE1234FIZZ",
    pan: "ABCDE1234F",
    state: "Maharashtra",
    pincode: "41026",
    address: "Plot 14, MIDC Bhosari, Pune",
    mobileNumber: "+919820012345",
    contactPerson: "Rakesh Jadhav",
    email: "dealer@shreeauto.in",
    isActive: true,
    productCategoriesAllowed: "Braking",
    uploadAccessEnabled: true,
    defaultMargin: 18.0,
    slaType: "SLA Type",
    lastUploadDate: "2025-04-30 10:15",
    lastFulfilmentDate: "2025-04-29 14:22",
    slaMaxDispatchTime: 24,
    assignedTopriseEmployee: "USRO19",
    onboardingDate: "2024-11-12",
    remarks: "Slow with suspension items",
  },
}: DealerPopupModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay className="bg-black bg-opacity-50" />
      <DialogContent className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
        <DialogHeader className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-semibold text-gray-900">Dealer Details</DialogTitle>
              <p className="text-sm text-gray-500">Comprehensive dealer information</p>
            </div>
          </div>
        </DialogHeader>

        <div className="p-4 space-y-6 overflow-y-auto max-h-[70vh] bg-gray-50">
          {/* Dealer Identification */}
          <div className="bg-white rounded-xl shadow border p-6 space-y-2">
            <h2 className="text-lg font-semibold text-gray-900">Dealer Identification</h2>
            <p className="text-sm text-gray-500">Basic information to uniquely identify the dealer in the system</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div>
                <p className="text-sm text-gray-500">Dealer ID</p>
                <p className="text-base font-bold">{dealerData.dealerId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Legal Name</p>
                <p className="text-base font-bold">{dealerData.legalName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Trade Name</p>
                <p className="text-base font-bold">{dealerData.tradeName}</p>
              </div>
            </div>
          </div>

          {/* Legal & Tax Information */}
          <div className="bg-white rounded-xl shadow border p-6 space-y-2">
            <h2 className="text-lg font-semibold text-gray-900">Legal & Tax Information</h2>
            <p className="text-sm text-gray-500">Compliance details needed for GST and invoicing</p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
              <div>
                <p className="text-sm text-gray-500">GSTIN</p>
                <p className="text-base font-bold">{dealerData.gstin}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">PAN</p>
                <p className="text-base font-bold">{dealerData.pan}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">State</p>
                <p className="text-base font-bold">{dealerData.state}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Pincode</p>
                <p className="text-base font-bold">{dealerData.pincode}</p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-xl shadow border p-6 space-y-2">
            <h2 className="text-lg font-semibold text-gray-900">Contact Information</h2>
            <p className="text-sm text-gray-500">Primary contact and communication details</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="text-base font-bold">{dealerData.address}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Contact Person</p>
                <p className="text-base font-bold">{dealerData.contactPerson}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Mobile Number</p>
                <p className="text-base font-bold">{dealerData.mobileNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-base font-bold">{dealerData.email}</p>
              </div>
            </div>
          </div>

          {/* Operational Access & Categories */}
          <div className="bg-white rounded-xl shadow border p-6 space-y-2">
            <h2 className="text-lg font-semibold text-gray-900">Operational Access & Categories</h2>
            <p className="text-sm text-gray-500">Define what the dealer can access and what they’re allowed to sell</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div>
                <p className="text-sm text-gray-500">Is Active</p>
                <p className="text-base font-bold">{dealerData.isActive ? "True" : "False"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Product Categories Allowed</p>
                <p className="text-base font-bold">{dealerData.productCategoriesAllowed}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Upload Access Enabled</p>
                <p className="text-base font-bold">{dealerData.uploadAccessEnabled ? "True" : "False"}</p>
              </div>
            </div>
          </div>

          {/* Margins & Service Level */}
          <div className="bg-white rounded-xl shadow border p-6 space-y-2">
            <h2 className="text-lg font-semibold text-gray-900">Margins & Service Level</h2>
            <p className="text-sm text-gray-500">Business logic for pricing and fulfilment commitments.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div>
                <p className="text-sm text-gray-500">Default Margin %</p>
                <p className="text-base font-bold">{dealerData.defaultMargin}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">SLA Type</p>
                <p className="text-base font-bold">{dealerData.slaType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">SLA Max Dispatch Time</p>
                <p className="text-base font-bold">{dealerData.slaMaxDispatchTime}</p>
              </div>
            </div>
          </div>

          {/* Activity Tracking */}
          <div className="bg-white rounded-xl shadow border p-6 space-y-2">
            <h2 className="text-lg font-semibold text-gray-900">Activity Tracking</h2>
            <p className="text-sm text-gray-500">Recent actions to monitor dealer performance and engagement.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <p className="text-sm text-gray-500">Last Upload Date</p>
                <p className="text-base font-bold">{dealerData.lastUploadDate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Fulfilment Date</p>
                <p className="text-base font-bold">{dealerData.lastFulfilmentDate}</p>
              </div>
            </div>
          </div>

          {/* Account Management */}
          <div className="bg-white rounded-xl shadow border p-6 space-y-2">
            <h2 className="text-lg font-semibold text-gray-900">Account Management</h2>
            <p className="text-sm text-gray-500">Internal assignment and monitoring of dealer performance</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <p className="text-sm text-gray-500">Assigned Employee</p>
                <p className="text-base font-bold">{dealerData.assignedTopriseEmployee}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Onboarding Date</p>
                <p className="text-base font-bold">{dealerData.onboardingDate}</p>
              </div>
            </div>
            <div className="pt-2">
              <p className="text-sm text-gray-500">Remarks</p>
              <p className="text-base font-bold">{dealerData.remarks}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}