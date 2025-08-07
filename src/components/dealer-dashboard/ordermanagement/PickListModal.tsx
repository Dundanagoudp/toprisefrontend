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
import { DealerPickList } from "@/types/dealerOrder-types";

interface PickListModalProps {
  isOpen: boolean;
  onClose: () => void;
  pickLists: DealerPickList[];
  orderId: string;
}

export default function PickListModal({
  isOpen,
  onClose,
  pickLists,
  orderId,
}: PickListModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-red-600">
            Pick List - Order {orderId}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          {pickLists.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">No pick list found for this order</p>
            </div>
          ) : (
            pickLists.map((pickList) => (
              <div key={pickList._id} className="mb-8 border border-red-200 rounded-lg p-4">
                <div className="mb-2 text-sm text-gray-700">
                  <span className="font-semibold">Pick List ID:</span> {pickList._id} <br />
                  <span className="font-semibold">Scan Status:</span> {pickList.scanStatus} <br />
                  <span className="font-semibold">Invoice Generated:</span> {pickList.invoiceGenerated ? "Yes" : "No"}
                </div>
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-gray-200 bg-gray-50/50">
                      <TableHead className="text-gray-700 font-medium px-4 py-3 text-left">SKU</TableHead>
                      <TableHead className="text-gray-700 font-medium px-4 py-3 text-left">Quantity</TableHead>
                      <TableHead className="text-gray-700 font-medium px-4 py-3 text-left">Barcode</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pickList.skuList.map((item) => (
                      <TableRow key={item._id} className="border-b border-gray-100">
                        <TableCell className="px-4 py-3 font-medium text-gray-900">{item.sku}</TableCell>
                        <TableCell className="px-4 py-3 text-gray-900">{item.quantity}</TableCell>
                        <TableCell className="px-4 py-3 text-gray-600 font-mono text-sm">{item.barcode}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}