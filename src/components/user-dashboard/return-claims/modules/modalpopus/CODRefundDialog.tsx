import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import DynamicButton from "@/components/common/button/button";
import { useToast as useGlobalToast } from "@/components/ui/toast";
import { processManualRefund, refundInitiate } from "@/service/return-service";
import { getBankDetails, UserBankDetails } from "@/service/user/userService";
import { DollarSign, CreditCard, Loader2, AlertCircle } from "lucide-react";
import { ReturnRequest } from "@/types/return-Types";

interface CODRefundDialogProps {
  open: boolean;
  onClose: () => void;
  onComplete?: (success: boolean) => void;
  returnId: string | null | undefined;
  returnRequest?: ReturnRequest | null;
}

export default function CODRefundDialog({ 
  open, 
  onClose, 
  onComplete, 
  returnId,
  returnRequest 
}: CODRefundDialogProps) {
  const { showToast } = useGlobalToast();
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bankDetails, setBankDetails] = useState<UserBankDetails | null>(null);

  useEffect(() => {
    if (open && returnRequest) {
      fetchBankDetails();
    } else if (open) {
      // Reset bank details when dialog opens without returnRequest
      setBankDetails(null);
    }
  }, [open, returnRequest]);

  const fetchBankDetails = async () => {
    let userId: string | undefined;
    
    console.log("CODRefundDialog - Fetching bank details");
    console.log("returnRequest:", returnRequest);
    console.log("returnRequest.orderId:", returnRequest?.orderId);
    console.log("returnRequest.customerId:", returnRequest?.customerId);
    
    // Priority 1: Check if orderId is an object with customerDetails.userId
    if (returnRequest?.orderId && typeof returnRequest.orderId === 'object' && returnRequest.orderId !== null) {
      const orderIdObj = returnRequest.orderId as any;
      if (orderIdObj.customerDetails?.userId) {
        userId = orderIdObj.customerDetails.userId;
        console.log("Found userId from orderId.customerDetails.userId:", userId);
      }
    }
    
    // Priority 2: Use customerId from return request (this is the most reliable)
    if (!userId && returnRequest?.customerId) {
      userId = returnRequest.customerId;
      console.log("Using customerId from returnRequest:", userId);
    }
    
    // Priority 3: Check if orderId is an object with customerDetails and try to get userId from there
    if (!userId && returnRequest?.orderId && typeof returnRequest.orderId === 'object') {
      const orderIdObj = returnRequest.orderId as any;
      // Sometimes userId might be directly in customerDetails
      if (orderIdObj.customerDetails) {
        userId = orderIdObj.customerDetails.userId || orderIdObj.customerDetails.id;
        console.log("Trying to get userId from orderId.customerDetails:", userId);
      }
    }
    
    if (!userId) {
      console.error("User ID not found in return request");
      showToast("User ID not found. Cannot fetch bank details.", "error");
      setLoading(false);
      return;
    }

    console.log("Fetching bank details for userId:", userId);
    console.log("API endpoint will be: /users/api/users/" + userId + "/bank-details");

    try {
      setLoading(true);
      const response = await getBankDetails(userId);
      
      console.log("Bank details API response:", response);
      console.log("Response structure:", {
        success: response.success,
        data: response.data,
        user: (response as any).data?.user,
        bank_details: (response as any).data?.user?.bank_details
      });
      
      // Map the response structure: response.data.user.bank_details
      let bankDetailsData: UserBankDetails | null = null;
      
      if (response.success && response.data) {
        // Check if response.data has user.bank_details structure
        const responseData = response.data as any;
        if (responseData.user?.bank_details) {
          // Map from response.data.user.bank_details
          bankDetailsData = {
            account_number: responseData.user.bank_details.account_number || "",
            ifsc_code: responseData.user.bank_details.ifsc_code || "",
            account_type: responseData.user.bank_details.account_type || "",
            bank_account_holder_name: responseData.user.bank_details.bank_account_holder_name || "",
            bank_name: responseData.user.bank_details.bank_name || ""
          };
          console.log("Bank details mapped from user.bank_details:", bankDetailsData);
        } else if (responseData.account_number || responseData.ifsc_code || responseData.bank_name) {
          // Fallback: if bank_details are directly in response.data
          bankDetailsData = {
            account_number: responseData.account_number || "",
            ifsc_code: responseData.ifsc_code || "",
            account_type: responseData.account_type || "",
            bank_account_holder_name: responseData.bank_account_holder_name || "",
            bank_name: responseData.bank_name || ""
          };
          console.log("Bank details mapped directly from data:", bankDetailsData);
        }
      }
      
      if (bankDetailsData && (bankDetailsData.account_number || bankDetailsData.ifsc_code || bankDetailsData.bank_name)) {
        console.log("Bank details set successfully:", bankDetailsData);
        setBankDetails(bankDetailsData);
      } else {
        console.warn("Bank details not found in response", response);
        showToast("Bank details not found. Please ensure customer has added bank details.", "error");
        setBankDetails(null);
      }
    } catch (error: any) {
      console.error("Failed to fetch bank details:", error);
      console.error("Error details:", {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status
      });
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to fetch bank details";
      showToast(`Failed to fetch bank details: ${errorMessage}`, "error");
      setBankDetails(null);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

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
      const response = await processManualRefund({
        returnId: returnId,
        reason: reason.trim(),
        bankDetails: bankDetails
      } as any);

      if (response.success) {
        showToast("Refund processed successfully", "success");
        onComplete?.(true);
        onClose();
        setReason("");
      } else {
        showToast(response.message || "Failed to process refund", "error");
        onComplete?.(false);
      }
    } catch (error: any) {
      console.error("Error processing refund:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to process refund";
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            COD Refund - Bank Details
          </DialogTitle>
          <DialogDescription>
            Process refund to customer's bank account for COD order.
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
          {/* Refund Amount */}
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-gray-500">Refund Amount</Label>
                <p className="text-2xl font-bold text-green-600">
                  {returnRequest?.refund?.refundAmount 
                    ? formatCurrency(returnRequest.refund.refundAmount)
                    : "N/A"
                  }
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Bank Details */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="h-5 w-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Customer Bank Details</h3>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="ml-2 text-sm text-muted-foreground">
                    Loading bank details...
                  </span>
                </div>
              ) : bankDetails ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-gray-500">Account Number</Label>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {bankDetails.account_number || "N/A"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">IFSC Code</Label>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {bankDetails.ifsc_code || "N/A"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Bank Name</Label>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {bankDetails.bank_name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Account Holder Name</Label>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {bankDetails.bank_account_holder_name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Account Type</Label>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {bankDetails.account_type || "N/A"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-amber-900 text-sm">Bank Details Not Found</h4>
                      <p className="text-sm text-amber-800 mt-1">
                        Customer bank details are not available. Please ensure the customer has added their bank details before processing the refund.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Refund Reason */}
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
            disabled={!bankDetails || isSubmitting}
          >
            Mark as Refund Complete
          </DynamicButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

