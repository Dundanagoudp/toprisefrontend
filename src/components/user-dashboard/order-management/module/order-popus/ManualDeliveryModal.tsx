"use client"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"
import { getDealerById } from "@/service/dealerServices"
import { markOrderAsManualDelivery } from "@/service/order-service"
import { useAppSelector } from "@/store/hooks"

interface ManualDeliveryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  orderId?: string
  dealerId?: string
  picklistId?: string
  items?: Array<{sku: string, quantity: number}>
  onSuccess?: () => void
}

export default function ManualDeliveryModal({
  open,
  onOpenChange,
  orderId = "",
  dealerId = "",
  picklistId = "",
  items = [],
  onSuccess
}: ManualDeliveryModalProps) {
  const { showToast } = useToast()
  const auth = useAppSelector((state) => state.auth.user)
  const [loading, setLoading] = useState(false)
  const [dealerTradeName, setDealerTradeName] = useState<string>("")
  const [picklistItems, setPicklistItems] = useState<Array<{sku: string, quantity: number, weight?: number}>>([])
  const [weightInputs, setWeightInputs] = useState<Record<string, string | number>>({})
  const [trackURL, setTrackURL] = useState<string>("")

  useEffect(() => {
    if (!open) {
      setPicklistItems([])
      setWeightInputs({})
      setTrackURL("")
      return
    }

    // Initialize from items prop
    if (items && items.length > 0) {
      const mappedItems = items.map(item => ({
        sku: item.sku,
        quantity: item.quantity,
        weight: 0
      }))
      setPicklistItems(mappedItems)

      const initialWeights: Record<string, string | number> = {}
      mappedItems.forEach(item => {
        initialWeights[item.sku] = ""
      })
      setWeightInputs(initialWeights)
    } else {
      setPicklistItems([])
      setWeightInputs({})
    }
  }, [open, items])

  useEffect(() => {
    let cancelled = false
    const fetchDealer = async () => {
      try {
        if (!dealerId) {
          setDealerTradeName("")
          return
        }
        const res = await getDealerById(dealerId)
        const dealer: any = (res as any)?.data
        const name = dealer?.trade_name || dealer?.legal_name || ""
        if (!cancelled) setDealerTradeName(name)
      } catch {
        if (!cancelled) setDealerTradeName("")
      }
    }
    fetchDealer()
    return () => {
      cancelled = true
    }
  }, [dealerId])

  const handleSubmitManualDelivery = async () => {
    if (!picklistId) {
      showToast("Picklist ID is required", "error")
      return
    }

    if (picklistItems.length === 0) {
      showToast("No items found in picklist", "error")
      return
    }

    // Validate that all weights are provided and valid
    const weightObject: Record<string, number> = {}
    for (const item of picklistItems) {
      const weight = Number(weightInputs[item.sku])
      if (!weightInputs[item.sku] || weight <= 0 || isNaN(weight)) {
        showToast(`Please enter a valid weight for SKU: ${item.sku}`, "error")
        return
      }
      weightObject[item.sku] = weight
    }

    if (!trackURL.trim()) {
      showToast("Please enter a tracking URL", "error")
      return
    }

    try {
      setLoading(true)

      const isSuperAdmin = auth?.role === "Super-admin"
      const forcePacking = isSuperAdmin || auth?.role === "Fulfillment-Admin"

      const response = await markOrderAsManualDelivery({
        orderId,
        dealerId,
        picklistId,
        trackURL: trackURL.trim(),
        weight_object: weightObject,
        forcePacking: forcePacking
      })

      console.log("Manual delivery response:", response)
      showToast("Manual delivery submitted successfully", "success")
      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to submit manual delivery:", error)
      showToast("Failed to submit manual delivery", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Manual Delivery</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <div>
              <label className="text-sm font-medium text-gray-700">Order ID</label>
              <Input
                type="text"
                value={orderId || "N/A"}
                readOnly
                className="bg-gray-50 cursor-default"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Dealer ID</label>
              <Input
                type="text"
                value={dealerId || "N/A"}
                readOnly
                className="bg-gray-50 cursor-default"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Picklist ID</label>
              <Input
                type="text"
                value={picklistId || "N/A"}
                readOnly
                className="bg-gray-50 cursor-default"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Dealer Trade Name</label>
              <Input
                type="text"
                value={dealerTradeName || "N/A"}
                readOnly
                className="bg-gray-50 cursor-default"
              />
            </div>
          </div>

          {picklistItems.length > 0 ? (
            <div className="space-y-4">
              <label className="text-sm font-medium">Weight per SKU (kg)</label>
              {picklistItems.map((item) => (
                <div key={item.sku} className="flex items-center space-x-2">
                  <div className="flex-1">
                    <label className="text-sm text-gray-700 block mb-1">
                      SKU: {item.sku} (Qty: {item.quantity})
                    </label>
                    <Input
                      type="number"
                      value={weightInputs[item.sku] || ""}
                      onChange={(e) => setWeightInputs(prev => ({
                        ...prev,
                        [item.sku]: e.target.value
                      }))}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className="w-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : picklistId ? (
            <div className="text-center py-4">
              <div className="text-sm text-gray-600">No items found in picklist</div>
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="text-sm text-gray-600">Picklist ID is required</div>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700">Tracking URL</label>
            <Input
              type="url"
              value={trackURL}
              onChange={(e) => setTrackURL(e.target.value)}
              placeholder="https://example.com/track/123"
              className="w-full"
            />
          </div>

          <Button
            onClick={handleSubmitManualDelivery}
            disabled={loading || picklistItems.length === 0 || Object.keys(weightInputs).length === 0 || !trackURL.trim()}
            className="w-full"
          >
            {loading ? "Submitting..." : "Submit Manual Delivery"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
