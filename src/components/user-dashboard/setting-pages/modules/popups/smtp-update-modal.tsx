"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import type { AppSettings } from "@/types/deliverycharge-Types"

interface SmtpUpdateModalProps {
  settings: AppSettings | null
  onSubmit: (smtpData: Partial<AppSettings["smtp"]>) => Promise<void>
  onCancel: () => void
}

export function SmtpUpdateModal({
  settings,
  onSubmit,
  onCancel,
}: SmtpUpdateModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    fromName: "",
    fromEmail: "",
    host: "",
    port: "",
    secure: false,
    auth: {
      user: "",
      pass: "",
    },
  })
  const [errors, setErrors] = useState({
    fromName: "",
    fromEmail: "",
    host: "",
    port: "",
    user: "",
    pass: "",
  })

  useEffect(() => {
    if (settings?.smtp) {
      setFormData({
        fromName: settings.smtp.fromName || "",
        fromEmail: settings.smtp.fromEmail || "",
        host: settings.smtp.host || "",
        port: settings.smtp.port?.toString() || "",
        secure: settings.smtp.secure || false,
        auth: {
          user: settings.smtp.auth?.user || "",
          pass: settings.smtp.auth?.pass || "",
        },
      })
    }
  }, [settings])

  const validateForm = () => {
    const newErrors = {
      fromName: "",
      fromEmail: "",
      host: "",
      port: "",
      user: "",
      pass: "",
    }
    let isValid = true

    if (!formData.fromName.trim()) {
      newErrors.fromName = "From Name is required"
      isValid = false
    }

    if (!formData.fromEmail.trim()) {
      newErrors.fromEmail = "From Email is required"
      isValid = false
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.fromEmail)) {
      newErrors.fromEmail = "Invalid email format"
      isValid = false
    }

    if (!formData.host.trim()) {
      newErrors.host = "Host is required"
      isValid = false
    }

    if (!formData.port || Number(formData.port) <= 0) {
      newErrors.port = "Port must be greater than 0"
      isValid = false
    }

    if (!formData.auth.user.trim()) {
      newErrors.user = "SMTP User is required"
      isValid = false
    }

    if (!formData.auth.pass.trim()) {
      newErrors.pass = "SMTP Password is required"
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
        fromName: formData.fromName.trim(),
        fromEmail: formData.fromEmail.trim(),
        host: formData.host.trim(),
        port: Number(formData.port),
        secure: formData.secure,
        auth: {
          user: formData.auth.user.trim(),
          pass: formData.auth.pass.trim(),
        },
      })
    } catch (error) {
      console.error("Error updating SMTP settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string | boolean) => {
    if (field.startsWith("auth.")) {
      const authField = field.split(".")[1]
      setFormData((prev) => ({
        ...prev,
        auth: {
          ...prev.auth,
          [authField]: value,
        },
      }))
      if (errors[authField as keyof typeof errors]) {
        setErrors((prev) => ({ ...prev, [authField]: "" }))
      }
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }))
      if (errors[field as keyof typeof errors]) {
        setErrors((prev) => ({ ...prev, [field]: "" }))
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fromName">
            From Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="fromName"
            value={formData.fromName}
            onChange={(e) => handleChange("fromName", e.target.value)}
            placeholder="Toprise"
            disabled={loading}
            className={errors.fromName ? "border-red-500" : ""}
          />
          {errors.fromName && (
            <p className="text-sm text-red-500">{errors.fromName}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="fromEmail">
            From Email <span className="text-red-500">*</span>
          </Label>
          <Input
            id="fromEmail"
            type="email"
            value={formData.fromEmail}
            onChange={(e) => handleChange("fromEmail", e.target.value)}
            placeholder="mailer@example.com"
            disabled={loading}
            className={errors.fromEmail ? "border-red-500" : ""}
          />
          {errors.fromEmail && (
            <p className="text-sm text-red-500">{errors.fromEmail}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="host">
            Host <span className="text-red-500">*</span>
          </Label>
          <Input
            id="host"
            value={formData.host}
            onChange={(e) => handleChange("host", e.target.value)}
            placeholder="smtp-mail.outlook.com"
            disabled={loading}
            className={errors.host ? "border-red-500" : ""}
          />
          {errors.host && (
            <p className="text-sm text-red-500">{errors.host}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="port">
            Port <span className="text-red-500">*</span>
          </Label>
          <Input
            id="port"
            type="number"
            min="1"
            max="65535"
            value={formData.port}
            onChange={(e) => handleChange("port", e.target.value)}
            placeholder="587"
            disabled={loading}
            className={errors.port ? "border-red-500" : ""}
          />
          {errors.port && (
            <p className="text-sm text-red-500">{errors.port}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="secure"
            checked={formData.secure}
            onCheckedChange={(checked) =>
              handleChange("secure", checked as boolean)
            }
            disabled={loading}
          />
          <Label htmlFor="secure" className="cursor-pointer">
            Use Secure Connection (TLS/SSL)
          </Label>
        </div>
      </div>

      <div className="border-t pt-4 space-y-4">
        <h4 className="font-semibold text-sm">SMTP Authentication</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="authUser">
              SMTP User <span className="text-red-500">*</span>
            </Label>
            <Input
              id="authUser"
              type="email"
              value={formData.auth.user}
              onChange={(e) => handleChange("auth.user", e.target.value)}
              placeholder="mailer@example.com"
              disabled={loading}
              className={errors.user ? "border-red-500" : ""}
            />
            {errors.user && (
              <p className="text-sm text-red-500">{errors.user}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="authPass">
              SMTP Password <span className="text-red-500">*</span>
            </Label>
            <Input
              id="authPass"
              type="password"
              value={formData.auth.pass}
              onChange={(e) => handleChange("auth.pass", e.target.value)}
              placeholder="Enter password"
              disabled={loading}
              className={errors.pass ? "border-red-500" : ""}
            />
            {errors.pass && (
              <p className="text-sm text-red-500">{errors.pass}</p>
            )}
          </div>
        </div>
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
            "Update SMTP Settings"
          )}
        </Button>
      </div>
    </form>
  )
}

