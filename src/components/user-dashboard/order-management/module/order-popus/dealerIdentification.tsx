"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

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
      <DialogContent className="w-[95vw] max-w-6xl mx-4 max-h-[95vh] overflow-y-auto bg-white">
        <DialogHeader className="flex flex-row items-center justify-between p-6 border-b border-gray-200">
          <div className="flex-1">
            <DialogTitle className="text-2xl md:text-3xl font-semibold text-red-600 mb-2">
              Dealer Identification
            </DialogTitle>
            <p className="text-base text-gray-600">Basic information to uniquely identify the dealer in the system</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full hover:bg-gray-100">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogHeader>

        <div className="p-6 space-y-8">
          {/* Dealer Identification Section */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Dealer ID</h3>
                <p className="text-xl font-bold text-gray-900">{dealerData?.dealerId}</p>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Legal Name</h3>
                <p className="text-xl font-bold text-gray-900">{dealerData?.legalName}</p>
              </div>
              <div className="space-y-2 md:col-span-2 xl:col-span-1">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Trade Name</h3>
                <p className="text-xl font-bold text-gray-900">{dealerData?.tradeName}</p>
              </div>
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="space-y-6">
            <div className="border-l-4 border-red-600 pl-4">
              <h2 className="text-2xl md:text-3xl font-bold text-red-600 mb-2">Contact Information</h2>
              <p className="text-base text-gray-600">Primary contact and communication details</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Address</h3>
                <p className="text-lg font-semibold text-gray-900">{dealerData?.address}</p>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Contact Person</h3>
                <p className="text-lg font-semibold text-gray-900">{dealerData?.contactPerson}</p>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Mobile Number</h3>
                <p className="text-lg font-semibold text-gray-900">{dealerData?.mobileNumber}</p>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Email</h3>
                <p className="text-lg font-semibold text-gray-900 break-all">{dealerData?.email}</p>
              </div>
            </div>
          </div>

          {/* Legal & Tax Information Section */}
          <div className="space-y-6">
            <div className="border-l-4 border-red-600 pl-4">
              <h2 className="text-2xl md:text-3xl font-bold text-red-600 mb-2">Legal & Tax Information</h2>
              <p className="text-base text-gray-600">Compliance details needed for GST and invoicing</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">GSTIN</h3>
                <p className="text-lg font-semibold text-gray-900 font-mono break-all">{dealerData?.gstin}</p>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">PAN</h3>
                <p className="text-lg font-semibold text-gray-900 font-mono">{dealerData?.pan}</p>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">STATE</h3>
                <p className="text-lg font-semibold text-gray-900">{dealerData?.state}</p>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">PINCODE</h3>
                <p className="text-lg font-semibold text-gray-900">{dealerData?.pincode}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
