"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AddProducts() {
  return (
    <div className="w-full">
      <Card className="shadow-sm ">
        <CardHeader className="px-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="flex flex-col space-y-2 items-start">
              <CardTitle className="text-2xl font-semibold">
                Add Product
              </CardTitle>
              <CardDescription>
                Add your product description
              </CardDescription>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="default"
                className="flex items-center gap-3 bg-(--primary) hover:bg-[#c7282083] rounded-[8px] px-4 py-2 min-w-[98px] min-h-[42px] justify-center"
              >
                <span className="text-(--neutral-100) b3">Save</span>
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-4">
            <CardTitle className="text-red-600 text-xl font-semibold">Product Classification</CardTitle>
          <CardDescription className="text-gray-600">
            Classify the product for catalog structure, filterability, and business logic.
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
    />
  </div>

  <div className="flex flex-col gap-2 w-full sm:w-5/12">
    <Label htmlFor="sub-category" className="text-sm font-medium">
      Sub-category
    </Label>
    <Input
      id="sub-category"
      placeholder="Enter Sku Code"
      className="rounded-[8px] p-6"
    />
  </div>
</div>

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mt-4">
            <div className="flex flex-col gap-2 w-full sm:w-5/12" >
           
              <Label htmlFor="product-type" className="text-sm font-medium">
                Product Type
              </Label>
              <Input id="product-type" placeholder="Enter Sku Code" className="rounded-[8px] p-6" />
           
           </div>
           <div className="flex flex-col gap-2 w-full sm:w-5/12" >
              <Label htmlFor="is-universal" className="text-sm font-medium">
                Is Universal
              </Label>
              <Select>
                <SelectTrigger className="rounded-[8px] p-6 w-full">
                  <SelectValue placeholder="Enter Sku Code" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
              </div>
            </div>
          

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="is-consumable" className="text-sm font-medium">
                Is Consumable
              </Label>
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Enter Sku Code" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
