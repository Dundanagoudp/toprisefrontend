"use client"
import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown, Edit, Package, HandHeart, Truck, UserCheck, Eye } from "lucide-react"
import { DynamicButton } from "@/components/common/button"
import CreatePicklist from "./CreatePicklist"

interface ProductItem {
  _id?: string
  productId?: string
  productName: string
  dealerId: any
  sku?: string
  quantity?: number
  mrp: number
  gst: number | string 
  totalPrice: number
  image?: string
}

interface ProductDetailsForOrderProps {
  products: ProductItem[] | null | undefined
  onProductEyeClick: (product: ProductItem) => void
  onDealerEyeClick: (dealerId: string) => void
}

export default function ProductDetailsForOrder({
  products,
  onProductEyeClick,
  onDealerEyeClick,
}: ProductDetailsForOrderProps) {
  const [picklistOpen, setPicklistOpen] = useState(false)
  const safeDealerId = (dealer: any): string => {
    if (dealer == null) return ""
    if (typeof dealer === "string") return dealer
    if (typeof dealer === "number") return String(dealer)
    return dealer._id || dealer.id || String(dealer)
  }

  return (
    <>
      <Card className="border border-gray-200 shadow-sm">
      <CardHeader className="pb-3 lg:pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle className="text-base sm:text-lg font-semibold text-gray-900">Product Details</CardTitle>
            <p className="text-xs sm:text-sm text-gray-600">Product that order by the customer</p>
          </div>
          <div className="flex flex-col items-start gap-1 text-xs sm:text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span>No.of Product:</span>
              <span className="font-medium">{products?.length || 0}</span>
            </div>
            {products && products.length > 3 && (
              <DynamicButton
                text="View All"
                customClassName="px-2 py-1 text-xs h-7 min-w-0"
              />
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Desktop Table View - Fixed width columns */}
        <div className="hidden xl:block">
  <div className="w-full bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
    <table className="w-full table-fixed">
      <thead className="bg-gray-50">
        <tr>
          <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider w-[35%]">
            Product Name
          </th>
          <th className="text-left py-4 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider w-[15%]">
            Dealers
          </th>
          <th className="text-left py-4 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider w-[12%]">
            MRP
          </th>
          <th className="text-left py-4 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider w-[8%]">
            GST
          </th>
          <th className="text-left py-4 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider w-[15%]">
            Total Price
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {products?.map((productItem: ProductItem, index: number) => (
          <tr 
            key={productItem._id || index} 
            className="hover:bg-gray-50 transition-colors duration-150"
          >
            <td className="py-4 px-6 align-middle w-[35%]">
              <div className="flex items-center gap-3">
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {productItem.productName}
                    </p>
                    <button 
                      onClick={() => onProductEyeClick(productItem)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label="View product details"
                    >
                      <Eye className="w-4 h-4 flex-shrink-0" />
                    </button>
                  </div>
                </div>
              </div>
            </td>
            <td className="py-4 px-4 align-middle w-[15%]">
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-900">
                  {Array.isArray(productItem.dealerId) ? productItem.dealerId.length : 1}
                </span>
                <button
                  onClick={() => onDealerEyeClick(safeDealerId(productItem.dealerId))}
                  className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="View dealers"
                >
                  <Eye className="w-4 h-4 flex-shrink-0" />
                </button>
              </div>
            </td>
            <td className="py-4 px-4 text-sm font-medium text-gray-900 w-[12%]">
              ₹{productItem.mrp.toLocaleString()}
            </td>
            <td className="py-4 px-4 text-sm font-medium text-gray-900 w-[8%]">
              {productItem.gst}%
            </td>
            <td className="py-4 px-4 text-sm font-medium text-gray-900 w-[15%]">
              ₹{productItem.totalPrice.toLocaleString()}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    
    <div className="flex justify-end p-4 border-t border-gray-200 bg-gray-50">
      <DynamicButton
        text="Create Picklist"
        customClassName="bg-[#C72920] hover:bg-red-700 px-6 py-2 text-sm font-medium rounded-md shadow-sm text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        onClick={() => setPicklistOpen(true)}
      />
    </div>
  </div>
</div>

        {/* Card View for Mobile and Tablet */}
        <div className="xl:hidden p-4 space-y-3">
          <div className="flex justify-end mb-2">
            <DynamicButton
              text="Create Picklist"
              customClassName="bg-[#C72920] hover:bg-red-700 px-4 py-1 text-xs rounded shadow-sm"
              onClick={() => setPicklistOpen(true)}
            />
          </div>
          {products?.map((productItem: ProductItem) => (
            <div key={productItem._id} className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-start gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-gray-900 text-sm truncate">{productItem.productName}</h3>
                    <Eye
                      className="w-4 h-4 text-gray-500 flex-shrink-0 cursor-pointer"
                      onClick={() => onProductEyeClick(productItem)}
                    />
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs sm:text-sm text-gray-600">No. of Dealers:</span>
                    <span className="text-xs sm:text-sm text-gray-900 font-semibold">
                      {Array.isArray(productItem.dealerId) ? productItem.dealerId.length : 1}
                    </span>
                    <Eye
                      className="w-3 h-3 text-gray-500 flex-shrink-0 cursor-pointer ml-1 inline-block align-middle"
                      onClick={() => onDealerEyeClick(safeDealerId(productItem.dealerId))}
                    />
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs sm:text-sm text-gray-600">MRP:</span>
                    <span className="text-xs sm:text-sm text-gray-900 font-semibold">₹{productItem.mrp}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs sm:text-sm text-gray-600">GST:</span>
                    <span className="text-xs sm:text-sm text-gray-900 font-semibold">{productItem.gst}%</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs sm:text-sm text-gray-600">Total Price:</span>
                    <span className="text-xs sm:text-sm text-gray-900 font-semibold">₹{productItem.totalPrice}</span>
                  </div>
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
      <CreatePicklist open={picklistOpen} onClose={() => setPicklistOpen(false)} />
    </>
  )
}
