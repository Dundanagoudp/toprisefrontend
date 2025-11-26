"use client"

import { Bell, X, CheckCheck, AlertCircle, Info, AlertTriangle, Eye } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  getAllNotifications,
  markAsRead as markAsReadAPI,
  markAllAsRead as markAllAsReadAPI,
} from "@/service/notificationServices"
import type { Notification } from "@/types/notification-types"
import { getUserIdFromToken } from "@/utils/auth"

type NotificationsPanelProps = {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onCountUpdate?: (count: number) => void
}

type FilterType = "all" | "read" | "unread"

const getNotificationIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case "error":
      return <AlertCircle className="w-4 h-4 text-red-500" />
    case "warning":
      return <AlertTriangle className="w-4 h-4 text-yellow-500" />
    case "info":
    default:
      return <Info className="w-4 h-4 text-blue-500" />
  }
}

// Replace undesirable literal placeholders coming from backend templates
// like "undefined" or "null" with a friendly fallback.
const sanitizeText = (text?: string | null) => {
  if (!text) return "—"
  return text
    .replace(/\bundefined\b/gi, "system")
    .replace(/\bnull\b/gi, "system")
    .replace(/\s{2,}/g, " ")
    .trim()
}

// Function to handle notification navigation
const handleNotificationClick = (notification: Notification, router: any) => {
  // Mark notification as read when clicked
  if (!notification.markAsRead) {
    markAsReadAPI(notification._id)
  }

  // Navigate based on notification type and webRoute
  if (notification.webRoute) {
    // Use the webRoute from the notification
    router.push(notification.webRoute)
  } else {
    // Fallback navigation based on notification type
    const type = notification.notification_type?.toLowerCase()
    
    switch (type) {
      case 'order':
      case 'order_created':
      case 'order_updated':
      case 'order_cancelled':
        router.push('/user/dashboard/order')
        break
      case 'product':
      case 'product_created':
      case 'product_updated':
      case 'product_approved':
      case 'product_rejected':
        router.push('/user/dashboard/product')
        break
      case 'inventory':
      case 'inventory_low':
      case 'inventory_updated':
        router.push('/user/dashboard/inventory')
        break
      case 'user':
      case 'user_created':
      case 'user_updated':
        router.push('/user/dashboard/user-management')
        break
      case 'dealer':
      case 'dealer_created':
      case 'dealer_updated':
        router.push('/user/dashboard/dealer')
        break
      case 'sla':
      case 'sla_violation':
        router.push('/user/dashboard/sla-violations')
        break
      case 'return':
      case 'return_request':
        router.push('/user/dashboard/return-claims')
        break
      case 'purchase_request':
        router.push('/user/dashboard/purchase-requests')
        break
      case 'catalogue':
      case 'catalogue_created':
      case 'catalogue_updated':
        router.push('/user/dashboard/catalogues')
        break
      case 'content_management':
      case 'brand':
      case 'model':
      case 'variant':
      case 'category':
      case 'subcategory':
        router.push('/user/dashboard/content-management')
        break
      case 'reports':
        router.push('/user/dashboard/reports')
        break
      case 'settings':
        router.push('/user/dashboard/settings')
        break
      case 'ticket':
      case 'support_ticket':
      case 'ticket_created':
      case 'ticket_updated':
      case 'ticket_resolved':
        router.push('/user/dashboard/tickets')
        break
      default:
        // Default to dashboard if no specific route is found
        router.push('/user/dashboard')
        break
    }
  }
}

export function NotificationsPanel({ open, onOpenChange, onCountUpdate }: NotificationsPanelProps) {
  const router = useRouter()
  const [internalOpen, setInternalOpen] = useState(false)
  const isOpen = open !== undefined ? open : internalOpen
  const setIsOpen = onOpenChange ?? setInternalOpen
  const [notificationList, setNotificationList] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterType>("all")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [allTotalCount, setAllTotalCount] = useState<number>(0)

  // Show only three items at a time and let the rest scroll
  const VISIBLE_ITEMS = 3
  const ITEM_APPROX_HEIGHT_PX = 96 // approx row height in pixels
  const LIST_MAX_HEIGHT = VISIBLE_ITEMS * ITEM_APPROX_HEIGHT_PX

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      setError(null)
      const userId = getUserIdFromToken()
      if (!userId) {
        setError("Authentication required")
        setNotificationList([])
        onCountUpdate?.(0)
        return
      }

      const response = await getAllNotifications(userId)

      if (response.success) {
        // Filter out deleted notifications and sort from latest to oldest
        const filteredNotifications = (response.data || []).filter((n) => !n.isUserDeleted)
        const sortedNotifications = filteredNotifications.sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime()
          const dateB = new Date(b.createdAt).getTime()
          return dateB - dateA // Latest first
        })
        setNotificationList(sortedNotifications)
        setSelectedIds(new Set())
        
        // Calculate counts for badge display
        const unread = filteredNotifications.filter((n) => !n.markAsRead).length
        setAllTotalCount(filteredNotifications.length)
        onCountUpdate?.(unread)
      }
    } catch (err) {
      setError("Failed to load notifications")
      console.error("Error fetching notifications:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchNotifications()
    }
  }, [isOpen])

  const markAsRead = async (id: string) => {
    try {
      const response = await markAsReadAPI(id)
      if (response.success) {
        // Update the notification in the local state immediately for real-time feedback
        setNotificationList(prev => {
          const updated = prev.map(notification => 
            notification._id === id 
              ? { ...notification, markAsRead: true, markAsReadAt: new Date().toISOString() }
              : notification
          )
          // Calculate the updated unread count from the new state
          const updatedUnreadCount = updated.filter(n => !n.markAsRead).length
          onCountUpdate?.(updatedUnreadCount)
          return updated
        })
      }
    } catch (err) {
      console.error("Error marking notification as read:", err)
    }
  }


  const markAllAsRead = async () => {
    try {
      const userId = getUserIdFromToken()
      if (!userId) {
        setError("Authentication required")
        return
      }
      
      console.log("Marking all as read for userId:", userId)
      const response = await markAllAsReadAPI(userId)
      console.log("Mark all as read response:", response)
      
      if (response.success) {
        // Refetch notifications from backend to ensure data is synced
        await fetchNotifications()
      } else {
        setError(response.message || "Failed to mark all as read")
        console.error("Mark all as read failed:", response)
      }
    } catch (err) {
      console.error("Error marking all as read:", err)
      setError("Failed to mark all as read. Please try again.")
    }
  }


  const handleCheckboxChange = (notification: Notification) => {
    // Only select/deselect; do not mark as read automatically via checkbox.
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(notification._id)) {
        next.delete(notification._id)
      } else {
        next.add(notification._id)
      }
      return next
    })
  }

  const markSelectedAsRead = async () => {
    try {
      const idsToMark = Array.from(selectedIds)
      if (idsToMark.length === 0) return
      const responses = await Promise.all(idsToMark.map((id) => markAsReadAPI(id)))
      
      // Check if all requests were successful
      if (responses.every(res => res.success)) {
        // Update all selected notifications to read status immediately for real-time feedback
        setNotificationList(prev => {
          const updated = prev.map(notification => 
            idsToMark.includes(notification._id)
              ? { ...notification, markAsRead: true, markAsReadAt: new Date().toISOString() }
              : notification
          )
          // Calculate the updated unread count from the new state
          const updatedUnreadCount = updated.filter(n => !n.markAsRead).length
          onCountUpdate?.(updatedUnreadCount)
          return updated
        })
        // Clear selection
        setSelectedIds(new Set())
      }
    } catch (err) {
      console.error("Error marking selected as read:", err)
    }
  }



  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  // Filter notifications based on current filter
  const filteredNotifications = useMemo(() => {
    if (!notificationList.length) return []
    
    switch (filter) {
      case "read":
        return notificationList.filter(notification => notification.markAsRead === true)
      case "unread":
        return notificationList.filter(notification => notification.markAsRead === false)
      case "all":
      default:
        return notificationList
    }
  }, [notificationList, filter])

  const unreadCount = notificationList.filter((n) => !n.markAsRead).length
  const totalCount = notificationList.length
  const readCount = totalCount - unreadCount
  const headerBadgeCount = unreadCount > 0 ? unreadCount : allTotalCount

  return (
    <div>
      {isOpen && (
        <div className="fixed top-16 right-4 z-50 w-80 md:w-96 lg:w-[420px] max-w-[calc(100vw-2rem)]">
          <Card className="bg-white shadow-2xl overflow-hidden border border-t-0 rounded-lg">
                         <div style={{ backgroundColor: "var(--primary)" }} className="text-white px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5" />
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold">Notifications</h2>
                    <span className="inline-flex items-center justify-center min-w-[18px] h-5 px-1.5 rounded-full text-[10px] font-medium bg-white/20 text-white">
                      {headerBadgeCount}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/10 h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-2 border-b">
              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  {(["all", "unread", "read"] as FilterType[]).map((filterType) => {
                    const isActive = filter === filterType
                    const counts: Record<FilterType, number> = {
                      all: totalCount,
                      unread: unreadCount,
                      read: readCount,
                    }
                    let colorClasses = "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    if (isActive) {
                      if (filterType === "unread") {
                        colorClasses = "bg-red-500 text-white hover:bg-red-600"
                      } else if (filterType === "all") {
                        colorClasses = "bg-[#d7e5fd] text-blue-800 hover:bg-[#c6dbfc]"
                      } else {
                        colorClasses = "bg-green-500 text-white hover:bg-green-600"
                      }
                    } else if (filterType === "unread" && unreadCount > 0) {
                      colorClasses = "text-red-600 hover:text-red-700 hover:bg-red-50"
                    }
                    return (
                      <Button
                        key={filterType}
                        variant="ghost"
                        size="sm"
                        onClick={() => setFilter(filterType)}
                        className={`h-7 px-3 text-xs capitalize ${colorClasses}`}
                      >
                        <span className="mr-2">{filterType}</span>
                        <span className="inline-flex items-center justify-center min-w-[18px] h-5 px-1.5 rounded-full text-[10px] font-medium bg-white/60 text-gray-700">
                          {counts[filterType]}
                        </span>
                      </Button>
                    )
                  })}
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="h-7 px-2 text-xs text-gray-500 hover:text-gray-700"
                    disabled={unreadCount === 0}
                  >
                    <CheckCheck className="w-3 h-3 mr-1" />
                    Mark All Read
                  </Button>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="px-4 py-8 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-red-500 mx-auto mb-2"></div>
                <p className="text-sm text-gray-500">Loading notifications...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="px-4 py-3 bg-red-50 border-l-4 border-red-500 mx-4 my-2 rounded-r">
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}

            {!loading && !error && (
              <div
                className="overflow-y-auto overflow-x-hidden"
                style={{ maxHeight: `${LIST_MAX_HEIGHT}px` }}
              >
                {filteredNotifications.length === 0 ? (
                  <div className="px-4 py-12 text-center">
                    <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">
                      {filter === "all" ? "No notifications yet" : 
                       filter === "read" ? "No read notifications" : 
                       "No unread notifications"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {filter === "all" ? "You're all caught up!" : 
                       filter === "read" ? "No read notifications found" : 
                       "All notifications are read"}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {filteredNotifications.map((notification) => {
                      const isSelected = selectedIds.has(notification._id)
                      return (
                        <div
                          key={notification._id}
                          className={`group relative px-4 py-3 hover:bg-gray-50 transition-colors rounded-sm ${
                            isSelected
                              ? "bg-green-50 ring-1 ring-green-300"
                              : !notification.markAsRead
                              ? "bg-blue-50/50 border-l-4 border-blue-500"
                              : "bg-gray-50/30"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              className="mt-1 rounded border-gray-300 focus:ring-green-600 focus:ring-offset-0 focus:ring-1 accent-green-600"
                              checked={isSelected}
                              onChange={(e) => {
                                e.stopPropagation()
                                handleCheckboxChange(notification)
                              }}
                            />

                            <div 
                              className="flex-1 min-w-0 cursor-pointer"
                              onClick={() => handleNotificationClick(notification, router)}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    {!notification.markAsRead && (
                                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                                    )}
                                    <h4
                                      className={`text-sm font-medium break-words ${
                                        !notification.markAsRead ? "text-gray-900 font-semibold" : "text-gray-700"
                                      }`}
                                      style={{ display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}
                                    >
                                      {sanitizeText(notification.notification_title)}
                                    </h4>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-0.5 capitalize">
                                    {notification.notification_type}
                                  </p>
                                  <p
                                    className="text-sm text-gray-700 mt-1 break-words"
                                    style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
                                  >
                                    {sanitizeText(notification.notification_body)}
                                  </p>
                                </div>

                                <div className="flex items-center gap-1 flex-shrink-0">
                                  <span className="text-xs text-gray-400 whitespace-nowrap">
                                    {formatTimestamp(notification.createdAt)}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {!notification.markAsRead && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    markAsRead(notification._id)
                                  }}
                                  className="h-7 w-7 p-0 text-gray-400 hover:text-green-500"
                                  title="Mark as read"
                                >
                                  <Eye className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            <div className="border-t bg-white px-4 py-2">
              <div className="flex flex-col sm:flex-row justify-between gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    markAllAsRead()
                  }}
                  className="h-8 px-3 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 flex items-center gap-1 justify-center sm:justify-start"
                  disabled={notificationList.length === 0 || unreadCount === 0}
                >
                  <CheckCheck className="w-4 h-4 text-blue-600" />
                  Mark All Read
                </Button>
                {selectedIds.size > 0 && (
                  <div className="flex items-center gap-2 justify-center sm:justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markSelectedAsRead}
                      className="h-8 px-3 text-xs text-gray-700 hover:text-gray-900 hover:bg-gray-100 flex items-center gap-1"
                    >
                      <CheckCheck className="w-4 h-4 text-gray-700" />
                      Mark as Read
                    </Button>
                  </div>
                )}
                <Button variant="outline" size="sm" onClick={() => setIsOpen(false)} className="h-8 px-4 text-xs">
                  Close
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
