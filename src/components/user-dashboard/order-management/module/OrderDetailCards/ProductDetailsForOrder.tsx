"use client"
import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown, Edit, Package, HandHeart, Truck, UserCheck, Eye, MoreHorizontal } from "lucide-react"
import { DynamicButton } from "@/components/common/button"
import CreatePicklist from "./CreatePicklist"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast as GlobalToast } from "@/components/ui/toast"
import { assignDealersToOrder, assignPicklistToStaff, updateOrderStatusByDealerReq } from "@/service/order-service"
import { getDealerPickList } from "@/service/dealerOrder-services"
import { DealerPickList } from "@/types/dealerOrder-types"

interface ProductItem {
  _id?: string
  productId?: string
  productName: string
  dealerId: any
  sku?: string
  quantity?: number
  mrp: number
  gst: number | string 
  totalPrice: number
  image?: string
}

interface ProductDetailsForOrderProps {
  products: ProductItem[] | null | undefined
  onProductEyeClick: (product: ProductItem) => void
  onDealerEyeClick: (dealerId: string) => void
  orderId?: string
}

export default function ProductDetailsForOrder({
  products,
  onProductEyeClick,
  onDealerEyeClick,
  orderId = "",
}: ProductDetailsForOrderProps) {
  const [picklistOpen, setPicklistOpen] = useState(false)
  const [activeDealerId, setActiveDealerId] = useState<string>("")
  const [viewPicklistsOpen, setViewPicklistsOpen] = useState(false)
  const [picklists, setPicklists] = useState<DealerPickList[]>([])
  const [loadingPicklists, setLoadingPicklists] = useState(false)
  const [actionOpen, setActionOpen] = useState(false)
  const [activeAction, setActiveAction] = useState<"assignDealers" | "assignPicklist" | "markPacked" | null>(null)
  const [dealerId, setDealerId] = useState("")
  const [staffId, setStaffId] = useState("")
  const [totalWeightKg, setTotalWeightKg] = useState<number>(0)
  const [assignmentsJson, setAssignmentsJson] = useState("[]")
  const [loadingAction, setLoadingAction] = useState(false)
  const { showToast } = GlobalToast()
  const safeDealerId = (dealer: any): string => {
    if (dealer == null) return ""
    if (typeof dealer === "string") return dealer
    if (typeof dealer === "number") return String(dealer)
    return dealer._id || dealer.id || String(dealer)
  }

  return (
    <>
      <Card className="border border-gray-200 shadow-sm">
      <CardHeader className="pb-3 lg:pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle className="text-base sm:text-lg font-semibold text-gray-900">Product Details</CardTitle>
            <p className="text-xs sm:text-sm text-gray-600">Product that order by the customer</p>
          </div>
          <div className="flex flex-col items-start gap-1 text-xs sm:text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span>No.of Product:</span>
              <span className="font-medium">{products?.length || 0}</span>
            </div>
            {products && products.length > 3 && (
              <DynamicButton
                text="View All"
                customClassName="px-2 py-1 text-xs h-7 min-w-0"
              />
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Desktop Table View - Fixed width columns */}
        <div className="hidden xl:block">
  <div className="w-full bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
    <table className="w-full table-fixed">
      <thead className="bg-gray-50">
        <tr>
          <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider w-[35%]">
            Product Name
          </th>
          <th className="text-left py-4 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider w-[15%]">
            Dealers
          </th>
          <th className="text-left py-4 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider w-[12%]">
            MRP
          </th>
          <th className="text-left py-4 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider w-[8%]">
            GST
          </th>
          <th className="text-left py-4 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider w-[15%]">
            Total Price
          </th>
          <th className="text-left py-4 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider w-[15%]">
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {products?.map((productItem: ProductItem, index: number) => (
          <tr 
            key={productItem._id || index} 
            className="hover:bg-gray-50 transition-colors duration-150"
          >
            <td className="py-4 px-6 align-middle w-[35%]">
              <div className="flex items-center gap-3">
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {productItem.productName}
                    </p>
                    <button 
                      onClick={() => onProductEyeClick(productItem)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label="View product details"
                    >
                      <Eye className="w-4 h-4 flex-shrink-0" />
                    </button>
                  </div>
                </div>
              </div>
            </td>
            <td className="py-4 px-4 align-middle w-[15%]">
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-900">
                  {Array.isArray(productItem.dealerId) ? productItem.dealerId.length : 1}
                </span>
                <button
                  onClick={() => onDealerEyeClick(safeDealerId(productItem.dealerId))}
                  className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="View dealers"
                >
                  <Eye className="w-4 h-4 flex-shrink-0" />
                </button>
              </div>
            </td>
            <td className="py-4 px-4 text-sm font-medium text-gray-900 w-[12%]">
              ₹{productItem.mrp.toLocaleString()}
            </td>
            <td className="py-4 px-4 text-sm font-medium text-gray-900 w-[8%]">
              {productItem.gst}%
            </td>
            <td className="py-4 px-4 text-sm font-medium text-gray-900 w-[15%]">
              ₹{productItem.totalPrice.toLocaleString()}
            </td>
            <td className="py-4 px-4 align-middle w-[15%]">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-gray-100"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 rounded-lg shadow-lg border border-neutral-200 p-1">
                  <DropdownMenuItem className="flex items-center gap-2 rounded hover:bg-neutral-100" onClick={() => { setActiveAction("assignDealers"); setActionOpen(true); }}>
                    <Edit className="h-4 w-4 mr-2" /> Assign Dealers
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-2 rounded hover:bg-neutral-100" onClick={() => { setActiveAction("assignPicklist"); setDealerId(""); setStaffId(""); setActionOpen(true); }}>
                    <Edit className="h-4 w-4 mr-2" /> Assign Picklist
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-2 rounded hover:bg-neutral-100" onClick={() => { setActiveAction("markPacked"); setDealerId(safeDealerId(productItem.dealerId)); setActionOpen(true); }}>
                    <Edit className="h-4 w-4 mr-2" /> Mark Packed
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    
    <div className="flex justify-end gap-2 p-4 border-t border-gray-200 bg-gray-50">
      <DynamicButton
        text="View Picklists"
        customClassName="px-6 py-2 text-sm font-medium rounded-md shadow-sm border"
        onClick={async () => {
          try {
            const firstDealer = products && products.length > 0 ? products[0].dealerId : ""
            const dealerId = safeDealerId(firstDealer as any)
            if (!dealerId) {
              showToast("No dealer found for this order", "error")
              return
            }
            setLoadingPicklists(true)
            const data = await getDealerPickList(dealerId)
            setPicklists(data)
            setViewPicklistsOpen(true)
          } catch (e) {
            showToast("Failed to load picklists", "error")
          } finally {
            setLoadingPicklists(false)
          }
        }}
      />
      <DynamicButton
        text="Create Picklist"
        customClassName="bg-[#C72920] hover:bg-red-700 px-6 py-2 text-sm font-medium rounded-md shadow-sm text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        onClick={() => {
          // Prefer dealer id from the first product row if available
          const firstDealer = products && products.length > 0 ? products[0].dealerId : ""
          setActiveDealerId(safeDealerId(firstDealer as any))
          setPicklistOpen(true)
        }}
      />
    </div>
  </div>
</div>

        {/* Card View for Mobile and Tablet */}
        <div className="xl:hidden p-4 space-y-3">
          <div className="flex justify-end mb-2">
            <DynamicButton
              text="Create Picklist"
              customClassName="bg-[#C72920] hover:bg-red-700 px-4 py-1 text-xs rounded shadow-sm"
              onClick={() => {
                const firstDealer = products && products.length > 0 ? products[0].dealerId : ""
                setActiveDealerId(safeDealerId(firstDealer as any))
                setPicklistOpen(true)
              }}
            />
          </div>
          {products?.map((productItem: ProductItem) => (
            <div key={productItem._id} className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-start gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-gray-900 text-sm truncate">{productItem.productName}</h3>
                    <Eye
                      className="w-4 h-4 text-gray-500 flex-shrink-0 cursor-pointer"
                      onClick={() => onProductEyeClick(productItem)}
                    />
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs sm:text-sm text-gray-600">No. of Dealers:</span>
                    <span className="text-xs sm:text-sm text-gray-900 font-semibold">
                      {Array.isArray(productItem.dealerId) ? productItem.dealerId.length : 1}
                    </span>
                    <Eye
                      className="w-3 h-3 text-gray-500 flex-shrink-0 cursor-pointer ml-1 inline-block align-middle"
                      onClick={() => onDealerEyeClick(safeDealerId(productItem.dealerId))}
                    />
                    <button
                      className="ml-2 text-[11px] px-2 py-0.5 border rounded"
                      onClick={async () => {
                        try {
                          const dealerId = safeDealerId(productItem.dealerId)
                          if (!dealerId) return
                          setLoadingPicklists(true)
                          const data = await getDealerPickList(dealerId)
                          setPicklists(data)
                          setViewPicklistsOpen(true)
                        } catch (e) {
                          showToast("Failed to load picklists", "error")
                        } finally {
                          setLoadingPicklists(false)
                        }
                      }}
                    >
                      Picklists
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs sm:text-sm text-gray-600">MRP:</span>
                    <span className="text-xs sm:text-sm text-gray-900 font-semibold">₹{productItem.mrp}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs sm:text-sm text-gray-600">GST:</span>
                    <span className="text-xs sm:text-sm text-gray-900 font-semibold">{productItem.gst}%</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs sm:text-sm text-gray-600">Total Price:</span>
                    <span className="text-xs sm:text-sm text-gray-900 font-semibold">₹{productItem.totalPrice}</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 bg-white border border-gray-300 rounded-md shadow-sm w-20 justify-between text-xs"
                    >
                      Edit
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem className="text-sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-sm">
                      <Package className="h-4 w-4 mr-2" />
                      Mark Packed
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-sm">
                      <HandHeart className="h-4 w-4 mr-2" />
                      Mark Handover
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-sm">
                      <Truck className="h-4 w-4 mr-2" />
                      Update Tracking
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-sm">
                      <UserCheck className="h-4 w-4 mr-2" />
                      Reassign Dealer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
      {/* Action Modal (same flow as orders-table) */}
      <Dialog open={actionOpen} onOpenChange={setActionOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {activeAction === "assignDealers" && "Assign Dealers to SKUs"}
              {activeAction === "assignPicklist" && "Assign Picklist to Staff"}
              {activeAction === "markPacked" && "Mark Order as Packed"}
            </DialogTitle>
          </DialogHeader>

          {activeAction === "assignDealers" && (
            <div className="space-y-3">
              <div>
                <Label>Order ID</Label>
                <Input readOnly value={orderId || ""} />
              </div>
              <div>
                <Label>Assignments (JSON)</Label>
                <Textarea rows={5} value={assignmentsJson} onChange={(e) => setAssignmentsJson(e.target.value)} />
              </div>
              <Button
                onClick={async () => {
                  try {
                    setLoadingAction(true)
                    const payload = {
                      orderId,
                      assignments: JSON.parse(assignmentsJson || "[]"),
                    } as any
                    await assignDealersToOrder(payload)
                    showToast("Dealers assigned", "success")
                    setActionOpen(false)
                  } catch (e) {
                    showToast("Failed to assign dealers", "error")
                  } finally {
                    setLoadingAction(false)
                  }
                }}
                disabled={loadingAction}
              >
                {loadingAction ? "Saving..." : "Assign"}
              </Button>
            </div>
          )}

          {activeAction === "assignPicklist" && (
            <div className="space-y-3">
              <div>
                <Label>Picklist ID</Label>
                <Input value={dealerId} onChange={(e) => setDealerId(e.target.value)} placeholder="picklistId" />
              </div>
              <div>
                <Label>Staff ID</Label>
                <Input value={staffId} onChange={(e) => setStaffId(e.target.value)} />
              </div>
              <Button
                onClick={async () => {
                  try {
                    setLoadingAction(true)
                    await assignPicklistToStaff({ picklistId: dealerId, staffId })
                    showToast("Picklist assigned", "success")
                    setActionOpen(false)
                  } catch (e) {
                    showToast("Failed to assign picklist", "error")
                  } finally {
                    setLoadingAction(false)
                  }
                }}
                disabled={loadingAction}
              >
                {loadingAction ? "Assigning..." : "Assign"}
              </Button>
            </div>
          )}

          {activeAction === "markPacked" && (
            <div className="space-y-3">
              <div>
                <Label>Order ID</Label>
                <Input readOnly value={orderId || ""} />
              </div>
              <div>
                <Label>Dealer ID</Label>
                <Input value={dealerId} onChange={(e) => setDealerId(e.target.value)} />
              </div>
              <div>
                <Label>Total Weight (kg)</Label>
                <Input type="number" value={totalWeightKg} onChange={(e) => setTotalWeightKg(parseFloat(e.target.value) || 0)} />
              </div>
              <Button
                onClick={async () => {
                  try {
                    setLoadingAction(true)
                    await updateOrderStatusByDealerReq({ orderId, dealerId, total_weight_kg: totalWeightKg } as any)
                    showToast("Order marked as packed", "success")
                    setActionOpen(false)
                  } catch (e) {
                    showToast("Failed to mark packed", "error")
                  } finally {
                    setLoadingAction(false)
                  }
                }}
                disabled={loadingAction}
              >
                {loadingAction ? "Updating..." : "Mark Packed"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <CreatePicklist
        open={picklistOpen}
        onClose={() => setPicklistOpen(false)}
        orderId={orderId}
        defaultDealerId={activeDealerId}
        defaultSkuList={(products || []).map((p) => ({ sku: p.sku || "", quantity: p.quantity || 1 }))}
      />

      <Dialog open={viewPicklistsOpen} onOpenChange={setViewPicklistsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Dealer Picklists</DialogTitle>
          </DialogHeader>
          {loadingPicklists ? (
            <div className="p-6 text-sm">Loading...</div>
          ) : picklists.length === 0 ? (
            <div className="p-6 text-sm">No picklists found for this dealer.</div>
          ) : (
            <div className="mt-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Picklist ID</TableHead>
                    <TableHead>Linked Order</TableHead>
                    <TableHead>Scan Status</TableHead>
                    <TableHead>Invoice</TableHead>
                    <TableHead>SKUs</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {picklists.map((pl) => (
                    <TableRow key={pl._id}>
                      <TableCell className="font-mono text-xs">{pl._id}</TableCell>
                      <TableCell className="font-mono text-xs">{pl.linkedOrderId}</TableCell>
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
    </>
  )
}
