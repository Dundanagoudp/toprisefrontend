"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Clock } from "lucide-react"
import { type SlaType } from "@/service/slaViolations-Service"

interface ViewSlaModalProps {
  slaType: SlaType | null
  loading?: boolean
  onClose: () => void
}

export function ViewSlaModal({ slaType, loading = false, onClose }: ViewSlaModalProps) {
  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (!slaType) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No SLA type data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#C72920]" />
            SLA Type Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <p className="text-xs text-gray-500">Name</p>
            <p className="text-sm font-semibold text-gray-900">{slaType.name}</p>
          </div>
          
          <div className="space-y-1 pt-2 border-t">
            <p className="text-xs text-gray-500">Description</p>
            <p className="text-sm font-medium text-gray-900">{slaType.description}</p>
          </div>

          <div className="space-y-1 pt-2 border-t">
            <p className="text-xs text-gray-500">Expected Time</p>
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                <Clock className="w-3 h-3 mr-1" />
                {slaType.expected_hours} minutes
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

