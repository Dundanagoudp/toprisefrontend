"use client"
import { ChevronDown, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

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
  return (
    <div className="p-4 lg:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-xl lg:text-2xl font-semibold text-gray-900 mb-2">Order Details</h1>
          <p className="text-sm text-gray-600">Order Overview</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 px-3 py-1">Active</Badge>
          <Button variant="outline" className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
            Cancel Order
          </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Customer Information */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900">Customer Information</CardTitle>
              <p className="text-sm text-gray-600">Customer Details</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Name</p>
                  <p className="font-medium text-gray-900">Mahesh Shinde</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Email</p>
                  <p className="font-medium text-gray-900">mahesh.shinde.designer@gmail.com</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Phone Number</p>
                  <p className="font-medium text-gray-900">+91 9632587125</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Delivery Address</p>
                  <p className="font-medium text-gray-900">Rajaji Nagar, Bangalore, Karnataka, 562148</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tracking Information */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900">Tracking Infor mation</CardTitle>
              <p className="text-sm text-gray-600">Check the order status</p>
            </CardHeader>
            <CardContent>
              {/* Vertical Progress Bar */}
              <div className="space-y-6">
                {trackingSteps.map((step, index) => (
                  <div key={index} className="relative flex items-start gap-4">
                    {/* Vertical Line */}
                    {index < trackingSteps.length - 1 && (
                      <div
                        className={`absolute left-2 top-8 w-0.5 h-16 ${
                          step.status === "completed" ? "bg-green-500" : "bg-gray-200"
                        }`}
                      ></div>
                    )}

                    {/* Progress Circle */}
                    <div
                      className={`w-4 h-4 rounded-full flex-shrink-0 mt-1 relative z-10 ${
                        step.status === "completed" ? "bg-green-500" : "bg-gray-300"
                      }`}
                    ></div>

                    {/* Step Content */}
                    <div className="flex-1 min-w-0">
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
        <div>
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900">Product Details</CardTitle>
                  <p className="text-sm text-gray-600">Product that order by the customer</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>No.of Product:</span>
                  <span className="font-medium">4</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Desktop Table View */}
              <div className="hidden lg:block">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-gray-200">
                      <tr>
                        <th className="text-left py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">
                          Product Name
                        </th>
                        <th className="text-left py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">
                          Dealer ID
                        </th>
                        <th className="text-left py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">
                          MRP
                        </th>
                        <th className="text-left py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">
                          GST
                        </th>
                        <th className="text-left py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">
                          Total Price
                        </th>
                        <th className="text-left py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {mockProducts.map((product, index) => (
                        <tr key={product.id} className="hover:bg-gray-50">
                          <td className="py-4 pr-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={product.image || "/placeholder.svg"}
                                alt={product.name}
                                className="w-10 h-10 rounded object-cover bg-gray-100"
                              />
                              <div>
                                <p className="text-sm font-medium text-gray-900">{product.name}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-2">
                            <div className="flex items-center gap-1">
                              <span className="text-sm text-gray-900">{product.dealerId}</span>
                              <div className="w-4 h-4 rounded-full bg-gray-300 flex items-center justify-center">
                                <span className="text-xs text-white">?</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-2 text-sm text-gray-900">₹{product.mrp.toFixed(2)}</td>
                          <td className="py-4 px-2 text-sm text-gray-900">{product.gst}</td>
                          <td className="py-4 px-2 text-sm font-medium text-gray-900">
                            ₹{product.totalPrice.toFixed(2)}
                          </td>
                          <td className="py-4 pl-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 px-2 text-gray-600">
                                  Edit
                                  <ChevronDown className="h-4 w-4 ml-1" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-32">
                                <DropdownMenuItem className="text-sm">
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
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

              {/* Mobile Card View */}
              <div className="lg:hidden space-y-4">
                {mockProducts.map((product, index) => (
                  <div key={product.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <img
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        className="w-12 h-12 rounded object-cover bg-gray-100 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 text-sm mb-1">{product.name}</h3>
                        <div className="flex items-center gap-1 mb-2">
                          <span className="text-sm text-gray-600">Dealer ID:</span>
                          <span className="text-sm text-gray-900">{product.dealerId}</span>
                          <div className="w-4 h-4 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-xs text-white">?</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
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
                          <Button variant="outline" size="sm" className="h-8 bg-transparent">
                            Edit
                            <ChevronDown className="h-4 w-4 ml-1" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-32">
                          <DropdownMenuItem className="text-sm">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
