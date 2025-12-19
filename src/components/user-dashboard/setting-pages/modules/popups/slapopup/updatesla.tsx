"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { SlaType } from "@/service/slaViolations-Service"

interface UpdateSlaModalProps {
  slaType: SlaType
  onSubmit: (id: string, data: Partial<Omit<SlaType, "_id" | "created_at" | "updated_at" | "__v">>) => Promise<void>
  onCancel: () => void
}

export function UpdateSlaModal({ slaType, onSubmit, onCancel }: UpdateSlaModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    expected_hours: "",
  })
  const [errors, setErrors] = useState({
    name: "",
    description: "",
    expected_hours: "",
  })

  useEffect(() => {
    if (slaType) {
      setFormData({
        name: slaType.name || "",
        description: slaType.description || "",
        expected_hours: slaType.expected_hours?.toString() || "",
      })
    }
  }, [slaType])

  const validateForm = () => {
    const newErrors = {
      name: "",
      description: "",
      expected_hours: "",
    }
    let isValid = true

    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
      isValid = false
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required"
      isValid = false
    }

    if (!formData.expected_hours || Number(formData.expected_hours) <= 0) {
      newErrors.expected_hours = "Expected minutes must be greater than 0"
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
      await onSubmit(slaType._id!, {
        name: formData.name.trim(),
        description: formData.description.trim(),
        expected_hours: Number(formData.expected_hours),
      })
    } catch (error) {
      console.error("Error updating SLA type:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">
          Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          placeholder="Enter SLA type name"
          disabled={loading}
          className={errors.name ? "border-red-500" : ""}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">
          Description <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Enter SLA type description"
          disabled={loading}
          rows={3}
          className={errors.description ? "border-red-500" : ""}
        />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="expected_hours">
          Expected Minutes <span className="text-red-500">*</span>
        </Label>
        <Input
          id="expected_hours"
          type="number"
          min="1"
          step="1"
          value={formData.expected_hours}
          onChange={(e) => handleChange("expected_hours", e.target.value)}
          placeholder="Enter expected minutes"
          disabled={loading}
          className={errors.expected_hours ? "border-red-500" : ""}
        />
        {errors.expected_hours && (
          <p className="text-sm text-red-500">{errors.expected_hours}</p>
        )}
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
            "Update SLA Type"
          )}
        </Button>
      </div>
    </form>
  )
}

