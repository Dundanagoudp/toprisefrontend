"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Users, 
  Star, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  DollarSign,
  BarChart3,
  Target,
  TrendingDown
} from "lucide-react"
import { useRouter } from "next/navigation"
import { 
  getDealerDashboardData, 
  DealerDashboardResponse,
  DealerDashboardStats,
  DealerOrderKPI,
  DealerAssignedCategory,
  getProductStatsByDealer,
  ProductStatsByDealerResponse,
  getDealerRevenue,
  DealerRevenueResponse
} from "@/service/dealer-dashboard-services"
import { getDealerIdFromUserId, getDealerByUserId } from "@/service/dealerServices"
import { getAuthToken } from "@/utils/auth"

// Stat Card Component
const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  trend, 
  subtitle 
}: {
  title: string
  value: string | number
  icon: any
  color: string
  trend?: "up" | "down" | "stable"
  subtitle?: string
}) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
      <Icon className={`h-4 w-4 ${color}`} />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {subtitle && (
        <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
      )}
      {trend && (
        <div className="flex items-center mt-1">
          {trend === "up" && <TrendingUp className="h-3 w-3 text-green-500 mr-1" />}
          {trend === "down" && <TrendingDown className="h-3 w-3 text-red-500 mr-1" />}
          {trend === "stable" && <BarChart3 className="h-3 w-3 text-gray-500 mr-1" />}
          <span className={`text-xs ${trend === "up" ? "text-green-500" : trend === "down" ? "text-red-500" : "text-gray-500"}`}>
            {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"} {trend === "stable" ? "Stable" : "Trending"}
          </span>
        </div>
      )}
    </CardContent>
  </Card>
)

// Performance Metric Component
const PerformanceMetric = ({ 
  label, 
  value, 
  icon: Icon, 
  color, 
  unit = "%" 
}: {
  label: string
  value: number
  icon: any
  color: string
  unit?: string
}) => (
  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
    <div className={`p-2 rounded-full ${color} bg-opacity-10`}>
      <Icon className={`h-5 w-5 ${color}`} />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-900">{label}</p>
      <p className="text-lg font-bold text-gray-700">{value}{unit}</p>
    </div>
  </div>
)

// Growth Indicator Component
const GrowthIndicator = ({ value, label }: { value: number; label: string }) => {
  const isPositive = value > 0;
  const isNegative = value < 0;
  const isNeutral = value === 0;

  return (
    <div className="flex items-center space-x-2">
      {isPositive && <TrendingUp className="h-4 w-4 text-green-500" />}
      {isNegative && <TrendingDown className="h-4 w-4 text-red-500" />}
      {isNeutral && <BarChart3 className="h-4 w-4 text-gray-500" />}
      <span className={`text-sm font-medium ${
        isPositive ? "text-green-600" : 
        isNegative ? "text-red-600" : 
        "text-gray-600"
      }`}>
        {isPositive ? "+" : ""}{value}% {label}
      </span>
    </div>
  );
};

// Category Card Component
const CategoryCard = ({ category }: { category: DealerAssignedCategory }) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardContent className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          {category.category_image ? (
            <img 
              src={category.category_image} 
              alt={category.category_name}
              className="w-10 h-10 rounded-lg object-cover"
            />
          ) : (
            <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
              <Package className="h-5 w-5 text-gray-500" />
            </div>
          )}
          <div>
            <h3 className="font-semibold text-gray-900">{category.category_name}</h3>
            <p className="text-sm text-gray-500">Code: {category.category_code}</p>
          </div>
        </div>
        <Badge variant={category.is_active ? "default" : "secondary"}>
          {category.is_active ? "Active" : "Inactive"}
        </Badge>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">{category.product_count} products</span>
        <span className="text-gray-500">
          Assigned: {new Date(category.assigned_date).toLocaleDateString()}
        </span>
      </div>
    </CardContent>
  </Card>
)

// Loading Skeleton
const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-3 w-20" />
          </CardContent>
        </Card>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
)

export default function DealerDashboard() {
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<DealerDashboardResponse | null>(null)
  const [productStats, setProductStats] = useState<ProductStatsByDealerResponse['data'] | null>(null)
  const [revenueData, setRevenueData] = useState<DealerRevenueResponse['data'] | null>(null)
  const [dealerData, setDealerData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch dashboard data
        const data = await getDealerDashboardData()
        setDashboardData(data)
        
        // Get user ID from token
        let userId: string | null = null
        const token = getAuthToken()
        if (token) {
          try {
            const payloadBase64 = token.split(".")[1]
            if (payloadBase64) {
              const base64 = payloadBase64.replace(/-/g, "+").replace(/_/g, "/")
              const paddedBase64 = base64.padEnd(
                base64.length + ((4 - (base64.length % 4)) % 4),
                "="
              )
              const payloadJson = atob(paddedBase64)
              const payload = JSON.parse(payloadJson)
              userId = payload.id || payload.userId || payload.user_id
            }
          } catch (err) {
            console.error("Failed to decode token for userId:", err)
          }
        }
        
        // Fetch product stats, revenue, and dealer data independently (don't let one failure break others)
        try {
          const dealerId = await getDealerIdFromUserId()
          
          // Fetch product stats independently
          getProductStatsByDealer(dealerId)
            .then((response) => {
              if (response && response.data) {
                setProductStats(response.data)
              }
            })
            .catch((error) => {
              console.error("Failed to fetch product stats:", error)
              // Keep existing data, don't break
            })
          
          // Fetch revenue independently
          getDealerRevenue(dealerId)
            .then((response) => {
              if (response && response.data) {
                setRevenueData(response.data)
              }
            })
            .catch((error) => {
              console.error("Failed to fetch revenue:", error)
              // Keep existing data, don't break
            })
        } catch (dealerIdError) {
          console.error("Failed to get dealer ID:", dealerIdError)
          // Don't break the dashboard
        }
        
        // Fetch dealer by user ID independently
        if (userId) {
          getDealerByUserId(userId)
            .then((response) => {
              // Handle different response structures
              if (response) {
                if (response.dealer) {
                  setDealerData(response.dealer)
                } else if (response.data && response.data.dealer) {
                  setDealerData(response.data.dealer)
                } else if (response.data) {
                  setDealerData(response.data)
                } else {
                  setDealerData(response)
                }
              }
            })
            .catch((error) => {
              console.error("Failed to fetch dealer by user ID:", error)
              // Keep existing data, don't break
            })
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err)
        setError("Failed to load dashboard data")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return <DashboardSkeleton />
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Dashboard</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    )
  }

  const stats = dashboardData?.data?.stats
  const orderKPIs = dashboardData?.data?.orderKPIs?.[0] // Get current period
  const categories = dashboardData?.data?.assignedCategories || []

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-10xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dealer Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back! Here's your business overview.</p>
          </div>
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              onClick={() => router.push("/dealer/dashboard/product")}
            >
              <Package className="h-4 w-4 mr-2" />
              Manage Products
            </Button>
            <Button 
              onClick={() => router.push("/dealer/dashboard/order")}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              View Orders
            </Button>
          </div>
        </div>

        {/* Overview Content */}
        <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Products"
            value={productStats?.totalProducts || stats?.products.total || 0}
            icon={Package}
            color="text-blue-600"
            trend="up"
            subtitle="Active inventory"
          />
          <StatCard
            title="Total Orders"
            value={revenueData?.totalOrders || stats?.orders.total || 0}
            icon={ShoppingCart}
            color="text-green-600"
            trend="up"
            subtitle="This month"
          />
          <StatCard
            title="Revenue"
            value={`₹${((revenueData?.totalRevenue || stats?.orders.totalRevenue) || 0).toLocaleString()}`}
            icon={DollarSign}
            color="text-purple-600"
            trend="up"
            subtitle="Total earnings"
          />
          <StatCard
            title="Allowed Brands"
            value={dealerData?.brands_allowed?.length || stats?.categories.assigned || 0}
            icon={Target}
            color="text-orange-600"
            trend="stable"
            subtitle="Brands allowed"
          />
        </div>

        {/* Product Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Products</p>
                  <p className="text-2xl font-bold text-blue-600">{productStats?.totalProducts || stats?.products.total || 0}</p>
                </div>
                <Package className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Approved Products</p>
                  <p className="text-2xl font-bold text-green-600">{productStats?.totaApprovedProducts || stats?.products.approved || 0}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Products</p>
                  <p className="text-2xl font-bold text-yellow-600">{productStats?.totalPendingProducts || stats?.products.pending || 0}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Rejected Products</p>
                  <p className="text-2xl font-bold text-red-600">{productStats?.totalRejectedProducts || stats?.products.rejected || 0}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid - Order Performance and Performance Metrics */}
        {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Order Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {orderKPIs ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-600">Total Orders</p>
                      <p className="text-2xl font-bold text-blue-600">{orderKPIs.orders.total}</p>
                      <GrowthIndicator value={orderKPIs.orders.growth} label="vs last period" />
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-gray-600">Revenue</p>
                      <p className="text-2xl font-bold text-green-600">₹{orderKPIs.revenue.total.toLocaleString()}</p>
                      <GrowthIndicator value={orderKPIs.revenue.growth} label="vs last period" />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <PerformanceMetric
                      label="SLA Compliance"
                      value={orderKPIs.performance.slaCompliance}
                      icon={CheckCircle}
                      color="text-green-600"
                    />
                    <PerformanceMetric
                      label="Avg Fulfillment Time"
                      value={orderKPIs.performance.avgFulfillmentTime}
                      icon={Clock}
                      color="text-blue-600"
                      unit=" hours"
                    />
                    <PerformanceMetric
                      label="Customer Satisfaction"
                      value={orderKPIs.performance.customerSatisfaction}
                      icon={Star}
                      color="text-yellow-600"
                      unit="%"
                    />
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No order data available</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <PerformanceMetric
                label="SLA Compliance Rate"
                value={stats?.performance.slaCompliance || 0}
                icon={CheckCircle}
                color="text-green-600"
              />
              <PerformanceMetric
                label="Average Response Time"
                value={stats?.performance.avgResponseTime || 0}
                icon={Clock}
                color="text-blue-600"
                unit=" hours"
              />
              <PerformanceMetric
                label="Customer Rating"
                value={stats?.performance.customerRating || 0}
                icon={Star}
                color="text-yellow-600"
                unit="%"
              />
              <PerformanceMetric
                label="Fulfillment Rate"
                value={stats?.performance.fulfillmentRate || 0}
                icon={Target}
                color="text-purple-600"
              />
            </CardContent>
          </Card>
        </div> */}

        {/* Assigned Categories */}
        {/* <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Assigned Categories
              </div>
              <Badge variant="outline">
                {categories.length} Categories
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {categories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <CategoryCard key={category._id} category={category} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No categories assigned yet</p>
                <p className="text-sm">Contact admin to get category assignments</p>
              </div>
            )}
          </CardContent>
        </Card> */}
        </div>
      </div>
    </div>
  )
}
