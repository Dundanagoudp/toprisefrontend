"use client"

import { useState, useEffect } from "react"
import { Search, Filter, ChevronDown, Edit, Eye, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination"

interface ReturnClaim {
  returnId: string
  orderId: string
  product: string
  customer: string
  date: string
  type: string
  status: "Pending" | "Approved"
}

const mockReturnClaims: ReturnClaim[] = [
  {
    returnId: "RI12345",
    orderId: "O56789",
    product: "Brake Pad (Bosch)",
    customer: "John Doe",
    date: "2025-07-08",
    type: "Defective",
    status: "Pending",
  },
  {
    returnId: "RI12345",
    orderId: "O56790",
    product: "Brake Pad (Bosch)",
    customer: "Jane Smith",
    date: "2025-07-08",
    type: "Wrong Item",
    status: "Approved",
  },
  {
    returnId: "RI12345",
    orderId: "O56789",
    product: "Engine Oil Filter",
    customer: "John Doe",
    date: "2025-07-08",
    type: "Defective",
    status: "Pending",
  },
  {
    returnId: "RI12345",
    orderId: "O56790",
    product: "Brake Pad (Bosch)",
    customer: "John Doe",
    date: "2025-07-08",
    type: "Others",
    status: "Approved",
  },
  {
    returnId: "RI12345",
    orderId: "O56789",
    product: "Engine Oil Filter",
    customer: "John Doe",
    date: "2025-07-08",
    type: "Wrong Item",
    status: "Pending",
  },
  {
    returnId: "RI12345",
    orderId: "O56790",
    product: "Brake Pad (Bosch)",
    customer: "John Doe",
    date: "2025-07-08",
    type: "Not Compatible",
    status: "Approved",
  },
  {
    returnId: "RI12345",
    orderId: "O56789",
    product: "Defective",
    customer: "John Doe",
    date: "2025-07-08",
    type: "Defective",
    status: "Pending",
  },
  {
    returnId: "RI12345",
    orderId: "O56789",
    product: "Defective",
    customer: "John Doe",
    date: "2025-07-08",
    type: "Defective",
    status: "Approved",
  },
]

export default function Returnclaims() {
  const [returnClaims, setReturnClaims] = useState<ReturnClaim[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState("All") // Changed from filterType to filterRole as per image

  const filteredReturnClaims = returnClaims
    .filter(
      (claim) =>
        claim.returnId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.product.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .filter(
      (claim) => filterRole === "All" || claim.type === filterRole, // Filter by type/role
    )

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8 // Adjusted items per page to match image
  const totalPages = Math.ceil(filteredReturnClaims.length / itemsPerPage)
  const paginatedReturnClaims = filteredReturnClaims.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setReturnClaims(mockReturnClaims)
      setLoading(false)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  const getStatusBadge = (status: "Pending" | "Approved") => {
    const baseClasses = "px-2 py-1 rounded text-xs font-medium"
    if (status === "Pending") {
      return `${baseClasses} text-red-700 bg-red-100` // Changed to red
    }
    return `${baseClasses} text-green-700 bg-green-100` // Approved stays green
  }

  // Loading Skeleton Component
  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {/* Desktop Table Skeleton */}
      <div className="hidden lg:block">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {/* <th className="w-12 px-4 py-3">
                    <Skeleton className="h-4 w-4" />
                  </th> */}
                  <th className="text-left px-4 py-3">
                    <Skeleton className="h-4 w-16" />
                  </th>
                  <th className="text-left px-4 py-3">
                    <Skeleton className="h-4 w-16" />
                  </th>
                  <th className="text-left px-4 py-3">
                    <Skeleton className="h-4 w-20" />
                  </th>
                  <th className="text-left px-4 py-3">
                    <Skeleton className="h-4 w-20" />
                  </th>
                  <th className="text-left px-4 py-3">
                    <Skeleton className="h-4 w-12" />
                  </th>
                  <th className="text-left px-4 py-3">
                    <Skeleton className="h-4 w-16" />
                  </th>
                  <th className="text-left px-4 py-3">
                    <Skeleton className="h-4 w-16" />
                  </th>
                  <th className="text-left px-4 py-3">
                    <Skeleton className="h-4 w-12" />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[...Array(itemsPerPage)].map((_, index) => (
                  <tr key={index}>
                    <td className="px-4 py-4">
                      <Skeleton className="h-4 w-4" />
                    </td>
                    <td className="px-4 py-4">
                      <Skeleton className="h-4 w-16" />
                    </td>
                    <td className="px-4 py-4">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="px-4 py-4">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="px-4 py-4">
                      <Skeleton className="h-4 w-28" />
                    </td>
                    <td className="px-4 py-4">
                      <Skeleton className="h-4 w-12" />
                    </td>
                    <td className="px-4 py-4">
                      <Skeleton className="h-4 w-16" />
                    </td>
                    <td className="px-4 py-4">
                      <Skeleton className="h-6 w-16" />
                    </td>
                    <td className="px-4 py-4">
                      <Skeleton className="h-8 w-16" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* Mobile/Tablet Card Skeleton */}
      <div className="lg:hidden space-y-4">
        {[...Array(itemsPerPage)].map((_, index) => (
          <Card key={index} className="p-4">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-6 w-16" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-8 w-20" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="p-4 lg:p-6 bg-neutral-50 min-h-screen">
        {/* Header Skeleton */}
        <div className="mb-8">
          <Skeleton className="h-8 w-64 mb-6" />
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
            <Skeleton className="h-10 w-full sm:w-80" />
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" /> {/* For Review Return button */}
          </div>
        </div>
        <LoadingSkeleton />
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-6 bg-(neutral-100)-50 min-h-screen font-red-hat">
      {/* Header */}
      <div className="mb-8">
        {/* Search and Filters + Review Return Button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          {/* Left: Search and Filters */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 flex-1">
            <div className="relative flex-1 w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search Order ID"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white border-gray-200 h-10"
              />
            </div>
            <Button variant="outline" className="h-10 px-4 bg-white border-gray-200 w-full sm:w-auto">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-full sm:w-32 h-10 bg-white border-gray-200">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="Defective">Defective</SelectItem>
                <SelectItem value="Wrong Item">Wrong Item</SelectItem>
                <SelectItem value="Others">Others</SelectItem>
                <SelectItem value="Not Compatible">Not Compatible</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Right: Review Return Button */}
          <div className="flex w-full sm:w-auto justify-end">
            <Button className="flex items-center gap-2 border-red-400 text-red-600 bg-red-50 hover:bg-red-100 hover:border-red-500 px-6 py-2 rounded-lg font-medium text-base h-10 shadow-none focus:ring-2 focus:ring-red-100">
              Review Return
            </Button>
          </div>
        </div>
      </div>
      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full font-red-hat">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="w-12 px-4 py-3 b3 text-base font-red-hat text-gray-600">
                    {" "}
                    <Checkbox />{" "}
                  </th>
                  <th className="text-left px-4 py-3 b3 text-base font-red-hat text-gray-600">Return ID</th>
                  <th className="text-left px-4 py-3 b3 text-base font-red-hat text-gray-600">Order ID</th>
                  <th className="text-left px-4 py-3 b3 text-base font-red-hat text-gray-600">Product</th>
                  <th className="text-left px-4 py-3 b3 text-base font-red-hat text-gray-600">Customer</th>
                  <th className="text-left px-4 py-3 b3 text-base font-red-hat text-gray-600">Date</th>
                  <th className="text-left px-4 py-3 b3 text-base font-red-hat text-gray-600">Type</th>
                  <th className="text-left px-4 py-3 b3 text-base font-red-hat text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 b3 text-base font-red-hat text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedReturnClaims.map((claim, index) => (
                  <tr key={`${claim.returnId}-${index}`} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 b3 text-base font-red-hat">
                      <Checkbox />
                    </td>
                    <td className="px-4 py-4 b3 text-base font-red-hat text-gray-900 font-medium">{claim.returnId}</td>
                    <td className="px-4 py-4 b3 text-base font-red-hat text-gray-600">{claim.orderId}</td>
                    <td className="px-4 py-4 b3 text-base font-red-hat text-gray-900">{claim.product}</td>
                    <td className="px-4 py-4 b3 text-base font-red-hat text-gray-600">{claim.customer}</td>
                    <td className="px-4 py-4 b3 text-base font-red-hat text-gray-600">{claim.date}</td>
                    <td className="px-4 py-4 b3 text-base font-red-hat text-gray-600">{claim.type}</td>
                    <td className="px-4 py-4 b3 text-base font-red-hat">
                      <span className={getStatusBadge(claim.status)}>{claim.status}</span>
                    </td>
                    <td className="px-4 py-4 b3 text-base font-red-hat">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-9 px-4 rounded-lg border border-neutral-300 b3 text-base font-red-hat text-gray-900 flex items-center gap-1 shadow-sm hover:border-red-100 focus:ring-2 focus:ring-red-100 bg-transparent"
                          >
                            {claim.status === "Pending" ? "Edit" : "View"}
                            <ChevronDown className="h-4 w-4 ml-1" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-40 rounded-lg shadow-lg border border-neutral-200 p-1 font-red-hat b3 text-base"
                        >
                          <DropdownMenuItem className="b3 text-base font-red-hat flex items-center gap-2 rounded hover:bg-neutral-100">
                            <Edit className="h-4 w-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="b3 text-base font-red-hat flex items-center gap-2 rounded hover:bg-neutral-100">
                            <Eye className="h-4 w-4 mr-2" /> View
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <Pagination className="mt-6">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    setCurrentPage((p) => Math.max(1, p - 1))
                  }}
                  aria-disabled={currentPage === 1}
                  tabIndex={currentPage === 1 ? -1 : 0}
                />
              </PaginationItem>
              {[...Array(totalPages)].map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    href="#"
                    isActive={currentPage === i + 1}
                    onClick={(e) => {
                      e.preventDefault()
                      setCurrentPage(i + 1)
                    }}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }}
                  aria-disabled={currentPage === totalPages}
                  tabIndex={currentPage === totalPages ? -1 : 0}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
      {/* Mobile/Tablet Card View */}
      <div className="lg:hidden space-y-4 font-red-hat">
        {paginatedReturnClaims.map((claim, index) => (
          <Card
            key={`${claim.returnId}-${index}`}
            className="border border-gray-200 hover:border-red-200 transition-colors"
          >
            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Header Row */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <Checkbox />
                    <span className="font-medium text-gray-900 b3 text-base font-red-hat">{claim.returnId}</span>
                  </div>
                  <span className={getStatusBadge(claim.status)}>{claim.status}</span>
                </div>
                {/* Claim Info */}
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-base text-gray-600 b3 font-red-hat">Order ID:</span>
                    <span className="text-base font-medium text-gray-900 b3 font-red-hat">{claim.orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-base text-gray-600 b3 font-red-hat">Product:</span>
                    <span className="text-base text-gray-900 b3 font-red-hat">{claim.product}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-base text-gray-600 b3 font-red-hat">Customer:</span>
                    <span className="text-base text-gray-900 b3 font-red-hat">{claim.customer}</span>
                  </div>
                </div>
                {/* Return Details */}
                <div className="grid grid-cols-2 gap-2 text-base">
                  <div className="flex justify-between">
                    <span className="text-gray-600 b3 font-red-hat">Date:</span>
                    <span className="text-gray-900 b3 font-red-hat">{claim.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 b3 font-red-hat">Type:</span>
                    <span className="font-medium text-gray-900 b3 font-red-hat">{claim.type}</span>
                  </div>
                </div>
                {/* Actions */}
                <div className="flex justify-end pt-2 border-t border-gray-100">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 px-4 rounded-lg border border-neutral-300 b3 text-base font-red-hat text-gray-900 flex items-center gap-1 shadow-sm hover:border-red-100 focus:ring-2 focus:ring-red-100 bg-transparent"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-40 rounded-lg shadow-lg border border-neutral-200 p-1 font-red-hat b3 text-base"
                    >
                      <DropdownMenuItem className="b3 text-base font-red-hat flex items-center gap-2 rounded hover:bg-neutral-100">
                        <Edit className="h-4 w-4 mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="b3 text-base font-red-hat flex items-center gap-2 rounded hover:bg-neutral-100">
                        <Eye className="h-4 w-4 mr-2" /> View
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {/* Pagination Controls for Mobile */}
        {totalPages > 1 && (
          <Pagination className="mt-6">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    setCurrentPage((p) => Math.max(1, p - 1))
                  }}
                  aria-disabled={currentPage === 1}
                  tabIndex={currentPage === 1 ? -1 : 0}
                />
              </PaginationItem>
              {[...Array(totalPages)].map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    href="#"
                    isActive={currentPage === i + 1}
                    onClick={(e) => {
                      e.preventDefault()
                      setCurrentPage(i + 1)
                    }}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }}
                  aria-disabled={currentPage === totalPages}
                  tabIndex={currentPage === totalPages ? -1 : 0}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
      {/* Empty State */}
      {filteredReturnClaims.length === 0 && !loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <p className="text-gray-500 text-lg mb-2">No returns or claims found</p>
          <p className="text-gray-400 text-sm">Try adjusting your search terms or filters</p>
        </div>
      )}
    </div>
  )
}
