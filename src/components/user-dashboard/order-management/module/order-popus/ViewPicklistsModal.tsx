"use client"
import React, { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast as GlobalToast } from "@/components/ui/toast"
import { getDealerPickList } from "@/service/dealerOrder-services"
import { DealerPickList } from "@/types/dealerOrder-types"

interface ViewPicklistsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  dealerId?: string
  orderId?: string
}

const ViewPicklistsModal: React.FC<ViewPicklistsModalProps> = ({ open, onOpenChange, dealerId = "", orderId }) => {
  const { showToast } = GlobalToast()
  const [picklists, setPicklists] = useState<DealerPickList[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    const load = async () => {
      try {
        if (!dealerId) {
          setPicklists([])
          showToast("No dealer found for this order", "error")
          return
        }
        setLoading(true)
        const data = await getDealerPickList(dealerId)
        // If orderId is provided and API returns linkedOrderId, optionally filter
        const filtered = (orderId ? (data || []).filter((pl: any) => String(pl.linkedOrderId) === String(orderId)) : data) || []
        setPicklists(filtered)
      } catch (e) {
        setPicklists([])
        showToast("Failed to load picklists", "error")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [open, dealerId, orderId])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Dealer Picklists</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="p-6 text-sm">Loading...</div>
        ) : picklists.length === 0 ? (
          <div className="p-6 text-sm">No picklists found for this dealer.</div>
        ) : (
          <div className="mt-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Picklist ID</TableHead>
                  <TableHead>Scan Status</TableHead>
                  <TableHead>Invoice</TableHead>
                  <TableHead>SKUs</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {picklists.map((pl) => (
                  <TableRow key={pl._id}>
                    <TableCell className="font-mono text-xs">{pl._id}</TableCell>
                    <TableCell>{pl.scanStatus}</TableCell>
                    <TableCell>{pl.invoiceGenerated ? "Yes" : "No"}</TableCell>
                    <TableCell>
                      {(pl.skuList || []).map((s) => (
                        <div key={s._id} className="text-xs font-mono">{s.sku} x{s.quantity}</div>
                      ))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default ViewPicklistsModal

