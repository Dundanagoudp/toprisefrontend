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

interface Order {
  id: string
  date: string
  customer: string
  number: string
  payment: string
  value: string
  skus: number
  dealers: number
  status: "Pending" | "Approved"
}

const mockOrders: Order[] = [
  {
    id: "O56789",
    date: "26 Jun 2025",
    customer: "A. Sharma",
    number: "+91 8523694712",
    payment: "Cod",
    value: "₹1,899",
    skus: 5,
    dealers: 5,
    status: "Pending",
  },
  {
    id: "O56790",
    date: "26 Jun 2025",
    customer: "Maren Dokidis",
    number: "+91 8523694712",
    payment: "UPI",
    value: "₹1,899",
    skus: 15,
    dealers: 15,
    status: "Approved",
  },
  {
    id: "O56789",
    date: "26 Jun 2025",
    customer: "Cristofer Siphron",
    number: "+91 8523694712",
    payment: "Card",
    value: "₹1,899",
    skus: 4,
    dealers: 4,
    status: "Pending",
  },
  {
    id: "O56790",
    date: "26 Jun 2025",
    customer: "Zaire Dorwart",
    number: "+91 8523694712",
    payment: "Cod",
    value: "₹1,899",
    skus: 6,
    dealers: 6,
    status: "Approved",
  },
  {
    id: "O56789",
    date: "26 Jun 2025",
    customer: "Mira Phillips",
    number: "+91 8523694712",
    payment: "UPI",
    value: "₹1,899",
    skus: 8,
    dealers: 8,
    status: "Pending",
  },
  {
    id: "O56790",
    date: "26 Jun 2025",
    customer: "Madelyn Donin",
    number: "+91 8523694712",
    payment: "Card",
    value: "₹1,899",
    skus: 6,
    dealers: 6,
    status: "Approved",
  },
  {
    id: "O56789",
    date: "26 Jun 2025",
    customer: "Cooper Aminoff",
    number: "+91 8523694712",
    payment: "Cod",
    value: "₹1,899",
    skus: 5,
    dealers: 5,
    status: "Pending",
  },
  {
    id: "O56789",
    date: "26 Jun 2025",
    customer: "Nolan Korsgaard",
    number: "+91 8523694712",
    payment: "UPI",
    value: "₹1,899",
    skus: 7,
    dealers: 7,
    status: "Approved",
  },
  {
    id: "O56789",
    date: "26 Jun 2025",
    customer: "Nolan Korsgaard",
    number: "+91 8523694712",
    payment: "Card",
    value: "₹1,899",
    skus: 20,
    dealers: 20,
    status: "Approved",
  },
]

export default function OrdersTable() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("Requests")

  // Filtered orders must be declared before pagination logic
  const filteredOrders = orders.filter(
    (order) =>
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.number.includes(searchTerm),
  )

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setOrders(mockOrders)
      setLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const getStatusBadge = (status: "Pending" | "Approved") => {
    const baseClasses = "px-2 py-1 rounded text-xs font-medium"
    if (status === "Pending") {
      return `${baseClasses} text-yellow-700 bg-yellow-100`
    }
    return `${baseClasses} text-green-700 bg-green-100`
  }

  // Loading Skeleton Component
  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {/* Desktop Table Skeleton */}
      <div className="hidden lg:block">
        <div className="bg-white rounded-lg shadow-sm border border-(neutral-100)-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="w-12 px-4 py-3">
                    <Skeleton className="h-4 w-4" />
                  </th>
                  <th className="text-left px-4 py-3">
                    <Skeleton className="h-4 w-16" />
                  </th>
                  <th className="text-left px-4 py-3">
                    <Skeleton className="h-4 w-12" />
                  </th>
                  <th className="text-left px-4 py-3">
                    <Skeleton className="h-4 w-20" />
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
                  <th className="text-left px-4 py-3">
                    <Skeleton className="h-4 w-16" />
                  </th>
                  <th className="text-left px-4 py-3">
                    <Skeleton className="h-4 w-16" />
                  </th>
                  <th className="text-left px-4 py-3">
                    <Skeleton className="h-4 w-12" />
                  </th>
                  <th className="text-left px-4 py-3">
                    <Skeleton className="h-4 w-16" />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[...Array(8)].map((_, index) => (
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
                      <Skeleton className="h-4 w-8" />
                    </td>
                    <td className="px-4 py-4">
                      <Skeleton className="h-4 w-8" />
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
        {[...Array(6)].map((_, index) => (
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
      <div className="p-4 lg:p-6 bg-(neutral-100)-50 min-h-screen">
        {/* Header Skeleton */}
        <div className="mb-8">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
            <Skeleton className="h-10 w-full sm:w-80" />
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="mb-4">
            <Skeleton className="h-6 w-16 mb-2" />
            <Skeleton className="h-4 w-40" />
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
        <h1 className="text-xl lg:text-2xl font-semibold text-gray-900 mb-6 b2 font-red-hat">Order Management</h1>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
          <div className="relative flex-1 w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search Spare parts"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-gray-200 h-10"
            />
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" className="h-10 px-4 bg-white border-gray-200 flex-1 sm:flex-none">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-32 h-10 bg-white border-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Requests">Requests</SelectItem>
                <SelectItem value="Orders">Orders</SelectItem>
                <SelectItem value="Returns">Returns</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Orders Section Header */}
        <div className="mb-4">
          <h2 className="text-lg lg:text-xl font-semibold text-gray-900">Orders</h2>
          <p className="text-sm text-gray-600">Manage your Orders details</p>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full font-red-hat">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="w-12 px-4 py-3 b3 text-base font-red-hat text-gray-600"> <Checkbox /> </th>
                  <th className="text-left px-4 py-3 b3 text-base font-red-hat text-gray-600">Order ID</th>
                  <th className="text-left px-4 py-3 b3 text-base font-red-hat text-gray-600">Date</th>
                  <th className="text-left px-4 py-3 b3 text-base font-red-hat text-gray-600">Customer</th>
                  <th className="text-left px-4 py-3 b3 text-base font-red-hat text-gray-600">Number</th>
                  <th className="text-left px-4 py-3 b3 text-base font-red-hat text-gray-600">Payment</th>
                  <th className="text-left px-4 py-3 b3 text-base font-red-hat text-gray-600">Value</th>
                  <th className="text-left px-4 py-3 b3 text-base font-red-hat text-gray-600">No.of Skus</th>
                  <th className="text-left px-4 py-3 b3 text-base font-red-hat text-gray-600">Dealers</th>
                  <th className="text-left px-4 py-3 b3 text-base font-red-hat text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 b3 text-base font-red-hat text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedOrders.map((order, index) => (
                  <tr key={`${order.id}-${index}`} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 b3 text-base font-red-hat"><Checkbox /></td>
                    <td className="px-4 py-4 b3 text-base font-red-hat text-gray-900 font-medium">{order.id}</td>
                    <td className="px-4 py-4 b3 text-base font-red-hat text-gray-600">{order.date}</td>
                    <td className="px-4 py-4 b3 text-base font-red-hat text-gray-900">{order.customer}</td>
                    <td className="px-4 py-4 b3 text-base font-red-hat text-gray-600">{order.number}</td>
                    <td className="px-4 py-4 b3 text-base font-red-hat text-gray-600">{order.payment}</td>
                    <td className="px-4 py-4 b3 text-base font-red-hat font-medium text-gray-900">{order.value}</td>
                    <td className="px-4 py-4 b3 text-base font-red-hat text-gray-600">{order.skus}</td>
                    <td className="px-4 py-4 b3 text-base font-red-hat text-gray-600">{order.dealers}</td>
                    <td className="px-4 py-4 b3 text-base font-red-hat"><span className={getStatusBadge(order.status)}>{order.status}</span></td>
                    <td className="px-4 py-4 b3 text-base font-red-hat">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="h-9 px-4 rounded-lg border border-neutral-300 b3 text-base font-red-hat text-gray-900 flex items-center gap-1 shadow-sm hover:border-red-100 focus:ring-2 focus:ring-red-100">
                            {order.status === "Pending" ? "Edit" : "View"}
                            <ChevronDown className="h-4 w-4 ml-1" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 rounded-lg shadow-lg border border-neutral-200 p-1 font-red-hat b3 text-base">
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
                  onClick={e => { e.preventDefault(); setCurrentPage(p => Math.max(1, p - 1)) }}
                  aria-disabled={currentPage === 1}
                  tabIndex={currentPage === 1 ? -1 : 0}
                />
              </PaginationItem>
              {[...Array(totalPages)].map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    href="#"
                    isActive={currentPage === i + 1}
                    onClick={e => { e.preventDefault(); setCurrentPage(i + 1) }}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={e => { e.preventDefault(); setCurrentPage(p => Math.min(totalPages, p + 1)) }}
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
        {paginatedOrders.map((order, index) => (
          <Card key={`${order.id}-${index}`} className="border border-gray-200 hover:border-red-200 transition-colors">
            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Header Row */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <Checkbox />
                    <span className="font-medium text-gray-900 b3 text-base font-red-hat">{order.id}</span>
                  </div>
                  <span className={getStatusBadge(order.status)}>{order.status}</span>
                </div>
                {/* Customer Info */}
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-base text-gray-600 b3 font-red-hat">Customer:</span>
                    <span className="text-base font-medium text-gray-900 b3 font-red-hat">{order.customer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-base text-gray-600 b3 font-red-hat">Date:</span>
                    <span className="text-base text-gray-900 b3 font-red-hat">{order.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-base text-gray-600 b3 font-red-hat">Number:</span>
                    <span className="text-base text-gray-900 b3 font-red-hat">{order.number}</span>
                  </div>
                </div>
                {/* Order Details */}
                <div className="grid grid-cols-2 gap-2 text-base">
                  <div className="flex justify-between">
                    <span className="text-gray-600 b3 font-red-hat">Payment:</span>
                    <span className="text-gray-900 b3 font-red-hat">{order.payment}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 b3 font-red-hat">Value:</span>
                    <span className="font-medium text-gray-900 b3 font-red-hat">{order.value}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 b3 font-red-hat">SKUs:</span>
                    <span className="text-gray-900 b3 font-red-hat">{order.skus}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 b3 font-red-hat">Dealers:</span>
                    <span className="text-gray-900 b3 font-red-hat">{order.dealers}</span>
                  </div>
                </div>
                {/* Actions */}
                <div className="flex justify-end pt-2 border-t border-gray-100">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-9 px-4 rounded-lg border border-neutral-300 b3 text-base font-red-hat text-gray-900 flex items-center gap-1 shadow-sm hover:border-red-100 focus:ring-2 focus:ring-red-100">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 rounded-lg shadow-lg border border-neutral-200 p-1 font-red-hat b3 text-base">
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
                  onClick={e => { e.preventDefault(); setCurrentPage(p => Math.max(1, p - 1)) }}
                  aria-disabled={currentPage === 1}
                  tabIndex={currentPage === 1 ? -1 : 0}
                />
              </PaginationItem>
              {[...Array(totalPages)].map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    href="#"
                    isActive={currentPage === i + 1}
                    onClick={e => { e.preventDefault(); setCurrentPage(i + 1) }}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={e => { e.preventDefault(); setCurrentPage(p => Math.min(totalPages, p + 1)) }}
                  aria-disabled={currentPage === totalPages}
                  tabIndex={currentPage === totalPages ? -1 : 0}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>

      {/* Empty State */}
      {filteredOrders.length === 0 && !loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <p className="text-gray-500 text-lg mb-2">No orders found</p>
          <p className="text-gray-400 text-sm">Try adjusting your search terms</p>
        </div>
      )}
    </div>
  )
}
