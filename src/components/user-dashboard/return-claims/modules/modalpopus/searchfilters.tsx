"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface SearchFiltersModalProps {
  trigger?: React.ReactNode
  currentStatus?: string
  currentClaimType?: string
  onApplyFilters?: (status: string, claimType: string) => void
  onResetFilters?: () => void
}

export default function SearchFiltersModal({ 
  trigger, 
  currentStatus = "", 
  currentClaimType = "",
  onApplyFilters,
  onResetFilters 
}: SearchFiltersModalProps) {
  const [returnStatus, setReturnStatus] = useState(currentStatus || "")
  const [claimType, setClaimType] = useState(currentClaimType || "")
  const [isOpen, setIsOpen] = useState(false)

  const returnStatusOptions = [
    "Requested",
    "Validated",
    "Rejected",
    "Shipment_Intiated",
    "Shipment_Completed",
    "Inspection_Started",
    "Inspection_Completed",
    "Intiated_Refund",
    "Refund_Completed",
    "Refund_Failed"
  ]
  const claimTypeOptions = [
    { label: "COD", value: "Manual_Refund" },
    { label: "Razorpay", value: "Original_Payment_Method" }
  ]

  // Helper function to format status display name
  const formatStatusName = (status: string) => {
    return status.replace(/_/g, " ")
  }

  // Sync local state when props change (when modal opens)
  useEffect(() => {
    if (isOpen) {
      setReturnStatus(currentStatus || "")
      setClaimType(currentClaimType || "")
    }
  }, [isOpen, currentStatus, currentClaimType])

  const handleSearch = () => {
    // Apply filters by calling the parent callback
    if (onApplyFilters) {
      onApplyFilters(returnStatus, claimType)
    }
    setIsOpen(false)
  }

  const handleReset = () => {
    setReturnStatus("")
    setClaimType("")
    // Call parent reset callback
    if (onResetFilters) {
      onResetFilters()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="outline"
            className="bg-white border-2 border-gray-200 hover:border-red-300 text-gray-700 font-medium"
          >
            Search Filters
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl w-full mx-4 sm:mx-auto bg-white rounded-2xl border-0 shadow-2xl p-0 overflow-hidden">
        <div className="bg-white p-8">
          <DialogHeader className="mb-8">
            <DialogTitle className="text-lg text-gray-900 font-bold text-left">Search Filters</DialogTitle>
          </DialogHeader>

          <div className="space-y-8">
            {/* Return Status */}
            <div>
              <h3 className="text-base text-gray-900 font-bold mb-4">Return Status</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {returnStatusOptions.map((status) => (
                  <button
                    key={status}
                    onClick={() => setReturnStatus(status)}
                    className={`py-3 px-4 text-sm font-medium transition-all duration-200 focus:outline-none rounded-lg text-center
                      ${returnStatus === status 
                        ? "bg-red-600 text-white shadow-md" 
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }
                    `}
                  >
                    {formatStatusName(status)}
                  </button>
                ))}
              </div>
            </div>

            {/* Claim Type */}
            <div>
              <h3 className="text-base text-gray-900 font-bold mb-4">Return Type</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {claimTypeOptions.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setClaimType(type.value)}
                    className={`py-3 px-4 text-sm font-medium transition-all duration-200 focus:outline-none rounded-lg text-center
                      ${claimType === type.value 
                        ? "bg-red-600 text-white shadow-md" 
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }
                    `}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center mt-10 pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={handleReset}
              className="px-8 py-3 border-2 border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400 font-medium rounded-lg bg-transparent"
            >
              Reset Filters
            </Button>
            <Button
              onClick={handleSearch}
              className="px-12 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Search
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
