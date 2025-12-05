"use client"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"
import { markOrderAsPacked } from "@/service/order-service"
import { useAppSelector } from "@/store/hooks"
import { getDealerById } from "@/service/dealerServices"

interface MarkPackedModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  orderId?: string
  dealerId?: string
  sku?: string
  productName?: string
  mpn?: string
  onSuccess?: () => void
}

export default function MarkPackedModal({ 
  open, 
  onOpenChange, 
  orderId = "", 
  dealerId = "",
  sku = "",
  productName = "",
  mpn = "",
  onSuccess
}: MarkPackedModalProps) {
  const { showToast } = useToast()
  const auth = useAppSelector((state) => state.auth.user)
  const [totalWeightKg, setTotalWeightKg] = useState<string | number>("")
  const [loading, setLoading] = useState(false)
  const [dealerTradeName, setDealerTradeName] = useState<string>("")

  useEffect(() => {
    if (!open) setTotalWeightKg("")
  }, [open])

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

  const handleMarkPacked = async () => {
    const weight = Number(totalWeightKg)
    if (!totalWeightKg || weight <= 0 || isNaN(weight)) {
      showToast("Please enter a valid weight", "error")
      return
    }

    try {
      setLoading(true)
      const isSuperAdmin = auth?.role === "Super-admin"
      await markOrderAsPacked({
        orderId,
        dealerId,
        total_weight_kg: weight,
        sku,
        forcePacking: isSuperAdmin
      })
      showToast("Order marked as packed", "success")
      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      showToast("Failed to mark packed", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Mark Order as Packed</DialogTitle>
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
              <label className="text-sm font-medium text-gray-700">Dealer Trade Name</label>
              <Input
                type="text"
                value={dealerTradeName || "N/A"}
                readOnly
                className="bg-gray-50 cursor-default"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Product Name</label>
              <Input
                type="text"
                value={productName || "N/A"}
                readOnly
                className="bg-gray-50 cursor-default"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">MPN</label>
              <Input
                type="text"
                value={mpn || "N/A"}
                readOnly
                className="bg-gray-50 cursor-default"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">SKU</label>
              <Input
                type="text"
                value={sku || "N/A"}
                readOnly
                className="bg-gray-50 cursor-default"
              />
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium">Total Weight (kg)</label>
            <Input
              type="number"
              value={totalWeightKg}
              onChange={(e) => setTotalWeightKg(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
            
              
            />
          </div>
          
          <Button 
            onClick={handleMarkPacked}
            disabled={loading || !totalWeightKg || Number(totalWeightKg) <= 0}
            className="w-full"
          >
            {loading ? "Processing..." : "Mark as Packed"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}