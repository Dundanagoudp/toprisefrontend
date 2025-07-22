"use client"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogOverlay } from "@/components/ui/dialog" 

interface DealerIdentificationProps {
  isOpen: boolean
  onClose: () => void
  dealerData?: {
    dealerId: string
    legalName: string
    tradeName: string
    address: string
    contactPerson: string
    mobileNumber: string
    email: string
    gstin: string
    pan: string
    state: string
    pincode: string
  }
}

export default function DealerIdentification({
  isOpen,
  onClose,
  dealerData = {
    dealerId: "DLR302",
    legalName: "Shree Auto Spares Pvt Ltd",
    tradeName: "ShreeAuto",
    address: "Plot 14, MIDC Bhosari, Pune",
    contactPerson: "Rakesh Jadhav",
    mobileNumber: "+91 98200 12345",
    email: "dealer@shreeauto.in",
    gstin: "27ABCDE1234F1Z2",
    pan: "ABCDE1234F",
    state: "Maharashtra",
    pincode: "411026",
  },
}: DealerIdentificationProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay className="bg-black bg-opacity-50" /> {/* Black transparent overlay */}
      <DialogContent className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl mx-auto bg-white p-4 sm:p-6 rounded-lg">
        <DialogHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 border-b border-gray-200 gap-2 sm:gap-0">
          <div className="flex-1">
            <DialogTitle className="text-xl sm:text-2xl md:text-3xl font-semibold text-red-600 mb-1 sm:mb-2">
              Dealer Identification
            </DialogTitle>
            <p className="text-sm sm:text-base text-gray-600">
              Basic information to uniquely identify the dealer in the system
            </p>
          </div>
        </DialogHeader>
        <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
          {/* Dealer Identification Section */}
          <div className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              <div className="space-y-1 sm:space-y-2">
                <h3 className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide">Dealer ID</h3>
                <p className="text-sm sm:text-base font-semibold text-gray-900">{dealerData?.dealerId}</p>
              </div>
              <div className="space-y-1 sm:space-y-2">
                <h3 className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide">Legal Name</h3>
                <p className="text-sm sm:text-base font-semibold text-gray-900">{dealerData?.legalName}</p>
              </div>
              <div className="space-y-1 sm:space-y-2 md:col-span-2 xl:col-span-1">
                <h3 className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide">Trade Name</h3>
                <p className="text-sm sm:text-base font-semibold text-gray-900">{dealerData?.tradeName}</p>
              </div>
            </div>
          </div>
          {/* Contact Information Section */}
          <div className="space-y-4 sm:space-y-6">
            <div className="border-l-4 border-red-600 pl-2 sm:pl-4">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-red-600 mb-1 sm:mb-2">
                Contact Information
              </h2>
              <p className="text-sm sm:text-base text-gray-600">Primary contact and communication details</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-1 sm:space-y-2">
                <h3 className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide">Address</h3>
                <p className="text-sm sm:text-base font-medium text-gray-900">{dealerData?.address}</p>
              </div>
              <div className="space-y-1 sm:space-y-2">
                <h3 className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide">Contact Person</h3>
                <p className="text-sm sm:text-base font-medium text-gray-900">{dealerData?.contactPerson}</p>
              </div>
              <div className="space-y-1 sm:space-y-2">
                <h3 className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide">Mobile Number</h3>
                <p className="text-sm sm:text-base font-medium text-gray-900">{dealerData?.mobileNumber}</p>
              </div>
              <div className="space-y-1 sm:space-y-2">
                <h3 className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide">Email</h3>
                <p className="text-sm sm:text-base font-medium text-gray-900 break-all">{dealerData?.email}</p>
              </div>
            </div>
          </div>
          {/* Legal & Tax Information Section */}
          <div className="space-y-4 sm:space-y-6">
            <div className="border-l-4 border-red-600 pl-2 sm:pl-4">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-red-600 mb-1 sm:mb-2">
                Legal & Tax Information
              </h2>
              <p className="text-sm sm:text-base text-gray-600">Compliance details needed for GST and invoicing</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
              <div className="space-y-1 sm:space-y-2">
                <h3 className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide">GSTIN</h3>
                <p className="text-sm sm:text-base font-medium text-gray-900 font-mono break-all">
                  {dealerData?.gstin}
                </p>
              </div>
              <div className="space-y-1 sm:space-y-2">
                <h3 className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide">PAN</h3>
                <p className="text-sm sm:text-base font-medium text-gray-900 font-mono">{dealerData?.pan}</p>
              </div>
              <div className="space-y-1 sm:space-y-2">
                <h3 className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide">STATE</h3>
                <p className="text-sm sm:text-base font-medium text-gray-900">{dealerData?.state}</p>
              </div>
              <div className="space-y-1 sm:space-y-2">
                <h3 className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide">PINCODE</h3>
                <p className="text-sm sm:text-base font-medium text-gray-900">{dealerData?.pincode}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
