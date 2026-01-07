"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import {
  MapPin,
  Truck,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  Loader2
} from "lucide-react"
import { checkPincode } from "@/service/user/cartService"
import { useAppDispatch } from "@/store/hooks"
import { setPincode, setPincodeData, setPincodeLoading, setPincodeError } from "@/store/slice/pincode/pincodeSlice"
import { usePincode } from "@/hooks/use-pincode"

// Form validation schema
const pincodeSchema = z.object({
  pincode: z.string()
    .min(6, "Pincode must be at least 6 digits")
    .max(6, "Pincode must be exactly 6 digits")
    .regex(/^\d{6}$/, "Pincode must contain only numbers"),
})

type PincodeFormData = z.infer<typeof pincodeSchema>

interface PincodeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPincodeSaved?: () => void
}

export function PincodeDialog({
  open,
  onOpenChange,
  onPincodeSaved
}: PincodeDialogProps) {
  const dispatch = useAppDispatch()
  const { error: pincodeError } = usePincode()
  const [validationData, setValidationData] = useState<any>(null)
  const [isValidating, setIsValidating] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm<PincodeFormData>({
    resolver: zodResolver(pincodeSchema),
  })

  const pincodeValue = watch("pincode")

  const handlePincodeCheck = async (data: PincodeFormData) => {
    setIsValidating(true)
    dispatch(setPincodeLoading(true))

    try {
      const response = await checkPincode(data.pincode)

      if (response.success && response.data.available) {
        setValidationData(response.data)
        dispatch(setPincode(data.pincode))
        dispatch(setPincodeData(response.data))
        dispatch(setPincodeError(""))
      } else {
        setValidationData(null)
        dispatch(setPincodeError("Not deliverable"))
      }
    } catch (error: any) {
      console.error("Failed to check pincode:", error)
      setValidationData(null)
      dispatch(setPincodeError("Failed to check pincode. Please try again."))
    } finally {
      setIsValidating(false)
      dispatch(setPincodeLoading(false))
    }
  }

  const handleSavePincode = () => {
    if (validationData) {
      // Pincode is already saved in Redux from the validation step
      onOpenChange(false)
      onPincodeSaved?.()
      // Reset form and validation data
      reset()
      setValidationData(null)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    reset()
    setValidationData(null)
    dispatch(setPincodeError(""))
  }

  const handlePincodeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
    setValue("pincode", value)
    // Clear validation data when user starts typing
    if (validationData) {
      setValidationData(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Enter Delivery Pincode
          </DialogTitle>
          <DialogDescription>
            Please enter your pincode to check delivery availability and charges.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handlePincodeCheck)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pincode">Pincode</Label>
            <Input
              id="pincode"
              type="text"
              placeholder="Enter 6-digit pincode"
              {...register("pincode")}
              onChange={handlePincodeInput}
              maxLength={6}
              className="text-center text-lg tracking-wider"
            />
            {errors.pincode && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <XCircle className="w-4 h-4" />
                {errors.pincode.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isValidating || !pincodeValue || pincodeValue.length !== 6}
          >
            {isValidating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Checking...
              </>
            ) : (
              "Check Pincode"
            )}
          </Button>
        </form>

        {pincodeError && !validationData && (
          <Card className="mt-4 border-red-200 bg-red-50">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-red-600">
                <XCircle className="w-5 h-5" />
                <span className="font-medium">{pincodeError}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {validationData && (
          <Card className="mt-4">
            <CardContent className="pt-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Delivery Available</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{validationData.city}, {validationData.state}</span>
                  </div>

                  <div className="flex items-center gap-2">
                  
                    <span>₹{validationData.delivery_charges} charges</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>{validationData.estimated_delivery_days} days</span>
                  </div>

                  {/* <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-muted-foreground" />
                    <span>COD: {validationData.cod_available ? "Available" : "Not Available"}</span>
                  </div> */}
                </div>

                {(validationData.borzo_standard || validationData.borzo_endOfDay) && (
                  <div className="text-xs text-muted-foreground">
                    Express delivery available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSavePincode}
            disabled={!validationData}
            className="bg-primary hover:bg-primary/90"
          >
            Save & Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
