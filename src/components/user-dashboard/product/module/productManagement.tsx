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
import image from "next/image";
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
import addSquare from "../../../../../public/assets/addSquare.svg";
import uploadFile from "../../../../../public/assets/uploadFile.svg";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
} from "@/components/ui/pagination";

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
import { getProducts } from "@/service/product-Service";
import React from "react";

// Product type for table
type Product = {
  id: string;
  image: string;
  name: string;
  category: string;
  subCategory: string;
  brand: string;
  productType: string;
  qcStatus: string;
};



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
  const route = useRouter();
  const payload = getTokenPayload();
  const isAllowed = payload?.role === "Inventory-admin" || payload?.role === "Super-admin";
  const [searchQuery, setSearchQuery] = useState("");
  const [productList, setProductList] = useState<Product[]>([]);
  const [selectedTab, setSelectedTab] = useState("Created");
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(10); // You can make this dynamic if needed
  const [totalProducts, setTotalProducts] = useState(0);
   const cardsPerPage = 10

  // Filter products based on selected tab
  const filteredProducts = React.useMemo(() => {
    if (selectedTab === "Created") return productList;
    return productList.filter((product) => product.qcStatus === selectedTab);
  }, [selectedTab, productList]);


  // Fetch products from API and map to table structure
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await getProducts();
        console.log("API Response:", response);
        const data = response.data; // Assuming the actual product data is in a 'data' property
        if (Array.isArray(data)) {
          const mapped = data.map((item) => ({
            id: item._id,
            image: item.model.model_image ,
            name: item.product_name || item.manufacturer_part_name || "-",
            category: item.category?.category_name || "-",
            subCategory: item.sub_category?.subcategory_name || "-",
            brand: item.brand?.brand_name || "-",
            productType: item.product_type || "-",
            qcStatus: item.Qc_status ||  "Pending",
          }));
          setProductList(mapped);
          setTotalProducts(response.data.length || 0); // Assuming API returns totalCount
        } else {
          setProductList([]);
          setTotalProducts(0);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
        setProductList([]);
        setTotalProducts(0);
      }
    };
    fetchProducts();
  }, [currentPage, productsPerPage]);

  const totalPages = Math.ceil(filteredProducts.length / cardsPerPage);
  const paginatedData = filteredProducts.slice(
    (currentPage - 1) * cardsPerPage,
    currentPage * cardsPerPage
  )
  const handleAddProduct = () => {
    route.push(`/user/dashboard/product/Addproduct`);
  };

  // Handler for QC status change
  const handleQCStatusChange = (id: string, newStatus: string) => {
    setProductList((prev) =>
      prev.map((product) =>
        product.id === id ? { ...product, qcStatus: newStatus } : product
      )
    );
  };



  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
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
                      <span className="b3">Requests</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem>All Requests</DropdownMenuItem>
                    <DropdownMenuItem>Pending Requests</DropdownMenuItem>
                    <DropdownMenuItem>Approved Requests</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Right Side - Action Buttons */}
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <Button
                variant="default"
                className="flex items-center gap-3 bg-[#408EFD1A] border-[#408EFD] hover:bg-[#408ffd3a] rounded-[8px] px-4 py-2 min-w-[120px] justify-center"
              >
                <Image src={uploadFile} alt="Add" className="h-4 w-4" />
                <span className="text-[#408EFD] b3">Upload</span>
              </Button>
              <Button
                className="flex items-center gap-3 bg-[#C729201A] border border-[#C72920] hover:bg-[#c728203a] text-[#C72920] rounded-[8px] px-4 py-2 min-w-[140px] justify-center"
                variant="default"
                onClick={handleAddProduct}
              // disabled={!isAllowed}
              >
                <Image src={addSquare} alt="Add" className="h-4 w-4" />
                <span className="b3 font-RedHat">Add Product</span>
              </Button>
            </div>
          </div>

          {/* Page Title and Description */}
          <div className="space-y-2">
            <CardTitle className="b1 text-black text-2xl font-semibold">
              Product
            </CardTitle>
            <CardDescription className="b4 text-gray-600">
              Manage your products and view inventory
            </CardDescription>
          </div>
              {/* Tab Bar */}
      <div className="flex border-b border-gray-200 mb-2">
        {['Created', 'Approved', 'Pending', 'Rejected'].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 text-sm font-medium focus:outline-none ${
              selectedTab === tab
                ? 'text-[#C72920] border-b-2 border-[#C72920]'
                : 'text-gray-500'
            }`}
            onClick={() => setSelectedTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
        </CardHeader>

        {/* Product Table */}
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow className="border-b border-[#E5E5E5] bg-gray-50/50">
                  <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left">
                    Image
                  </TableHead>
                  <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left min-w-[200px]">
                    Name
                  </TableHead>
                  <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left min-w-[150px]">
                    Category
                  </TableHead>
                  <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left min-w-[150px]">
                    Sub Category
                  </TableHead>
                  <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left min-w-[120px]">
                    Brand
                  </TableHead>
                  <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left min-w-[120px]">
                    Type
                  </TableHead>
                  <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left min-w-[100px]">
                    QC Status
                  </TableHead>
                  <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-center min-w-[80px]">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((product, index) => (
                  <TableRow
                    key={product.id}
                    className={`border-b border-gray-100 hover:bg-gray-50/50 transition-colors ${index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                      }`}
                  >
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
                        {product.category}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <span className="text-gray-700 b2">
                        {product.subCategory}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <span className="text-gray-700 b2">{product.brand}</span>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <span className="text-gray-700 b2">
                        {product.productType}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      {getStatusBadge(product.qcStatus)}
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
            { totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }).map((_, idx) => (
                  <PaginationItem key={idx + 1}>
                    <PaginationLink
                      isActive={currentPage === idx + 1}
                      onClick={() => setCurrentPage(idx + 1)}
                      className="cursor-pointer"
                    >
                      {idx + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
        </CardContent>
      </Card>
    </div>
  );
}
