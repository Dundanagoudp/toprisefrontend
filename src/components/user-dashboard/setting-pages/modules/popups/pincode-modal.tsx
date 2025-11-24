"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  MapPin, 
  Truck, 
  Clock, 
  DollarSign, 
  CheckCircle,
  XCircle
} from "lucide-react"
import type { Pincode } from "@/service/pincodeServices"

// Form validation schema
const pincodeSchema = z.object({
  pincode: z.string()
    .min(6, "Pincode must be at least 6 digits")
    .max(6, "Pincode must be exactly 6 digits")
    .regex(/^\d{6}$/, "Pincode must contain only numbers"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  district: z.string().min(1, "District is required"),
  area: z.string().min(1, "Area is required"),
  delivery_available: z.boolean(),
  delivery_charges: z.number()
    .min(0, "Delivery charges must be non-negative")
    .max(10000, "Delivery charges cannot exceed ₹10,000"),
  estimated_delivery_days: z.number()
    .min(1, "Delivery days must be at least 1")
    .max(30, "Delivery days cannot exceed 30"),
  cod_available: z.boolean(),
  status: z.enum(["active", "inactive"]),
  created_by: z.string().optional(),
  updated_by: z.string().optional(),
})

type PincodeFormData = z.infer<typeof pincodeSchema>

interface PincodeModalProps {
  pincode?: Pincode | null
  onSubmit: (data: Omit<Pincode, '_id' | 'created_at' | 'updated_at'>) => void
  onCancel: () => void
}

export function PincodeModal({ pincode, onSubmit, onCancel }: PincodeModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<PincodeFormData>({
    resolver: zodResolver(pincodeSchema),
    defaultValues: {
      pincode: "",
      city: "",
      state: "",
      district: "",
      area: "",
      delivery_available: true,
      delivery_charges: 0,
      estimated_delivery_days: 1,
      cod_available: true,
      status: "active",
      created_by: "Super Admin",
      updated_by: "Super Admin",
    }
  })

  const watchedDeliveryAvailable = watch("delivery_available")
  const watchedCodAvailable = watch("cod_available")

  // Populate form when editing
  useEffect(() => {
    if (pincode) {
      reset({
        pincode: pincode.pincode,
        city: pincode.city,
        state: pincode.state,
        district: pincode.district,
        area: pincode.area,
        delivery_available: pincode.delivery_available,
        delivery_charges: pincode.delivery_charges,
        estimated_delivery_days: pincode.estimated_delivery_days,
        cod_available: pincode.cod_available,
        status: pincode.status,
        created_by: pincode.created_by || "Super Admin",
        updated_by: "Super Admin",
      })
    }
  }, [pincode, reset])

  const onFormSubmit = async (data: PincodeFormData) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
    } catch (error) {
      console.error("Error submitting form:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="w-5 h-5 text-[#C72920]" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pincode">Pincode *</Label>
              <Input
                id="pincode"
                placeholder="Enter 6-digit pincode"
                maxLength={6}
                {...register("pincode")}
                className={errors.pincode ? "border-red-500" : ""}
              />
              {errors.pincode && (
                <p className="text-sm text-red-500">{errors.pincode.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                placeholder="Enter city name"
                {...register("city")}
                className={errors.city ? "border-red-500" : ""}
              />
              {errors.city && (
                <p className="text-sm text-red-500">{errors.city.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                placeholder="Enter state name"
                {...register("state")}
                className={errors.state ? "border-red-500" : ""}
              />
              {errors.state && (
                <p className="text-sm text-red-500">{errors.state.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="district">District *</Label>
              <Input
                id="district"
                placeholder="Enter district name"
                {...register("district")}
                className={errors.district ? "border-red-500" : ""}
              />
              {errors.district && (
                <p className="text-sm text-red-500">{errors.district.message}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="area">Area *</Label>
              <Input
                id="area"
                placeholder="Enter area/locality name"
                {...register("area")}
                className={errors.area ? "border-red-500" : ""}
              />
              {errors.area && (
                <p className="text-sm text-red-500">{errors.area.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Settings */}
      {/* <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Truck className="w-5 h-5 text-[#C72920]" />
            Delivery Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="delivery_available"
              checked={watchedDeliveryAvailable}
              onCheckedChange={(checked) => setValue("delivery_available", checked as boolean)}
            />
            <Label htmlFor="delivery_available" className="flex items-center gap-2">
              <Truck className="w-4 h-4" />
              Delivery Available
            </Label>
          </div>

          {watchedDeliveryAvailable && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="delivery_charges" className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Delivery Charges (₹) *
                </Label>
                <Input
                  id="delivery_charges"
                  type="number"
                  min="0"
                  max="10000"
                  step="1"
                  placeholder="Enter delivery charges"
                  {...register("delivery_charges", { valueAsNumber: true })}
                  className={errors.delivery_charges ? "border-red-500" : ""}
                />
                {errors.delivery_charges && (
                  <p className="text-sm text-red-500">{errors.delivery_charges.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimated_delivery_days" className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Estimated Delivery Days *
                </Label>
                <Input
                  id="estimated_delivery_days"
                  type="number"
                  min="1"
                  max="30"
                  step="1"
                  placeholder="Enter delivery days"
                  {...register("estimated_delivery_days", { valueAsNumber: true })}
                  className={errors.estimated_delivery_days ? "border-red-500" : ""}
                />
                {errors.estimated_delivery_days && (
                  <p className="text-sm text-red-500">{errors.estimated_delivery_days.message}</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card> */}

      {/* Payment & Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CheckCircle className="w-5 h-5 text-[#C72920]" />
            Payment & Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="cod_available"
              checked={watchedCodAvailable}
              onCheckedChange={(checked) => setValue("cod_available", checked as boolean)}
            />
            <Label htmlFor="cod_available" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Cash on Delivery (COD) Available
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select
              value={watch("status")}
              onValueChange={(value) => setValue("status", value as "active" | "inactive")}
            >
              <SelectTrigger className={errors.status ? "border-red-500" : ""}>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Active
                  </div>
                </SelectItem>
                <SelectItem value="inactive">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-600" />
                    Inactive
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="text-sm text-red-500">{errors.status.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-[#C72920] hover:bg-[#C72920]/90 text-white"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              {pincode ? "Updating..." : "Creating..."}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {pincode ? "Update Pincode" : "Create Pincode"}
            </div>
          )}
        </Button>
      </div>
    </form>
  )
}
