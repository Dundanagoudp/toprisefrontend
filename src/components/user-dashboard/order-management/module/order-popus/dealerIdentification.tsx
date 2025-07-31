"use client"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogOverlay } from "@/components/ui/dialog" 
import DynamicButton from "@/components/common/button/button"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"

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
        <Card className="p-4 sm:p-6  border-0">
          {/* Dealer Identification Section */}
          <div ><CardContent className="flex flex-col ">
          <div className="space-y-4 sm:space-y-6 ">
            <CardTitle className="text-xl sm:text-2xl md:text-3xl font-bold text-[#C72920] mb-1 sm:mb-2 font-sans">Dealer Identification</CardTitle>
            <CardDescription>Basic information to uniquely identify the dealer in the system</CardDescription>
         
          
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4 sm:gap-6 mb-4  ">
              <div className="space-y-1 sm:space-y-2 col-span-1 ">
                <span className="font-sans font-medium text-sm text-[#777777]">Dealer ID</span>
                <p className="font-sans font-bold text-sm  text-[#1D1D1B]">{dealerData?.dealerId}</p>
              </div>
              <div className="font-sans font-medium text-sm text-[#777777]">
                <span className="font-sans font-medium text-sm">Legal Name</span>
                <p className="font-sans font-bold text-sm text-[#1D1D1B]">{dealerData?.legalName}</p>
              </div>
              <div className="font-sans font-medium text-sm text-[#777777]">
                <span className="font-sans font-medium text-sm">Trade Name</span>
                <p className="font-sans font-bold text-sm text-[#1D1D1B]">{dealerData?.tradeName}</p>
              </div>
            </div>
          </div> 
          {/* Contact Information Section */}
          <div className="space-y-4 sm:space-y-6">
         
            <CardTitle className="text-xl sm:text-2xl md:text-3xl font-bold text-[#C72920] mb-1 sm:mb-2 font-sans">Contact Information</CardTitle>
            <CardDescription>Primary contact and communication details</CardDescription>
          
           
             <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4 sm:gap-6 mb-4">
              <div className="space-y-1 sm:space-y-2">
                <h3 className="font-sans font-medium text-sm text-[#777777]">Address</h3>
                <p className="font-sans font-bold text-sm text-[#1D1D1B]">{dealerData?.address}</p>
              </div>
              <div className="space-y-1 sm:space-y-2">
                <h3 className="font-sans font-medium text-sm text-[#777777]">Contact Person</h3>
                <p className="font-sans font-bold text-sm text-[#1D1D1B]">{dealerData?.contactPerson}</p>
              </div>
              <div className="space-y-1 sm:space-y-2">
                <h3 className="font-sans font-medium text-sm text-[#777777]">Mobile Number</h3>
                <p className="font-sans font-bold text-sm text-[#1D1D1B]">{dealerData?.mobileNumber}</p>
              </div>
              <div className="space-y-1 sm:space-y-2">
                <h3 className="font-sans font-medium text-sm text-[#777777]">Email</h3>
                <p className="font-sans font-bold text-sm text-[#1D1D1B] break-all">{dealerData?.email}</p>
              </div>
            </div>
          </div>
          {/* Legal & Tax Information Section */}
          <div className="space-y-4 sm:space-y-6">
            
                 <CardTitle className="text-xl sm:text-2xl md:text-3xl font-bold text-[#C72920] sm:mb-2 font-sans"> Legal & Tax Information</CardTitle>
            <CardDescription className="text-sm sm:text-base text-gray-600">Compliance details needed for GST and invoicing</CardDescription>
        
          
             <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4 sm:gap-6 mb-4">
              <div className="space-y-1 sm:space-y-2">
                <h3 className="font-sans font-medium text-sm text-[#777777]">GSTIN</h3>
                <p className="font-sans font-bold text-sm text-[#1D1D1B]  ">
                  {dealerData?.gstin}
                </p>
              </div>
              <div className="space-y-1 sm:space-y-2">
                <h3 className="font-sans font-medium text-sm text-[#777777]">PAN</h3>
                <p className="font-sans font-bold text-sm text-[#1D1D1B] ">{dealerData?.pan}</p>
              </div>
              <div className="space-y-1 sm:space-y-2">
                <h3 className="font-sans font-medium text-sm text-[#777777]">STATE</h3>
                <p className="font-sans font-bold text-sm text-[#1D1D1B]">{dealerData?.state}</p>
              </div>
              <div className="space-y-1 sm:space-y-2">
                <h3 className="font-sans font-medium text-sm text-[#777777]">PINCODE</h3>
                <p className="font-sans font-bold text-sm text-[#1D1D1B]">{dealerData?.pincode}</p>
              </div>
            </div>
          </div>
          <div ></div></CardContent></div>
          <DynamicButton
          variant="default"
          text="Reassign Dealer"
          customClassName="mt-4 sm:mt-6 w-full bg-[#C72920] hover:bg-red-700 "

          />
        </Card>
      </DialogContent>
    </Dialog>
  )
}
