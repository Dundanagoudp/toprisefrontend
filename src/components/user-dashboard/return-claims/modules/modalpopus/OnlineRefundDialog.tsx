import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import DynamicButton from "@/components/common/button/button";
import { useToast as useGlobalToast } from "@/components/ui/toast";
import { refundInitiate } from "@/service/return-service";
import { DollarSign } from "lucide-react";

interface OnlineRefundDialogProps {
  open: boolean;
  onClose: () => void;
  onComplete?: (success: boolean) => void;
  returnId: string | null;
}

export default function OnlineRefundDialog({ 
  open, 
  onClose, 
  onComplete, 
  returnId 
}: OnlineRefundDialogProps) {
  const { showToast } = useGlobalToast();
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!returnId) {
      showToast("Return ID is required", "error");
      return;
    }

    if (!reason.trim()) {
      showToast("Please enter a reason for the refund", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await refundInitiate({
        returnId: returnId,
        reason: reason.trim()
      });

      if (response.success) {
        showToast("Online refund initiated successfully", "success");
        onComplete?.(true);
        onClose();
        setReason("");
      } else {
        showToast(response.message || "Failed to initiate refund", "error");
        onComplete?.(false);
      }
    } catch (error: any) {
      console.error("Error initiating refund:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to initiate refund";
      showToast(errorMessage, "error");
      onComplete?.(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setReason("");
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
           
            Initiate Online Refund
          </DialogTitle>
          <DialogDescription>
            Process refund to customer's original payment method.
            {returnId && (
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                <span className="text-sm font-medium text-blue-900">
                  Return ID: <span className="font-mono">{returnId}</span>
                </span>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="reason" className="text-sm font-medium text-gray-700">
              Refund Reason <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter the reason for processing this refund"
              className="mt-2"
              rows={4}
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500 mt-1">
              This reason will be recorded for audit purposes.
            </p>
          </div>
        </div>

        <DialogFooter className="flex gap-3">
          <DynamicButton
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </DynamicButton>
          <DynamicButton
            onClick={handleSubmit}
            loading={isSubmitting}
            loadingText="Processing Refund..."
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Initiate Refund
          </DynamicButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
