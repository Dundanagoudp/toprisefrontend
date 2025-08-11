"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import { Filter, SlidersHorizontal, X, Search, ChevronDown } from "lucide-react"
import DynamicButton from "@/components/common/button/button"

interface GlobalFiltersProps {
  type: "employee" | "dealer"
  search: string
  onSearchChange: (search: string) => void
  currentRole: string
  onRoleChange: (role: string) => void
  currentStatus: string
  onStatusChange: (status: string) => void
  onResetFilters: () => void
}

const EMPLOYEE_ROLES = ["Sales", "Fulfillment-Staff", "General"] as const
const EMPLOYEE_STATUSES = ["Active", "Inactive"] as const

const DEALER_ROLES = ["admin", "user", "dealer"] as const
const DEALER_STATUSES = ["active", "inactive"] as const

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === "undefined") return true
    return window.matchMedia(query).matches
  })
  useEffect(() => {
    const media = window.matchMedia(query)
    const listener = () => setMatches(media.matches)
    media.addEventListener("change", listener)
    return () => media.removeEventListener("change", listener)
  }, [query])
  return matches
}

export default function GlobalFilters({
  type,
  search,
  onSearchChange,
  currentRole,
  onRoleChange,
  currentStatus,
  onStatusChange,
  onResetFilters,
}: GlobalFiltersProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement | null>(null)

  // Draft state for panel
  const [draftSearch, setDraftSearch] = useState(search)
  const [draftRole, setDraftRole] = useState(currentRole)
  const [draftStatus, setDraftStatus] = useState(currentStatus)

  // Sync draft when opened
  useEffect(() => {
    if (open) {
      setDraftSearch(search)
      setDraftRole(currentRole)
      setDraftStatus(currentStatus)
    }
  }, [open, search, currentRole, currentStatus])

  const roles = type === "employee" ? EMPLOYEE_ROLES : DEALER_ROLES
  const statuses = type === "employee" ? EMPLOYEE_STATUSES : DEALER_STATUSES

  const appliedFiltersCount = useMemo(
    () => (search ? 1 : 0) + (currentRole !== "all" ? 1 : 0) + (currentStatus !== "all" ? 1 : 0),
    [search, currentRole, currentStatus]
  )

  const clearAll = () => {
    onSearchChange("")
    onRoleChange("all")
    onStatusChange("all")
  }

  const applyDraft = () => {
    onSearchChange(draftSearch)
    onRoleChange(draftRole)
    onStatusChange(draftStatus)
    setOpen(false)
  }

  // Close panel on ESC
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  // Simple outside click close for desktop popover
  const popoverRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    if (!open || !isDesktop) return
    const onClick = (e: MouseEvent) => {
      if (!popoverRef.current) return
      if (
        !popoverRef.current.contains(e.target as Node) &&
        !triggerRef.current?.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [open, isDesktop])

  const getRoleDisplayName = (role: string) =>
    type === "employee" && role === "Fulfillment-Staff" ? "Fulfillment" : role

  const getStatusDisplayName = (status: string) =>
    status.charAt(0).toUpperCase() + status.slice(1)

  return (
    <div className="space-y-4">
      <header className="flex flex-col md:flex-row gap-3 md:items-center">
        <div className="flex items-center gap-3">
          <SlidersHorizontal className="size-5 text-foreground/80" aria-hidden="true" />
          <h2 className="text-xl font-semibold">
            {type === "employee" ? "Employee" : "Dealer"} Filters
          </h2>
        </div>
        <div className="md:ml-auto">
          <button
            ref={triggerRef}
            onClick={() => setOpen((o) => !o)}
            className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
            aria-expanded={open}
          >
            <Filter className="size-4" /> Filters
            {appliedFiltersCount > 0 ? ` (${appliedFiltersCount})` : ""}
          </button>
        </div>
      </header>

      {/* Inline controls (always visible) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1 max-w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            placeholder={`Search ${type === "employee" ? "employees" : "dealers"}...`}
            className="pl-10 bg-gray-50 border border-gray-200 rounded-md h-9 w-full outline-none focus:ring-2 focus:ring-gray-200"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {/* Role select */}
        <div className="relative">
          <SelectLike
            label="Role"
            value={currentRole}
            onChange={onRoleChange}
            options={["all", ...roles]}
            display={(v) => (v === "all" ? "All Roles" : getRoleDisplayName(v))}
          />
        </div>

        {/* Status select */}
        <div className="relative">
          <SelectLike
            label="Status"
            value={currentStatus}
            onChange={onStatusChange}
            options={["all", ...statuses]}
            display={(v) => (v === "all" ? "All Statuses" : getStatusDisplayName(v))}
          />
        </div>

        <DynamicButton
          variant="outline"
          customClassName="flex items-center gap-2 border-gray-300 hover:bg-gray-50"
          onClick={onResetFilters}
          icon={<Filter className="h-4 w-4" />}
          text="Reset"
        />
      </div>

      {/* Applied chips */}
      <div className="flex flex-wrap items-center gap-2">
        {search && (
          <Chip label={`Search: ${search}`} onRemove={() => onSearchChange("")} />
        )}
        {currentRole !== "all" && (
          <Chip
            label={`Role: ${getRoleDisplayName(currentRole)}`}
            onRemove={() => onRoleChange("all")}
          />
        )}
        {currentStatus !== "all" && (
          <Chip
            label={`Status: ${getStatusDisplayName(currentStatus)}`}
            onRemove={() => onStatusChange("all")}
          />
        )}
        {appliedFiltersCount > 0 && (
          <button
            onClick={clearAll}
            className="text-sm px-2 py-1 rounded-md hover:bg-muted inline-flex items-center"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Panel */}
      {open && (
        isDesktop ? (
          <div
            ref={popoverRef}
            className="relative"
          >
            <div className="absolute right-0 z-50 w-[340px] rounded-md border bg-white shadow-md">
              <div className="p-4 space-y-4">
                <PanelContent
                  type={type}
                  draftSearch={draftSearch}
                  setDraftSearch={setDraftSearch}
                  draftRole={draftRole}
                  setDraftRole={setDraftRole}
                  draftStatus={draftStatus}
                  setDraftStatus={setDraftStatus}
                />
                <div className="flex gap-2 pt-2">
                  <button
                    className="flex-1 h-9 rounded-md bg-black text-white text-sm"
                    onClick={applyDraft}
                  >
                    Apply
                  </button>
                  <button
                    className="flex-1 h-9 rounded-md border text-sm"
                    onClick={() => {
                      setDraftSearch("")
                      setDraftRole("all")
                      setDraftStatus("all")
                    }}
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="fixed inset-0 z-50">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setOpen(false)}
            />
            <div className="absolute inset-x-0 bottom-0 max-h-[85vh] rounded-t-xl bg-white shadow-lg">
              <div className="p-4 border-b">
                <h3 className="text-base font-semibold">Filters</h3>
              </div>
              <div className="px-4 pb-4 pt-3 overflow-y-auto max-h-[65vh]">
                <PanelContent
                  type={type}
                  draftSearch={draftSearch}
                  setDraftSearch={setDraftSearch}
                  draftRole={draftRole}
                  setDraftRole={setDraftRole}
                  draftStatus={draftStatus}
                  setDraftStatus={setDraftStatus}
                />
              </div>
              <div className="p-4 border-t flex gap-2">
                <button className="flex-1 h-10 rounded-md bg-black text-white" onClick={applyDraft}>
                  Apply
                </button>
                <button
                  className="flex-1 h-10 rounded-md border"
                  onClick={() => {
                    setDraftSearch("")
                    setDraftRole("all")
                    setDraftStatus("all")
                  }}
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  )
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1 text-xs">
      <span>{label}</span>
      <button
        className="inline-flex items-center rounded-sm hover:bg-gray-200"
        aria-label="Remove"
        onClick={onRemove}
      >
        <X className="size-3.5" />
      </button>
    </span>
  )
}

function SelectLike<T extends string>({
  label,
  value,
  onChange,
  options,
  display,
}: {
  label: string
  value: T
  onChange: (v: T) => void
  options: T[]
  display: (v: T) => string
}) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!open) return
      if (!containerRef.current) return
      if (!containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onDoc)
    return () => document.removeEventListener("mousedown", onDoc)
  }, [open])

  const current = display(value)

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        className="inline-flex items-center justify-between gap-2 h-9 min-w-[8rem] px-3 rounded-md border text-sm hover:bg-gray-50"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="truncate">{current || label}</span>
        <ChevronDown className="size-4" />
      </button>
      {open && (
        <div className="absolute z-40 mt-1 w-full rounded-md border bg-white shadow">
          <ul className="max-h-56 overflow-auto py-1 text-sm">
            {options.map((opt) => (
              <li key={opt}>
                <button
                  className={`w-full text-left px-3 py-2 hover:bg-gray-50 ${
                    value === opt ? "bg-gray-100" : ""
                  }`}
                  onClick={() => {
                    onChange(opt)
                    setOpen(false)
                  }}
                >
                  {display(opt)}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function PanelContent(props: {
  type: "employee" | "dealer"
  draftSearch: string
  setDraftSearch: (v: string) => void
  draftRole: string
  setDraftRole: (v: string) => void
  draftStatus: string
  setDraftStatus: (v: string) => void
}) {
  const { type, draftSearch, setDraftSearch, draftRole, setDraftRole, draftStatus, setDraftStatus } = props
  const roles = type === "employee" ? EMPLOYEE_ROLES : DEALER_ROLES
  const statuses = type === "employee" ? EMPLOYEE_STATUSES : DEALER_STATUSES

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Search</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            placeholder={`Search ${type === "employee" ? "employees" : "dealers"}...`}
            className="pl-10 bg-white border border-gray-200 rounded-md h-9 w-full outline-none focus:ring-2 focus:ring-gray-200"
            value={draftSearch}
            onChange={(e) => setDraftSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Collapsible Role */}
      <Collapsible title="Role">
        <div className="rounded-md border">
          <ul className="max-h-40 overflow-auto p-1">
            <li>
              <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 hover:bg-muted">
                <input
                  type="radio"
                  name="role"
                  checked={draftRole === "all"}
                  onChange={() => setDraftRole("all")}
                />
                <span className="text-sm">All Roles</span>
              </label>
            </li>
            {roles.map((r) => (
              <li key={r}>
                <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 hover:bg-muted">
                  <input
                    type="radio"
                    name="role"
                    checked={draftRole === r}
                    onChange={() => setDraftRole(r)}
                  />
                  <span className="text-sm">{type === "employee" && r === "Fulfillment-Staff" ? "Fulfillment" : r}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      </Collapsible>

      {/* Collapsible Status */}
      <Collapsible title="Status">
        <div className="rounded-md border">
          <ul className="max-h-40 overflow-auto p-1">
            <li>
              <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 hover:bg-muted">
                <input
                  type="radio"
                  name="status"
                  checked={draftStatus === "all"}
                  onChange={() => setDraftStatus("all")}
                />
                <span className="text-sm">All Statuses</span>
              </label>
            </li>
            {statuses.map((s) => (
              <li key={s}>
                <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 hover:bg-muted">
                  <input
                    type="radio"
                    name="status"
                    checked={draftStatus === s}
                    onChange={() => setDraftStatus(s)}
                  />
                  <span className="text-sm">{s.charAt(0).toUpperCase() + s.slice(1)}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      </Collapsible>
    </div>
  )
}

function Collapsible({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true)
  return (
    <div>
      <button
        className="w-full flex items-center justify-between py-2 text-sm font-medium"
        onClick={() => setOpen((o) => !o)}
      >
        {title}
        <ChevronDown className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="pt-1">{children}</div>}
    </div>
  )
}
