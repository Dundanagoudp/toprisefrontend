"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Truck } from "lucide-react";
import { updateOrderStatusByDealer } from "@/service/dealerOrder-services";
import { getCookie, getAuthToken } from "@/utils/auth";
import { useToast } from "@/components/ui/toast";

interface DealerProduct {
  sku: string;
  quantity: number;
  productId: string;
  productName: string;
  dealerMapped: any[];
  _id: string;
}

interface DealerProductsModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: DealerProduct[];
  orderId: string;
}

export default function DealerProductsModal({
  isOpen,
  onClose,
  products,
  orderId
}: DealerProductsModalProps) {
  const { showToast } = useToast();
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            Dealer Products - Order {orderId}
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          {products.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">No products found for this order</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-200 bg-gray-50/50">
                  <TableHead className="text-gray-700 font-medium px-4 py-3 text-left">
                    SKU
                  </TableHead>
                  <TableHead className="text-gray-700 font-medium px-4 py-3 text-left">
                    Product Name
                  </TableHead>
                  <TableHead className="text-gray-700 font-medium px-4 py-3 text-left">
                    Product ID
                  </TableHead>
                  <TableHead className="text-gray-700 font-medium px-4 py-3 text-left">
                    Quantity
                  </TableHead>
                  <TableHead className="text-gray-700 font-medium px-4 py-3 text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product, index) => (
                  <TableRow key={product._id || index} className="border-b border-gray-100">
                    <TableCell className="px-4 py-3 font-medium text-gray-900">
                      {product.sku}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-900">
                      {product.productName}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-600 font-mono text-sm">
                      {product.productId}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-900 font-semibold">
                      {product.quantity}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          try {
                            const weightInput = window.prompt("Enter total weight (kg) for shipment:", "");
                            if (weightInput === null) return; // cancel
                            const totalWeightKg = parseFloat(weightInput);
                            if (Number.isNaN(totalWeightKg) || totalWeightKg <= 0) {
                              showToast("Please enter a valid weight in kg", "error");
                              return;
                            }

                            // Resolve dealerId from cookie or token
                            let dealerId = getCookie("dealerId");
                            if (!dealerId) {
                              const token = getAuthToken();
                              if (token) {
                                try {
                                  const payloadBase64 = token.split(".")[1];
                                  if (payloadBase64) {
                                    const base64 = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
                                    const paddedBase64 = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
                                    const payloadJson = atob(paddedBase64);
                                    const payload = JSON.parse(payloadJson);
                                    dealerId = payload.dealerId || payload.id || "";
                                  }
                                } catch (err) {
                                  // ignore and fallback
                                }
                              }
                            }

                            if (!dealerId) {
                              showToast("Dealer ID not found", "error");
                              return;
                            }

                            await updateOrderStatusByDealer(String(dealerId), String(orderId), totalWeightKg);
                            showToast("Order marked as shipped", "success");
                          } catch (e) {
                            showToast("Failed to mark as shipped", "error");
                          }
                        }}
                        className="gap-1"
                      >
                        <Truck className="h-4 w-4" />
                        Mark Shipped
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
