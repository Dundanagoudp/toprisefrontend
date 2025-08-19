"use client"
import React, { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DynamicButton } from "@/components/common/button"
import { useToast as GlobalToast } from "@/components/ui/toast"
import { assignPicklistToStaff } from "@/service/order-service"
import { getAssignedEmployeesForDealer } from "@/service/dealerServices"
import { getDealerPickList } from "@/service/dealerOrder-services"
import { DealerPickList } from "@/types/dealerOrder-types"

interface AssignPicklistForDealerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  orderId?: string
  dealerId?: string
}

const AssignPicklistForDealerModal: React.FC<AssignPicklistForDealerModalProps> = ({ open, onOpenChange, orderId = "", dealerId = "" }) => {
  const { showToast } = GlobalToast()
  const [assignedEmployees, setAssignedEmployees] = useState<Array<{ id: string; name: string }>>([])
  const [availablePicklists, setAvailablePicklists] = useState<DealerPickList[]>([])
  const [loadingAssignPicklists, setLoadingAssignPicklists] = useState(false)
  const [staffId, setStaffId] = useState("")
  const [picklistId, setPicklistId] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    const load = async () => {
      try {
        setLoadingAssignPicklists(true)
        if (dealerId) {
          const res = await getAssignedEmployeesForDealer(dealerId)
          const list = (((res?.data as any)?.assignedEmployees) || []) as Array<any>
          const mapped = list
            .filter((e) => (e.role || "").toLowerCase() === "fulfillment-staff")
            .map((e) => ({ id: e.employeeId, name: e.name || e.employeeId_code || e.employeeId }))
          setAssignedEmployees(mapped)
          const data = await getDealerPickList(dealerId)
          const filtered = (data || []).filter((pl) => String(pl.linkedOrderId) === String(orderId))
          setAvailablePicklists(filtered)
        } else {
          setAssignedEmployees([])
          setAvailablePicklists([])
        }
      } catch {
        setAssignedEmployees([])
        setAvailablePicklists([])
      } finally {
        setLoadingAssignPicklists(false)
      }
    }
    load()
  }, [open, dealerId, orderId])

  const onAssign = async () => {
    try {
      setLoading(true)
      await assignPicklistToStaff({ picklistId: picklistId, staffId })
      showToast("Picklist assigned", "success")
      onOpenChange(false)
    } catch (e) {
      showToast("Failed to assign picklist", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Assign Picklist to Staff</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Picklist</Label>
            <Select value={picklistId} onValueChange={setPicklistId}>
              <SelectTrigger className="min-w-[260px]">
                <SelectValue placeholder={loadingAssignPicklists ? "Loading..." : (availablePicklists.length ? "Select picklist" : "No picklists for this order") } />
              </SelectTrigger>
              <SelectContent>
                {availablePicklists.map((pl) => (
                  <SelectItem key={pl._id} value={pl._id}>
                    {pl._id} • {pl.skuList?.length ?? 0} SKUs
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Fulfilment Staff</Label>
            <Select value={staffId} onValueChange={setStaffId}>
              <SelectTrigger className="min-w-[220px]">
                <SelectValue placeholder={assignedEmployees.length ? "Select staff" : "No assigned staff"} />
              </SelectTrigger>
              <SelectContent>
                {assignedEmployees.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DynamicButton onClick={onAssign} disabled={loading}>
            {loading ? "Assigning..." : "Assign"}
          </DynamicButton>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AssignPicklistForDealerModal

