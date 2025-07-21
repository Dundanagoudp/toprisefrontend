"use client"
import { useState, useEffect } from "react"
import { ChevronDown, Edit, Package, HandHeart, Truck, UserCheck, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import DealerIdentification from "./order-popus/dealerIdentification"

interface ProductItem {
  id: string
  name: string
  dealerId: string
  mrp: number
  gst: string
  totalPrice: number
  image: string
}

const mockProducts: ProductItem[] = [
  {
    id: "1",
    name: "Front Brake Pad - Swift 2016 Petrol",
    dealerId: "DLR302",
    mrp: 749.0,
    gst: "18%",
    totalPrice: 1498.0,
    image: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "2",
    name: "Front Brake Pad - Swift 2016 Petrol",
    dealerId: "DLR302",
    mrp: 749.0,
    gst: "18%",
    totalPrice: 1498.0,
    image: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "3",
    name: "Front Brake Pad - Swift 2016 Petrol",
    dealerId: "DLR302",
    mrp: 749.0,
    gst: "18%",
    totalPrice: 1498.0,
    image: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "4",
    name: "Front Brake Pad - Swift 2016 Petrol",
    dealerId: "DLR302",
    mrp: 749.0,
    gst: "18%",
    totalPrice: 1498.0,
    image: "/placeholder.svg?height=40&width=40",
  },
]

const trackingSteps = [
  {
    title: "Order Conformed",
    status: "completed",
    description: "Your Order has been placed.",
    time: "Sun, 16 Jun '24 - 7:51 pm",
    details: ["Seller has processed your order.", "Your item has picked up by delivery partner"],
  },
  {
    title: "Shipped",
    status: "completed",
    description: "Ekart Logistics - FMP1235468459",
    time: "Sun, 16 Jun '24 - 7:51 pm",
    details: ["Your item has been received in the hub nearest to you"],
  },
  {
    title: "Out for delivery",
    status: "completed",
    description: "Your Item is out for delivery",
    time: "Sun, 16 Jun '24 - 7:51 pm",
    details: [],
  },
  {
    title: "Delivered",
    status: "pending",
    description: "Your Item will be delivered soon",
    time: "",
    details: [],
  },
]

export default function OrderDetailsView() {
  const [loading, setLoading] = useState(true)
  // Modal state for DealerIdentification
  const [dealerModalOpen, setDealerModalOpen] = useState(false)
  const [selectedDealer, setSelectedDealer] = useState<any>(null)

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  // Loading Skeleton Component
  const LoadingSkeleton = () => (
    <div className="p-3 sm:p-4 lg:p-6 bg-gray-50 min-h-screen">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 lg:mb-8">
        <div>
          <Skeleton className="h-6 sm:h-8 w-40 sm:w-48 mb-2" />
          <Skeleton className="h-3 sm:h-4 w-24 sm:w-32" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 sm:h-6 w-12 sm:w-16" />
          <Skeleton className="h-8 sm:h-10 w-24 sm:w-28" />
        </div>
      </div>

      {/* Main Content Grid Skeleton */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
        {/* Left Column Skeleton */}
        <div className="space-y-4 lg:space-y-6">
          {/* Customer Information Skeleton */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-3 lg:pb-4">
              <Skeleton className="h-5 lg:h-6 w-32 lg:w-40 mb-2" />
              <Skeleton className="h-3 lg:h-4 w-24 lg:w-32" />
            </CardHeader>
            <CardContent className="space-y-3 lg:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                <div>
                  <Skeleton className="h-3 lg:h-4 w-10 lg:w-12 mb-1" />
                  <Skeleton className="h-4 lg:h-5 w-24 lg:w-32" />
                </div>
                <div>
                  <Skeleton className="h-3 lg:h-4 w-10 lg:w-12 mb-1" />
                  <Skeleton className="h-4 lg:h-5 w-36 lg:w-48" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                <div>
                  <Skeleton className="h-3 lg:h-4 w-16 lg:w-20 mb-1" />
                  <Skeleton className="h-4 lg:h-5 w-28 lg:w-36" />
                </div>
                <div>
                  <Skeleton className="h-3 lg:h-4 w-20 lg:w-24 mb-1" />
                  <Skeleton className="h-4 lg:h-5 w-44 lg:w-56" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tracking Information Skeleton */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-3 lg:pb-4">
              <Skeleton className="h-5 lg:h-6 w-36 lg:w-44 mb-2" />
              <Skeleton className="h-3 lg:h-4 w-28 lg:w-36" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4 lg:space-y-6">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="relative flex items-start gap-3 lg:gap-4">
                    <Skeleton className="w-3 h-3 lg:w-4 lg:h-4 rounded-full flex-shrink-0 mt-1" />
                    <div className="flex-1 min-w-0 pb-4 lg:pb-6">
                      <Skeleton className="h-4 lg:h-5 w-24 lg:w-32 mb-1" />
                      <Skeleton className="h-3 lg:h-4 w-36 lg:w-48 mb-1" />
                      <Skeleton className="h-3 w-32 lg:w-40 mb-2" />
                      <Skeleton className="h-3 lg:h-4 w-44 lg:w-56 mb-1" />
                      <Skeleton className="h-3 w-28 lg:w-36" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Product Details Skeleton */}
        <div className="space-y-4 lg:space-y-6">
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-3 lg:pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <Skeleton className="h-5 lg:h-6 w-24 lg:w-32 mb-2" />
                  <Skeleton className="h-3 lg:h-4 w-36 lg:w-48" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-3 lg:h-4 w-16 lg:w-20" />
                  <Skeleton className="h-3 lg:h-4 w-3 lg:w-4" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Table Skeleton */}
              <div className="space-y-3">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-start gap-3 mb-3">
                      <Skeleton className="w-10 h-10 lg:w-12 lg:h-12 rounded flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <Skeleton className="h-3 lg:h-4 w-32 lg:w-40 mb-1" />
                        <div className="flex items-center gap-1 mb-2">
                          <Skeleton className="h-3 w-12 lg:w-16" />
                          <Skeleton className="h-3 w-8 lg:w-12" />
                          <Skeleton className="w-3 h-3 lg:w-4 lg:h-4 rounded-full" />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="flex justify-between">
                        <Skeleton className="h-3 w-6 lg:w-8" />
                        <Skeleton className="h-3 w-8 lg:w-12" />
                      </div>
                      <div className="flex justify-between">
                        <Skeleton className="h-3 w-6 lg:w-8" />
                        <Skeleton className="h-3 w-6 lg:w-8" />
                      </div>
                      <div className="flex justify-between col-span-2">
                        <Skeleton className="h-3 w-12 lg:w-16" />
                        <Skeleton className="h-3 w-12 lg:w-16" />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Skeleton className="h-6 lg:h-8 w-12 lg:w-16" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Update Status Skeleton */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-3 lg:pb-4">
              <Skeleton className="h-5 lg:h-6 w-32 lg:w-40" />
            </CardHeader>
            <CardContent className="space-y-3 lg:space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Skeleton className="h-4 lg:h-5 w-20 lg:w-24 mb-1" />
                  <Skeleton className="h-3 lg:h-4 w-12 lg:w-16" />
                </div>
                <div className="text-right">
                  <Skeleton className="h-4 lg:h-5 w-16 lg:w-20 mb-1" />
                  <Skeleton className="h-3 w-20 lg:w-24" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 lg:h-4 w-24 lg:w-32" />
                <Skeleton className="h-8 lg:h-10 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return <LoadingSkeleton />
  }

  // Handler to open modal with dealer data
  const handleDealerEyeClick = (dealerId: string) => {
    // In real app, fetch dealer data by dealerId. Here, use mock data from mockProducts
    const dealer = {
      dealerId: dealerId,
      legalName: "Shree Auto Spares Pvt Ltd",
      tradeName: "ShreeAuto",
      address: "Plot 14, MIDC Bhosari, Pune",
      contactPerson: "Rakesh Jadhav",
      mobileNumber: "+91 98200 12345",
      email: "dealer@shreeauto.in",
      gstin: "27ABCDE1234F1Z2",
      pan: "ABCDE1234F",
      state: "Maharashtra",
      pincode: "411026",
    }
    setSelectedDealer(dealer)
    setDealerModalOpen(true)
  }

  return (
    <div className="p-3 sm:p-4 lg:p-6 bg-(neutral-100)-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 lg:mb-8">
        <div>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 mb-2">Order Details</h1>
          <p className="text-xs sm:text-sm text-gray-600">Order Overview</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 px-2 sm:px-3 py-1 text-xs sm:text-sm">
            Active
          </Badge>
          <Button
            variant="outline"
            className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 text-xs sm:text-sm px-3 sm:px-4 h-8 sm:h-10"
          >
            Cancel Order
          </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
        {/* Left Column */}
        <div className="space-y-4 lg:space-y-6">
          {/* Customer Information */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-3 lg:pb-4">
              <CardTitle className="text-base sm:text-lg font-semibold text-gray-900">Customer Information</CardTitle>
              <p className="text-xs sm:text-sm text-gray-600">Customer Details</p>
            </CardHeader>
            <CardContent className="space-y-3 lg:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">Name</p>
                  <p className="font-medium text-gray-900 text-sm sm:text-base">Mahesh Shinde</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">Email</p>
                  <p className="font-medium text-gray-900 text-sm sm:text-base break-all">
                    mahesh.shinde.designer@gmail.com
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">Phone Number</p>
                  <p className="font-medium text-gray-900 text-sm sm:text-base">+91 9632587125</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">Delivery Address</p>
                  <p className="font-medium text-gray-900 text-sm sm:text-base">
                    Rajaji Nagar, Bangalore, Karnataka, 562148
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tracking Information */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-3 lg:pb-4">
              <CardTitle className="text-base sm:text-lg font-semibold text-gray-900">Tracking Information</CardTitle>
              <p className="text-xs sm:text-sm text-gray-600">Check the order status</p>
            </CardHeader>
            <CardContent>
              {/* Vertical Progress Bar */}
              <div className="relative">
                {trackingSteps.map((step, index) => (
                  <div key={index} className="relative flex items-start gap-4">
                    {/* Vertical Line - Full Connection */}
                    <div
                      className={`absolute left-2 top-4 w-0.5 ${
                        index === trackingSteps.length - 1 ? "h-full bg-gray-200" : "h-full bg-green-500"
                      }`}
                      style={{ height: index === trackingSteps.length - 1 ? "100%" : "calc(100% + 24px)" }}
                    ></div>

                    {/* Progress Circle */}
                    <div
                      className={`w-4 h-4 rounded-full flex-shrink-0 mt-1 relative z-10 ${
                        step.status === "completed" ? "bg-green-500" : "bg-gray-300"
                      }`}
                    ></div>

                    {/* Step Content */}
                    <div className="flex-1 min-w-0 pb-6">
                      <h3 className="font-semibold text-gray-900 mb-1">{step.title}</h3>
                      <p className="text-sm text-gray-700 mb-1">{step.description}</p>
                      {step.time && <p className="text-xs text-gray-500 mb-2">{step.time}</p>}

                      {/* Additional Details */}
                      {step.details.map((detail, detailIndex) => (
                        <div key={detailIndex} className="mb-1">
                          <p className="text-sm text-gray-600">{detail}</p>
                          <p className="text-xs text-gray-500">Sun, 16 Jun '24 - 7:51 pm</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Product Details */}
        <div className="space-y-4 lg:space-y-6">
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-3 lg:pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <CardTitle className="text-base sm:text-lg font-semibold text-gray-900">Product Details</CardTitle>
                  <p className="text-xs sm:text-sm text-gray-600">Product that order by the customer</p>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                  <span>No.of Product:</span>
                  <span className="font-medium">4</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* Desktop Table View - Fixed width columns */}
              <div className="hidden xl:block">
                <div className="w-full">
                  <table className="w-full table-fixed">
                    <thead className="border-b border-gray-200">
                      <tr>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-600 uppercase tracking-wider w-[35%]">
                          Product Name
                        </th>
                        <th className="text-left py-3 px-2 text-xs font-medium text-gray-600 uppercase tracking-wider w-[15%]">
                          Dealer ID
                        </th>
                        <th className="text-left py-3 px-2 text-xs font-medium text-gray-600 uppercase tracking-wider w-[12%]">
                          MRP
                        </th>
                        <th className="text-left py-3 px-2 text-xs font-medium text-gray-600 uppercase tracking-wider w-[8%]">
                          GST
                        </th>
                        <th className="text-left py-3 px-2 text-xs font-medium text-gray-600 uppercase tracking-wider w-[15%]">
                          Total Price
                        </th>
                        <th className="text-left py-3 px-2 text-xs font-medium text-gray-600 uppercase tracking-wider w-[15%]">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {mockProducts.map((product, index) => (
                        <tr key={product.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4 align-middle w-[35%]">
                            <div className="flex items-center gap-2">
                              <img
                                src={product.image || "/assets/Box.svg"}
                                alt={product.name}
                                className="w-8 h-8 rounded object-contain bg-gray-100 border border-gray-200 flex-shrink-0"
                              />
                              <div className="flex flex-col justify-center min-w-0 flex-1">
                                <div className="flex items-center gap-1">
                                  <p className="text-xs font-medium text-gray-900 leading-tight truncate">
                                    {product.name}
                                  </p>
                                  <Eye className="w-3 h-3 text-gray-500 flex-shrink-0" />
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-2 align-middle w-[15%]">
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-gray-900 font-semibold truncate">{product.dealerId}</span>
                              <Eye className="w-3 h-3 text-gray-500 flex-shrink-0 cursor-pointer" onClick={() => handleDealerEyeClick(product.dealerId)} />
                            </div>
                          </td>
                          <td className="py-3 px-2 text-xs text-gray-900 w-[12%]">₹{product.mrp.toFixed(2)}</td>
                          <td className="py-3 px-2 text-xs text-gray-900 w-[8%]">{product.gst}</td>
                          <td className="py-3 px-2 text-xs font-medium text-gray-900 w-[15%]">
                            ₹{product.totalPrice.toFixed(2)}
                          </td>
                          <td className="py-3 px-2 w-[15%]">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2 text-xs text-gray-600 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 w-full max-w-[80px] justify-between"
                                >
                                  Edit
                                  <ChevronDown className="h-3 w-3 ml-1" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuItem className="text-sm">
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-sm">
                                  <Package className="h-4 w-4 mr-2" />
                                  Mark Packed
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-sm">
                                  <HandHeart className="h-4 w-4 mr-2" />
                                  Mark Handover
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-sm">
                                  <Truck className="h-4 w-4 mr-2" />
                                  Update Tracking
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-sm">
                                  <UserCheck className="h-4 w-4 mr-2" />
                                  Reassign Dealer
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

              {/* Card View for Mobile and Tablet */}
              <div className="xl:hidden p-4 space-y-3">
                {mockProducts.map((product, index) => (
                  <div key={product.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-start gap-3 mb-3">
                      <img
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded object-cover bg-gray-100 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-gray-900 text-sm truncate">{product.name}</h3>
                          <Eye className="w-4 h-4 text-gray-500 flex-shrink-0" />
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs sm:text-sm text-gray-600">Dealer ID:</span>
                          <span className="text-xs sm:text-sm text-gray-900 font-semibold">{product.dealerId}</span>
                          <Eye className="w-4 h-4 text-gray-500 flex-shrink-0 cursor-pointer" onClick={() => handleDealerEyeClick(product.dealerId)} />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm mb-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">MRP:</span>
                        <span className="text-gray-900">₹{product.mrp.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">GST:</span>
                        <span className="text-gray-900">{product.gst}</span>
                      </div>
                      <div className="flex justify-between col-span-2">
                        <span className="text-gray-600">Total Price:</span>
                        <span className="font-medium text-gray-900">₹{product.totalPrice.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 bg-white border border-gray-300 rounded-md shadow-sm w-20 justify-between text-xs"
                          >
                            Edit
                            <ChevronDown className="h-4 w-4 ml-1" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem className="text-sm">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-sm">
                            <Package className="h-4 w-4 mr-2" />
                            Mark Packed
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-sm">
                            <HandHeart className="h-4 w-4 mr-2" />
                            Mark Handover
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-sm">
                            <Truck className="h-4 w-4 mr-2" />
                            Update Tracking
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-sm">
                            <UserCheck className="h-4 w-4 mr-2" />
                            Reassign Dealer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Update Orders Status Card */}
          <Card className="border border-gray-200 shadow-sm mt-6 min-h-[400px]">
            <CardHeader className="pb-3 lg:pb-4">
              <CardTitle className="text-base sm:text-lg font-semibold text-gray-900">Update Orders Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 lg:space-y-4">
              {/* Product Info */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Rear shocker</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Yamaha</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <span className="text-base sm:text-lg font-semibold text-gray-900">₹6399.00</span>
                    <span className="text-xs sm:text-sm text-gray-500 line-through">₹6599.00</span>
                  </div>
                  <p className="text-xs text-gray-500">25 Jan 2025 12:00 PM</p>
                </div>
              </div>

              {/* Update Status Dropdown */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-medium text-gray-900">Update Order Status</label>
                <Select>
                  <SelectTrigger className="w-full bg-white border-gray-300 h-9 sm:h-10">
                    <SelectValue placeholder="Select Reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="returned">Returned</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      {/* DealerIdentification Modal */}
      <DealerIdentification isOpen={dealerModalOpen} onClose={() => setDealerModalOpen(false)} dealerData={selectedDealer} />
    </div>
  )
}
