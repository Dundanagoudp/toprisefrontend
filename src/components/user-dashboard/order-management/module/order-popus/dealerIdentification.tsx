"use client"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogOverlay } from "@/components/ui/dialog" 
import DynamicButton from "@/components/common/button/button"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"

interface DealerIdentificationProps {
  isOpen: boolean
  onClose: () => void
  dealerData?: Array<{
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
  }> | {
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
  dealerData 
}: DealerIdentificationProps) {
  // Normalize dealerData to array
  const dealers = Array.isArray(dealerData) ? dealerData : dealerData ? [dealerData] : [];
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay className="bg-black bg-opacity-50" />
      <DialogContent className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl mx-auto bg-white p-4 sm:p-6 rounded-lg">
        <div className="max-h-[60vh] overflow-y-auto space-y-4">
          {dealers.map((dealer, idx) => (
            <Card key={dealer.dealerId || idx} className="p-4 sm:p-6 border border-gray-200 shadow-sm">
              <CardContent className="flex flex-col">
                <div className="space-y-2">
                  <CardTitle className="text-lg font-bold text-[#C72920] mb-1 font-sans">Dealer Information</CardTitle>
                  <CardDescription className="mb-2">Dealer Information</CardDescription>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
                    <div>
                      <span className="font-sans font-medium text-sm text-[#777777]">Dealer ID</span>
                      <p className="font-sans font-bold text-sm text-[#1D1D1B]">{dealer.dealerId}</p>
                    </div>
                    <div>
                      <span className="font-sans font-medium text-sm text-[#777777]">Legal Name</span>
                      <p className="font-sans font-bold text-sm text-[#1D1D1B]">{dealer.legalName}</p>
                    </div>
                  </div>
      
                  <div className="flex justify-end mt-2">
                    <DynamicButton
                      variant="default"
                      text="Reassign Dealer"
                      customClassName="bg-[#C72920] hover:bg-red-700 px-4 py-1 text-xs rounded"
                      // onClick={() => handleReassignDealer(dealer.dealerId)} // Add handler as needed
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
