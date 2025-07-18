"use client"
import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getAllDealers } from "@/service/dealerServices"
import type { Dealer, Category } from "@/types/dealer-types"
import { toast } from "@/hooks/use-toast"
import { getAllCategories } from "@/service/dealerServices"
import { Skeleton } from "@/components/ui/skeleton"
import { useRef } from "react"

export default function Dealertable() {
  const [currentPage, setCurrentPage] = useState(1)
  const [dealers, setDealers] = useState<Dealer[]>([])
  const [loading, setLoading] = useState(true)
  const itemsPerPage = 10
  const totalItems = dealers.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const paginatedData = dealers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [visibleCount, setVisibleCount] = useState(10)
  const [isFetchingMore, setIsFetchingMore] = useState(false)
  const loaderRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    fetchDealers()
    fetchCategories()
  }, [])

  useEffect(() => {
    if (!loaderRef.current) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && !isFetchingMore && visibleCount < dealers.length) {
          setIsFetchingMore(true)
          setTimeout(() => {
            setVisibleCount((prev) => Math.min(prev + 10, dealers.length))
            setIsFetchingMore(false)
          }, 800) // Simulate network delay for smooth shimmer
        }
      },
      { threshold: 1 }
    )
    observer.observe(loaderRef.current)
    return () => observer.disconnect()
  }, [loading, isFetchingMore, visibleCount, dealers.length])

  const fetchDealers = async () => {
    try {
      setLoading(true)
      const response = await getAllDealers()
      if (response.success) {
        setDealers(response.data)
      }
    } catch (error) {
      console.error("Failed to fetch dealers:", error)
      toast({
        title: "Error",
        description: "Failed to fetch dealers",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await getAllCategories()
      if (response.success) {
        setCategories(response.data)
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error)
      toast({
        title: "Error",
        description: "Failed to fetch categories",
        variant: "destructive",
      })
    }
  }

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page)
  }

  const getStatusBadge = (isActive: boolean) => {
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}
      >
        {isActive ? "Active" : "Inactive"}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm">S. No.</th>
              <th className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm">
                <Checkbox />
              </th>
              <th className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm">Legal Name</th>
              <th className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm">Trade Name</th>
              <th className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm">Email/Phone</th>
              <th className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm">Contact Person</th>
              <th className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm">Role</th>
              <th className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm">Status</th>
              <th className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm">Category</th>
              <th className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm"></th>
            </tr>
          </thead>
          <tbody>
            {[...Array(10)].map((_, idx) => (
              <tr key={idx} className="border-b border-gray-100">
                <td className="p-3 md:p-4"><Skeleton className="h-4 w-8" /></td>
                <td className="p-3 md:p-4"><Skeleton className="h-4 w-4 rounded" /></td>
                <td className="p-3 md:p-4"><Skeleton className="h-4 w-24" /></td>
                <td className="p-3 md:p-4"><Skeleton className="h-4 w-24" /></td>
                <td className="p-3 md:p-4"><Skeleton className="h-4 w-28" /></td>
                <td className="p-3 md:p-4"><Skeleton className="h-4 w-24" /></td>
                <td className="p-3 md:p-4"><Skeleton className="h-4 w-16" /></td>
                <td className="p-3 md:p-4"><Skeleton className="h-4 w-14" /></td>
                <td className="p-3 md:p-4"><Skeleton className="h-4 w-20" /></td>
                <td className="p-3 md:p-4"><Skeleton className="h-4 w-8" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[800px]">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm">S. No.</th>
            <th className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm">
              <Checkbox />
            </th>
            <th className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm">Legal Name</th>
            <th className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm">Trade Name</th>
            <th className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm">Email/Phone</th>
            <th className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm">Contact Person</th>
            <th className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm">Role</th>
            <th className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm">Status</th>
            <th className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm">Category</th>
            <th className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm"></th>
          </tr>
        </thead>
        <tbody>
          {dealers.slice(0, visibleCount).map((dealer, index) => (
            <tr key={dealer._id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="p-3 md:p-4 text-gray-600 text-sm">{index + 1}</td>
              <td className="p-3 md:p-4">
                <Checkbox />
              </td>
              <td className="p-3 md:p-4 text-gray-600 text-sm">{dealer.legal_name}</td>
              <td className="p-3 md:p-4 font-medium text-gray-900 text-sm">{dealer.trade_name}</td>
              <td className="p-3 md:p-4 text-gray-600 text-sm">
                <div>
                  <div>{dealer.user_id.email}</div>
                  <div className="text-xs text-gray-500">{dealer.user_id.phone_Number}</div>
                </div>
              </td>
              <td className="p-3 md:p-4 text-gray-600 text-sm">
                <div>
                  <div>{dealer.contact_person.name}</div>
                  <div className="text-xs text-gray-500">{dealer.contact_person.email}</div>
                </div>
              </td>
              <td className="p-3 md:p-4 text-gray-600 text-sm">{dealer.user_id.role}</td>
              <td className="p-3 md:p-4">{getStatusBadge(dealer.is_active)}</td>
              <td className="p-3 md:p-4 text-gray-600 text-sm">
                <div className="flex flex-wrap gap-1">
                  {dealer.categories_allowed.map((categoryId, idx) => {
                    const category = categories.find(cat => cat._id === categoryId)
                    return (
                      <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {category ? category.category_name : categoryId}
                      </span>
                    )
                  })}
                </div>
              </td>
              <td className="p-3 md:p-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => router.push(`/user/dashboard/user/edit-dealer/${dealer._id}`)}>
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push(`/user/dashboard/user/dealerview/${dealer._id}`)}>
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
          {isFetchingMore &&
            [...Array(3)].map((_, idx) => (
              <tr key={"skeleton-" + idx} className="border-b border-gray-100">
                <td className="p-3 md:p-4"><Skeleton className="h-4 w-8" /></td>
                <td className="p-3 md:p-4"><Skeleton className="h-4 w-4 rounded" /></td>
                <td className="p-3 md:p-4"><Skeleton className="h-4 w-24" /></td>
                <td className="p-3 md:p-4"><Skeleton className="h-4 w-24" /></td>
                <td className="p-3 md:p-4"><Skeleton className="h-4 w-28" /></td>
                <td className="p-3 md:p-4"><Skeleton className="h-4 w-24" /></td>
                <td className="p-3 md:p-4"><Skeleton className="h-4 w-16" /></td>
                <td className="p-3 md:p-4"><Skeleton className="h-4 w-14" /></td>
                <td className="p-3 md:p-4"><Skeleton className="h-4 w-20" /></td>
                <td className="p-3 md:p-4"><Skeleton className="h-4 w-8" /></td>
              </tr>
            ))}
        </tbody>
      </table>
      <div ref={loaderRef} className="h-8 flex items-center justify-center">
        {visibleCount < dealers.length && !isFetchingMore && (
          <span className="text-gray-400 text-xs animate-pulse">Scroll to load more...</span>
        )}
        {visibleCount >= dealers.length && (
          <span className="text-gray-400 text-xs">No more dealers to load.</span>
        )}
      </div>
    </div>
  )
}
