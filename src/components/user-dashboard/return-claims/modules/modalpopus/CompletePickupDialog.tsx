"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { completeManualDelivery } from "@/service/return-service"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Package } from "lucide-react"

interface CompletePickupDialogProps {
  open: boolean
  onClose: () => void
  onComplete: (success: boolean) => void
  returnId: string | null
  returnRequest?: any
}

export default function CompletePickupDialog({
  open,
  onClose,
  onComplete,
  returnId,
  returnRequest
}: CompletePickupDialogProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!returnId) {
      toast({
        title: "Error",
        description: "Return ID is missing",
        variant: "destructive",
      })
      return
    }

    // Check if return request has the correct status for delivery completion
    const isValidStatus = returnRequest &&
      returnRequest.returnStatus === "Shipment_Intiated" &&
      returnRequest.delivery_chanel === "Manual_Rapido" &&
      returnRequest.shipment_started === true &&
      returnRequest.shipment_completed === false;

    if (returnRequest && !isValidStatus) {
      toast({
        title: "Invalid Status",
        description: "Only Manual Rapido deliveries with 'Shipment Initiated' status can be completed.",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      const response = await completeManualDelivery(returnId)

      if (response.success) {
        toast({
          title: "Success",
          description: "Delivery completed successfully",
        })
        onComplete(true)
        handleClose()
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to complete delivery",
          variant: "destructive",
        })
      }
    } catch (error: any) {

      // Better error handling for different types of errors
      let errorMessage = "Failed to complete delivery. Please try again."

      if (error.response) {
        // Server responded with error status
        if (error.response.status === 500) {
          errorMessage = "Server error: Internal server error occurred. Please contact support."
        } else if (error.response.data?.message) {
          errorMessage = `Server error: ${error.response.data.message}`
        } else {
          errorMessage = `Server error: ${error.response.status} - ${error.response.statusText}`
        }
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = "No response from server. Please check your connection."
      } else {
        // Something else happened
        errorMessage = error.message || "An unexpected error occurred."
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setLoading(false)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            Complete Delivery
          </DialogTitle>
          <DialogDescription>
            Confirm completion of Manual Rapido delivery for this return request.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {returnRequest && (
            <div className="bg-gray-50 p-3 rounded-lg space-y-2">
              <p className="text-sm font-medium text-gray-700">Return Details:</p>
              <div className="text-xs text-gray-600 space-y-1">
                <p>SKU: {returnRequest.sku}</p>
                <p>Quantity: {returnRequest.quantity}</p>
                <p>Customer: {returnRequest.orderId?.customerDetails?.name || 'N/A'}</p>
                <p>Delivery Channel: {returnRequest.delivery_chanel || 'N/A'}</p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Completing...
                </>
              ) : (
                "Complete Delivery"
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
