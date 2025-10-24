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
        <div className="absolute top-full left-0 z-50 mt-1 w-80 bg-white border rounded-md shadow-lg p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Date Range</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="from-date" className="text-xs">From Date</Label>
                <Input
                  id="from-date"
                  type="date"
                  value={tempFrom}
                  onChange={(e) => setTempFrom(e.target.value)}
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="to-date" className="text-xs">To Date</Label>
                <Input
                  id="to-date"
                  type="date"
                  value={tempTo}
                  onChange={(e) => setTempTo(e.target.value)}
                  className="text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="text-xs"
              >
                Clear
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleApply}
                  className="text-xs"
                >
                  Apply
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
