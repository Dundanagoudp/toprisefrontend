"use client"
import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogOverlay } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { DynamicButton } from "@/components/common/button"
import { createPicklist } from "@/service/order-service"
import { PicklistSkuItem } from "@/types/order-Types"
import { useToast as GlobalToast } from "@/components/ui/toast"

interface CreatePickListProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  defaultDealerId?: string;
  defaultSkuList?: PicklistSkuItem[];
  dealerOptions?: string[];
  skusSource?: PicklistSkuItem[];
}

export default function CreatePickList({ isOpen, onClose, orderId, defaultDealerId = "", defaultSkuList = [], dealerOptions = [], skusSource = [] }: CreatePickListProps) {
  const { showToast } = GlobalToast();
  const [dealerId, setDealerId] = useState<string>(defaultDealerId);
  const [staffId, setStaffId] = useState<string>("")
  const [skuListJson, setSkuListJson] = useState<string>(
    JSON.stringify(
      (defaultSkuList || []).map(({ sku, quantity, barcode }) => ({
        sku,
        quantity,
        barcode: barcode || "",
      })),
      null,
      2
    )
  );
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async () => {
    try {
      setSubmitting(true);
      const skuList: PicklistSkuItem[] = JSON.parse(skuListJson || "[]");
      if (!orderId) {
        showToast("Missing orderId", "error");
        return;
      }
      if (!dealerId) {
        showToast("Enter Dealer ID", "error");
        return;
      }
      if (!staffId) {
        showToast("Enter Fulfilment Staff ID", "error");
        return;
      }
      await createPicklist({ orderId, dealerId, fulfilmentStaff: staffId, skuList });
      showToast("Picklist created", "success");
      onClose();
    } catch (err) {
      showToast("Failed to create picklist", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogOverlay />
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Create Pick List</DialogTitle>
          </DialogHeader>
          <Card>
            <CardTitle>Pick List Details</CardTitle>
            <CardContent className="space-y-3">
              <CardDescription>
                Provide details to create a new pick list. You can edit the prefilled SKU list.
              </CardDescription>
              {/* Hiding Order ID and Dealer ID fields from UI while still using state values for backend */}
              <div>
                <Label>Fulfilment Staff</Label>
                <Input value={staffId} onChange={(e) => setStaffId(e.target.value)} />
              </div>
              <div>
                <Label>SKU List (JSON)</Label>
                <Textarea rows={6} value={skuListJson} onChange={(e) => setSkuListJson(e.target.value)} />
              </div>
              <div className="flex justify-end">
                <DynamicButton onClick={handleCreate} disabled={submitting} className="bg-[#C72920] text-white">
                  {submitting ? 'Creating...' : 'Create Picklist'}
                </DynamicButton>
              </div>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    </div>
  )
}
