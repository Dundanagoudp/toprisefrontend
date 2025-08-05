"use client"
import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// Import the separated schema and type
import { productSchema, type FormValues } from "@/lib/schemas/product-schema"

export default function DealerAddProducts() {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      is_universal: false,
      is_consumable: false,
      brochure_available: "no",
      is_returnable: false,
      no_of_stock: 0,
      // Default values for new fields if needed, or ensure they are optional in schema
    },
  })

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    console.log("Form submitted with data:", data)
    alert("Product form submitted successfully (API call removed for demonstration). Check console for data.")
    reset()
  }

  // Prevent form submission on Enter key in any input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === "Enter") {
      const target = e.target as HTMLElement
      if (target.tagName !== "TEXTAREA" && target.getAttribute("type") !== "submit") {
        e.preventDefault()
      }
    }
  }

  return (
    <div className="flex-1 p-4 md:p-6 bg-neutral-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 font-sans">Add Product</h1>
          <p className="text-base font-medium font-sans text-gray-500">Add your product description</p>
        </div>
      </div>
      <form
        id="add-product-form"
        onSubmit={handleSubmit(onSubmit, (errors) => {
          console.log("Form validation failed", errors)
        })}
        onKeyDown={handleKeyDown}
        className="space-y-6"
      >
        {/* Core Product Identity */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-red-600 font-bold text-lg font-sans">Core Product Identity</CardTitle>
            <p className="text-sm text-[#737373] font-medium font-sans">
              Essential details to uniquely identify and describe the product.
            </p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sku Code */}
            <div className="space-y-2">
              <Label htmlFor="skuCode" className="text-base font-medium font-sans">
                SKU Code
              </Label>
              <Input
                id="skuCode"
                placeholder="Enter SKU Code"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("sku_code")}
              />
              {errors.sku_code && <span className="text-red-500 text-sm">{errors.sku_code.message}</span>}
            </div>
            {/* No. of Stock */}
            <div className="space-y-2">
              <Label htmlFor="noOfStock" className="text-base font-medium font-sans">
                No. of Stock
              </Label>
              <Input
                id="noOfStock"
                type="number"
                step="1"
                min="0"
                placeholder="Enter No. of Stock"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("no_of_stock", { valueAsNumber: true })}
              />
              {errors.no_of_stock && <span className="text-red-500 text-sm">{errors.no_of_stock.message}</span>}
            </div>
            {/* Manufacturer Part Number */}
            <div className="space-y-2">
              <Label htmlFor="manufacturerPartNumber" className="text-base font-medium font-sans">
                Manufacturer Part Number (MPN)
              </Label>
              <Input
                id="manufacturerPartNumber"
                placeholder="Enter Manufacturer Part Number (MPN)"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("manufacturer_part_name")}
              />
              {errors.manufacturer_part_name && (
                <span className="text-red-500 text-sm">{errors.manufacturer_part_name.message}</span>
              )}
            </div>
            {/* Product Name */}
            <div className="space-y-2">
              <Label htmlFor="productName" className="text-base font-medium font-sans">
                Product Name
              </Label>
              <Input
                id="productName"
                placeholder="Enter Product Name"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("product_name")}
              />
              {errors.product_name && <span className="text-red-500 text-sm">{errors.product_name.message}</span>}
            </div>
            {/* HSN Code */}
            <div className="space-y-2">
              <Label htmlFor="hsnCode" className="text-base font-medium font-sans">
                HSN Code
              </Label>
              <Input
                id="hsnCode"
                placeholder="Enter HSN Code"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                type="number"
                {...register("hsn_code", { valueAsNumber: true })}
              />
              {errors.hsn_code && <span className="text-red-500 text-sm">{errors.hsn_code.message}</span>}
            </div>
          </CardContent>
        </Card>

        {/* Product Classification */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-red-600 font-bold text-lg font-sans">Product Classification</CardTitle>
            <p className="text-sm text-[#737373] font-medium font-sans">
              Classify the product for catalog structure, filterability, and business logic.
            </p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category" className="text-base font-medium font-sans">
                Category
              </Label>
              <Select onValueChange={(value) => setValue("category", value)} value={watch("category")}>
                <SelectTrigger id="category" className="bg-gray-50 border-gray-200 rounded-[8px] p-4 w-full">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="category1">Category 1</SelectItem>
                  <SelectItem value="category2">Category 2</SelectItem>
                  <SelectItem value="category3">Category 3</SelectItem>
                </SelectContent>
              </Select>
              {errors.category && <span className="text-red-500 text-sm">{errors.category.message}</span>}
            </div>
            {/* Sub-category */}
            <div className="space-y-2">
              <Label htmlFor="subCategory" className="text-base font-medium font-sans">
                Sub-category
              </Label>
              <Select onValueChange={(value) => setValue("sub_category", value)} value={watch("sub_category")}>
                <SelectTrigger id="subCategory" className="bg-gray-50 border-gray-200 rounded-[8px] p-4 w-full">
                  <SelectValue placeholder="Select Sub-category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="subcategory1">Sub-category 1</SelectItem>
                  <SelectItem value="subcategory2">Sub-category 2</SelectItem>
                </SelectContent>
              </Select>
              {errors.sub_category && <span className="text-red-500 text-sm">{errors.sub_category.message}</span>}
            </div>
            {/* Product Type (OE, OEM, Aftermarket) */}
            <div className="space-y-2">
              <Label htmlFor="productType" className="text-base font-medium font-sans">
                Product Type
              </Label>
              <Select onValueChange={(value) => setValue("product_type", value)} defaultValue={watch("product_type")}>
                <SelectTrigger id="productType" className="bg-gray-50 border-gray-200 rounded-[8px] p-4 w-full">
                  <SelectValue placeholder="Select Product Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OE">OE</SelectItem>
                  <SelectItem value="OEM">OEM</SelectItem>
                  <SelectItem value="AfterMarket">Aftermarket</SelectItem>
                </SelectContent>
              </Select>
              {errors.product_type && <span className="text-red-500 text-sm">{errors.product_type.message}</span>}
            </div>
            {/* Is Universal */}
            <div className="space-y-2">
              <Label htmlFor="isUniversal" className="text-base font-medium font-sans">
                Is Universal
              </Label>
              <Select
                onValueChange={(value) => setValue("is_universal", value === "yes")}
                defaultValue={watch("is_universal") ? "yes" : "no"}
              >
                <SelectTrigger id="isUniversal" className="bg-gray-50 border-gray-200 rounded-[8px] p-4 w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
              {errors.is_universal && <span className="text-red-500 text-sm">{errors.is_universal.message}</span>}
            </div>
            {/* Is Consumable */}
            <div className="space-y-2">
              <Label htmlFor="isConsumable" className="text-base font-medium font-sans">
                Is Consumable
              </Label>
              <Select
                onValueChange={(value) => setValue("is_consumable", value === "yes")}
                defaultValue={watch("is_consumable") ? "yes" : "no"}
              >
                <SelectTrigger id="isConsumable" className="bg-gray-50 border-gray-200 rounded-[8px] p-4 w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
              {errors.is_consumable && <span className="text-red-500 text-sm">{errors.is_consumable.message}</span>}
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Compatibility */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-red-600 font-bold text-lg font-sans">Vehicle Compatibility</CardTitle>
            <p className="text-sm text-[#737373] font-medium font-sans">
              Specify which vehicle make, model, and variant the product is compatible with.
            </p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Brand */}
            <div className="space-y-2">
              <Label htmlFor="brand" className="text-base font-medium font-sans">
                Brand
              </Label>
              <Select
                onValueChange={(value) => {
                  setValue("brand", value)
                }}
                value={watch("brand")}
              >
                <SelectTrigger id="brand" className="bg-gray-50 border-gray-200 rounded-[8px] p-4 w-full">
                  <SelectValue placeholder="Select Brand" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="brand1">Brand A</SelectItem>
                  <SelectItem value="brand2">Brand B</SelectItem>
                </SelectContent>
              </Select>
              {errors.brand && <span className="text-red-500 text-sm">{errors.brand.message}</span>}
            </div>
            {/* Make */}
            <div className="space-y-2">
              <Label htmlFor="make" className="text-base font-medium font-sans">
                Make
              </Label>
              <Input
                id="make"
                placeholder="Enter Make"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("make")}
              />
              {errors.make && <span className="text-red-500 text-sm">{errors.make.message}</span>}
            </div>
            {/* Model */}
            <div className="space-y-2">
              <Label htmlFor="model" className="text-base font-medium font-sans">
                Model
              </Label>
              <Select
                onValueChange={(value) => {
                  setValue("model", value)
                }}
                value={watch("model")}
              >
                <SelectTrigger id="model" className="bg-gray-50 border-gray-200 rounded-[8px] p-4 w-full">
                  <SelectValue placeholder="Select Model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="model1">Model X</SelectItem>
                  <SelectItem value="model2">Model Y</SelectItem>
                </SelectContent>
              </Select>
              {errors.model && <span className="text-red-500 text-sm">{errors.model.message}</span>}
            </div>
            {/* Year Range */}
            <div className="space-y-2">
              <Label htmlFor="yearRange" className="text-base font-medium font-sans">
                Year Range
              </Label>
              <Select onValueChange={(value) => setValue("year_range", value)} value={watch("year_range")}>
                <SelectTrigger id="yearRange" className="bg-gray-50 border-gray-200 rounded-[8px] p-4 w-full">
                  <SelectValue placeholder="Select Year Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2020-2022">2020-2022</SelectItem>
                  <SelectItem value="2023-Present">2023-Present</SelectItem>
                </SelectContent>
              </Select>
              {errors.year_range && <span className="text-red-500 text-sm">{errors.year_range.message}</span>}
            </div>
            {/* Variant */}
            <div className="space-y-2">
              <Label htmlFor="variant" className="text-base font-medium font-sans">
                Variant
              </Label>
              <Select onValueChange={(value) => setValue("variant", value)} value={watch("variant")}>
                <SelectTrigger id="variant" className="bg-gray-50 border-gray-200 rounded-[8px] p-4 w-full">
                  <SelectValue placeholder="Select Variant" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="variant1">Variant A</SelectItem>
                  <SelectItem value="variant2">Variant B</SelectItem>
                </SelectContent>
              </Select>
              {errors.variant && <span className="text-red-500 text-sm">{errors.variant.message}</span>}
            </div>
            {/* Vehicle Type */}
            <div className="space-y-2">
              <Label htmlFor="vehicleType" className="text-base font-medium font-sans">
                Vehicle Type
              </Label>
              <Input
                id="vehicleType"
                placeholder="Enter Vehicle Type"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("vehicle_type")}
              />
              {errors.vehicle_type && <span className="text-red-500 text-sm">{errors.vehicle_type.message}</span>}
            </div>
            {/* Fitment Notes */}
            <div className="space-y-2">
              <Label htmlFor="fitmentNotes" className="text-base font-medium font-sans">
                Fitment Notes
              </Label>
              <Input
                id="fitmentNotes"
                placeholder="Enter Fitment Notes"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("fitment_notes")}
              />
              {errors.fitment_notes && <span className="text-red-500 text-sm">{errors.fitment_notes.message}</span>}
            </div>
            {/* Fulfillment Priority */}
            <div className="space-y-2">
              <Label htmlFor="fulfillmentPriority" className="text-base font-medium font-sans">
                Fulfillment Priority
              </Label>
              <Input
                id="fulfillmentPriority"
                type="number"
                step="1"
                min="0"
                placeholder="Enter Fulfillment Priority"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("fulfillment_priority", { valueAsNumber: true })}
              />
              {errors.fulfillment_priority && (
                <span className="text-red-500 text-sm">{errors.fulfillment_priority.message}</span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Technical Specifications */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-red-600 font-bold text-lg font-sans">Technical Specifications</CardTitle>
            <p className="text-sm text-[#737373] font-medium font-sans">
              Add all relevant technical details to help users understand the product quality and features.
            </p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Key Specifications */}
            <div className="space-y-2">
              <Label htmlFor="keySpecifications" className="text-base font-medium font-sans">
                Key Specifications
              </Label>
              <Input
                id="keySpecifications"
                placeholder="Enter Key Specifications"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("keySpecifications")}
              />
              {errors.keySpecifications && (
                <span className="text-red-500 text-sm">{errors.keySpecifications.message}</span>
              )}
            </div>
            {/* Dimensions */}
            <div className="space-y-2">
              <Label htmlFor="dimensions" className="text-base font-medium font-sans">
                Dimensions
              </Label>
              <Input
                id="dimensions"
                placeholder="Enter Dimensions"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("dimensions")}
              />
              {errors.dimensions && <span className="text-red-500 text-sm">{errors.dimensions.message}</span>}
            </div>
            {/* Weight */}
            <div className="space-y-2">
              <Label htmlFor="weight" className="text-base font-medium font-sans">
                Weight
              </Label>
              <Input
                id="weight"
                placeholder="Enter Weight"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                type="number"
                {...register("weight", { valueAsNumber: true })}
              />
              {errors.weight && <span className="text-red-500 text-sm">{errors.weight.message}</span>}
            </div>
            {/* Certifications */}
            <div className="space-y-2">
              <Label htmlFor="certifications" className="text-base font-medium font-sans">
                Certifications
              </Label>
              <Input
                id="certifications"
                placeholder="Enter Certifications"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("certifications")}
              />
              {errors.certifications && <span className="text-red-500 text-sm">{errors.certifications.message}</span>}
            </div>
            {/* Warranty */}
            <div className="space-y-2">
              <Label htmlFor="warranty" className="text-base font-medium font-sans">
                Warranty
              </Label>
              <Input
                id="warranty"
                type="number"
                step="1"
                min="0"
                placeholder="Enter Warranty (months)"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("warranty", { valueAsNumber: true })}
              />
              {errors.warranty && <span className="text-red-500 text-sm">{errors.warranty.message}</span>}
            </div>
          </CardContent>
        </Card>

        {/* Media & Documentation */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-red-600 font-bold text-lg font-sans">Media & Documentation</CardTitle>
            <p className="text-sm text-[#737373] font-medium font-sans">
              Upload product images, videos, and brochures to enhance product representation and credibility.
            </p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Images */}
            <div className="space-y-2">
              <Label htmlFor="images" className="text-base font-medium font-sans">
                Images
              </Label>
              <Input
                id="images"
                placeholder="Enter Image URL(s) (comma-separated)"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("images")}
              />
              {errors.images && <span className="text-red-500 text-sm">{errors.images.message}</span>}
            </div>
            {/* Video URL */}
            <div className="space-y-2">
              <Label htmlFor="videoUrl" className="text-base font-medium font-sans">
                Video URL
              </Label>
              <Input
                id="videoUrl"
                placeholder="Enter Video URL"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("videoUrl")}
              />
              {errors.videoUrl && <span className="text-red-500 text-sm">{errors.videoUrl.message}</span>}
            </div>
            {/* Brochure Available */}
            <div className="space-y-2">
              <Label htmlFor="brouchureAvailable" className="text-base font-medium font-sans">
                Brochure Available
              </Label>
              <Select onValueChange={(value) => setValue("brochure_available", value)} defaultValue="no">
                <SelectTrigger id="brouchureAvailable" className="bg-gray-50 border-gray-200 rounded-[8px] p-4 w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
              {errors.brochure_available && (
                <span className="text-red-500 text-sm">{errors.brochure_available.message}</span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pricing Details */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-red-600 font-bold text-lg font-sans">Pricing Details</CardTitle>
            <p className="text-sm text-[#737373] font-medium font-sans">
              Provide the pricing and tax information required for listing and billing.
            </p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* MRP (with GST) */}
            <div className="space-y-2">
              <Label htmlFor="mrp" className="text-base font-medium font-sans">
                MRP (with GST)
              </Label>
              <Input
                id="mrp"
                type="number"
                placeholder="Enter MRP"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("mrp_with_gst", { valueAsNumber: true })}
              />
              {errors.mrp_with_gst && <span className="text-red-500 text-sm">{errors.mrp_with_gst.message}</span>}
            </div>
            {/* Selling Price (Required) */}
            <div className="space-y-2">
              <Label htmlFor="selling_price" className="text-base font-medium font-sans">
                Selling Price <span className="text-red-500">*</span>
              </Label>
              <Input
                id="selling_price"
                type="number"
                step="1"
                min="0"
                placeholder="Enter Selling Price"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("selling_price", { valueAsNumber: true })}
              />
              {errors.selling_price && <span className="text-red-500 text-sm">{errors.selling_price.message}</span>}
            </div>
            {/* GST % */}
            <div className="space-y-2">
              <Label htmlFor="gst" className="text-base font-medium font-sans">
                GST %
              </Label>
              <Input
                id="gst_percentage"
                type="number"
                placeholder="Enter GST %"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("gst_percentage", { valueAsNumber: true })}
              />
              {errors.gst_percentage && <span className="text-red-500 text-sm">{errors.gst_percentage.message}</span>}
            </div>
          </CardContent>
        </Card>

        {/* Returns & Availability */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-red-600 font-bold text-lg font-sans">Returns & Availability</CardTitle>
            <p className="text-sm text-[#737373] font-medium font-sans">
              Define product return eligibility and applicable return conditions.
            </p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Returnable */}
            <div className="space-y-2">
              <Label htmlFor="returnable" className="text-base font-medium font-sans">
                Returnable
              </Label>
              <Select
                onValueChange={(value) => setValue("is_returnable", value === "yes")}
                value={watch("is_returnable") ? "yes" : "no"}
              >
                <SelectTrigger id="returnable" className="bg-gray-50 border-gray-200 rounded-[8px] p-4 w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
              {errors.is_returnable && <span className="text-red-500 text-sm">{errors.is_returnable.message}</span>}
            </div>
            {/* Return Policy */}
            <div className="space-y-2">
              <Label htmlFor="returnPolicy" className="text-base font-medium font-sans">
                Return Policy
              </Label>
              <Input
                id="returnPolicy"
                placeholder="Enter Return Policy"
                className="bg-gray-50 border-gray-200 rounded-[8px] p-4"
                {...register("return_policy")}
              />
              {errors.return_policy && <span className="text-red-500 text-sm">{errors.return_policy.message}</span>}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end pt-4">
          <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg shadow-sm">
            Add Product
          </Button>
        </div>
      </form>
    </div>
  )
}
