"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { updateAppSettings } from "@/service/deliverychargeServices"
import type { AppSettings } from "@/types/deliverycharge-Types"
import { Settings, Mail, Phone, FileText } from "lucide-react"
import { useToast } from "@/components/ui/toast"

interface DeliveryChargeEditModalProps {
  isOpen: boolean
  onClose: () => void
  settings: AppSettings | null
  onUpdate: (settings: AppSettings) => void
  editingSection: string | null
}

export function DeliveryChargeEditModal({ isOpen, onClose, settings, onUpdate, editingSection }: DeliveryChargeEditModalProps) {
  const { showToast } = useToast()
  const [formData, setFormData] = useState({
    deliveryCharge: "",
    minimumOrderValue: "",
    smtp: {
      fromName: "",
      fromEmail: "",
      host: "",
      port: "",
      secure: false,
      auth: {
        user: "",
        pass: ""
      }
    },
    versioning: {
      web: "",
      android: "",
      ios: ""
    },
    supportEmail: "",
    supportPhone: "",
    tnc: "",
    privacyPolicy: ""
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (settings) {
      setFormData({
        deliveryCharge: settings.deliveryCharge?.toString() || "",
        minimumOrderValue: settings.minimumOrderValue?.toString() || "",
        smtp: {
          fromName: settings.smtp?.fromName || "",
          fromEmail: settings.smtp?.fromEmail || "",
          host: settings.smtp?.host || "",
          port: settings.smtp?.port?.toString() || "",
          secure: settings.smtp?.secure || false,
          auth: {
            user: settings.smtp?.auth?.user || "",
            pass: settings.smtp?.auth?.pass || ""
          }
        },
        versioning: {
          web: settings.versioning?.web || "",
          android: settings.versioning?.android || "",
          ios: settings.versioning?.ios || ""
        },
        supportEmail: settings.supportEmail || "",
        supportPhone: settings.supportPhone || "",
        tnc: settings.tnc || "",
        privacyPolicy: settings.privacyPolicy || ""
      })
    }
  }, [settings])

  const handleSave = async () => {
    if (!settings || !editingSection) return

    setIsLoading(true)
    try {
      let payload: any = {}
      
      // Build payload based on which section is being edited
      switch (editingSection) {
        case 'delivery':
          payload = {
            deliveryCharge: Number.parseFloat(formData.deliveryCharge) || 0,
            minimumOrderValue: Number.parseFloat(formData.minimumOrderValue) || 0
          }
          break
          
        case 'smtp':
          payload = {
            smtp: {
              fromName: formData.smtp.fromName,
              fromEmail: formData.smtp.fromEmail,
              host: formData.smtp.host,
              port: Number.parseInt(formData.smtp.port) || 587,
              secure: formData.smtp.secure,
              auth: {
                user: formData.smtp.auth.user,
                pass: formData.smtp.auth.pass
              }
            }
          }
          break
          
        case 'versioning':
          payload = {
            versioning: {
              web: formData.versioning.web,
              android: formData.versioning.android,
              ios: formData.versioning.ios
            }
          }
          break
          
        case 'support':
          payload = {
            supportEmail: formData.supportEmail,
            supportPhone: formData.supportPhone
          }
          break
          
        case 'legal':
          payload = {
            tnc: formData.tnc,
            privacyPolicy: formData.privacyPolicy
          }
          break
          
        default:
          showToast("Invalid section", "error")
          return
      }

      console.log(`Updating ${editingSection} with payload:`, payload)
      
      const response = await updateAppSettings(payload)
      if (response?.data) {
        onUpdate(response.data)
        showToast(`${getSectionName(editingSection)} updated successfully!`, "success")
        onClose()
      } else {
        showToast("Failed to update settings. Please try again.", "error")
      }
    } catch (error: any) {
      console.error("Error updating settings:", error)
      const errorMessage = error?.response?.data?.message || 
                          error?.response?.data?.error || 
                          error?.message || 
                          "An error occurred while updating settings. Please try again."
      showToast(errorMessage, "error")
    } finally {
      setIsLoading(false)
    }
  }

  const getSectionName = (section: string | null): string => {
    switch (section) {
      case 'delivery': return 'Delivery Settings'
      case 'smtp': return 'SMTP Configuration'
      case 'versioning': return 'App Versioning'
      case 'support': return 'Support Information'
      case 'legal': return 'Legal Links'
      default: return 'Settings'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto p-4 md:p-6 rounded-lg shadow-lg">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-3 md:pb-4">
          <DialogTitle className="text-xl md:text-2xl font-bold">Edit Application Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Delivery Settings Section */}
          {editingSection === 'delivery' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Settings className="h-5 w-5" />
              Delivery Settings
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="delivery-charge">Delivery Charge</Label>
                <Input
                  id="delivery-charge"
                  type="number"
                  placeholder="Enter delivery charge"
                  value={formData.deliveryCharge}
                  onChange={(e) => setFormData((prev) => ({ ...prev, deliveryCharge: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="minimum-order">Minimum Order Value</Label>
                <Input
                  id="minimum-order"
                  type="number"
                  placeholder="Enter minimum order value"
                  value={formData.minimumOrderValue}
                  onChange={(e) => setFormData((prev) => ({ ...prev, minimumOrderValue: e.target.value }))}
                />
              </div>
            </div>
          </div>
          )}

          {/* SMTP Settings Section */}
          {editingSection === 'smtp' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Mail className="h-5 w-5" />
              SMTP Configuration
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="smtp-host">SMTP Host</Label>
                <Input
                  id="smtp-host"
                  placeholder="smtp.gmail.com"
                  value={formData.smtp.host}
                  onChange={(e) => setFormData((prev) => ({ 
                    ...prev, 
                    smtp: { ...prev.smtp, host: e.target.value } 
                  }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="smtp-port">SMTP Port</Label>
                <Input
                  id="smtp-port"
                  type="number"
                  placeholder="587"
                  value={formData.smtp.port}
                  onChange={(e) => setFormData((prev) => ({ 
                    ...prev, 
                    smtp: { ...prev.smtp, port: e.target.value } 
                  }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="smtp-from-name">From Name</Label>
                <Input
                  id="smtp-from-name"
                  placeholder="Your Company Name"
                  value={formData.smtp.fromName}
                  onChange={(e) => setFormData((prev) => ({ 
                    ...prev, 
                    smtp: { ...prev.smtp, fromName: e.target.value } 
                  }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="smtp-from-email">From Email</Label>
                <Input
                  id="smtp-from-email"
                  type="email"
                  placeholder="noreply@yourdomain.com"
                  value={formData.smtp.fromEmail}
                  onChange={(e) => setFormData((prev) => ({ 
                    ...prev, 
                    smtp: { ...prev.smtp, fromEmail: e.target.value } 
                  }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="smtp-auth-user">Auth User</Label>
                <Input
                  id="smtp-auth-user"
                  placeholder="your-email@gmail.com"
                  value={formData.smtp.auth.user}
                  onChange={(e) => setFormData((prev) => ({ 
                    ...prev, 
                    smtp: { 
                      ...prev.smtp, 
                      auth: { ...prev.smtp.auth, user: e.target.value } 
                    } 
                  }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="smtp-auth-pass">Auth Password</Label>
                <Input
                  id="smtp-auth-pass"
                  type="password"
                  placeholder="App password"
                  value={formData.smtp.auth.pass}
                  onChange={(e) => setFormData((prev) => ({ 
                    ...prev, 
                    smtp: { 
                      ...prev.smtp, 
                      auth: { ...prev.smtp.auth, pass: e.target.value } 
                    } 
                  }))}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="smtp-secure"
                checked={formData.smtp.secure}
                onCheckedChange={(checked) => setFormData((prev) => ({ 
                  ...prev, 
                  smtp: { ...prev.smtp, secure: checked } 
                }))}
              />
              <Label htmlFor="smtp-secure">Secure Connection</Label>
            </div>
          </div>
          )}

          {/* Versioning Section */}
          {editingSection === 'versioning' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Settings className="h-5 w-5" />
              App Versioning
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="web-version">Web Version</Label>
                <Input
                  id="web-version"
                  placeholder="1.0.0"
                  value={formData.versioning.web}
                  onChange={(e) => setFormData((prev) => ({ 
                    ...prev, 
                    versioning: { ...prev.versioning, web: e.target.value } 
                  }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="android-version">Android Version</Label>
                <Input
                  id="android-version"
                  placeholder="1.1.0"
                  value={formData.versioning.android}
                  onChange={(e) => setFormData((prev) => ({ 
                    ...prev, 
                    versioning: { ...prev.versioning, android: e.target.value } 
                  }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ios-version">iOS Version</Label>
                <Input
                  id="ios-version"
                  placeholder="1.0.1"
                  value={formData.versioning.ios}
                  onChange={(e) => setFormData((prev) => ({ 
                    ...prev, 
                    versioning: { ...prev.versioning, ios: e.target.value } 
                  }))}
                />
              </div>
            </div>
          </div>
          )}

          {/* Support Information Section */}
          {editingSection === 'support' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Phone className="h-5 w-5" />
              Support Information
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="support-email">Support Email</Label>
                <Input
                  id="support-email"
                  type="email"
                  placeholder="support@yourdomain.com"
                  value={formData.supportEmail}
                  onChange={(e) => setFormData((prev) => ({ ...prev, supportEmail: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="support-phone">Support Phone</Label>
                <Input
                  id="support-phone"
                  placeholder="+919876543210"
                  value={formData.supportPhone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, supportPhone: e.target.value }))}
                />
              </div>
            </div>
          </div>
          )}

          {/* Legal Links Section */}
          {editingSection === 'legal' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <FileText className="h-5 w-5" />
              Legal Links
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="tnc">Terms & Conditions URL</Label>
                <Input
                  id="tnc"
                  type="url"
                  placeholder="https://yourdomain.com/terms"
                  value={formData.tnc}
                  onChange={(e) => setFormData((prev) => ({ ...prev, tnc: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="privacy-policy">Privacy Policy URL</Label>
                <Input
                  id="privacy-policy"
                  type="url"
                  placeholder="https://yourdomain.com/privacy"
                  value={formData.privacyPolicy}
                  onChange={(e) => setFormData((prev) => ({ ...prev, privacyPolicy: e.target.value }))}
                />
              </div>
            </div>
          </div>
          )}

        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="bg-[var(--new-300)] hover:bg-[var(--new-400)] text-white"
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
