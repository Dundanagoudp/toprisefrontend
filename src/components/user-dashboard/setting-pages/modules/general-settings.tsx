"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2, Edit, Mail, Calendar } from "lucide-react"
import { getAppSettings, updateAppSettings } from "@/service/deliverychargeServices"
import type { AppSettings } from "@/types/deliverycharge-Types"
import { useToast } from "@/components/ui/toast"
import { SmtpUpdateModal } from "./popups/smtp-update-modal"
import { PolicyUpdateModal } from "./popups/policy-update-modal"
import { DeliveryChargeUpdateModal } from "./popups/delivery-charge-update-modal"

export function GeneralSettings() {
  const { showToast } = useToast()
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSmtpModalOpen, setIsSmtpModalOpen] = useState(false)
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false)
  const [isDeliveryChargeModalOpen, setIsDeliveryChargeModalOpen] = useState(false)
  const fetchSettings = async () => {
    setLoading(true)
    try {
      const response = await getAppSettings()
      setSettings(response.data)
    } catch (error) {
      console.error("Error fetching settings:", error)
      showToast("Failed to load settings. Please refresh the page.", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleSmtpUpdate = async (smtpData: Partial<AppSettings["smtp"]>) => {
    try {
      const response = await updateAppSettings({ smtp: smtpData })
      if (response?.data) {
        setSettings(response.data)
        showToast("SMTP settings updated successfully!", "success")
        setIsSmtpModalOpen(false)
      }
    } catch (error) {
      console.error("Error updating SMTP settings:", error)
      showToast("Failed to update SMTP settings. Please try again.", "error")
    }
  }

  const handlePolicyUpdate = async (policyData: {
    lastStockCheck?: number
    returnPolicy?: number
  }) => {
    try {
      const response = await updateAppSettings(policyData)
      if (response?.data) {
        setSettings(response.data)
        showToast("Policy settings updated successfully!", "success")
        setIsPolicyModalOpen(false)
      }
    } catch (error) {
      console.error("Error updating policy settings:", error)
      showToast("Failed to update policy settings. Please try again.", "error")
    }
  }

  const handleDeliveryChargeUpdate = async (deliveryData: {
    deliveryCharge?: number
    minimumOrderValue?: number
  }) => {
    const response = await updateAppSettings(deliveryData)
    if (response?.data) {
      setSettings(response.data)
      showToast("Delivery settings updated successfully!", "success")
      setIsDeliveryChargeModalOpen(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-[#c72920]" />
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No settings data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">General Settings</h2>
          <p className="text-gray-600">Manage application-wide settings and configurations</p>
        </div>
      </div>

      {/* SMTP Settings Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            SMTP Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>From Name</TableHead>
                  <TableHead>From Email</TableHead>
                  <TableHead>Host</TableHead>
                  <TableHead>Port</TableHead>
                  <TableHead>Secure</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">
                    {settings.smtp?.fromName || "-"}
                  </TableCell>
                  <TableCell>{settings.smtp?.fromEmail || "-"}</TableCell>
                  <TableCell>{settings.smtp?.host || "-"}</TableCell>
                  <TableCell>{settings.smtp?.port || "-"}</TableCell>
                  <TableCell>
                    {settings.smtp?.secure ? (
                      <span className="text-green-600 font-medium">Yes</span>
                    ) : (
                      <span className="text-gray-500">No</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsSmtpModalOpen(true)}
                      className="h-8 w-8 p-0"
                      title="Edit SMTP Settings"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Policy Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Policy Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-700">Last Stock Check</p>
              <p className="text-lg font-semibold text-gray-900">
                {settings.lastStockCheck || 0} days
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-700">Return Policy</p>
              <p className="text-lg font-semibold text-gray-900">
                {settings.returnPolicy || 0} days
              </p>
            </div>
          </div>
          <div className="mt-4">
            <Button
              variant="outline"
              onClick={() => setIsPolicyModalOpen(true)}
              className="border-[#C72920] text-[#C72920] hover:bg-[#C72920] hover:text-white"
            >
              <Edit className="w-4 h-4 mr-2" />
              Update Policy Settings
            </Button>
          </div>
        </CardContent>
      </Card>
{/* Delivery Charge Settings */}
<Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Delivery Charge Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-700">Delivery Charge</p>
              <p className="text-lg font-semibold text-gray-900">
                {settings.deliveryCharge || 0}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-700">Minimum Order Value</p>
              <p className="text-lg font-semibold text-gray-900">
                {settings.minimumOrderValue || 0}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeliveryChargeModalOpen(true)}
              className="border-[#C72920] text-[#C72920] hover:bg-[#C72920] hover:text-white"
            >
              <Edit className="w-4 h-4 mr-2" />
              Update Delivery Charge Settings
            </Button>
          </div>
        </CardContent>
      </Card>
      {/* SMTP Update Modal */}
      <Dialog open={isSmtpModalOpen} onOpenChange={setIsSmtpModalOpen}>
        <DialogContent className="max-w-2xl" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Update SMTP Settings</DialogTitle>
          </DialogHeader>
          <SmtpUpdateModal
            settings={settings}
            onSubmit={handleSmtpUpdate}
            onCancel={() => setIsSmtpModalOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Policy Update Modal */}
      <Dialog open={isPolicyModalOpen} onOpenChange={setIsPolicyModalOpen}>
        <DialogContent className="max-w-lg" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Update Policy Settings</DialogTitle>
          </DialogHeader>
          <PolicyUpdateModal
            settings={settings}
            onSubmit={handlePolicyUpdate}
            onCancel={() => setIsPolicyModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
      {/* Delivery Charge Update Modal */}
      <Dialog open={isDeliveryChargeModalOpen} onOpenChange={setIsDeliveryChargeModalOpen}>
        <DialogContent className="max-w-lg" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Update Delivery Charge Settings</DialogTitle>
          </DialogHeader>
          <DeliveryChargeUpdateModal
            settings={settings}
            onSubmit={handleDeliveryChargeUpdate}
            onCancel={() => setIsDeliveryChargeModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

