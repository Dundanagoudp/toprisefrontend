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
