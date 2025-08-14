"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download } from 'lucide-react';
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
  onMarkAsPacked: () => void;
}

export default function PickListModal({
  isOpen,
  onClose,
  pickLists,
  orderId,
  onMarkAsPacked,
}: PickListModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-bold text-red-600">
            Pick List - Order {orderId}
          </DialogTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
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
         
                   {/* Packed Button - Bottom Right */}
          <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
            <Button
              onClick={onMarkAsPacked}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
            >
              Packed
            </Button>
          </div>
       </DialogContent>
     </Dialog>
  );
}