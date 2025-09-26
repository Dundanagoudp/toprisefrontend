"use client"

import { useState } from "react"
import { DynamicButton } from "@/components/common/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogOverlay } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useToast as GlobalToast } from "@/components/ui/toast"
import { cancelOrder } from "@/service/order-service"

interface CancelOrderModalProps {
  isOpen: boolean
  onClose: () => void
  orderId: string
  onOrderCancelled?: () => void
}

export default function CancelOrderModal({ isOpen, onClose, orderId, onOrderCancelled }: CancelOrderModalProps) {
  const [reason, setReason] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { showToast } = GlobalToast()

  const handleSubmit = async () => {
    if (!reason.trim()) {
      showToast("Please provide a reason for cancelling the order", "error")
      return
    }

    try {
      setIsLoading(true)
      const response = await cancelOrder(orderId, reason.trim())
      
      if (response.success) {
        showToast("Order cancelled successfully", "success")
        setReason("")
        onClose()
        onOrderCancelled?.()
      } else {
        showToast(response.message || "Failed to cancel order", "error")
      }
    } catch (error) {
      console.error("Error cancelling order:", error)
      showToast("Failed to cancel order. Please try again.", "error")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setReason("")
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogOverlay className="bg-transparent" />
      <DialogContent className="w-full max-w-md p-6 rounded-lg bg-white shadow-lg mx-auto">
        <DialogHeader className="relative flex flex-col items-center text-center pt-4 pb-6">
          <img
            src="/upload/cancelorder.png"
            alt="Cancel order illustration"
            className="mb-4 h-24 w-24 sm:h-32 sm:w-32"
          />
          <DialogTitle className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">
            Cancel Order
          </DialogTitle>
          <p className="text-sm text-gray-600">
            Please provide a reason for cancelling this order
          </p>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Cancellation *
            </label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please provide a reason for cancelling the order"
              className="min-h-[100px] border-gray-300 focus:border-red-500 focus:ring-red-500"
              disabled={isLoading}
            />
          </div>
          <div className="flex gap-3">
            <DynamicButton 
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </DynamicButton>
            <DynamicButton 
              onClick={handleSubmit}
              disabled={isLoading || !reason.trim()}
              className="flex-1 bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-400"
            >
              {isLoading ? "Cancelling..." : "Cancel Order"}
            </DynamicButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
