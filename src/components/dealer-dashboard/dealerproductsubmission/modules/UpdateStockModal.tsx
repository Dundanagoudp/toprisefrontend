import React from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Product } from "@/types/dealer-productTypes";

interface UpdateStockModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  loading: boolean;
  product: Product | null;
  quantity: number;
  setQuantity: (q: number) => void;
}

const UpdateStockModal: React.FC<UpdateStockModalProps> = ({
  open,
  onClose,
  onSubmit,
  loading,
  product,
  quantity,
  setQuantity,
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogTitle>Update Stock</DialogTitle>
        <div className="space-y-4">
          <div>
            Product: <b>{product?.product_name}</b>
          </div>
          <Input
            type="number"
            min={0}
            value={quantity}
            onChange={e => setQuantity(Number(e.target.value))}
            disabled={loading}
            placeholder="Enter quantity"
          />
          <div className="flex gap-2 justify-end">
            <button
              className="px-4 py-2 bg-gray-200 rounded"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-red-600 text-white rounded"
              onClick={onSubmit}
              disabled={loading}
            >
              {loading ? "Updating..." : "Update"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateStockModal;