"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import {
  Search,
  Filter,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  FileText,
  X,
} from "lucide-react"
import { useToast } from "@/components/ui/toast"
import { auditLogService } from "@/service/audit-log-service"
import type {
  ActionAuditLog,
  ActionAuditLogFilters,
} from "@/types/audit-log-types"
import { CustomDatePicker } from "@/components/ui/custom-date-picker"
import DynamicPagination from "@/components/common/pagination/DynamicPagination"

export default function Auditlogspage() {
  const { showToast } = useToast()
  const [auditLogs, setAuditLogs] = useState<ActionAuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  const [availableModules, setAvailableModules] = useState<string[]>([])
  const [availableRoles, setAvailableRoles] = useState<string[]>([])

  const itemsPerPage = 10

  const [filters, setFilters] = useState<ActionAuditLogFilters>({
    search: "",
    sortBy: "createdAt",
    sortOrder: "desc",
    page: 1,
    limit: itemsPerPage,
  })

  const [dateRange, setDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({ from: undefined, to: undefined })

  const fetchAuditLogs = async () => {
    setLoading(true)
    try {
      // Build clean filters - only include non-empty values
      const cleanFilters: ActionAuditLogFilters = {
        page: filters.page,
        limit: filters.limit,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      }

      // Add search if it has a value
      if (filters.search && filters.search.trim()) {
        cleanFilters.search = filters.search.trim()
      }

      // Add module filter if it has a value
      if (filters.module && filters.module.trim()) {
        cleanFilters.module = filters.module.trim()
      }

      // Add role filter if it has a value
      if (filters.role && filters.role.trim()) {
        cleanFilters.role = filters.role.trim()
      }

      // Add date filters
      if (dateRange.from) {
        cleanFilters.startDate = dateRange.from.toISOString().split("T")[0]
      }
      if (dateRange.to) {
        cleanFilters.endDate = dateRange.to.toISOString().split("T")[0]
      }

      const response = await auditLogService.getActionAuditLogs(cleanFilters)
      const fetchedLogs = response.data || []
      setAuditLogs(fetchedLogs)
      setTotalCount(response.pagination.total || 0)
      setTotalPages(response.pagination.totalPages || 1)

      // Extract unique modules and roles from fetched logs
      const uniqueModules = Array.from(
        new Set(fetchedLogs.map((log) => log.actionModule).filter(Boolean))
      ).sort()
      const uniqueRoles = Array.from(
        new Set(fetchedLogs.map((log) => log.role).filter(Boolean))
      ).sort()

      // Update available modules and roles (merge with existing to accumulate all unique values)
      setAvailableModules((prev) => {
        const merged = Array.from(new Set([...prev, ...uniqueModules]))
        return merged.sort()
      })
      setAvailableRoles((prev) => {
        const merged = Array.from(new Set([...prev, ...uniqueRoles]))
        return merged.sort()
      })
    } catch (error) {
      console.error("Error fetching audit logs:", error)
      showToast("Failed to load audit logs. Please refresh the page.", "error")
    } finally {
      setLoading(false)
    }
  }

  // Fetch all available modules and roles on initial load
  useEffect(() => {
    const fetchAllModulesAndRoles = async () => {
      try {
        // Fetch without filters to get all available modules and roles
        const response = await auditLogService.getActionAuditLogs({
          page: 1,
          limit: 1000, // Fetch a large number to get all unique values
        })
        const allLogs = response.data || []
        
        const uniqueModules = Array.from(
          new Set(allLogs.map((log) => log.actionModule).filter(Boolean))
        ).sort()
        const uniqueRoles = Array.from(
          new Set(allLogs.map((log) => log.role).filter(Boolean))
        ).sort()

        setAvailableModules(uniqueModules)
        setAvailableRoles(uniqueRoles)
      } catch (error) {
        console.error("Error fetching all modules and roles:", error)
      }
    }

    fetchAllModulesAndRoles()
  }, [])

  useEffect(() => {
    fetchAuditLogs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, dateRange])

  const handleSearch = (query: string) => {
    setFilters((prev) => ({
      ...prev,
      search: query,
      page: 1,
    }))
    setCurrentPage(1)
  }

  const handleSort = (column: string) => {
    setFilters((prev) => {
      if (prev.sortBy === column) {
        const newOrder = prev.sortOrder === "asc" ? "desc" : "asc"
        return { ...prev, sortOrder: newOrder }
      } else {
        return { ...prev, sortBy: column, sortOrder: "asc" }
      }
    })
  }

  const getSortIcon = (column: string) => {
    if (filters.sortBy !== column) {
      return <ArrowUpDown className="w-3 h-3 ml-1 text-gray-400" />
    }
    return filters.sortOrder === "asc" ? (
      <ArrowUp className="w-3 h-3 ml-1 text-[#C72920]" />
    ) : (
      <ArrowDown className="w-3 h-3 ml-1 text-[#C72920]" />
    )
  }

  const handleModuleChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      module: value === "all" ? undefined : value,
      page: 1,
    }))
    setCurrentPage(1)
  }

  const handleRoleChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      role: value === "all" ? undefined : value,
      page: 1,
    }))
    setCurrentPage(1)
  }

  const handleDateRangeChange = (range: {
    from: Date | undefined
    to: Date | undefined
  }) => {
    setDateRange(range)
    setFilters((prev) => ({ ...prev, page: 1 }))
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    setFilters((prev) => ({ ...prev, page }))
  }

  const clearFilters = () => {
    setFilters({
      search: "",
      sortBy: "createdAt",
      sortOrder: "desc",
      page: 1,
      limit: itemsPerPage,
    })
    setDateRange({ from: undefined, to: undefined })
    setCurrentPage(1)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }


  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Action Audit Logs</h2>
          <p className="text-gray-600 text-sm">
            Track and monitor all user actions across the system
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by action name, user email, or phone..."
              value={filters.search || ""}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 h-10"
            />
          </div>

          {/* Desktop Filters */}
          <div className="hidden lg:flex items-center gap-2">
            <Select
              value={filters.module || "all"}
              onValueChange={handleModuleChange}
            >
              <SelectTrigger className="w-[180px] h-10">
                <SelectValue placeholder="Module" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modules</SelectItem>
                {availableModules.map((module) => (
                  <SelectItem key={module} value={module}>
                    {module}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.role || "all"}
              onValueChange={handleRoleChange}
            >
              <SelectTrigger className="w-[180px] h-10">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {availableRoles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <CustomDatePicker
              value={dateRange}
              onChange={handleDateRangeChange}
              placeholder="Date Range"
              className="w-[250px]"
            />

            {(filters.module || filters.role || dateRange.from || dateRange.to) && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="h-10"
              >
                <X className="w-4 h-4 mr-2" />
                Clear
              </Button>
            )}
          </div>

          {/* Mobile Filter Button */}
          <Sheet open={showFilters} onOpenChange={setShowFilters}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                className="lg:hidden flex items-center gap-2 h-10"
              >
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="space-y-6 mt-6">
                <div className="space-y-2">
                  <Label>Module</Label>
                  <Select
                    value={filters.module || "all"}
                    onValueChange={handleModuleChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Module" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Modules</SelectItem>
                      {availableModules.map((module) => (
                        <SelectItem key={module} value={module}>
                          {module}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select
                    value={filters.role || "all"}
                    onValueChange={handleRoleChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      {availableRoles.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Date Range</Label>
                  <CustomDatePicker
                    value={dateRange}
                    onChange={handleDateRangeChange}
                    placeholder="Pick a date range"
                  />
                </div>

                {(filters.module || filters.role || dateRange.from || dateRange.to) && (
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="w-full"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Clear Filters
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-2 text-sm text-gray-600 px-2">
            <FileText className="w-4 h-4" />
            <span className="font-medium">{totalCount} logs</span>
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="w-5 h-5 text-[#C72920]" />
            Action Audit Logs ({totalCount})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          ) : auditLogs.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No audit logs found
              </h3>
              <p className="text-gray-600">
                {filters.search || filters.module || filters.role || dateRange.from
                  ? "Try adjusting your search criteria."
                  : "No audit logs to display."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead
                      className="cursor-pointer hover:bg-gray-100 py-3 px-4 font-semibold"
                      onClick={() => handleSort("actionName")}
                    >
                      <div className="flex items-center">
                        Action Name
                        {getSortIcon("actionName")}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-100 py-3 px-4 font-semibold"
                      onClick={() => handleSort("actionModule")}
                    >
                      <div className="flex items-center">
                        Module
                        {getSortIcon("actionModule")}
                      </div>
                    </TableHead>
                    <TableHead className="py-3 px-4 font-semibold">User</TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-100 py-3 px-4 font-semibold"
                      onClick={() => handleSort("role")}
                    >
                      <div className="flex items-center">
                        Role
                        {getSortIcon("role")}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-100 py-3 px-4 font-semibold"
                      onClick={() => handleSort("actionTime")}
                    >
                      <div className="flex items-center">
                        Action Time
                        {getSortIcon("actionTime")}
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.map((log) => (
                    <TableRow key={log._id} className="hover:bg-gray-50">
                      <TableCell className="font-medium py-4 px-4">
                        <span className="text-sm">{log.actionName}</span>
                      </TableCell>
                      <TableCell className="py-4 px-4">
                        <span className="text-sm">{log.actionModule}</span>
                      </TableCell>
                      <TableCell className="py-4 px-4">
                        <div className="flex flex-col">
                          <span className="text-sm text-gray-900">
                            {log.userId?.email || "N/A"}
                          </span>
                          {log.userId?.phone_Number && (
                            <span className="text-xs text-gray-500">
                              {log.userId.phone_Number}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-4">
                        <span className="text-sm">{log.role}</span>
                      </TableCell>
                      <TableCell className="py-4 px-4">
                        <span className="text-sm text-gray-600">
                          {formatDate(log.actionTime)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      <DynamicPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        totalItems={totalCount}
        itemsPerPage={itemsPerPage}
        showItemsInfo={true}
        itemLabel="logs"
      />
    </div>
  )
}
