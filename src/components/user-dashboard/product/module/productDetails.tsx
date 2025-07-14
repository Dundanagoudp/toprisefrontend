"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Productcard } from "./productCard";
import { Button } from "@/components/ui/button";

export default function ProductClassificationCard() {
  return (
    <div className="w-full">
    <Card className="rounded-none">
      <div className="container  px-4">
        <CardHeader className="my-4">
          <div className="flex  flex-col lg:flex-row  items-start justify-between gap-4">
            <div className="flex flex-row sm:flex-col items-start  gap-3 w-full lg:w-auto">
              <CardTitle className="text-2xl font-bold">
                Product Details
              </CardTitle>
              <CardDescription className="text-sm text-gray-500">
                Add your product description
              </CardDescription>
            </div>
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <Button
                variant="outline"
                className="flex items-center gap-3 bg-[#D9D9D9]  hover:bg-[#d9d9d9c5] rounded-[8px] px-4 py-2 min-w-[120px] justify-center"
              >
                <span className="text-[#7F7F7F] b3">Edit</span>
              </Button>
              <Button
                className="flex items-center gap-3 bg-[#C72920]  hover:bg-[#c72820c5]  rounded-[8px] px-4 py-2 min-w-[140px] justify-center"
                variant="default"
              >
                <span className="b3 font-RedHat texr-[#FFFFFF]">Delete</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Productcard
            title="Product Classification"
            description="the product for catalog structure, filterability, and business logic."
            data={[
              { label: "Category", value: "Braking System" },
              { label: "Sub-category", value: "Brake Pads" },
              { label: "Product Type", value: "Aftermarket" },
              { label: "Is Universal", value: "False" },
              { label: "Is Consumable", value: "True" },
            ]}
          />
          <Productcard
            title="Product Classification"
            description="the product for catalog structure, filterability, and business logic."
            data={[
              { label: "Category", value: "Braking System" },
              { label: "Sub-category", value: "Brake Pads" },
              { label: "Product Type", value: "Aftermarket" },
              { label: "Is Universal", value: "False" },
              { label: "Is Consumable", value: "True" },
            ]}
          />
          <Productcard
            title="Product Classification"
            description="the product for catalog structure, filterability, and business logic."
            data={[
              { label: "Category", value: "Braking System" },
              { label: "Sub-category", value: "Brake Pads" },
              { label: "Product Type", value: "Aftermarket" },
              { label: "Is Universal", value: "False" },
              { label: "Is Consumable", value: "True" },
            ]}
          />
          <Productcard
            title="Product Classification"
            description="the product for catalog structure, filterability, and business logic."
            data={[
              { label: "Category", value: "Braking System" },
              { label: "Sub-category", value: "Brake Pads" },
              { label: "Product Type", value: "Aftermarket" },
              { label: "Is Universal", value: "False" },
              { label: "Is Consumable", value: "True" },
            ]}
          />{" "}
        </div>
      </div>
    </Card></div>
  );
}
