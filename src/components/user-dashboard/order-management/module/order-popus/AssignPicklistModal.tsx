"use client"
import React, { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { DynamicButton } from "@/components/common/button"
import { useToast as GlobalToast } from "@/components/ui/toast"
import { assignPicklistToStaff } from "@/service/order-service"

interface AssignPicklistModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const AssignPicklistModal: React.FC<AssignPicklistModalProps> = ({ open, onOpenChange }) => {
  const { showToast } = GlobalToast()
  const [picklistId, setPicklistId] = useState("")
  const [staffId, setStaffId] = useState("")
  const [loading, setLoading] = useState(false)

  const onAssign = async () => {
    try {
      setLoading(true)
      await assignPicklistToStaff({ picklistId, staffId })
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
            <Label>Picklist ID</Label>
            <Input value={picklistId} onChange={(e) => setPicklistId(e.target.value)} placeholder="picklistId" />
          </div>
          <div>
            <Label>Staff ID</Label>
            <Input value={staffId} onChange={(e) => setStaffId(e.target.value)} />
          </div>
          <DynamicButton onClick={onAssign} disabled={loading}>
            {loading ? "Assigning..." : "Assign"}
          </DynamicButton>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AssignPicklistModal

