import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Truck, Loader2 } from 'lucide-react'
import { useToast } from "@/components/ui/toast"

interface ManualDeliveryModalProps {
  open: boolean;
  onClose: () => void;
  onComplete?: (success: boolean) => void;
  returnId: string;
  returnRequest?: any;
}

export default function ManualDeliveryModal({
  open,
  onClose,
  onComplete,
  returnId,
  returnRequest
}: ManualDeliveryModalProps) {
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [trackingUrl, setTrackingUrl] = useState('')
  const [deliveryNotes, setDeliveryNotes] = useState('')

  const handleSubmit = async () => {
    if (!returnId) {
      showToast("Return ID is required", "error")
      return
    }

    try {
      setLoading(true)

      // TODO: Implement the actual API call for manual delivery
      // For now, just show success and close
      console.log('Manual delivery for return:', returnId, {
        trackingUrl: trackingUrl.trim(),
        deliveryNotes: deliveryNotes.trim()
      })

      showToast("Manual delivery marked successfully", "success")
      onComplete?.(true)
      handleClose()
    } catch (error) {
      console.error("Failed to mark manual delivery:", error)
      showToast("Failed to mark manual delivery", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setTrackingUrl('')
    setDeliveryNotes('')
    setLoading(false)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-blue-600" />
            Manual Delivery
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="returnId">Return ID</Label>
            <Input
              id="returnId"
              value={returnId || "N/A"}
              readOnly
              className="bg-gray-50 cursor-default"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sku">SKU</Label>
            <Input
              id="sku"
              value={returnRequest?.sku || "N/A"}
              readOnly
              className="bg-gray-50 cursor-default"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="trackingUrl">Tracking URL (Optional)</Label>
            <Input
              id="trackingUrl"
              type="url"
              value={trackingUrl}
              onChange={(e) => setTrackingUrl(e.target.value)}
              placeholder="https://example.com/track/123"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deliveryNotes">Delivery Notes (Optional)</Label>
            <Textarea
              id="deliveryNotes"
              value={deliveryNotes}
              onChange={(e) => setDeliveryNotes(e.target.value)}
              placeholder="Enter delivery notes..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Truck className="h-4 w-4 mr-2" />
                Mark as Delivered
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
