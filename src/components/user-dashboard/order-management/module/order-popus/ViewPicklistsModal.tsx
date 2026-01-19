"use client"
import type React from "react"
import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { useToast as GlobalToast } from "@/components/ui/toast"
import { getDealerPickList } from "@/service/dealerOrder-services"
import type { DealerPickList } from "@/types/dealerOrder-types"
import { fetchPicklistByOrderId, getOrderById, setMarkAsDelivery } from "@/service/order-service"
import { markPicklistAsPacked } from "@/service/picklist-service"
import { DynamicButton } from "@/components/common/button"
import { MoreVertical, Package } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import MarkPackedForPicklistId from "./MarkPackedForPicklistId"
import ManualDeliveryModal from "./ManualDeliveryModal"

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
  const [markPackedModal, setMarkPackedModal] = useState<{ open: boolean; picklistId?: string }>({ open: false })
  const [manualDeliveryModal, setManualDeliveryModal] = useState<{ open: boolean; picklistId?: string }>({ open: false })
  const [markAsDeliveryModal, setMarkAsDeliveryModal] = useState<{ open: boolean; picklistId?: string; dealerId?: string }>({ open: false })
  const [orderStatus, setOrderStatus] = useState<string>("")
// API service function
const fetchPicklists = async (orderId: string): Promise<DealerPickList[]> => {
  try {
    const [picklistResponse, orderResponse] = await Promise.all([
      fetchPicklistByOrderId(orderId),
      getOrderById(orderId)
    ]);
    
    const data = picklistResponse?.data || []
    
    // Handle orderData - it could be an array or single object
    const orderDataArray = Array.isArray(orderResponse?.data) 
      ? orderResponse.data 
      : orderResponse?.data ? [orderResponse.data] : [];
    const orderData = orderDataArray[0]; // Get first order
    setOrderStatus(orderData?.status || "")
    // Create a map of SKU to product information from order details
    const skuProductMap = new Map();
    if (orderData?.skus && Array.isArray(orderData.skus)) {
      orderData.skus.forEach((sku: any) => {
        skuProductMap.set(sku.sku, {
          productName: sku.productName || "",
          markAsPacked: sku.markAsPacked || false,
          delivery_chanel: sku.delivery_chanel || "",
          markAsDelivered: sku.markAsDelivered || false,
          // Add other fields if available in order data
        });
      });
    }

    // Normalize incoming API shape (Picklist) to our DealerPickList type
    const mapped: DealerPickList[] = (data as any[]).map((p, pIndex) => {
      const picklistId = String(p._id ?? p.id ?? `picklist-${orderId}-${pIndex}`)

      const skuList = (p.skuList || []).map((s: any, sIndex: number) => {
        // Get product info from order data by matching SKU
        const productInfo = skuProductMap.get(s.sku ?? s.skuCode ?? "");
        
        return {
          _id: String(s._id ?? s.id ?? `${picklistId}-sku-${sIndex}`),
          sku: s.sku ?? s.skuCode ?? "",
          quantity: Number(s.quantity ?? 0),
          productName: s.productName || productInfo?.productName || "",
          barcode: s.barcode || "",
          manufacturer_part_name: s.manufacturer_part_name || "",
          markAsPacked: productInfo?.markAsPacked ?? s.markAsPacked ?? false,
          delivery_chanel: productInfo?.delivery_chanel || "",
          markAsDelivered: productInfo?.markAsDelivered ?? s.markAsDelivered ?? false,
          // copy other fields if needed
        }
      })

      return {
        // include other properties from the API response first (including dealerId)
        ...(p || {}),
        // then override with normalized required fields
        _id: picklistId,
        scanStatus: p.scanStatus ?? p.status ?? "unknown",
        invoiceGenerated: Boolean(p.invoiceGenerated),
        skuList,
      } as DealerPickList
    })

    return mapped
  } catch (error) {
    console.error("Failed to fetch picklists:", error)
    throw error
  }
}

// Component hook
useEffect(() => {
  if (!open) return;
  
  const loadPicklists = async () => {
    if (!dealerId) {
      setPicklists([]);
      showToast("No dealer found for this order", "error");
      return;
    }
    if (!orderId) {
      setPicklists([]);
      showToast("No order ID provided", "error");
      return;
    }
    
    setLoading(true);
    try {
      const picklists = await fetchPicklists(orderId);
      //log picklists
      console.log("picklists", picklists);
      setPicklists(picklists);
    } catch (error) {
      setPicklists([]);
      showToast("Failed to load picklists", "error");
    } finally {
      setLoading(false);
    }
  };
  
  loadPicklists();
}, [open, dealerId, orderId]);

  const handleMarkAsPacked = (picklistId: string) => {
    console.log("picklistId", picklistId);
    setMarkPackedModal({ open: true, picklistId });
  };

  const handleManualDelivery = (picklistId: string) => {
    console.log("Manual delivery selected for picklist:", picklistId);
    setManualDeliveryModal({ open: true, picklistId });
  };

  const handleMarkPackedSuccess = () => {
    // Update the picklist status locally for immediate UI feedback
    setPicklists(prev => prev.map(pl =>
      pl._id === markPackedModal.picklistId
        ? { ...pl, scanStatus: "packed" }
        : pl
    ));
    setMarkPackedModal({ open: false });
  };

  const handleManualDeliverySuccess = () => {
    // Update the picklist status locally for immediate UI feedback
    setPicklists(prev => prev.map(pl =>
      pl._id === manualDeliveryModal.picklistId
        ? { ...pl, scanStatus: "delivered" }
        : pl
    ));
    setManualDeliveryModal({ open: false });
  };

  // mark as delivery
  const handleMarkAsDelivery = (picklistId: string) => {
    console.log("Mark as delivery selected for picklist:", picklistId);
    const picklist = picklists.find(p => p._id === picklistId);
    const picklistDealerId = picklist?.dealerId || dealerId;
    setMarkAsDeliveryModal({ open: true, picklistId, dealerId: picklistDealerId });
  };

  const handleMarkAsDeliveryConfirm = async () => {
    if (!markAsDeliveryModal.picklistId || !orderId) {
      showToast("Missing required information", "error");
      return;
    }

    try {
      const requestBody = {
        orderId: orderId,
        dealerId: markAsDeliveryModal.dealerId || dealerId,
        picklistId: markAsDeliveryModal.picklistId,
      };

      console.log("Calling setMarkAsDelivery with:", requestBody);
      
      const response = await setMarkAsDelivery(requestBody);
      
      if (response?.success !== false) {
        showToast("Order marked as delivered successfully", "success");
        // Update the picklist status locally
        setPicklists(prev => prev.map(pl =>
          pl._id === markAsDeliveryModal.picklistId
            ? { ...pl, scanStatus: "delivered" }
            : pl
        ));
        setMarkAsDeliveryModal({ open: false });
        
        // Optionally refresh picklists
        if (orderId) {
          const updatedPicklists = await fetchPicklists(orderId);
          setPicklists(updatedPicklists);
        }
      } else {
        showToast(response?.message || "Failed to mark as delivered", "error");
      }
    } catch (error) {
      console.error("Failed to mark as delivered:", error);
      showToast("Failed to mark as delivered", "error");
    }
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const getStatusColor = (status: string) => {
      switch (status.toLowerCase()) {
        case "completed":
        case "scanned":
          return "bg-green-100 text-green-800 border-green-200"
        case "pending":
        case "in-progress":
          return "bg-yellow-100 text-yellow-800 border-yellow-200"
        case "failed":
        case "error":
          return "bg-red-100 text-red-800 border-red-200"
        default:
          return "bg-gray-100 text-gray-800 border-gray-200"
      }
    }

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(status)}`}
      >
        {status}
      </span>
    )
  }

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center p-12">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="text-sm text-gray-600">Loading picklists...</p>
      </div>
    </div>
  )

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No picklists found</h3>
      <p className="text-sm text-gray-500">There are no picklists available for this dealer.</p>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4 border-b border-gray-200">
          <DialogTitle className="text-xl font-semibold text-gray-900">Dealer Picklists</DialogTitle>
          {dealerId && (
            <p className="text-sm text-gray-600 mt-1">
              Dealer ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">{dealerId}</span>
            </p>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {loading ? (
            <LoadingSpinner />
          ) : picklists.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="p-1">
              <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">{picklists.length}</span> picklist{picklists.length !== 1 ? "s" : ""}{" "}
                  found
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold text-gray-900">Picklist ID</TableHead>
                      <TableHead className="font-semibold text-gray-900">Status</TableHead>
                      {/* <TableHead className="font-semibold text-gray-900">Invoice</TableHead> */}
                      <TableHead className="font-semibold text-gray-900">SKUs</TableHead>
                      <TableHead className="font-semibold text-gray-900">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {picklists.map((pl, index) => {
                      // Step 2: Create derived constant for the row based on SKU flags
                      const isAllPacked = pl.skuList?.every((s: any) => s.markAsPacked) ?? false;
                      const hasManualRapido = pl.skuList?.some((s: any) => s.delivery_chanel === "Manual_Rapido") ?? false;
                      const isMarkedDelivered = pl.skuList?.some((s: any) => s.markAsDelivered === true) ?? false;
                      
                      return (
                        <TableRow key={pl._id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          <TableCell className="font-mono text-sm bg-gray-100 rounded px-2 py-1 max-w-[200px]">
                            <div className="truncate" title={pl._id}>
                              {pl._id}
                            </div>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={pl.scanStatus} />
                          </TableCell>
                          {/* <TableCell>
                            <div className="flex items-center gap-2">
                              {pl.invoiceGenerated ? (
                                <>
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  <span className="text-green-700 font-medium">Generated</span>
                                </>
                              ) : (
                                <>
                                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                  <span className="text-gray-600">Pending</span>
                                </>
                              )}
                            </div>
                          </TableCell> */}
                          <TableCell>
                            <div className="space-y-1 max-w-[250px]">
                              {(pl.skuList || []).map((s) => (
                                <div
                                  key={s._id}
                                  className="flex items-center justify-between bg-gray-50 px-2 py-1 rounded text-xs"
                                >
                                  <span className="font-mono text-gray-800">{s.sku}</span>
                                  <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-medium">
                                    ×{s.quantity}
                                  </span>
                                </div>
                              ))}
                              {(pl.skuList || []).length === 0 && (
                                <span className="text-gray-400 text-xs italic">No SKUs</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {isAllPacked && hasManualRapido && isMarkedDelivered ? (
                              // Render Packed Badge for Manual_Rapido items that are marked as delivered
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-green-100 text-green-800 border-green-200">
                                Packed
                              </span>
                            ) : isAllPacked && hasManualRapido ? (
                              // Render "Mark as delivery" button for Manual_Rapido packed picklists
                              <Button
                                onClick={() => handleMarkAsDelivery(pl._id)}
                                size="sm"
                                className="text-xs px-3 py-1 h-7 bg-blue-600 text-white hover:bg-blue-700"
                              >
                                Mark as delivery
                              </Button>
                            ) : isAllPacked ? (
                              // Render Packed Badge (Green, static) if all SKUs are packed
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-green-100 text-green-800 border-green-200">
                                Packed
                              </span>
                            ) : orderStatus === "Cancelled" || orderStatus === "Canceled" ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-red-100 text-red-800 border-red-200">
                                Cancelled
                              </span>
                            ) : (
                              // Render dropdown menu with delivery options
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                onClick={() => handleMarkAsPacked(pl._id)}
                                  >
                                   Initiate Borzo Delivery
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleManualDelivery(pl._id)}
                                  >
                                    Manual delivery
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                              // <Button
                              //   onClick={() => handleMarkAsPacked(pl._id)}
                              //   size="sm"
                              //   className="text-xs px-2 py-1 h-7 bg-blue-600 text-white hover:bg-blue-700"
                              // >
                              //   Mark as Packed
                              // </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      </DialogContent>

      <MarkPackedForPicklistId
        open={markPackedModal.open}
        onOpenChange={(open) => setMarkPackedModal({ open, picklistId: open ? markPackedModal.picklistId : undefined })}
        orderId={orderId}
        dealerId={picklists.find(p => p._id === markPackedModal.picklistId)?.dealerId || dealerId}
        productName={picklists.find(pl => pl._id === markPackedModal.picklistId)?.skuList?.[0]?.productName || ""}
        picklistId={markPackedModal.picklistId}
        items={picklists.find(pl => pl._id === markPackedModal.picklistId)?.skuList || []}
        onSuccess={handleMarkPackedSuccess}
      />

      <ManualDeliveryModal
        open={manualDeliveryModal.open}
        onOpenChange={(open) => setManualDeliveryModal({ open, picklistId: open ? manualDeliveryModal.picklistId : undefined })}
        orderId={orderId}
        dealerId={picklists.find(p => p._id === manualDeliveryModal.picklistId)?.dealerId || dealerId}
        picklistId={manualDeliveryModal.picklistId}
        items={picklists.find(pl => pl._id === manualDeliveryModal.picklistId)?.skuList || []}
        onSuccess={handleManualDeliverySuccess}
      />

      {/* Mark as Delivery Confirmation Dialog */}
      <Dialog 
        open={markAsDeliveryModal.open} 
        onOpenChange={(open) => setMarkAsDeliveryModal({ open, picklistId: open ? markAsDeliveryModal.picklistId : undefined, dealerId: open ? markAsDeliveryModal.dealerId : undefined })}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Mark as Delivered</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to mark this picklist as delivered?
            </p>
            
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-2">
              <div className="text-xs font-semibold text-gray-700 mb-2">Request Details:</div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order ID:</span>
                  <span className="font-mono text-gray-900">{orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Dealer ID:</span>
                  <span className="font-mono text-gray-900">{markAsDeliveryModal.dealerId || dealerId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Picklist ID:</span>
                  <span className="font-mono text-gray-900">{markAsDeliveryModal.picklistId}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setMarkAsDeliveryModal({ open: false })}
              >
                Cancel
              </Button>
              <Button
                onClick={handleMarkAsDeliveryConfirm}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Confirm Delivery
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  )
}

export default ViewPicklistsModal
