"use client"
import React, { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DynamicButton } from "@/components/common/button"
import { useToast as GlobalToast } from "@/components/ui/toast"
import { assignDealersToOrder } from "@/service/order-service"
import { getAllDealers } from "@/service/dealerServices"
import type { Dealer } from "@/types/dealer-types"

interface ProductItem {
  sku?: string
  dealerId: any
}

interface AssignDealersPerSkuModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  orderId?: string
  products?: ProductItem[] | null
}

const AssignDealersPerSkuModal: React.FC<AssignDealersPerSkuModalProps> = ({ open, onOpenChange, orderId = "", products = [] }) => {
  const { showToast } = GlobalToast()
  const [dealers, setDealers] = useState<Dealer[]>([])
  const [loadingDealers, setLoadingDealers] = useState(false)
  const [loading, setLoading] = useState(false)
  const [assignments, setAssignments] = useState<Array<{ sku: string; dealerId: string }>>([])

  const isPlaceholderString = (value: string) => {
    const v = (value || "").trim().toLowerCase()
    return v === "n/a" || v === "na" || v === "null" || v === "undefined" || v === "-"
  }

  const safeDealerId = (dealer: any): string => {
    if (dealer == null) return ""
    if (typeof dealer === "string") return isPlaceholderString(dealer) ? "" : dealer
    if (typeof dealer === "number") return Number.isFinite(dealer) ? String(dealer) : ""
    const id = dealer._id || dealer.id
    if (typeof id === "string" && isPlaceholderString(id)) return ""
    return id ? String(id) : ""
  }

  const initializeAssignments = () => {
    const initial = (products || []).map((p) => ({ sku: p?.sku || "", dealerId: safeDealerId(p?.dealerId) }))
    setAssignments(initial)
  }

  useEffect(() => {
    if (!open) return
    initializeAssignments()
    const loadDealers = async () => {
      try {
        setLoadingDealers(true)
        const res = await getAllDealers()
        setDealers(((res as any)?.data || []) as Dealer[])
      } catch {
        setDealers([])
      } finally {
        setLoadingDealers(false)
      }
    }
    loadDealers()
  }, [open])

  const onAssign = async () => {
    try {
      setLoading(true)
      const payload = {
        orderId,
        assignments: assignments.filter((a) => a.sku && a.dealerId),
      }
      await assignDealersToOrder(payload as any)
      showToast("Dealers assigned", "success")
      onOpenChange(false)
    } catch (e) {
      showToast("Failed to assign dealers", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Assign Dealers to SKUs</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-3">
            {(products || []).map((p, idx) => (
              <div key={`${p?.sku}-${idx}`} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-5">
                  <Label className="text-xs">SKU</Label>
                  <Input readOnly value={p?.sku || ""} />
                </div>
                <div className="col-span-7">
                  <Label className="text-xs">Dealer</Label>
                  <Select
                    value={assignments[idx]?.dealerId || ""}
                    onValueChange={(val) => {
                      setAssignments((prev) => {
                        const next = [...prev]
                        next[idx] = { sku: p?.sku || "", dealerId: val }
                        return next
                      })
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={loadingDealers ? "Loading dealers..." : "Select dealer"} />
                    </SelectTrigger>
                    <SelectContent>
                      {dealers.map((d) => (
                        <SelectItem key={(d as any)._id as any} value={(d as any)._id as string}>
                          {d.trade_name || d.legal_name} • {(d.user_id as any)?.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
          <DynamicButton onClick={onAssign} disabled={loading}>
            {loading ? "Saving..." : "Assign"}
          </DynamicButton>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AssignDealersPerSkuModal

