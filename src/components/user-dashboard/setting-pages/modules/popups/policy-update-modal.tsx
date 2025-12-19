"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { AppSettings } from "@/types/deliverycharge-Types"

interface PolicyUpdateModalProps {
  settings: AppSettings | null
  onSubmit: (policyData: {
    lastStockCheck?: number
    returnPolicy?: number
  }) => Promise<void>
  onCancel: () => void
}

export function PolicyUpdateModal({
  settings,
  onSubmit,
  onCancel,
}: PolicyUpdateModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    lastStockCheck: "",
    returnPolicy: "",
  })
  const [errors, setErrors] = useState({
    lastStockCheck: "",
    returnPolicy: "",
  })

  useEffect(() => {
    if (settings) {
      setFormData({
        lastStockCheck: settings.lastStockCheck?.toString() || "",
        returnPolicy: settings.returnPolicy?.toString() || "",
      })
    }
  }, [settings])

  const validateForm = () => {
    const newErrors = {
      lastStockCheck: "",
      returnPolicy: "",
    }
    let isValid = true

    if (formData.lastStockCheck && Number(formData.lastStockCheck) < 0) {
      newErrors.lastStockCheck = "Last Stock Check must be 0 or greater"
      isValid = false
    }

    if (formData.returnPolicy && Number(formData.returnPolicy) < 0) {
      newErrors.returnPolicy = "Return Policy must be 0 or greater"
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
        lastStockCheck: formData.lastStockCheck
          ? Number(formData.lastStockCheck)
          : undefined,
        returnPolicy: formData.returnPolicy
          ? Number(formData.returnPolicy)
          : undefined,
      })
    } catch (error) {
      console.error("Error updating policy settings:", error)
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
        <Label htmlFor="lastStockCheck">
          Last Stock Check (days)
        </Label>
        <Input
          id="lastStockCheck"
          type="number"
          min="0"
          step="1"
          value={formData.lastStockCheck}
          onChange={(e) => handleChange("lastStockCheck", e.target.value)}
          placeholder="Enter days (e.g., 60)"
          disabled={loading}
          className={errors.lastStockCheck ? "border-red-500" : ""}
        />
        {errors.lastStockCheck && (
          <p className="text-sm text-red-500">{errors.lastStockCheck}</p>
        )}
        <p className="text-xs text-gray-500">
          Number of days for last stock check interval
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="returnPolicy">
          Return Policy (days)
        </Label>
        <Input
          id="returnPolicy"
          type="number"
          min="0"
          step="1"
          value={formData.returnPolicy}
          onChange={(e) => handleChange("returnPolicy", e.target.value)}
          placeholder="Enter days (e.g., 14)"
          disabled={loading}
          className={errors.returnPolicy ? "border-red-500" : ""}
        />
        {errors.returnPolicy && (
          <p className="text-sm text-red-500">{errors.returnPolicy}</p>
        )}
        <p className="text-xs text-gray-500">
          Number of days allowed for product returns
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
            "Update Policy Settings"
          )}
        </Button>
      </div>
    </form>
  )
}

