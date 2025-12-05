import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { AlertCircle, XCircle, Loader2 } from 'lucide-react'
import { rejectReturnRequest } from "@/service/return-service"

interface RejectReturnDialogProps {
  open: boolean;
  onClose: () => void;
  onRejectComplete?: (success: boolean) => void;
  returnId: string | null;
}

export default function RejectReturnDialog({ 
  open, 
  onClose, 
  onRejectComplete,
  returnId 
}: RejectReturnDialogProps) {
  const [isRejecting, setIsRejecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [validationError, setValidationError] = useState<string | null>(null)

  const handleReject = async () => {
    if (!returnId) return;

    // Validate rejection reason
    if (!rejectionReason.trim()) {
      setValidationError("Rejection reason is required")
      return;
    }

    if (rejectionReason.trim().length < 10) {
      setValidationError("Rejection reason must be at least 10 characters")
      return;
    }
    
    setIsRejecting(true)
    setError(null)
    setValidationError(null)
    
    try {
      const response = await rejectReturnRequest(returnId, rejectionReason.trim())
      if (response.success) {
        setSuccess(true)
        onRejectComplete?.(true)
      } else {
        setError("Failed to reject return request. Please try again.")
      }
    } catch (err: any) {
      console.error("Error rejecting return request:", err)
      setError(
        err?.response?.data?.message || err?.message || "An error occurred while rejecting the return request."
      )
    } finally {
      setIsRejecting(false)
    }
  }

  const handleClose = () => {
    setIsRejecting(false)
    setError(null)
    setSuccess(false)
    setRejectionReason("")
    setValidationError(null)
    onClose()
  }

  const handleCancel = () => {
    if (!isRejecting) {
      handleClose()
    }
  }

  const handleReasonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRejectionReason(e.target.value)
    if (validationError) {
      setValidationError(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {success ? (
              <>
                <XCircle className="h-5 w-5 text-red-600" />
                Return Rejected Successfully
              </>
            ) : (
              "Reject Return Request"
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {success ? (
            <div className="text-center">
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-gray-700">
                  The return request has been rejected successfully. The customer will be notified about the rejection.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-700">
                    <p className="font-medium mb-1">Please provide a reason for rejecting this return request.</p>
                    <p className="text-xs text-gray-600">This reason will be shared with the customer.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rejectionReason" className="text-sm font-medium">
                  Rejection Reason <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="rejectionReason"
                  placeholder="Enter the reason for rejecting this return request..."
                  value={rejectionReason}
                  onChange={handleReasonChange}
                  rows={4}
                  className={`resize-none ${validationError ? 'border-red-500 focus:border-red-500' : ''}`}
                  disabled={isRejecting}
                />
                {validationError && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {validationError}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  Minimum 10 characters required
                </p>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          {success ? (
            <Button onClick={handleClose} className="w-full">
              Close
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isRejecting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleReject}
                disabled={isRejecting}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isRejecting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  "Reject Return"
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

