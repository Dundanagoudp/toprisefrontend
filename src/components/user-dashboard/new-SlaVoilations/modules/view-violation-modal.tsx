"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { FileText, Clock, User, MessageSquare } from "lucide-react"
import type { SlaViolation } from "@/types/sla-violation-types"

interface ViewViolationModalProps {
  violation: SlaViolation | null
  loading?: boolean
  onClose: () => void
}

export function ViewViolationModal({
  violation,
  loading = false,
  onClose,
}: ViewViolationModalProps) {
  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (!violation) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No violation data available</p>
      </div>
    )
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getOrderId = (orderId: SlaViolation["order_id"]) => {
    if (typeof orderId === "string") return orderId
    return orderId?.orderId || "N/A"
  }

  return (
    <div className="space-y-6">
      {/* Violation Details */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#C72920]" />
            Violation Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-gray-500">Order ID</p>
              <p className="text-sm font-semibold text-gray-900">{getOrderId(violation.order_id)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-500">SKU</p>
              <p className="text-sm font-medium text-gray-900 font-mono">{violation.sku}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-500">Dealer ID</p>
              <p className="text-sm font-medium text-gray-900 font-mono">
                {violation.dealer_id.substring(0, 16)}...
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-500">Violation Minutes</p>
              <p className="text-sm font-semibold text-red-600">
                {Math.round(violation.violation_minutes * 100) / 100} min
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-500">Status</p>
              <Badge
                className={
                  violation.status === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : violation.status === "remarked"
                    ? "bg-blue-100 text-blue-800"
                    : violation.status === "resolved"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }
              >
                {violation.status.charAt(0).toUpperCase() + violation.status.slice(1)}
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-500">Created At</p>
              <p className="text-sm text-gray-600">{formatDate(violation.created_at)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#C72920]" />
            Notes & Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Resolve Notes */}
          {violation.notes?.resolve && (
            <div className="border-l-4 border-green-500 pl-4 py-2 bg-green-50 rounded-r">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-green-600" />
                <span className="text-sm font-semibold text-green-900">Resolved</span>
              </div>
              {violation.notes.resolve.notes && (
                <p className="text-sm text-gray-700 mb-2">{violation.notes.resolve.notes}</p>
              )}
              <div className="flex items-center gap-4 text-xs text-gray-600">
                {violation.notes.resolve.added_by && (
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>{violation.notes.resolve.added_by.substring(0, 8)}...</span>
                  </div>
                )}
                {violation.notes.resolve.added_at && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(violation.notes.resolve.added_at)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Remark Notes */}
          {violation.notes?.remark && (
            <div className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 rounded-r">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-900">Remark</span>
              </div>
              {violation.notes.remark.notes && (
                <p className="text-sm text-gray-700 mb-2">{violation.notes.remark.notes}</p>
              )}
              <div className="flex items-center gap-4 text-xs text-gray-600">
                {violation.notes.remark.added_by && (
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>{violation.notes.remark.added_by.substring(0, 8)}...</span>
                  </div>
                )}
                {violation.notes.remark.added_at && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(violation.notes.remark.added_at)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Closed Notes */}
          {violation.notes?.closed && (
            <div className="border-l-4 border-gray-500 pl-4 py-2 bg-gray-50 rounded-r">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-semibold text-gray-900">Closed</span>
              </div>
              {violation.notes.closed.notes && (
                <p className="text-sm text-gray-700 mb-2">{violation.notes.closed.notes}</p>
              )}
              <div className="flex items-center gap-4 text-xs text-gray-600">
                {violation.notes.closed.added_by && (
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>{violation.notes.closed.added_by.substring(0, 8)}...</span>
                  </div>
                )}
                {violation.notes.closed.added_at && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(violation.notes.closed.added_at)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {!violation.notes?.resolve && !violation.notes?.remark && !violation.notes?.closed && (
            <div className="text-center py-4 text-gray-500 text-sm">
              No notes available for this violation
            </div>
          )}
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

