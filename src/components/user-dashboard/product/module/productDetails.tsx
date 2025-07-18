"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pencil } from "lucide-react"
import { Productcard } from "./productCard"

export default function ViewProductDetails() {
  const [status, setStatus] = React.useState("Approved")

  const getStatusColor = (currentStatus: string) => {
    switch (currentStatus) {
      case "Created":
        return "text-gray-600 bg-gray-50 border-gray-200"
      case "Approved":
        return "text-green-600 bg-green-50 border-green-200"
      case "Pending":
        return "text-orange-600 bg-orange-50 border-orange-200"
      case "Rejected":
        return "text-red-600 bg-red-50 border-red-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  return (
    <div className="min-h-screen bg-(neutral-100)-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Product Overview</h1>
            <p className="text-sm text-gray-500">Add your product description</p>
          </div>
          <div className="flex items-center gap-3">
            <Select onValueChange={setStatus} value={status}>
              <SelectTrigger className={`min-w-[120px] ${getStatusColor(status)}`}>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Created">Created</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              className="flex items-center gap-2 bg-red-50 border-red-200 hover:bg-red-100 text-red-600"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 space-y-8">
        {/* Core Product Identity */}
        <div>
          <Productcard
            title="Core Product Identity"
            description="the core identifiers that define the product's identity, brand, and origin."
            data={[
              { label: "SKU Code", value: "TOP-BRK-000453" },
              { label: "Manufacturer Part Number (MPN)", value: "BP-456M-VL" },
              { label: "Product Name", value: "Front Brake Pad" },
              { label: "Brand", value: "Bosch" },
              { label: "Category", value: "Braking System" },
              { label: "Sub-category", value: "Brake Pads" },
              { label: "Product Type", value: "Aftermarket" },
              { label: "HSN Code", value: "87083000" },
            ]}
          />
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Vehicle Compatibility */}
          <Productcard
            title="Vehicle Compatibility"
            description="The vehicle make, model, and variant the product is compatible with."
            data={[
              { label: "Make", value: "Maruti Suzuki" },
              { label: "Model", value: "Swift" },
              { label: "Year Range", value: "2015-2020" },
              { label: "Variant", value: "ZXI, VXI Petrol" },
              { label: "Fitment Notes", value: "Only for ABS variants" },
              { label: "Is Universal", value: "False" },
            ]}
          />

          {/* Technical Specifications */}
          <Productcard
            title="Technical Specifications"
            description="Relevant technical details to help users understand the product quality and features."
            data={[
              { label: "Key Specifications", value: "Ceramic, 18mm" },
              { label: "Dimensions", value: "90 x 65 x 20" },
              { label: "Weight", value: "0.45 kg" },
              { label: "Certifications", value: "ISO 9001, ARAI Certified" },
              { label: "Warranty", value: "12" },
              { label: "Is Consumable", value: "True" },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Media & Assets */}
          <Productcard
            title="Media & Assets"
            description="product images, videos, and brochures to enhance visual representation and credibility."
            data={[]}
          >
            <div className="col-span-2 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="aspect-video bg-gray-200 rounded-md" />
                <div className="grid grid-cols-2 gap-2">
                  <div className="aspect-square bg-gray-200 rounded-md" />
                  <div className="aspect-square bg-gray-200 rounded-md" />
                  <div className="aspect-square bg-gray-200 rounded-md" />
                  <div className="aspect-square bg-gray-200 rounded-md" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Video URL</span>
                  <a href="#" className="text-sm font-medium text-blue-600 hover:underline">
                    Youtube
                  </a>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Brochure Available</span>
                  <span className="text-sm font-medium text-gray-900">True</span>
                </div>
              </div>
            </div>
          </Productcard>

          {/* Pricing & Tax */}
          <Productcard
            title="Pricing & Tax"
            description="The pricing and tax information required for listing and billing."
            data={[
              { label: "MRP (with GST)", value: "₹1,099.00" },
              { label: "GST %", value: "18" },
              { label: "Returnable", value: "True" },
              { label: "Return Policy", value: "sdfghj'jhgfx" },
            ]}
          />
        </div>

        {/* Bottom Section */}
        <div className="space-y-6">
          {/* Dealer-Level Mapping & Routing */}
          <Productcard
            title="Dealer-Level Mapping & Routing"
            description="the core identifiers that define the product's identity, brand, and origin."
            data={[
              { label: "Available Dealers", value: "DLR102" },
              { label: "Quantity per Dealer", value: "DLR102" },
              { label: "Dealer Margin %", value: "DLR102" },
              { label: "Dealer Priority Override", value: "DLR102" },
              { label: "Stock Expiry Rule", value: "Front Brake Pad" },
              { label: "Last Stock Update", value: "Bosch" },
              { label: "Last Inquired At", value: "Aftermarket" },
            ]}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* SEO & Search Optimization */}
            <Productcard
              title="SEO & Search Optimization"
              description="The pricing and tax information required for listing and billing."
              data={[
                { label: "SEO Title", value: "lkjhxgfghjk" },
                { label: "SEO Description", value: "qasdf" },
                { label: "Search Tags", value: "swift pad, disc brake, brake pad petrol" },
              ]}
            />

            {/* Status, Audit & Metadata */}
            <Productcard
              title="Status, Audit & Metadata"
              description="The pricing and tax information required for listing and billing."
              data={[
                { label: "Created By", value: "USR102" },
                { label: "Modified At / By", value: "2025-04-30 11:10 by USR204" },
                { label: "Change Log", value: "{{field: 'Price', from: 999, to: 1099}}" },
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
