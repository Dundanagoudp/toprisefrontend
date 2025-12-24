"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar as CalendarIcon, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface CustomDatePickerProps {
  value?: { from: Date | undefined; to: Date | undefined }
  onChange: (range: { from: Date | undefined; to: Date | undefined }) => void
  placeholder?: string
  className?: string
}

export function CustomDatePicker({
  value,
  onChange,
  placeholder = "Pick a date range",
  className
}: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [tempFrom, setTempFrom] = useState<string>("")
  const [tempTo, setTempTo] = useState<string>("")

  const formatDate = (date: Date | undefined) => {
    if (!date) return ""
    return date.toISOString().split('T')[0]
  }

  const handleApply = () => {
    const fromDate = tempFrom ? new Date(tempFrom) : undefined
    const toDate = tempTo ? new Date(tempTo) : undefined
    
    // Validate dates
    if (fromDate && toDate && fromDate > toDate) {
      // Swap dates if from is after to
      onChange({ from: toDate, to: fromDate })
    } else {
      onChange({ from: fromDate, to: toDate })
    }
    setIsOpen(false)
  }

  const handleClear = () => {
    setTempFrom("")
    setTempTo("")
    onChange({ from: undefined, to: undefined })
    setIsOpen(false)
  }

  const handleOpen = () => {
    setTempFrom(formatDate(value?.from))
    setTempTo(formatDate(value?.to))
    setIsOpen(true)
  }

  const displayText = () => {
    if (value?.from && value?.to) {
      return `${value.from.toLocaleDateString()} - ${value.to.toLocaleDateString()}`
    } else if (value?.from) {
      return `From ${value.from.toLocaleDateString()}`
    } else if (value?.to) {
      return `To ${value.to.toLocaleDateString()}`
    }
    return placeholder
  }

  return (
    <div className={cn("relative", className)}>
      <Button
        variant="outline"
        className={cn(
          "w-full justify-start text-left font-normal",
          !value?.from && "text-muted-foreground"
        )}
        onClick={handleOpen}
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {displayText()}
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 sm:left-auto sm:right-0 z-50 mt-2 w-[calc(100vw-2rem)] sm:w-[380px] md:w-[400px] max-w-full mx-auto sm:mx-0 bg-white border border-gray-200 rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <Label className="text-base font-semibold text-gray-900">Date Range</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-6 w-6 p-0 hover:bg-gray-100"
            >
              <X className="h-4 w-4 text-gray-500" />
            </Button>
          </div>

          {/* Date Inputs */}
          <div className="p-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="from-date" className="text-sm font-medium text-gray-700">
                  From Date
                </Label>
                <Input
                  id="from-date"
                  type="date"
                  value={tempFrom}
                  onChange={(e) => setTempFrom(e.target.value)}
                  className="text-sm h-10 pr-3"
                  placeholder="dd-mm-yyyy"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="to-date" className="text-sm font-medium text-gray-700">
                  To Date
                </Label>
                <Input
                  id="to-date"
                  type="date"
                  value={tempTo}
                  onChange={(e) => setTempTo(e.target.value)}
                  className="text-sm h-10 pr-3"
                  placeholder="dd-mm-yyyy"
                />
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="text-sm text-gray-700 hover:text-gray-900 hover:bg-transparent"
            >
              Clear
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-sm"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleApply}
                className="text-sm bg-[#C72920] hover:bg-[#C72920]/90 text-white"
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
