"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  MapPin, 
  Truck, 
  Package, 
  CheckCircle2, 
  XCircle
} from "lucide-react"
import { type Pincode } from "@/service/pincodeServices"

interface PincodeViewModalProps {
  pincode: Pincode | null
  loading?: boolean
  onClose: () => void
}

export function PincodeViewModal({ pincode, loading = false, onClose }: PincodeViewModalProps) {
  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (!pincode) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No pincode data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Location Information */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#C72920]" />
            Location Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-gray-500">Pincode</p>
              <p className="text-sm font-semibold text-gray-900">{pincode.pincode}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-500">City</p>
              <p className="text-sm font-medium text-gray-900">{pincode.city}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-500">State</p>
              <p className="text-sm font-medium text-gray-900">{pincode.state}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-500">District</p>
              <p className="text-sm font-medium text-gray-900">{pincode.district}</p>
            </div>
          </div>
          <div className="pt-2 border-t">
            <p className="text-xs text-gray-500 mb-1">Area</p>
            <p className="text-sm font-medium text-gray-900">{pincode.area}</p>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Partners */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#C72920]" />
            Delivery Partners
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium">ShipRocket</span>
            </div>
            <Badge 
              variant={pincode.shipRocket_availability ? "default" : "secondary"}
              className={pincode.shipRocket_availability ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-gray-100 text-gray-600"}
            >
              {pincode.shipRocket_availability ? (
                <><CheckCircle2 className="w-3 h-3 mr-1" /> Available</>
              ) : (
                <><XCircle className="w-3 h-3 mr-1" /> Not Available</>
              )}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-700">Borzo Delivery</p>
            <div className="flex items-center justify-between py-2 pl-4 bg-gray-50 rounded">
              <span className="text-sm">Standard</span>
              <Badge 
                variant={pincode.borzo_availability.standard ? "default" : "secondary"}
                className={pincode.borzo_availability.standard ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-gray-100 text-gray-600"}
              >
                {pincode.borzo_availability.standard ? (
                  <><CheckCircle2 className="w-3 h-3 mr-1" /> Available</>
                ) : (
                  <><XCircle className="w-3 h-3 mr-1" /> Not Available</>
                )}
              </Badge>
            </div>
            <div className="flex items-center justify-between py-2 pl-4 bg-gray-50 rounded">
              <span className="text-sm">End of Day</span>
              <Badge 
                variant={pincode.borzo_availability.endOfDay ? "default" : "secondary"}
                className={pincode.borzo_availability.endOfDay ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-gray-100 text-gray-600"}
              >
                {pincode.borzo_availability.endOfDay ? (
                  <><CheckCircle2 className="w-3 h-3 mr-1" /> Available</>
                ) : (
                  <><XCircle className="w-3 h-3 mr-1" /> Not Available</>
                )}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        <Button
          onClick={onClose}
          className="bg-[#C72920] hover:bg-[#C72920]/90 text-white"
        >
          Close
        </Button>
      </div>
    </div>
  )
}
