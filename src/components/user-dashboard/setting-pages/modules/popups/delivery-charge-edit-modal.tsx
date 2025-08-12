"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { updateAppSettings } from "@/service/deliverychargeServices"
import type { AppSettings } from "@/types/deliverycharge-Types"

interface DeliveryChargeEditModalProps {
  isOpen: boolean
  onClose: () => void
  settings: AppSettings | null
  onUpdate: (settings: AppSettings) => void
}

export function DeliveryChargeEditModal({ isOpen, onClose, settings, onUpdate }: DeliveryChargeEditModalProps) {
  const [formData, setFormData] = useState({
    deliveryCharge: "",
    minimumOrderValue: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (settings) {
      setFormData({
        deliveryCharge: settings.deliveryCharge?.toString() || "",
        minimumOrderValue: settings.minimumOrderValue?.toString() || "",
      })
    }
  }, [settings])

  const handleSave = async () => {
    if (!settings) return

    setIsLoading(true)
    const updatedSettings = {
      ...settings,
      deliveryCharge: Number.parseFloat(formData.deliveryCharge) || 0,
      minimumOrderValue: Number.parseFloat(formData.minimumOrderValue) || 0,
    }

    const response = await updateAppSettings(updatedSettings)
    if (response?.data) {
      onUpdate(response.data)
      onClose()
    }
    setIsLoading(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-6 rounded-lg shadow-lg">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="text-2xl font-bold">Edit Delivery Settings</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="delivery-charge" className="text-base font-medium">
              Delivery Charge
            </Label>
            <Input
              id="delivery-charge"
              type="number"
              placeholder="Enter delivery charge"
              value={formData.deliveryCharge}
              onChange={(e) => setFormData((prev) => ({ ...prev, deliveryCharge: e.target.value }))}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="minimum-order" className="text-base font-medium">
              Minimum Order Value
            </Label>
            <Input
              id="minimum-order"
              type="number"
              placeholder="Enter minimum order value"
              value={formData.minimumOrderValue}
              onChange={(e) => setFormData((prev) => ({ ...prev, minimumOrderValue: e.target.value }))}
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-[var(--new-300)] hover:bg-[var(--new-400)] text-white py-2 text-lg font-semibold"
          onClick={handleSave}
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
