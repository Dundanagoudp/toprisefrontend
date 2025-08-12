"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

export function DeliveryChargeSettings() {
  return (
    <div className="flex flex-col gap-6">
      <h2 className="h5 font-bold">Delivery Charge</h2>
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="enable-delivery-charge">Enable Delivery Charge</Label>
            <Switch id="enable-delivery-charge" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="default-charge">Default Delivery Charge Amount</Label>
            <Input id="default-charge" type="number" placeholder="e.g., 5.00" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="min-order-for-free">Minimum Order Value for Free Delivery</Label>
            <Input id="min-order-for-free" type="number" placeholder="e.g., 50.00" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Zone-Based Delivery</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="enable-zone-delivery">Enable Zone-Based Delivery</Label>
            <Switch id="enable-zone-delivery" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="zone-1-charge">Zone 1 Delivery Charge</Label>
            <Input id="zone-1-charge" type="number" placeholder="e.g., 3.00" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="zone-2-charge">Zone 2 Delivery Charge</Label>
            <Input id="zone-2-charge" type="number" placeholder="e.g., 7.50" />
          </div>
          {/* You can add more zones here */}
        </CardContent>
      </Card>

      <Button className="bg-[var(--new-300)] hover:bg-[var(--new-400)] text-white self-end">Save Changes</Button>
    </div>
  )
}
