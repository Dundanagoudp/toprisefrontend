"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface SearchFiltersModalProps {
  trigger?: React.ReactNode
}

export default function SearchFiltersModal({ trigger }: SearchFiltersModalProps) {
  const [returnStatus, setReturnStatus] = useState("Approved")
  const [claimType, setClaimType] = useState("Not Compatible")
  const [isOpen, setIsOpen] = useState(false)

  const returnStatusOptions = ["Pending", "Approved", "Rejected", "In_Progress", "Pickup_Scheduled", "Pickup_Completed", "Completed"]
  const claimTypeOptions = ["Defective", "Wrong Item", "Not Compatible", "Others"]

  const handleSearch = () => {
    console.log("Search filters:", {
      returnStatus,
      claimType,
    })
    setIsOpen(false)
  }

  const handleReset = () => {
    setReturnStatus("Pending")
    setClaimType("Defective")
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
              <div className="flex w-full bg-gray-100 rounded-xl overflow-hidden">
                {returnStatusOptions.map((status) => (
                  <button
                    key={status}
                    onClick={() => setReturnStatus(status)}
                    className={`flex-1 py-3 text-base font-medium transition-all duration-200 focus:outline-none rounded-xl
                      ${returnStatus === status ? "bg-red-600 text-white" : "text-gray-500"}
                    `}
                    style={{ border: 'none', boxShadow: 'none' }}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Claim Type */}
            <div>
              <h3 className="text-base text-gray-900 font-bold mb-4">Claim Type</h3>
              <div className="flex w-full bg-gray-100 rounded-xl overflow-hidden">
                {claimTypeOptions.map((type) => (
                  <button
                    key={type}
                    onClick={() => setClaimType(type)}
                    className={`flex-1 py-3 text-base font-medium transition-all duration-200 focus:outline-none rounded-xl
                      ${claimType === type ? "bg-red-600 text-white" : "text-gray-500"}
                    `}
                    style={{ border: 'none', boxShadow: 'none' }}
                  >
                    {type}
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
