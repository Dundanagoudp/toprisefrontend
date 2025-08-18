import React, { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useToast as GlobalToast } from "@/components/ui/toast"
import { createPicklist } from "@/service/order-service"
import { getAssignedEmployeesForDealer } from "@/service/dealerServices"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
  const [assignedEmployees, setAssignedEmployees] = useState<Array<{ id: string; name: string; email?: string; role?: string }>>([])
  const [loadingEmployees, setLoadingEmployees] = useState<boolean>(false)

  // Keep local state in sync when dialog opens with new defaults
  useEffect(() => {
    if (open) {
      setDealerId(defaultDealerId || "")
      setSkuRows(defaultSkuList.length > 0 ? defaultSkuList : [{ sku: "", quantity: 1 }])
      setBarcodeVisible({})
    }
  }, [open, defaultDealerId, defaultSkuList])

  // Load assigned employees for dealer when dealerId becomes available
  useEffect(() => {
    const fetchEmployees = async () => {
      if (!dealerId) {
        setAssignedEmployees([])
        return
      }
      try {
        setLoadingEmployees(true)
        const res = await getAssignedEmployeesForDealer(dealerId)
        const list = (((res?.data as any)?.assignedEmployees) || []) as Array<any>
        const onlyFulfilment = list.filter((e) => (e.role || "").toLowerCase() === "fulfillment-staff")
        const mapped = onlyFulfilment.map((e) => ({ id: e.employeeId, name: e.name || e.employeeId_code || e.employeeId, email: e.email, role: e.role }))
        setAssignedEmployees(mapped)
        // If current staffId is not in list, clear it
        if (!mapped.some((m) => m.id === staffId)) {
          setStaffId("")
        }
      } catch (err) {
        setAssignedEmployees([])
      } finally {
        setLoadingEmployees(false)
      }
    }
    fetchEmployees()
  }, [dealerId])

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
        showToast("Select a Fulfilment Staff", "error")
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
          {/* Intentionally hiding Order ID and Dealer ID from UI while still using them internally */}
          <div>
            <Label>Fulfilment Staff</Label>
            <div className="flex items-center gap-2">
              <Select value={staffId} onValueChange={setStaffId}>
                <SelectTrigger className="min-w-[240px]">
                  <SelectValue placeholder={loadingEmployees ? "Loading..." : (assignedEmployees.length ? "Select staff" : "No assigned staff")} />
                </SelectTrigger>
                <SelectContent>
                  {assignedEmployees.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} {s.email ? `• ${s.email}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {loadingEmployees && <span className="text-xs text-gray-500">Loading...</span>}
            </div>
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
