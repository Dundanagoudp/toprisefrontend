"use client"

import type React from "react"
import { X, Package, Users, TrendingUp } from "lucide-react"
import type { Product } from "@/types/product-Types"

interface DealersModalProps {
  open: boolean
  onClose: () => void
  product: Product | null
}

const MODAL_CONSTANTS = {
  TITLE: "Available Dealers",
  CLOSE_LABEL: "Close modal",
  NO_DATA: "N/A",
  STANDARD_PRIORITY: "Standard",
  STOCK_STATUS: {
    IN_STOCK: "In Stock",
    OUT_OF_STOCK: "Out of Stock",
  },
}

const TABLE_HEADERS = [
  { key: "dealer_id", label: "Dealer ID", icon: Users },
  { key: "quantity", label: "Quantity", icon: Package },
  { key: "margin", label: "Margin %", icon: TrendingUp },
  { key: "priority", label: "Priority" },
  { key: "stock_status", label: "Stock Status" },
  { key: "last_update", label: "Last Update" },
]

const DealersModal: React.FC<DealersModalProps> = ({ open, onClose, product }) => {
  if (!open || !product || !product.available_dealers) {
    return null
  }

  const dealerCount = product.available_dealers.length
  const inStockCount = product.available_dealers.filter((dealer) => dealer.inStock).length

  const formatDate = (dateString: string | null) => {
    if (!dateString) return MODAL_CONSTANTS.NO_DATA
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getStockStatusStyle = (inStock: boolean) => {
    return inStock ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dealers-modal-title"
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 id="dealers-modal-title" className="text-2xl font-bold text-gray-900">
                  {MODAL_CONSTANTS.TITLE}
                </h2>
                <div className="flex items-center space-x-4 mt-1">
                  <p className="text-sm font-medium text-gray-700">{product.product_name}</p>
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <span className="flex items-center">
                      <Package className="w-4 h-4 mr-1" />
                      {dealerCount} dealers
                    </span>
                    <span className="flex items-center">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full mr-1"></div>
                      {inStockCount} in stock
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
              aria-label={MODAL_CONSTANTS.CLOSE_LABEL}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    {TABLE_HEADERS.map((header) => {
                      const IconComponent = header.icon
                      return (
                        <th
                          key={header.key}
                          className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200 last:border-r-0"
                        >
                          <div className="flex items-center space-x-2">
                            {IconComponent && <IconComponent className="w-4 h-4" />}
                            <span>{header.label}</span>
                          </div>
                        </th>
                      )
                    })}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {product.available_dealers.map((dealer: any, index: number) => (
                    <tr key={`dealer-${index}`} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                        <span className="text-sm font-mono font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded">
                          {dealer.dealers_Ref || MODAL_CONSTANTS.NO_DATA}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                        <span className="font-medium">{dealer.quantity_per_dealer?.toLocaleString() || 0}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                        <span className="font-medium">
                          {dealer.dealer_margin || dealer.aler_margin || MODAL_CONSTANTS.NO_DATA}
                          {(dealer.dealer_margin || dealer.aler_margin) && "%"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-200">
                          {dealer.dealer_priority_override || MODAL_CONSTANTS.STANDARD_PRIORITY}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm border-r border-gray-200">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${getStockStatusStyle(dealer.inStock)}`}
                        >
                          {dealer.inStock
                            ? MODAL_CONSTANTS.STOCK_STATUS.IN_STOCK
                            : MODAL_CONSTANTS.STOCK_STATUS.OUT_OF_STOCK}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="text-gray-600">{formatDate(dealer.last_stock_update)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            Showing {dealerCount} dealer{dealerCount !== 1 ? "s" : ""} for {product.product_name}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#c72920] focus:ring-offset-2 transition-all duration-200"
            >
              Close
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-white bg-[#c72920] border border-transparent rounded-lg hover:bg-[#a61f19] focus:outline-none focus:ring-2 focus:ring-[#c72920] focus:ring-offset-2 transition-all duration-200"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DealersModal
