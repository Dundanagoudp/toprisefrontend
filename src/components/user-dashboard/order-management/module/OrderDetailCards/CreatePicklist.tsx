import React, { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast as GlobalToast } from "@/components/ui/toast"
import { createPicklist } from "@/service/order-service"

interface CreatePicklistProps {
  open: boolean
  onClose: () => void
  orderId: string
  defaultDealerId?: string
  defaultSkuList?: Array<{ sku: string; quantity: number; barcode?: string }>
}

const CreatePicklist: React.FC<CreatePicklistProps> = ({ open, onClose, orderId, defaultDealerId = "", defaultSkuList = [] }) => {
  const { showToast } = GlobalToast();
  const [dealerId, setDealerId] = useState<string>(defaultDealerId)
  const [staffId, setStaffId] = useState<string>("")
  const [skuListJson, setSkuListJson] = useState<string>(JSON.stringify(defaultSkuList, null, 2))
  const [submitting, setSubmitting] = useState(false)

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
      const skuList = JSON.parse(skuListJson || "[]")
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
            <Label>SKU List (JSON)</Label>
            <Textarea rows={6} value={skuListJson} onChange={(e) => setSkuListJson(e.target.value)} />
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
