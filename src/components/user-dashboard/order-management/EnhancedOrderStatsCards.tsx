"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Calendar, TrendingUp, Package, Users, DollarSign, Filter, RefreshCw } from "lucide-react"
import { EnhancedOrderStatsData, EnhancedOrderStatsQuery } from "@/types/dashboard-Types"

interface EnhancedOrderStatsCardsProps {
  stats: EnhancedOrderStatsData | null
  loading: boolean
  filters: EnhancedOrderStatsQuery
  onFilterChange: (key: keyof EnhancedOrderStatsQuery, value: any) => void
  onRefresh: () => void
  onClearFilters: () => void
}

export default function EnhancedOrderStatsCards({
  stats,
  loading,
  filters,
  onFilterChange,
  onRefresh,
  onClearFilters
}: EnhancedOrderStatsCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'assigned':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'shipped':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const summaryCards = [
    {
      title: "Total Orders",
      value: stats?.summary.totalOrders.toLocaleString() || "-",
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Total Revenue",
      value: stats?.summary.totalRevenue ? formatCurrency(stats.summary.totalRevenue) : "-",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Average Order Value",
      value: stats?.summary.avgOrderValue ? formatCurrency(stats.summary.avgOrderValue) : "-",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    {
      title: "Active Orders",
      value: stats ? stats.statusBreakdown.reduce((sum, status) => 
        status.status !== 'Delivered' && status.status !== 'Cancelled' ? sum + status.count : sum, 0
      ).toLocaleString() : "-",
      icon: Users,
      color: "text-orange-600",
      bgColor: "bg-orange-100"
    }
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Filters */}
      {/* <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Order Statistics Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Today Only</label>
              <Select
                value={filters.today ? "true" : "false"}
                onValueChange={(value) => onFilterChange("today", value === "true")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="false">All Time</SelectItem>
                  <SelectItem value="true">Today Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Status</label>
              <Select
                value={filters.status || "all"}
                onValueChange={(value) => onFilterChange("status", value === "all" ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Confirmed">Confirmed</SelectItem>
                  <SelectItem value="Assigned">Assigned</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                  <SelectItem value="Shipped">Shipped</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Start Date</label>
              <Input
                type="date"
                value={filters.startDate || ""}
                onChange={(e) => onFilterChange("startDate", e.target.value || undefined)}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">End Date</label>
              <Input
                type="date"
                value={filters.endDate || ""}
                onChange={(e) => onFilterChange("endDate", e.target.value || undefined)}
              />
            </div>

            <div className="flex items-end gap-2">
              <Button variant="outline" onClick={onClearFilters} className="flex-1">
                Clear
              </Button>
              <Button variant="outline" onClick={onRefresh} disabled={loading} className="flex-1">
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card> */}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryCards.map((card, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                </div>
                <div className={`p-3 rounded-full ${card.bgColor}`}>
                  <card.icon className={`h-6 w-6 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Status Breakdown */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Status Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.statusBreakdown.map((status, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusBadgeColor(status.status)}>
                        {status.status}
                      </Badge>
                      <div>
                        <p className="font-medium">{status.count} orders</p>
                        <p className="text-sm text-gray-600">{status.percentage}% of total</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(status.totalAmount)}</p>
                      <p className="text-sm text-gray-600">Avg: {formatCurrency(status.avgOrderValue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.recentOrders.slice(0, 5).map((order) => (
                  <div
                    key={order._id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm">{order.orderId}</p>
                        <Badge className={getStatusBadgeColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{order.customerName}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.orderDate).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">{formatCurrency(order.totalAmount)}</p>
                      <p className="text-xs text-gray-500">{order.skuCount} SKU{order.skuCount !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Generated At */}
      {stats && (
        <div className="text-center text-sm text-gray-500">
          Last updated: {new Date(stats.generatedAt).toLocaleString('en-IN')}
        </div>
      )}
    </div>
  )
}
