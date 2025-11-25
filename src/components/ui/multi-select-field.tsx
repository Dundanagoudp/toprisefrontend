"use client"

import { useState, useRef, useEffect } from "react"
import { X, ChevronDown, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

export interface MultiSelectOption {
  value: string
  label: string
  category?: string
}

interface MultiSelectFieldProps {
  options: MultiSelectOption[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  searchPlaceholder?: string
  className?: string
  disabled?: boolean
  maxHeight?: string
}

export function MultiSelectField({
  options,
  selected,
  onChange,
  placeholder = "Select fields...",
  searchPlaceholder = "Search fields...",
  className,
  disabled = false,
  maxHeight = "300px",
}: MultiSelectFieldProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [open])

  // Filter options based on search
  const filteredOptions = search
    ? options.filter(
        (option) =>
          option.label.toLowerCase().includes(search.toLowerCase()) ||
          option.value.toLowerCase().includes(search.toLowerCase())
      )
    : options

  // Group options by category if available
  const groupedOptions = filteredOptions.reduce((acc, option) => {
    const category = option.category || "Other"
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(option)
    return acc
  }, {} as Record<string, MultiSelectOption[]>)

  const handleToggle = (value: string) => {
    if (disabled) return
    
    const newSelected = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value]
    
    onChange(newSelected)
  }

  const handleRemove = (value: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (disabled) return
    onChange(selected.filter((v) => v !== value))
  }

  const handleSelectAll = () => {
    if (disabled) return
    if (selected.length === options.length) {
      onChange([])
    } else {
      onChange(options.map((o) => o.value))
    }
  }

  const getOptionLabel = (value: string) => {
    return options.find((o) => o.value === value)?.label || value
  }

  return (
    <div ref={dropdownRef} className={cn("relative w-full", className)}>
      {/* Selected items display */}
      <div
        className={cn(
          "min-h-[42px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer",
          "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          disabled && "cursor-not-allowed opacity-50",
          open && "ring-2 ring-ring ring-offset-2"
        )}
        onClick={() => !disabled && setOpen(!open)}
      >
        <div className="flex flex-wrap gap-1.5 items-center">
          {selected.length === 0 ? (
            <span className="text-muted-foreground">{placeholder}</span>
          ) : (
            selected.map((value) => (
              <Badge
                key={value}
                variant="secondary"
                className="bg-red-100 text-red-800 hover:bg-red-200 pr-1"
              >
                {getOptionLabel(value)}
                <button
                  type="button"
                  onClick={(e) => handleRemove(value, e)}
                  className="ml-1 rounded-sm hover:bg-red-300 p-0.5"
                  disabled={disabled}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))
          )}
          <ChevronDown
            className={cn(
              "ml-auto h-4 w-4 shrink-0 opacity-50 transition-transform",
              open && "transform rotate-180"
            )}
          />
        </div>
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 w-full mt-2 rounded-md border bg-popover shadow-md">
          {/* Search input */}
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-9"
              />
            </div>
          </div>

          {/* Select all option */}
          <div className="p-2 border-b bg-muted/50">
            <div
              className="flex items-center space-x-2 cursor-pointer hover:bg-accent rounded px-2 py-1.5"
              onClick={handleSelectAll}
            >
              <Checkbox
                checked={selected.length === options.length && options.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm font-medium">
                Select All ({selected.length}/{options.length})
              </span>
            </div>
          </div>

          {/* Options list */}
          <div className="max-h-[300px] overflow-y-auto p-1">
            {Object.keys(groupedOptions).length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No fields found
              </div>
            ) : (
              Object.entries(groupedOptions).map(([category, categoryOptions]) => (
                <div key={category} className="mb-2">
                  {/* Category header */}
                  {category !== "Other" && (
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {category}
                    </div>
                  )}
                  {/* Options */}
                  {categoryOptions.map((option) => (
                    <div
                      key={option.value}
                      className="flex items-center space-x-2 cursor-pointer hover:bg-accent rounded px-2 py-2"
                      onClick={() => handleToggle(option.value)}
                    >
                      <Checkbox
                        checked={selected.includes(option.value)}
                        onCheckedChange={() => handleToggle(option.value)}
                      />
                      <span className="text-sm flex-1">{option.label}</span>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
