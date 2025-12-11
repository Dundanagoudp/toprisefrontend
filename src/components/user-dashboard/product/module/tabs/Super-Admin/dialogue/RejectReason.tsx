import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast as useGlobalToast } from "@/components/ui/toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { rejectBulkProducts, rejectProduct } from "@/service/product-Service";
import { updateProductLiveStatus } from "@/store/slice/product/productLiveStatusSlice";
import { RejectBulkProductsPayload } from "@/types/product-Types";

const rejectReasonSchema = z.object({
  reason: z.string().min(1, "Reason is required"),
});
type RejectReasonFormData = z.infer<typeof rejectReasonSchema>;

interface RejectReasonProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RejectReasonFormData) => void;
}

export default function RejectReason({ isOpen, onClose, onSubmit }: RejectReasonProps) {
  const { showToast } = useGlobalToast();
  const auth = useAppSelector((state) => state.auth);
  const userId = useAppSelector((state) => state.auth.user._id);
  const selectedProducts = useAppSelector(
    (state) => state.productIdForBulkAction.products
  );
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RejectReasonFormData>({
    resolver: zodResolver(rejectReasonSchema),
    defaultValues: {
      reason: "",
    },
  });

  const handleFormSubmit = useCallback(
    async (data: RejectReasonFormData) => {
      try {
        const productIds = Object.keys(selectedProducts);
        
        // Check if this is bulk rejection (from product list) or single product rejection (from details page)
        if (productIds.length > 0) {
          // Bulk rejection mode
          const payload: RejectBulkProductsPayload = {
            productIds: productIds,
            reason: typeof data.reason === 'string' ? data.reason : '',
            rejectedBy: typeof userId === 'string' ? userId : '',
          };
          console.log("Payload:", payload);
          
          
          await rejectBulkProducts(payload);
          productIds.forEach((id) => {
            dispatch(updateProductLiveStatus({ id, liveStatus: "Rejected" }));
          });
          showToast("Products rejected successfully", "success");
          
          await new Promise((resolve) => setTimeout(resolve, 1000));
          
          // Reset form and close dialog
          reset();
          onClose();
        } else {
          // Single product rejection mode - call the provided onSubmit callback
          console.log("Single product rejection mode - calling onSubmit callback");
          reset();
          onSubmit(data); // This will be handled by the parent component (productDetails.tsx)
        }
      } catch (err: any) {
        console.error("Error rejecting product:", err);
        showToast("Failed to reject product. Please try again.", "error");
      }
    },
    [showToast, reset, onClose, auth.user._id, selectedProducts, dispatch, onSubmit]
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject Reason</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <Controller
            name="reason"
            control={control}
            render={({ field }) => (
              <>
                <Textarea {...field} placeholder="Enter reason for rejection" />
                {errors.reason && (
                  <span className="text-red-500 text-sm">
                    {errors.reason.message}
                  </span>
                )}
              </>
            )}
          />
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting || loading}>
              Submit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
