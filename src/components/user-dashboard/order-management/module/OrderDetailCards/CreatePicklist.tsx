import React, { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useToast as GlobalToast } from "@/components/ui/toast"
import { createPicklist } from "@/service/order-service"

interface CreatePicklistProps {
  open: boolean
  onClose: () => void
  orderId: string
  defaultDealerId?: string
  defaultSkuList?: Array<{ sku: string; quantity: number; barcode?: string }>
}

type SkuRow = { sku: string; quantity: number; barcode?: string }

const CreatePicklist: React.FC<CreatePicklistProps> = ({ open, onClose, orderId, defaultDealerId = "", defaultSkuList = [] }) => {
  const { showToast } = GlobalToast();
  const [dealerId, setDealerId] = useState<string>(defaultDealerId)
  const [staffId, setStaffId] = useState<string>("")
  const [skuRows, setSkuRows] = useState<SkuRow[]>(defaultSkuList.length > 0 ? defaultSkuList : [{ sku: "", quantity: 1 }])
  const [barcodeVisible, setBarcodeVisible] = useState<Record<number, boolean>>({})
  const [submitting, setSubmitting] = useState(false)

  // Keep local state in sync when dialog opens with new defaults
  useEffect(() => {
    if (open) {
      setDealerId(defaultDealerId || "")
      setSkuRows(defaultSkuList.length > 0 ? defaultSkuList : [{ sku: "", quantity: 1 }])
      setBarcodeVisible({})
    }
  }, [open, defaultDealerId, defaultSkuList])

  const updateRow = (index: number, field: keyof SkuRow, value: string) => {
    setSkuRows((prev) => {
      const next = [...prev]
      if (field === "quantity") {
        const parsed = parseInt(value || "0", 10)
        next[index].quantity = isNaN(parsed) || parsed <= 0 ? 1 : parsed
      } else {
        next[index][field] = value
      }
      return next
    })
  }

  const addRow = () => setSkuRows((prev) => [...prev, { sku: "", quantity: 1 }])
  const removeRow = (index: number) => {
    setSkuRows((prev) => prev.filter((_, i) => i !== index))
    setBarcodeVisible((prev) => {
      const next = { ...prev }
      delete next[index]
      return next
    })
  }
  const toggleBarcode = (index: number) => setBarcodeVisible((prev) => ({ ...prev, [index]: !prev[index] }))

  const handleCreate = async () => {
    try {
      setSubmitting(true)
      if (!orderId) {
        showToast("Missing orderId", "error")
        return
      }
      if (!dealerId) {
        showToast("Enter Dealer ID", "error")
        return
      }
      if (!staffId) {
        showToast("Enter Fulfilment Staff ID", "error")
        return
      }
      const skuList = skuRows
        .map((r) => ({ sku: (r.sku || "").trim(), quantity: r.quantity || 1, barcode: (r.barcode || "").trim() }))
        .filter((r) => r.sku)
      if (skuList.length === 0) {
        showToast("Add at least one SKU", "error")
        return
      }
      await createPicklist({ orderId, dealerId, fulfilmentStaff: staffId, skuList })
      showToast("Picklist created", "success")
      onClose()
    } catch (e) {
      showToast("Failed to create picklist", "error")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Picklist</DialogTitle>
        </DialogHeader>
        <div className="py-2 space-y-3">
          <div>
            <Label>Order ID</Label>
            <Input readOnly value={orderId} />
          </div>
          <div>
            <Label>Dealer ID</Label>
            <Input value={dealerId} onChange={(e) => setDealerId(e.target.value)} />
          </div>
          <div>
            <Label>Fulfilment Staff ID</Label>
            <Input value={staffId} onChange={(e) => setStaffId(e.target.value)} />
          </div>
          <div>
            <Label>SKUs</Label>
            <div className="space-y-2">
              {skuRows.map((row, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-6">
                    <Input
                      placeholder="SKU code"
                      value={row.sku}
                      onChange={(e) => updateRow(idx, "sku", e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      min={1}
                      placeholder="Qty"
                      value={String(row.quantity)}
                      onChange={(e) => updateRow(idx, "quantity", e.target.value)}
                    />
                  </div>
                  <div className="col-span-3">
                    {barcodeVisible[idx] || (row.barcode && row.barcode.length > 0) ? (
                      <Input
                        placeholder="Barcode (optional)"
                        value={row.barcode || ""}
                        onChange={(e) => updateRow(idx, "barcode", e.target.value)}
                      />
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => toggleBarcode(idx)}>Add barcode</Button>
                    )}
                  </div>
                  <div className="col-span-1 flex justify-end">
                    {skuRows.length > 1 && (
                      <Button variant="outline" size="sm" onClick={() => removeRow(idx)}>Remove</Button>
                    )}
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addRow}>Add SKU</Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button className="bg-[#C72920] text-white ml-2" onClick={handleCreate} disabled={submitting}>{submitting ? 'Creating...' : 'Create'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CreatePicklist
