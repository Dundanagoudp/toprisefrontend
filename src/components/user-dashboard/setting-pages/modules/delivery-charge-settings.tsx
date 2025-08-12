"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Edit } from "lucide-react"
import { getAppSettings } from "@/service/deliverychargeServices"
import { DeliveryChargeEditModal } from "@/components/user-dashboard/setting-pages/modules/popups/delivery-charge-edit-modal"
import type { AppSettings } from "@/types/deliverycharge-Types"

export function DeliveryChargeSettings() {
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchSettings = async () => {
    setLoading(true)
    const response = await getAppSettings()
    setSettings(response.data)
    setLoading(false)
  }

  const handleSettingsUpdate = (updatedSettings: AppSettings) => {
    setSettings(updatedSettings)
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

  return (
    <div className="p-6">
      <Card className="max-w-2xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <input type="checkbox" className="w-4 h-4 text-[#c72920]" defaultChecked />
              <div className="grid grid-cols-3 gap-8 flex-1">
                <div>
                  <div className="text-sm text-gray-600">Delivery Charge</div>
                  <div className="font-medium">₹{settings?.deliveryCharge || 0}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Min Order Value</div>
                  <div className="font-medium">₹{settings?.minimumOrderValue || 0}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Status</div>
                  <div className="font-medium text-green-600">Active</div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => setIsModalOpen(true)} className="h-8 w-8 p-0">
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-8">
            <div>
              <div className="text-sm text-gray-600">SMTP Host</div>
              <div className="font-medium">{settings?.smtp?.host || "Not configured"}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">SMTP Port</div>
              <div className="font-medium">{settings?.smtp?.port || "Not set"}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Email From</div>
              <div className="font-medium">{settings?.smtp?.fromEmail || "Not set"}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <DeliveryChargeEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        settings={settings}
        onUpdate={handleSettingsUpdate}
      />
    </div>
  )
}
