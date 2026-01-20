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
  borzo_availability: z.object({
    standard: z.boolean(),
    endOfDay: z.boolean(),
  }),
  shipRocket_availability: z.boolean(),
  delivery_available: z.boolean(),
  delivery_charges: z.number(),
  estimated_delivery_days: z.number(),
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
      borzo_availability: {
        standard: false,
        endOfDay: false,
      },
      shipRocket_availability: false,
      delivery_available: true,
      delivery_charges: 0,
      estimated_delivery_days: 3,
      cod_available: true,
      status: "active",
      created_by: "Super Admin",
      updated_by: "Super Admin",
    }
  })


  // Populate form when editing
  useEffect(() => {
    if (pincode) {
      reset({
        pincode: pincode.pincode,
        city: pincode.city,
        state: pincode.state,
        district: pincode.district,
        area: pincode.area,
        borzo_availability: pincode.borzo_availability || {
          standard: false,
          endOfDay: false,
        },
        shipRocket_availability: pincode.shipRocket_availability || false,
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

      {/* Delivery Partners */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Truck className="w-5 h-5 text-[#C72920]" />
            Delivery Partners
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* COD Section */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">COD</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="cod_available"
                checked={watch("cod_available")}
                onCheckedChange={(checked) => setValue("cod_available", checked as boolean)}
              />
              <Label htmlFor="cod_available">
                COD Available
              </Label>
            </div>
          </div>
          {/* ShipRocket Section */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">ShipRocket</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="shipRocket_availability"
                checked={watch("shipRocket_availability")}
                onCheckedChange={(checked) => setValue("shipRocket_availability", checked as boolean)}
              />
              <Label htmlFor="shipRocket_availability">
                ShipRocket Available
              </Label>
            </div>
          </div>

          {/* Borzo Delivery Section */}
          <div className="space-y-3 pt-3 border-t">
            <Label className="text-sm font-semibold">Borzo Delivery</Label>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="borzo_standard"
                checked={watch("borzo_availability.standard")}
                onCheckedChange={(checked) => 
                  setValue("borzo_availability.standard", checked as boolean)
                }
              />
              <Label htmlFor="borzo_standard">
                Borzo Standard
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="borzo_endOfDay"
                checked={watch("borzo_availability.endOfDay")}
                onCheckedChange={(checked) => 
                  setValue("borzo_availability.endOfDay", checked as boolean)
                }
              />
              <Label htmlFor="borzo_endOfDay">
                Borzo End of Day
              </Label>
            </div>
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
