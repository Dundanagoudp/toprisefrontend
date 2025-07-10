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

import {
  Search,
  Filter,
  ChevronDown,
  Upload,
  Plus,
  MoreHorizontal,
  FileUp,
  PlusIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";

const products = [
  {
    id: 1,
    image: "/placeholder.svg?height=40&width=40",
    name: "Front Brake Pad - Swift 2016 Petrol",
    category: "Braking System",
    subCategory: "Brake Pads",
    brand: "Bosch",
    productType: "Aftermarket",
    status: "Active",
  },
  {
    id: 2,
    image: "/placeholder.svg?height=40&width=40",
    name: "Front Brake Pad - Swift 2016 Petrol",
    category: "Braking System",
    subCategory: "Brake Pads",
    brand: "Bosch",
    productType: "Aftermarket",
    status: "Disable",
  },
  {
    id: 3,
    image: "/placeholder.svg?height=40&width=40",
    name: "Front Brake Pad - Swift 2016 Petrol",
    category: "Braking System",
    subCategory: "Brake Pads",
    brand: "Bosch",
    productType: "Aftermarket",
    status: "Active",
  },
  {
    id: 4,
    image: "/placeholder.svg?height=40&width=40",
    name: "Front Brake Pad - Swift 2016 Petrol",
    category: "Braking System",
    subCategory: "Brake Pads",
    brand: "Bosch",
    productType: "Aftermarket",
    status: "Pending",
  },
  {
    id: 5,
    image: "/placeholder.svg?height=40&width=40",
    name: "Front Brake Pad - Swift 2016 Petrol",
    category: "Braking System",
    subCategory: "Brake Pads",
    brand: "Bosch",
    productType: "Aftermarket",
    status: "Active",
  },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Active":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          {status}
        </Badge>
      );
    case "Disable":
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
          {status}
        </Badge>
      );
    case "Pending":
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
          {status}
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export default function ProductManagement() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
   <div className=" w-full">
  <Card className="  shadow-lg">
    {/* Header */}
    <CardHeader className="px-4 sm:px-4">
      <div className="p-2 sm:px-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Search and Filters (Left Side) */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2 w-full sm:w-64 md:w-80 h-10 rounded-lg bg-[#EBEBEB] px-3 py-2 text-[#737373] text-sm">
              <Search className="h-4 w-4 text-[#737373] flex-shrink-0" />
              <Input
                placeholder="Search Spare parts"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-[#737373] placeholder:text-[#737373] w-full"
              />
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                className="flex items-center gap-2 bg-transparent w-full sm:w-auto justify-start sm:justify-center"
              >
               
                <span className=" b3 font-poppins ">Filters</span>
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 bg-transparent w-full sm:w-auto justify-start sm:justify-center"
                  >
                    <span className="b3">Requests</span>
                    <ChevronDown className="h-4 w-4 hidden sm:inline" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>All Requests</DropdownMenuItem>
                  <DropdownMenuItem>Pending Requests</DropdownMenuItem>
                  <DropdownMenuItem>Approved Requests</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Action Buttons (Right Side) */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="default"
              className="flex items-center gap-[12px]  w-full   bg-[#408EFD1A] rounded-[8px] hover:bg-[#408ffd3a] sm:w-auto justify-start sm:justify-center"
            >
              <FileUp className="text-[#408EFD]" />
              <span className="hidden sm:inline text-[#408EFD] b3">Upload</span>
            </Button>
            <Button className="flex items-center gap-[12px]  w-full  bg-[#C729201A] rounded-[8px] hover:bg-[#c728203a] sm:w-auto justify-start sm:justify-center">
              <Plus className="text-(--primary)"/>
              <span className="hidden sm:inline b3 font-RedHat text-(--primary)">Add Product</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Product Section Header */}
      <div className=" sm:px-4">
        <div>
            <CardTitle className="b1  text-black">
              Product 
            </CardTitle>
            <CardDescription className="b4 text-gray-600">
              Manage your products and view inventory
            </CardDescription>
     
        </div>
      </div>
    </CardHeader>

    {/* Product Table */}
    <CardContent className="rounded-lg px-4 shadow-sm overflow-x-auto">
   <div className="overflow-x-auto">
      <Table className="overflow-x-automin-w-full divide-y divide-gray-200">
        <TableHeader>
          <TableRow className="border-b border-[#E5E5E5] ">
            <TableHead className="b2 text-(--neutral-700)">Image</TableHead>
            <TableHead className=" b2 text-(--neutral-700)">Name</TableHead>
            <TableHead className=" b2 text-(--neutral-700)">Category</TableHead>
            <TableHead className=" b2 text-(--neutral-700) ">Sub Category</TableHead>
            <TableHead className=" b2 text-(--neutral-700) ">Brand</TableHead>
            <TableHead className=" b2 text-(--neutral-700) ">Type</TableHead>
            <TableHead className="b2 text-(--neutral-700)">Status</TableHead>
            <TableHead className="b2 text-(--neutral-700)">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id} className="border-b">
              <TableCell>
                <div className="w-[144px] h-[116px] rounded-md overflow-hidden bg-gray-100">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                </div>
              </TableCell>
              <TableCell className="b2 font-redhat">
                {product.name}
              </TableCell>
              <TableCell className="b2 font-redHat ">
                {product.category}
              </TableCell>
              <TableCell className="b2">
                {product.subCategory}
              </TableCell>
              <TableCell className="b2">
                {product.brand}
              </TableCell>
              <TableCell className="b2">
                {product.productType}
              </TableCell>
              <TableCell>
                <div className="w-[67px]">
                  {getStatusBadge(product.status)}
                </div>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Edit Product</DropdownMenuItem>
                    <DropdownMenuItem>View Details</DropdownMenuItem>
                    <DropdownMenuItem>Duplicate</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table></div>

      {/* Footer */}
      <div className="p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">Showing 1-5 of 32 products</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              Previous
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </div>
      </div>
 
    </CardContent>
  </Card>
</div>
  );
}
