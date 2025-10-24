"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CalendarIcon, X } from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

interface SimpleDatePickerProps {
  value: { from: Date | undefined; to: Date | undefined };
  onChange: (range: { from: Date | undefined; to: Date | undefined }) => void;
  placeholder?: string;
  className?: string;
}

export function SimpleDatePicker({
  value,
  onChange,
  placeholder = "Select date range",
  className,
}: SimpleDatePickerProps) {
  const [fromDate, setFromDate] = useState<string>(
    value.from ? format(value.from, "yyyy-MM-dd") : ""
  );
  const [toDate, setToDate] = useState<string>(
    value.to ? format(value.to, "yyyy-MM-dd") : ""
  );

  const handleFromDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFromDateStr = e.target.value;
    setFromDate(newFromDateStr);

    let newFromDate: Date | undefined = newFromDateStr
      ? parseISO(newFromDateStr)
      : undefined;
    let newToDate: Date | undefined = toDate ? parseISO(toDate) : undefined;

    // If new from date is after to date, set to date to new from date
    if (newFromDate && newToDate && newFromDate > newToDate) {
      newToDate = newFromDate;
      setToDate(newFromDateStr);
    }

    onChange({ from: newFromDate, to: newToDate });
  };

  const handleToDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newToDateStr = e.target.value;
    setToDate(newToDateStr);

    let newFromDate: Date | undefined = fromDate
      ? parseISO(fromDate)
      : undefined;
    let newToDate: Date | undefined = newToDateStr
      ? parseISO(newToDateStr)
      : undefined;

    // If new to date is before from date, set from date to new to date
    if (newFromDate && newToDate && newToDate < newFromDate) {
      newFromDate = newToDate;
      setFromDate(newToDateStr);
    }

    onChange({ from: newFromDate, to: newToDate });
  };

  const handleClear = () => {
    setFromDate("");
    setToDate("");
    onChange({ from: undefined, to: undefined });
  };

  const displayValue =
    value.from && value.to
      ? `${format(value.from, "LLL dd, y")} - ${format(value.to, "LLL dd, y")}`
      : value.from
      ? format(value.from, "LLL dd, y")
      : value.to
      ? format(value.to, "LLL dd, y")
      : placeholder;

  return (
    <div className={cn("flex flex-col space-y-2", className)}>
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Label htmlFor="from-date" className="sr-only">
            From Date
          </Label>
          <Input
            id="from-date"
            type="date"
            value={fromDate}
            onChange={handleFromDateChange}
            className="w-full"
            aria-label="From Date"
          />
        </div>
        <span className="text-gray-500">-</span>
        <div className="relative flex-1">
          <Label htmlFor="to-date" className="sr-only">
            To Date
          </Label>
          <Input
            id="to-date"
            type="date"
            value={toDate}
            onChange={handleToDateChange}
            className="w-full"
            aria-label="To Date"
          />
        </div>
        {(fromDate || toDate) && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className="h-8 w-8 shrink-0"
            aria-label="Clear dates"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
