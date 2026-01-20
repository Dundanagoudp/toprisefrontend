"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { AppSettings } from "@/types/deliverycharge-Types"

interface DeliveryChargeUpdateModalProps {
  settings: AppSettings | null
  onSubmit: (deliveryData: {
    deliveryCharge?: number
    minimumOrderValue?: number
  }) => Promise<void>
  onCancel: () => void
}

export function DeliveryChargeUpdateModal({
  settings,
  onSubmit,
  onCancel,
}: DeliveryChargeUpdateModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    deliveryCharge: "",
    minimumOrderValue: "",
  })
  const [errors, setErrors] = useState({
    deliveryCharge: "",
    minimumOrderValue: "",
  })

  useEffect(() => {
    if (settings) {
      setFormData({
        deliveryCharge: settings.deliveryCharge?.toString() || "",
        minimumOrderValue: settings.minimumOrderValue?.toString() || "",
      })
    }
  }, [settings])

  const validateForm = () => {
    const newErrors = {
      deliveryCharge: "",
      minimumOrderValue: "",
    }
    let isValid = true

    if (formData.deliveryCharge && Number(formData.deliveryCharge) < 0) {
      newErrors.deliveryCharge = "Delivery charge must be 0 or greater"
      isValid = false
    }

    if (formData.minimumOrderValue && Number(formData.minimumOrderValue) < 0) {
      newErrors.minimumOrderValue = "Minimum order value must be 0 or greater"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      await onSubmit({
        deliveryCharge: formData.deliveryCharge
          ? Number(formData.deliveryCharge)
          : undefined,
        minimumOrderValue: formData.minimumOrderValue
          ? Number(formData.minimumOrderValue)
          : undefined,
      })
    } catch (error) {
      console.error("Error updating delivery charge settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="deliveryCharge">
          Delivery Charge
        </Label>
        <Input
          id="deliveryCharge"
          type="number"
          min="0"
          step="0.01"
          value={formData.deliveryCharge}
          onChange={(e) => handleChange("deliveryCharge", e.target.value)}
          placeholder="Enter delivery charge (e.g., 50.00)"
          disabled={loading}
          className={errors.deliveryCharge ? "border-red-500" : ""}
        />
        {errors.deliveryCharge && (
          <p className="text-sm text-red-500">{errors.deliveryCharge}</p>
        )}
        <p className="text-xs text-gray-500">
          Delivery charge amount in your currency
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="minimumOrderValue">
          Minimum Order Value
        </Label>
        <Input
          id="minimumOrderValue"
          type="number"
          min="0"
          step="0.01"
          value={formData.minimumOrderValue}
          onChange={(e) => handleChange("minimumOrderValue", e.target.value)}
          placeholder="Enter minimum order value (e.g., 500.00)"
          disabled={loading}
          className={errors.minimumOrderValue ? "border-red-500" : ""}
        />
        {errors.minimumOrderValue && (
          <p className="text-sm text-red-500">{errors.minimumOrderValue}</p>
        )}
        <p className="text-xs text-gray-500">
          Minimum order value required for delivery
        </p>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="bg-[#C72920] hover:bg-[#C72920]/90 text-white"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Updating...
            </div>
          ) : (
            "Update Delivery Settings"
          )}
        </Button>
      </div>
    </form>
  )
}
