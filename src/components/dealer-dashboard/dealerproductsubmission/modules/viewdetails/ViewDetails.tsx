"use client"
import Link from "next/link"
import dynamic from "next/dynamic"
const Button = dynamic(() => import("@/components/ui/button").then(mod => mod.Button), { ssr: false })
import { ArrowLeft } from "lucide-react"
import { Productcard } from "@/components/user-dashboard/product/module/productCard" // Corrected import path for custom component
import { useParams, useRouter } from "next/navigation"

// Simplified Product type for static data, matching the fields used in the UI
type Product = {
  sku_code?: string
  manufacturer_part_name?: string
  product_name?: string
  brand?: { brand_name: string }
  category?: { category_name: string }
  sub_category?: { subcategory_name: string }
  product_type?: string
  hsn_code?: string
  is_universal?: boolean
  is_consumable?: boolean
  make?: string
  model?: { model_name: string }
  year_range?: { year_name: string }[]
  variant?: { variant_name: string }[]
  fitment_notes?: string
  key_specifications?: string
  dimensions?: string
  weight?: number
  certifications?: string
  warranty?: number
  images?: string[]
  video_url?: string
  brochure_available?: boolean
  mrp_with_gst?: number
  gst_percentage?: number
  is_returnable?: boolean
  return_policy?: string
}

// Static data for the product, matching the screenshot content
const staticProduct: Product = {
  sku_code: "TOP-BRK-000453",
  manufacturer_part_name: "BP-456M-VL",
  product_name: "Front Brake Pad",
  brand: { brand_name: "Bosch" },
  category: { category_name: "Braking System" },
  sub_category: { subcategory_name: "Brake Pads" },
  product_type: "Aftermarket",
  hsn_code: "87083000",
  is_universal: false,
  is_consumable: true,
  make: "Maruti Suzuki",
  model: { model_name: "Swift" },
  year_range: [{ year_name: "2015-2020" }],
  variant: [{ variant_name: "ZXI, VXi Petrol" }],
  fitment_notes: "Only for ABS variants",
  key_specifications: "Ceramic, 18mm",
  dimensions: "90 x 65 x 20",
  weight: 0.45,
  certifications: "ISO 9001, ARAI Certified",
  warranty: 12,
  images: [
    "/placeholder.svg?height=200&width=300",
    "/placeholder.svg?height=100&width=100",
    "/placeholder.svg?height=100&width=100",
    "/placeholder.svg?height=100&width=100",
  ],
  video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Example YouTube URL
  brochure_available: true,
  mrp_with_gst: 1099.0,
  gst_percentage: 18,
  is_returnable: true,
  return_policy: "18 Days",
}

export default function ViewProductDetails() {
  const router = useRouter()
  const id = useParams<{ id: string }>() // useParams is a Client Component hook [^3]

  const handleEdit = () => {
    // Use a static ID or the actual ID if available from the URL
    router.push(`/user/dashboard/product/productedit/${id.id || "static-product-id"}`)
  }

  const handleGoBack = () => {
    router.back()
  }

  // The product data is now static
  const product = staticProduct

  return (
    <div className="min-h-screen bg-(neutral-100)-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline" // Change variant to outline
              size="icon"
              onClick={handleGoBack}
              aria-label="Go back"
              className="rounded-lg border-2 border-gray-400 p-2 bg-transparent" // Add custom classes for border and rounding
            >
              <ArrowLeft className="h-5 w-5 text-gray-900" /> {/* Ensure icon color is dark */}
            </Button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 font-sans">Product Details</h1>
              <p className="text-base font-medium font-sans text-gray-500">Add your product description</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="default" className="bg-red-500 hover:bg-(primary)-600 text-white" onClick={handleEdit}>
              Edit
            </Button>
          </div>
        </div>
      </div>
      {/* Content */}
      <div className="p-4 sm:p-6 space-y-8">
        {/* Top Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Product Information */}
          <div>
            <Productcard
              title="Basic Product Information"
              description="the core identifiers that define the product's identity, brand, and origin."
              data={
                product
                  ? [
                      { label: "SKU Code", value: product.sku_code || "-" },
                      {
                        label: "Manufacturer Part Number (MPN)",
                        value: product.manufacturer_part_name || "-",
                      },
                      { label: "Product Name", value: product.product_name || "-" },
                      { label: "Brand", value: product.brand?.brand_name || "-" },
                      { label: "HSN Code", value: product.hsn_code || "-" },
                    ]
                  : []
              }
            />
          </div>
          {/* Product Classification */}
          <div>
            <Productcard
              title="Product Classification"
              description="the product for catalog structure, filterability, and business logic."
              data={
                product
                  ? [
                      { label: "Category", value: product.category?.category_name || "-" },
                      {
                        label: "Sub-category",
                        value: product.sub_category?.subcategory_name || "-",
                      },
                      { label: "Product Type", value: product.product_type || "-" },
                      {
                        label: "Is Universal",
                        value: product.is_universal ? "True" : "False",
                      },
                      {
                        label: "Is Consumable",
                        value: product.is_consumable ? "True" : "False",
                      },
                    ]
                  : []
              }
            />
          </div>
        </div>
        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Vehicle Compatibility */}
          <Productcard
            title="Vehicle Compatibility"
            description="The vehicle make, model, and variant the product is compatible with."
            data={
              product
                ? [
                    { label: "Make", value: product.make || "-" },
                    { label: "Model", value: product.model?.model_name || "-" },
                    {
                      label: "Year Range",
                      value: Array.isArray(product.year_range)
                        ? product.year_range.map((y) => y.year_name).join(", ")
                        : "-",
                    },
                    {
                      label: "Variant",
                      value: Array.isArray(product.variant)
                        ? product.variant.map((v) => v.variant_name).join(", ")
                        : "-",
                    },
                    { label: "Fitment Notes", value: product.fitment_notes || "-" },
                  ]
                : []
            }
          />
          {/* Technical Specifications */}
          <Productcard
            title="Technical Specifications"
            description="Relevant technical details to help users understand the product quality and features."
            data={
              product
                ? [
                    { label: "Key Specifications", value: product.key_specifications || "-" },
                    { label: "Dimensions", value: product.dimensions || "-" },
                    {
                      label: "Weight",
                      value: product.weight ? `${product.weight} kg` : "-",
                    },
                    { label: "Certifications", value: product.certifications || "-" },
                    {
                      label: "Warranty",
                      value: product.warranty ? `${product.warranty} months` : "-",
                    },
                  ]
                : []
            }
          />
        </div>
        {/* Bottom Section - Media & Documentation and Pricing/Returns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Media & Documentation */}
          <Productcard
            title="Media & Documentation"
            description="product images, videos, and brochures to enhance visual representation and credibility."
            data={[]} // Data is rendered as children
          >
            <div className="col-span-2 space-y-4">
              <div className="grid grid-cols-2 gap-3 ">
                {product && Array.isArray(product.images) && product.images.length > 0 ? (
                  <>
                    {/* Show the first image as main */}
                    <img
                      src={product.images[0] || "/placeholder.svg"}
                      alt="Main product image"
                      width={300}
                      height={200}
                      className="aspect-video bg-gray-200 rounded-md object-cover"
                    />
                    {/* Show remaining images, if any */}
                    <div className={`grid grid-cols-2 gap-2`}>
                      {product.images.slice(1).map((img: string, idx: number) => (
                        <img
                          key={idx}
                          src={img || "/placeholder.svg"}
                          alt={`Product thumbnail ${idx + 1}`}
                          width={100}
                          height={100}
                          className="aspect-square bg-gray-200 rounded-md object-cover"
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  // No images at all
                  <div className="col-span-2 aspect-video bg-gray-200 rounded-md" />
                )}
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 ">Video URL</span>
                  {product?.video_url ? (
                    <Link
                      href={product.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Youtube
                    </Link>
                  ) : (
                    <span className="text-sm text-gray-400">N/A</span>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Brochure Available</span>
                  <span className="text-sm font-medium text-gray-900">
                    {product && typeof product.brochure_available === "boolean"
                      ? product.brochure_available
                        ? "True"
                        : "False"
                      : "False"}
                  </span>
                </div>
              </div>
            </div>
          </Productcard>
          {/* Right column for Pricing & Tax and Returns & Availability */}
          <div className="space-y-6">
            {/* Pricing & Tax */}
            <Productcard
              title="Pricing Details"
              description="The pricing and tax information required for listing and billing."
              data={
                product
                  ? [
                      {
                        label: "MRP (with GST)",
                        value: product.mrp_with_gst ? `₹${product.mrp_with_gst.toFixed(2)}` : "-",
                      },
                      {
                        label: "GST %",
                        value: product.gst_percentage ? String(product.gst_percentage) : "-",
                      },
                    ]
                  : []
              }
            />
            {/* Returns & Availability */}
            <Productcard
              title="Returns & Availability"
              description="Product return eligibility and applicable return conditions."
              data={
                product
                  ? [
                      {
                        label: "Returnable",
                        value: product.is_returnable ? "True" : "False",
                      },
                      {
                        label: "Return Policy",
                        value: product.return_policy || "-",
                      },
                    ]
                  : []
              }
            />
          </div>
        </div>
      </div>
    </div>
  )
}
