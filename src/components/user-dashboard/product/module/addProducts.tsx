"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
const schema = z.object({
  category: z.string().min(1, "Category is required"),
  subCategory: z.string().min(1, "Sub-category is required"),
  productType: z.string().min(1, "Product type is required"),
  isUniversal: z.string(),
  isConsumable: z.string(),
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  yearRange: z.string(),
  variant: z.string().min(1, "Variant is required"),
  fitmentNotes: z.string(),
  images: z.string(),
  videoUrl: z.string(),
  brouchureAvailable: z.string(),
  mrp: z.string().min(1, "MRP is required"),
  gst: z.string().min(1, "GST is required"),
  returnable: z.string().min(1, "Returnable is required"),
  returnPolicy: z.string().min(1, "Return Policy is required"),
});
;
type FormValues = z.infer<typeof schema>;
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; 
import { addProduct } from "@/service/product-Service";

export default function AddProducts() {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormValues) => {
    console.log("Form Data:", data);
    addProduct(data);
  };

  return (
    <div className="w-full">
      <Card className="shadow-sm rounded-none">
        <CardHeader className="px-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="flex flex-col space-y-2 items-start">
              <CardTitle className="text-2xl font-semibold">
                Add Product
              </CardTitle>
              <CardDescription>Add your product description</CardDescription>
            </div>
            <Button
              variant="default"
              type="submit"
              className="flex items-center gap-3 bg-(--primary) hover:bg-[#c7282083] rounded-[8px] px-4 py-2 min-w-[98px] min-h-[42px] justify-center"
              onClick={handleSubmit(onSubmit)}
            >
              <span className="text-(--neutral-100) b3">Save</span>
            </Button>
          </div>
        </CardHeader>
        <form className="p-6 md:p-8" onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="px-4  border border-gray-200 rounded-md shadow-sm">
            <CardTitle className="text-red-600 text-xl font-semibold mt-4">
              Product Classification
            </CardTitle>
            <CardDescription className="text-gray-600">
              Classify the product for catalog structure, filterability, and
              business logic.
            </CardDescription>

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mt-4">
              <div className="flex flex-col gap-2 w-full sm:w-5/12">
                <Label htmlFor="category" className="text-sm font-medium">
                  Category
                </Label>
                <Input
                  id="category"
                  placeholder="Enter Sku Code"
                  className="rounded-[8px] p-6"
                  {...register("category")}
                />
                {errors.category && (
                  <span className="text-red-500 text-sm">
                    {errors.category.message}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-2 w-full sm:w-5/12">
                <Label htmlFor="sub-category" className="text-sm font-medium">
                  Sub-category
                </Label>
                <Input
                  id="sub-category"
                  placeholder="Enter Sku Code"
                  className="rounded-[8px] p-6"
                  {...register("subCategory")}
                />
                {errors.subCategory && (
                  <span className="text-red-500 text-sm">
                    {errors.subCategory.message}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mt-4">
              <div className="flex flex-col gap-2 w-full sm:w-5/12">
                <Label htmlFor="product-type" className="text-sm font-medium">
                  Product Type
                </Label>
                <Input
                  id="product-type"
                  placeholder="Enter Sku Code"
                  className="rounded-[8px] p-6"
                  {...register("productType")}
                />
                {errors.productType && (
                  <span className="text-red-500 text-sm">
                    {errors.productType.message}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-2 w-full sm:w-5/12">
                <Label htmlFor="is-universal" className="text-sm font-medium">
                  Is Universal
                </Label>
                <Select onValueChange={(value) => setValue("isUniversal", value)} defaultValue="no">
                  <SelectTrigger id="is-universal" className="rounded-[8px] p-6 w-full border border-gray-300">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
                {errors.isUniversal && (
                  <span className="text-red-500 text-sm">
                    {errors.isUniversal.message}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4">
              <div className="space-y-2">
                <Label htmlFor="is-consumable" className="text-sm font-medium">
                  Is Consumable
                </Label>
                <Select onValueChange={(value) => setValue("isConsumable", value)} defaultValue="no">
                  <SelectTrigger id="is-consumable" className="rounded-[8px] p-6 w-full border border-gray-300">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
                {errors.isConsumable && (
                  <span className="text-red-500 text-sm">
                    {errors.isConsumable.message}
                  </span>
                )}
              </div>
            </div>
          </CardContent>
          <CardContent className="px-4 mt-6 border border-gray-200 rounded-md shadow-sm">
            <CardTitle className="text-red-600 text-xl font-semibold mt-4">
              Vehicle Compatibility
            </CardTitle>
            <CardDescription className="text-gray-600">
              Specify which vehicle make, model, and variant the product is
              compatible with.
            </CardDescription>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mt-4">
              <div className="flex flex-col gap-2 w-full sm:w-5/12">
                <Label htmlFor="Make" className="text-sm font-medium">
                  Make
                </Label>
                <Input
                  id="make"
                  placeholder="Enter Sku Code"
                  className="rounded-[8px] p-6"
                  {...register("make")}
                />
                {errors.make && (
                  <span className="text-red-500 text-sm">
                    {errors.make.message}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-2 w-full sm:w-5/12">
                <Label htmlFor="Model" className="text-sm font-medium">
                  Model
                </Label>
                <Input
                  id="model"
                  placeholder="Enter Sku Code"
                  className="rounded-[8px] p-6"
                  {...register("model")}
                />
                {errors.model && (
                  <span className="text-red-500 text-sm">
                    {errors.model.message}
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mt-4">
              <div className="flex flex-col gap-2 w-full sm:w-5/12">
                <Label htmlFor="YearRange" className="text-sm font-medium">
                  Year Range
                </Label>
                <Input
                  id="yearRange"
                  placeholder="Enter Sku Code"
                  className="rounded-[8px] p-6"
                  {...register("yearRange")}
                />
                {errors.yearRange && (
                  <span className="text-red-500 text-sm">
                    {errors.yearRange.message}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-2 w-full sm:w-5/12">
                <Label htmlFor="Variant" className="text-sm font-medium">
                  Variant
                </Label>
                <Input
                  id="variant"
                  placeholder="Enter Sku Code"
                  className="rounded-[8px] p-6"
                  {...register("variant")}
                />
                {errors.variant && (
                  <span className="text-red-500 text-sm">
                    {errors.variant.message}
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 my-4 ">
              <div className="flex flex-col gap-2 w-full sm:w-5/12 ">
                <Label htmlFor="FitmentNotes" className="text-sm font-medium">
                  Fitment Notes
                </Label>
                <Input
                  id="fitmentNotes"
                  placeholder="Enter Sku Code"
                  className="rounded-[8px] p-6"
                  {...register("fitmentNotes")}
                />
                {errors.fitmentNotes && (
                  <span className="text-red-500 text-sm">
                    {errors.fitmentNotes.message}
                  </span>
                )}
              </div>
            </div>
          </CardContent>
          <CardContent className="px-4 mt-6 border border-gray-200 rounded-md shadow-sm">
            <CardTitle className="text-red-600 text-xl font-semibold mt-4">
              Media & Documentation
            </CardTitle>
            <CardDescription className="text-gray-600">
              Upload product images , videos , and brouchers to enchance product
              representation and credibility.
            </CardDescription>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mt-4">
              <div className="flex flex-col gap-2 w-full sm:w-5/12">
                <Label htmlFor="images" className="text-sm font-medium">
                  images
                </Label>
                <Input
                  id="images"
                  placeholder="Enter Sku Code"
                  className="rounded-[8px] p-6"
                  {...register("images")}
                />
                {errors.images && (
                  <span className="text-red-500 text-sm">
                    {errors.images.message}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-2 w-full sm:w-5/12">
                <Label htmlFor="videoUrl" className="text-sm font-medium">
                  video Url
                </Label>
                <Input
                  id="videoUrl"
                  placeholder="Enter Sku Code"
                  className="rounded-[8px] p-6"
                  {...register("videoUrl")}
                />
                {errors.videoUrl && (
                  <span className="text-red-500 text-sm">
                    {errors.videoUrl.message}
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 my-4">
              <div className="flex flex-col gap-2 w-full sm:w-5/12">
                <Label
                  htmlFor="BrouchureAvailable"
                  className="text-sm font-medium"
                >
                  Brouchure Available
                </Label>
                <Input
                  id="brouchureAvailable"
                  placeholder="Enter Sku Code"
                  className="rounded-[8px] p-6"
                  {...register("brouchureAvailable")}
                />
                {errors.brouchureAvailable && (
                  <span className="text-red-500 text-sm">
                    {errors.brouchureAvailable.message}
                  </span>
                )}
              </div>
            </div>
          </CardContent>
          <CardContent className="px-4 mt-6 border border-gray-200 rounded-md shadow-sm">
            <CardTitle className="text-red-600 text-xl font-semibold mt-4">
              Pricing details
            </CardTitle>
            <CardDescription className="text-gray-600">
              Provide the pricing and tax information required for listing and
              billing.
            </CardDescription>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 my-4">
              <div className="flex flex-col gap-2 w-full sm:w-5/12">
                <Label htmlFor="MRP" className="text-sm font-medium">
                  MRP (with GST)
                </Label>
                <Input
                  id="mrp"
                  placeholder="Enter Sku Code"
                  className="rounded-[8px] p-6"
                  {...register("mrp")}
                />
                {errors.mrp && (
                  <span className="text-red-500 text-sm">
                    {errors.mrp.message}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-2 w-full sm:w-5/12">
                <Label htmlFor="Gst" className="text-sm font-medium">
                  GST %
                </Label>
                <Input
                  id="gst"
                  placeholder="Enter Sku Code"
                  className="rounded-[8px] p-6"
                  {...register("gst")}
                />
                {errors.gst && (
                  <span className="text-red-500 text-sm">
                    {errors.gst.message}
                  </span>
                )}
              </div>
            </div>
          </CardContent>
          <CardContent className="px-4 mt-6 border border-gray-200 rounded-md shadow-sm">
            <CardTitle className="text-red-600 text-xl font-semibold mt-4">
              Return & Availbility
            </CardTitle>
            <CardDescription className="text-gray-600">
              Define product return eligibility and applicable return
              conditions.
            </CardDescription>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 my-4">
              <div className="flex flex-col gap-2 w-full sm:w-5/12">
                <Label htmlFor="return" className="text-sm font-medium">
                  Returnable
                </Label>
                <Input
                  id="returnable"
                  placeholder="Enter Sku Code"
                  className="rounded-[8px] p-6"
                  {...register("returnable")}
                />
                {errors.returnable && (
                  <span className="text-red-500 text-sm">
                    {errors.returnable.message}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-2 w-full sm:w-5/12">
                <Label htmlFor="returnPolicy" className="text-sm font-medium">
                  Return Policy
                </Label>
                <Input
                  id="returnPolicy"
                  placeholder="Enter Sku Code"
                  className="rounded-[8px] p-6"
                  {...register("returnPolicy")}
                />
                {errors.returnPolicy && (
                  <span className="text-red-500 text-sm">
                    {errors.returnPolicy.message}
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
