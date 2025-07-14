"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getTokenPayload } from "@/utils/cookies";
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
import { EditIcon } from "@/components/ui/TicketIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import addSquare from "../../../../../public/assets/addSquare.svg";

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
import { useEffect } from "react";
import Image from "next/image";
import {  getProducts } from "@/service/product-Service";

const products = [
  {
    id: 1,
    image: "/placeholder.svg?height=40&width=40",
    name: "Front Brake Pad - Swift 2016 Petrol",
    sku: "TOP-BRK-000453",
    currentSellingPrice: "₹1,099.00",
    BaseCost: "₹899.00",
    Margin: "10.0%",
    status: "Active",
  },
  {
    id: 2,
    image: "/placeholder.svg?height=40&width=40",
    name: "Rear Brake Shoe - Alto 800 2018 Petrol",
    sku: "TOP-BRK-000454",
    currentSellingPrice: "₹850.00",
    BaseCost: "₹650.00",
    Margin: "15.0%",
    status: "Disable",
  },
  {
    id: 3,
    image: "/placeholder.svg?height=40&width=40",
    name: "Air Filter - WagonR 2015 CNG",
    sku: "TOP-FIL-000123",
    currentSellingPrice: "₹450.00",
    BaseCost: "₹300.00",
    Margin: "20.0%",
    status: "Active",
  },
  {
    id: 4,
    image: "/placeholder.svg?height=40&width=40",
    name: "Oil Filter - Dzire 2017 Diesel",
    sku: "TOP-FIL-000124",
    currentSellingPrice: "₹300.00",
    BaseCost: "₹200.00",
    Margin: "18.0%",
    status: "Pending",
  },
  {
    id: 5,
    image: "/placeholder.svg?height=40&width=40",
    name: "Spark Plug - Celerio 2019 Petrol",
    sku: "TOP-IGN-000001",
    currentSellingPrice: "₹150.00",
    BaseCost: "₹100.00",
    Margin: "25.0%",
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

export default function PriceAndMarginManagement() {
  const route = useRouter();
  const payload = getTokenPayload();
  const isAllowed = payload?.role === "Inventory-admin" || payload?.role === "Super-admin";
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const allProductIds = products.map((product) => product.id);
      setSelectedProductIds(allProductIds);
    } else {
      setSelectedProductIds([]);
    }
  };

  const handleSelectProduct = (event: React.ChangeEvent<HTMLInputElement>, id: number) => {
    if (event.target.checked) {
      setSelectedProductIds((prev) => [...prev, id]);
    } else {
      setSelectedProductIds((prev) => prev.filter((productId) => productId !== id));
    }
  };

  useEffect(() => {
    const response = getProducts();
    response.then((data) => {
      console.log("Fetched Products:", data);
    }).catch((error) => {
      console.error("Error fetching products:", error);
    });
  }, []);
  const handleEditProdcut = () => {
    route.push(`/user/dashboard/PricingMarginMangement/edit`);
  };

  return (
    <div className="w-full">
      <Card className="shadow-sm rounded-none ">
        {/* Header */}
        <CardHeader className="space-y-6">
          {/* Search and Actions Row */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            {/* Left Side - Search and Filters */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto">
              {/* Search Bar */}
              <div className="relative w-full sm:w-80 lg:w-96">
                <div className="flex items-center gap-2 h-10 rounded-lg bg-[#EBEBEB] px-3 py-2">
                  <Search className="h-4 w-4 text-[#737373] flex-shrink-0" />
                  <Input
                    placeholder="Search Spare parts"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-[#737373] placeholder:text-[#737373] h-auto p-0"
                  />
                </div>
              </div>

              {/* Filter Buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="flex items-center gap-2 bg-transparent border-gray-300 hover:bg-gray-50 min-w-[100px]"
                >
                  <span className="b3 font-poppins">Filters</span>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 bg-transparent border-gray-300 hover:bg-gray-50 min-w-[120px]"
                    >
                      <span className="b3">Role</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem>SuperAdmin</DropdownMenuItem>
                    <DropdownMenuItem>Invetory Admin</DropdownMenuItem>
                    <DropdownMenuItem>Admin</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Right Side - Action Buttons */}
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <Button
                className="flex items-center gap-3 bg-[#C729201A] border border-[#C72920] hover:bg-[#c728203a] text-[#C72920] rounded-[8px] px-4 py-2 min-w-[140px] justify-center"
                variant="default"
                onClick={handleEditProdcut}
                                 
              >
                <EditIcon/> 
                <span className="b3 font-RedHat">Edit</span>
              </Button>
            </div>
          </div>

    
        </CardHeader>

        {/* Product Table */}
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow className="border-b border-[#E5E5E5] bg-gray-50/50">
                  <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left">
                    <input type="checkbox" />
                  </TableHead>
                  <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left">
                    Image
                  </TableHead>
                  <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left min-w-[200px]">
                    Name
                  </TableHead>
                  <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left min-w-[150px]">
                    SKU
                  </TableHead>
                  <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left min-w-[150px]">
                    Current Selling Price
                  </TableHead>
                  <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left min-w-[120px]">
                    Base Cost
                  </TableHead>
                  <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left min-w-[120px]">
                    Margin
                  </TableHead>
                  <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left min-w-[100px]">
                    Status
                  </TableHead>
                  <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-center min-w-[80px]">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product, index) => (
                  <TableRow
                    key={product.id}
                    className={`border-b border-gray-100 hover:bg-gray-50/50 transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                    }`}
                  >
                    <TableCell className="px-6 py-4">
                      <input type="checkbox" />
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="w-16 h-12 lg:w-20 lg:h-16 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                        <Image
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          width={80}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="font-medium text-gray-900 b2 font-redhat">
                        {product.name}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <span className="text-gray-700 b2 font-redHat">
                        {product.sku}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <span className="text-gray-700 b2">
                        {product.currentSellingPrice}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <span className="text-gray-700 b2">{product.BaseCost}</span>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <span className="text-gray-700 b2">
                        {product.Margin}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      {getStatusBadge(product.status)}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-gray-100"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem className="cursor-pointer">
                            Edit Product
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer">
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer">
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600 cursor-pointer hover:text-red-700">
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Footer - Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/30">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-500 order-2 sm:order-1">
                Showing 1-5 of 32 products
              </p>
              <div className="flex items-center gap-2 order-1 sm:order-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="min-w-[80px] hover:bg-gray-100 bg-transparent"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="min-w-[80px] hover:bg-gray-100 bg-transparent"
                >
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
