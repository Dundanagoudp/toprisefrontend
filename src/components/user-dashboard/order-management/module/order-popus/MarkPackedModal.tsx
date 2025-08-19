"use client"
import React, { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { DynamicButton } from "@/components/common/button"
import { useToast as GlobalToast } from "@/components/ui/toast"
import { updateOrderStatusByDealerReq } from "@/service/order-service"

interface MarkPackedModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  orderId?: string
  dealerId?: string
}

const MarkPackedModal: React.FC<MarkPackedModalProps> = ({ open, onOpenChange, orderId = "", dealerId = "" }) => {
  const { showToast } = GlobalToast()
  const [totalWeightKg, setTotalWeightKg] = useState<number>(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) setTotalWeightKg(0)
  }, [open])

  const onMarkPacked = async () => {
    try {
      setLoading(true)
      await updateOrderStatusByDealerReq({ orderId, dealerId, total_weight_kg: totalWeightKg } as any)
      showToast("Order marked as packed", "success")
      onOpenChange(false)
    } catch (e) {
      showToast("Failed to mark packed", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Mark Order as Packed</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Total Weight (kg)</Label>
            <Input type="number" value={totalWeightKg} onChange={(e) => setTotalWeightKg(parseFloat(e.target.value) || 0)} />
          </div>
          <DynamicButton onClick={onMarkPacked} disabled={loading}>
            {loading ? "Updating..." : "Mark Packed"}
          </DynamicButton>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default MarkPackedModal

