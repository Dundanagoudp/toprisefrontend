"use client";
import React, { useEffect } from 'react';
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const schema = z.object({
  skuCode: z.string().min(1, "SKU Code is required"),
  manufacturerPartNumber: z.string().optional(),
  productName: z.string().min(1, "Product Name is required"),
  brand: z.string().optional(),
  hsnCode: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  subCategory: z.string().min(1, "Sub-category is required"),
  productType: z.string().min(1, "Product type is required"),
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  yearRange: z.string().optional(),
  variant: z.string().min(1, "Variant is required"),
  fitmentNotes: z.string().optional(),
  isUniversal: z.string().optional(),
  isConsumable: z.string().optional(),
  keySpecifications: z.string().optional(),
  dimensions: z.string().optional(),
  weight: z.string().optional(),
  certifications: z.string().optional(),
  warranty: z.string().optional(),
  images: z.string().optional(),
  videoUrl: z.string().optional(),
  brouchureAvailable: z.string().optional(),
  mrp: z.string().min(1, "MRP is required"),
  gst: z.string().min(1, "GST is required"),
  returnable: z.string().min(1, "Returnable is required"),
  returnPolicy: z.string().min(1, "Return Policy is required"),
  availableDealers: z.string().optional(),
  quantityPerDealer: z.string().optional(),
  dealerMargin: z.string().optional(),
  dealerPriorityOverride: z.string().optional(),
  stockExpiryRule: z.string().optional(),
  lastStockUpdate: z.string().optional(),
  active: z.string().optional(),
  createdBy: z.string().optional(),
  modifiedAtBy: z.string().optional(),
  changeLog: z.string().optional(),
  seoTitle: z.string().optional(),
  searchTags: z.string().optional(),
  seoDescription: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const dummyData: FormValues = {
  skuCode: "TOP-BRK-000453",
  manufacturerPartNumber: "BP-456M-VL",
  productName: "Front Brake Pad",
  brand: "Bosch",
  hsnCode: "87083000",
  category: "category1",
  subCategory: "subCategory1",
  productType: "type1",
  make: "make1",
  model: "model1",
  yearRange: "2020-2022",
  variant: "variant1",
  fitmentNotes: "Fits most 2016-2020 Swift models.",
  isUniversal: "no",
  isConsumable: "no",
  keySpecifications: "High performance, long life",
  dimensions: "200x50x30mm",
  weight: "1.2kg",
  certifications: "ISO 9001",
  warranty: "2 years",
  images: "image1.jpg",
  videoUrl: "https://youtu.be/example",
  brouchureAvailable: "yes",
  mrp: "1099",
  gst: "18",
  returnable: "yes",
  returnPolicy: "30 days return",
  availableDealers: "Dealer1, Dealer2",
  quantityPerDealer: "100",
  dealerMargin: "10",
  dealerPriorityOverride: "",
  stockExpiryRule: "6 months",
  lastStockUpdate: "2024-05-01",
  active: "yes",
  createdBy: "USR102",
  modifiedAtBy: "USR204",
  changeLog: "Price updated from 999 to 1099",
  seoTitle: "Swift Brake Pad",
  searchTags: "swift pad, disc brake, brake pad petrol",
  seoDescription: "High quality brake pad for Swift 2016-2020",
};

export default function ProductEdit() {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: dummyData,
  });

  // If you want to simulate fetching, you could use useEffect to set values
  useEffect(() => {
    Object.entries(dummyData).forEach(([key, value]) => {
      setValue(key as keyof FormValues, value as any);
    });
  }, [setValue]);

  const onSubmit = (data: FormValues) => {
    console.log("Updated Product Data:", data);
    alert("Product updated! Check console for data.");
  };

  return (
    <div className="flex-1 p-4 md:p-6 bg-(neutral-100)-50 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Edit Product</h1>
          <p className="text-sm text-gray-500">Edit your product details below</p>
        </div>
      </div>
      <form id="edit-product-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Core Product Identity */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-red-600 font-semibold text-lg">Core Product Identity</CardTitle>
            <p className="text-sm text-gray-500">Classify the product for catalog structure, filterability, and business logic.</p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sku Code */}
            <div className="space-y-2">
              <Label htmlFor="skuCode" className="text-sm font-medium">Sku Code</Label>
              <Input id="skuCode" placeholder="Enter Sku Code" className="bg-gray-50 border-gray-200 rounded-[8px] p-4" {...register("skuCode")} />
              {errors.skuCode && <span className="text-red-500 text-sm">{errors.skuCode.message}</span>}
            </div>
            {/* Manufacturer Part Number */}
            <div className="space-y-2">
              <Label htmlFor="manufacturerPartNumber" className="text-sm font-medium">Manufacturer Part Number (MPN)</Label>
              <Input id="manufacturerPartNumber" placeholder="Part Number" className="bg-gray-50 border-gray-200 rounded-[8px] p-4" {...register("manufacturerPartNumber")} />
              {errors.manufacturerPartNumber && <span className="text-red-500 text-sm">{errors.manufacturerPartNumber.message}</span>}
            </div>
            {/* Product Name */}
            <div className="space-y-2">
              <Label htmlFor="productName" className="text-sm font-medium">Product Name</Label>
              <Input id="productName" placeholder="Enter Product Name" className="bg-gray-50 border-gray-200 rounded-[8px] p-4" {...register("productName")} />
              {errors.productName && <span className="text-red-500 text-sm">{errors.productName.message}</span>}
            </div>
            {/* Brand */}
            <div className="space-y-2">
              <Label htmlFor="brand" className="text-sm font-medium">Brand</Label>
              <Input id="brand" placeholder="Enter Brand" className="bg-gray-50 border-gray-200 rounded-[8px] p-4" {...register("brand")} />
              {errors.brand && <span className="text-red-500 text-sm">{errors.brand.message}</span>}
            </div>
            {/* HSN Code */}
            <div className="space-y-2">
              <Label htmlFor="hsnCode" className="text-sm font-medium">HSN Code</Label>
              <Input id="hsnCode" placeholder="Enter HSN Code" className="bg-gray-50 border-gray-200 rounded-[8px] p-4" {...register("hsnCode")} />
              {errors.hsnCode && <span className="text-red-500 text-sm">{errors.hsnCode.message}</span>}
            </div>
            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium">Category</Label>
              <Select onValueChange={(value) => setValue("category", value)} defaultValue={dummyData.category}>
                <SelectTrigger id="category" className="bg-gray-50 border-gray-200 rounded-[8px] p-4 w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="category1">Category 1</SelectItem>
                  <SelectItem value="category2">Category 2</SelectItem>
                </SelectContent>
              </Select>
              {errors.category && <span className="text-red-500 text-sm">{errors.category.message}</span>}
            </div>
            {/* Sub-category */}
            <div className="space-y-2">
              <Label htmlFor="subCategory" className="text-sm font-medium">Sub-category</Label>
              <Select onValueChange={(value) => setValue("subCategory", value)} defaultValue={dummyData.subCategory}>
                <SelectTrigger id="subCategory" className="bg-gray-50 border-gray-200 rounded-[8px] p-4 w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="subCategory1">Sub-category 1</SelectItem>
                  <SelectItem value="subCategory2">Sub-category 2</SelectItem>
                </SelectContent>
              </Select>
              {errors.subCategory && <span className="text-red-500 text-sm">{errors.subCategory.message}</span>}
            </div>
            {/* Product Type */}
            <div className="space-y-2">
              <Label htmlFor="productType" className="text-sm font-medium">Product Type</Label>
              <Select onValueChange={(value) => setValue("productType", value)} defaultValue={dummyData.productType}>
                <SelectTrigger id="productType" className="bg-gray-50 border-gray-200 rounded-[8px] p-4 w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="type1">Type 1</SelectItem>
                  <SelectItem value="type2">Type 2</SelectItem>
                </SelectContent>
              </Select>
              {errors.productType && <span className="text-red-500 text-sm">{errors.productType.message}</span>}
            </div>
          </CardContent>
        </Card>
        {/* Vehicle Compatibility */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-red-600 font-semibold text-lg">Vehicle Compatibility</CardTitle>
            <p className="text-sm text-gray-500">Specify which vehicle make, model, and variant the product is compatible with.</p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Make */}
            <div className="space-y-2">
              <Label htmlFor="make" className="text-sm font-medium">Make</Label>
              <Select onValueChange={(value) => setValue("make", value)} defaultValue={dummyData.make}>
                <SelectTrigger id="make" className="bg-gray-50 border-gray-200 rounded-[8px] p-4 w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="make1">Make 1</SelectItem>
                  <SelectItem value="make2">Make 2</SelectItem>
                </SelectContent>
              </Select>
              {errors.make && <span className="text-red-500 text-sm">{errors.make.message}</span>}
            </div>
            {/* Model */}
            <div className="space-y-2">
              <Label htmlFor="model" className="text-sm font-medium">Model</Label>
              <Select onValueChange={(value) => setValue("model", value)} defaultValue={dummyData.model}>
                <SelectTrigger id="model" className="bg-gray-50 border-gray-200 rounded-[8px] p-4 w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="model1">Model 1</SelectItem>
                  <SelectItem value="model2">Model 2</SelectItem>
                </SelectContent>
              </Select>
              {errors.model && <span className="text-red-500 text-sm">{errors.model.message}</span>}
            </div>
            {/* Year Range */}
            <div className="space-y-2">
              <Label htmlFor="yearRange" className="text-sm font-medium">Year Range</Label>
              <Select onValueChange={(value) => setValue("yearRange", value)} defaultValue={dummyData.yearRange}>
                <SelectTrigger id="yearRange" className="bg-gray-50 border-gray-200 rounded-[8px] p-4 w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2020-2022">2020-2022</SelectItem>
                  <SelectItem value="2023-2025">2023-2025</SelectItem>
                </SelectContent>
              </Select>
              {errors.yearRange && <span className="text-red-500 text-sm">{errors.yearRange.message}</span>}
            </div>
            {/* Variant */}
            <div className="space-y-2">
              <Label htmlFor="variant" className="text-sm font-medium">Variant</Label>
              <Select onValueChange={(value) => setValue("variant", value)} defaultValue={dummyData.variant}>
                <SelectTrigger id="variant" className="bg-gray-50 border-gray-200 rounded-[8px] p-4 w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="variant1">Variant 1</SelectItem>
                  <SelectItem value="variant2">Variant 2</SelectItem>
                </SelectContent>
              </Select>
              {errors.variant && <span className="text-red-500 text-sm">{errors.variant.message}</span>}
            </div>
            {/* Fitment Notes */}
            <div className="space-y-2">
              <Label htmlFor="fitmentNotes" className="text-sm font-medium">Fitment Notes</Label>
              <Input id="fitmentNotes" placeholder="Enter Fitment Notes" className="bg-gray-50 border-gray-200 rounded-[8px] p-4" {...register("fitmentNotes")} />
              {errors.fitmentNotes && <span className="text-red-500 text-sm">{errors.fitmentNotes.message}</span>}
            </div>
            {/* Is Universal */}
            <div className="space-y-2">
              <Label htmlFor="isUniversal" className="text-sm font-medium">Is Universal</Label>
              <Select onValueChange={(value) => setValue("isUniversal", value)} defaultValue={dummyData.isUniversal}>
                <SelectTrigger id="isUniversal" className="bg-gray-50 border-gray-200 rounded-[8px] p-4 w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
              {errors.isUniversal && <span className="text-red-500 text-sm">{errors.isUniversal.message}</span>}
            </div>
          </CardContent>
        </Card>
        {/* Technical Specifications */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-red-600 font-semibold text-lg">Technical Specifications</CardTitle>
            <p className="text-sm text-gray-500">Add all relevant technical details to help users understand the product quality and features.</p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Key Specifications */}
            <div className="space-y-2">
              <Label htmlFor="keySpecifications" className="text-sm font-medium">Key Specifications</Label>
              <Input id="keySpecifications" placeholder="Enter Key Specifications" className="bg-gray-50 border-gray-200 rounded-[8px] p-4" {...register("keySpecifications")} />
              {errors.keySpecifications && <span className="text-red-500 text-sm">{errors.keySpecifications.message}</span>}
            </div>
            {/* Dimensions */}
            <div className="space-y-2">
              <Label htmlFor="dimensions" className="text-sm font-medium">Dimensions</Label>
              <Input id="dimensions" placeholder="Enter Dimensions" className="bg-gray-50 border-gray-200 rounded-[8px] p-4" {...register("dimensions")} />
              {errors.dimensions && <span className="text-red-500 text-sm">{errors.dimensions.message}</span>}
            </div>
            {/* Weight */}
            <div className="space-y-2">
              <Label htmlFor="weight" className="text-sm font-medium">Weight</Label>
              <Input id="weight" placeholder="Enter Weight" className="bg-gray-50 border-gray-200 rounded-[8px] p-4" {...register("weight")} />
              {errors.weight && <span className="text-red-500 text-sm">{errors.weight.message}</span>}
            </div>
            {/* Certifications */}
            <div className="space-y-2">
              <Label htmlFor="certifications" className="text-sm font-medium">Certifications</Label>
              <Input id="certifications" placeholder="Enter Certifications" className="bg-gray-50 border-gray-200 rounded-[8px] p-4" {...register("certifications")} />
              {errors.certifications && <span className="text-red-500 text-sm">{errors.certifications.message}</span>}
            </div>
            {/* Warranty */}
            <div className="space-y-2">
              <Label htmlFor="warranty" className="text-sm font-medium">Warranty</Label>
              <Input id="warranty" placeholder="Enter Warranty" className="bg-gray-50 border-gray-200 rounded-[8px] p-4" {...register("warranty")} />
              {errors.warranty && <span className="text-red-500 text-sm">{errors.warranty.message}</span>}
            </div>
            {/* Is Consumable */}
            <div className="space-y-2">
              <Label htmlFor="isConsumable" className="text-sm font-medium">Is Consumable</Label>
              <Select onValueChange={(value) => setValue("isConsumable", value)} defaultValue={dummyData.isConsumable}>
                <SelectTrigger id="isConsumable" className="bg-gray-50 border-gray-200 rounded-[8px] p-4 w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
              {errors.isConsumable && <span className="text-red-500 text-sm">{errors.isConsumable.message}</span>}
            </div>
          </CardContent>
        </Card>
        {/* Media & Documentation */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-red-600 font-semibold text-lg">Media & Documentation</CardTitle>
            <p className="text-sm text-gray-500">Upload product images, videos, and brochures to enhance product representation and credibility.</p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Images */}
            <div className="space-y-2">
              <Label htmlFor="images" className="text-sm font-medium">Images</Label>
              <Input id="images" placeholder="Upload Image" className="bg-gray-50 border-gray-200 rounded-[8px] p-4" {...register("images")} />
              {errors.images && <span className="text-red-500 text-sm">{errors.images.message}</span>}
            </div>
            {/* Video URL */}
            <div className="space-y-2">
              <Label htmlFor="videoUrl" className="text-sm font-medium">Video URL</Label>
              <Input id="videoUrl" placeholder="Paste Link" className="bg-gray-50 border-gray-200 rounded-[8px] p-4" {...register("videoUrl")} />
              {errors.videoUrl && <span className="text-red-500 text-sm">{errors.videoUrl.message}</span>}
            </div>
            {/* Brochure Available */}
            <div className="space-y-2">
              <Label htmlFor="brouchureAvailable" className="text-sm font-medium">Brochure Available</Label>
              <Select onValueChange={(value) => setValue("brouchureAvailable", value)} defaultValue={dummyData.brouchureAvailable}>
                <SelectTrigger id="brouchureAvailable" className="bg-gray-50 border-gray-200 rounded-[8px] p-4 w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
              {errors.brouchureAvailable && <span className="text-red-500 text-sm">{errors.brouchureAvailable.message}</span>}
            </div>
          </CardContent>
        </Card>
        {/* Pricing details */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-red-600 font-semibold text-lg">Pricing & Tax</CardTitle>
            <p className="text-sm text-gray-500">Provide the pricing and tax information required for listing and billing.</p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* MRP (with GST) */}
            <div className="space-y-2">
              <Label htmlFor="mrp" className="text-sm font-medium">MRP (with GST)</Label>
              <Input id="mrp" placeholder="Enter MRP" className="bg-gray-50 border-gray-200 rounded-[8px] p-4" {...register("mrp")} />
              {errors.mrp && <span className="text-red-500 text-sm">{errors.mrp.message}</span>}
            </div>
            {/* GST % */}
            <div className="space-y-2">
              <Label htmlFor="gst" className="text-sm font-medium">GST %</Label>
              <Input id="gst" placeholder="Enter GST" className="bg-gray-50 border-gray-200 rounded-[8px] p-4" {...register("gst")} />
              {errors.gst && <span className="text-red-500 text-sm">{errors.gst.message}</span>}
            </div>
            {/* Returnable */}
            <div className="space-y-2">
              <Label htmlFor="returnable" className="text-sm font-medium">Returnable</Label>
              <Input id="returnable" placeholder="Enter Returnable" className="bg-gray-50 border-gray-200 rounded-[8px] p-4" {...register("returnable")} />
              {errors.returnable && <span className="text-red-500 text-sm">{errors.returnable.message}</span>}
            </div>
            {/* Return Policy */}
            <div className="space-y-2">
              <Label htmlFor="returnPolicy" className="text-sm font-medium">Return Policy</Label>
              <Input id="returnPolicy" placeholder="Enter Return Policy" className="bg-gray-50 border-gray-200 rounded-[8px] p-4" {...register("returnPolicy")} />
              {errors.returnPolicy && <span className="text-red-500 text-sm">{errors.returnPolicy.message}</span>}
            </div>
          </CardContent>
        </Card>
        {/* Dealer-Level Mapping & Routing */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-red-600 font-semibold text-lg">Dealer-Level Mapping & Routing</CardTitle>
            <p className="text-sm text-gray-500">Dealer product quantity and quality</p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Available Dealers */}
            <div className="space-y-2">
              <Label htmlFor="availableDealers" className="text-sm font-medium">Available Dealers</Label>
              <Input id="availableDealers" placeholder="Enter Available Dealers" className="bg-gray-50 border-gray-200 rounded-[8px] p-4" {...register("availableDealers")} />
              {errors.availableDealers && <span className="text-red-500 text-sm">{errors.availableDealers.message}</span>}
            </div>
            {/* Quantity per Dealer */}
            <div className="space-y-2">
              <Label htmlFor="quantityPerDealer" className="text-sm font-medium">Quantity per Dealer</Label>
              <Input id="quantityPerDealer" placeholder="Enter Quantity" className="bg-gray-50 border-gray-200 rounded-[8px] p-4" {...register("quantityPerDealer")} />
              {errors.quantityPerDealer && <span className="text-red-500 text-sm">{errors.quantityPerDealer.message}</span>}
            </div>
            {/* Dealer Margin % */}
            <div className="space-y-2">
              <Label htmlFor="dealerMargin" className="text-sm font-medium">Dealer Margin %</Label>
              <Input id="dealerMargin" placeholder="Enter Margin" className="bg-gray-50 border-gray-200 rounded-[8px] p-4" {...register("dealerMargin")} />
              {errors.dealerMargin && <span className="text-red-500 text-sm">{errors.dealerMargin.message}</span>}
            </div>
            {/* Dealer Priority Override */}
            <div className="space-y-2">
              <Label htmlFor="dealerPriorityOverride" className="text-sm font-medium">Dealer Priority Override</Label>
              <Input id="dealerPriorityOverride" placeholder="Enter Override" className="bg-gray-50 border-gray-200 rounded-[8px] p-4" {...register("dealerPriorityOverride")} />
              {errors.dealerPriorityOverride && <span className="text-red-500 text-sm">{errors.dealerPriorityOverride.message}</span>}
            </div>
            {/* Stock Expiry Rule */}
            <div className="space-y-2">
              <Label htmlFor="stockExpiryRule" className="text-sm font-medium">Stock Expiry Rule</Label>
              <Input id="stockExpiryRule" placeholder="Enter Rule" className="bg-gray-50 border-gray-200 rounded-[8px] p-4" {...register("stockExpiryRule")} />
              {errors.stockExpiryRule && <span className="text-red-500 text-sm">{errors.stockExpiryRule.message}</span>}
            </div>
            {/* Last Stock Update */}
            <div className="space-y-2">
              <Label htmlFor="lastStockUpdate" className="text-sm font-medium">Last Stock Update</Label>
              <Input id="lastStockUpdate" placeholder="Enter Update" className="bg-gray-50 border-gray-200 rounded-[8px] p-4" {...register("lastStockUpdate")} />
              {errors.lastStockUpdate && <span className="text-red-500 text-sm">{errors.lastStockUpdate.message}</span>}
            </div>
          </CardContent>
        </Card>
        {/* Status, Audit & Metadata */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-red-600 font-semibold text-lg">Status, Audit & Metadata</CardTitle>
            <p className="text-sm text-gray-500">Provide the pricing and tax information required for listing and billing.</p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Active */}
            <div className="space-y-2">
              <Label htmlFor="active" className="text-sm font-medium">Active</Label>
              <Select onValueChange={(value) => setValue("active", value)} defaultValue={dummyData.active}>
                <SelectTrigger id="active" className="bg-gray-50 border-gray-200 rounded-[8px] p-4 w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
              {errors.active && <span className="text-red-500 text-sm">{errors.active.message}</span>}
            </div>
            {/* Created By */}
            <div className="space-y-2">
              <Label htmlFor="createdBy" className="text-sm font-medium">Created By</Label>
              <Input id="createdBy" placeholder="Enter Created By" className="bg-gray-50 border-gray-200 rounded-[8px] p-4" {...register("createdBy")} />
              {errors.createdBy && <span className="text-red-500 text-sm">{errors.createdBy.message}</span>}
            </div>
            {/* Modified At / By */}
            <div className="space-y-2">
              <Label htmlFor="modifiedAtBy" className="text-sm font-medium">Modified At / By</Label>
              <Input id="modifiedAtBy" placeholder="Enter Modified At / By" className="bg-gray-50 border-gray-200 rounded-[8px] p-4" {...register("modifiedAtBy")} />
              {errors.modifiedAtBy && <span className="text-red-500 text-sm">{errors.modifiedAtBy.message}</span>}
            </div>
            {/* Change Log */}
            <div className="space-y-2">
              <Label htmlFor="changeLog" className="text-sm font-medium">Change Log</Label>
              <Input id="changeLog" placeholder="Enter Change Log" className="bg-gray-50 border-gray-200 rounded-[8px] p-4" {...register("changeLog")} />
              {errors.changeLog && <span className="text-red-500 text-sm">{errors.changeLog.message}</span>}
            </div>
          </CardContent>
        </Card>
        {/* SEO & Search Optimization */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-red-600 font-semibold text-lg">SEO & Search Optimization</CardTitle>
            <p className="text-sm text-gray-500">Provide the pricing and tax information required for listing and billing.</p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* SEO Title */}
            <div className="space-y-2">
              <Label htmlFor="seoTitle" className="text-sm font-medium">SEO Title</Label>
              <Input id="seoTitle" placeholder="Enter SEO Title" className="bg-gray-50 border-gray-200 rounded-[8px] p-4" {...register("seoTitle")} />
              {errors.seoTitle && <span className="text-red-500 text-sm">{errors.seoTitle.message}</span>}
            </div>
            {/* Search Tags */}
            <div className="space-y-2">
              <Label htmlFor="searchTags" className="text-sm font-medium">Search Tags</Label>
              <Input id="searchTags" placeholder="Enter Search Tags" className="bg-gray-50 border-gray-200 rounded-[8px] p-4" {...register("searchTags")} />
              {errors.searchTags && <span className="text-red-500 text-sm">{errors.searchTags.message}</span>}
            </div>
            {/* SEO Description */}
            <div className="space-y-2 col-span-full">
              <Label htmlFor="seoDescription" className="text-sm font-medium">SEO Description</Label>
              <Input id="seoDescription" placeholder="Enter SEO Description" className="bg-gray-50 border-gray-200 rounded-[8px] p-4" {...register("seoDescription")} />
              {errors.seoDescription && <span className="text-red-500 text-sm">{errors.seoDescription.message}</span>}
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg shadow-sm"
          >
            Update Product
          </Button>
        </div>
      </form>
    </div>
  );
}
