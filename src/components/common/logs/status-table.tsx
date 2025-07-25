"use client";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import DynamicButton from "../button/button";
import SearchInput from "../search/SearchInput";
import { useAppSelector } from "@/store/hooks";
import { useCallback, useState } from "react";
import useDebounce from "@/utils/useDebounce";

const tableData = [
  {
    timeDate: "05 Jan 2025 / 11:00PM",
    status: "Reject",
    nameOfProduct: "Braking System",
    productId: "PD2345",
    skuCode: "TOP-BRK-000453",
    hsnCode: "87083000",
  },
  {
    timeDate: "05 Jan 2025 / 11:00PM",
    status: "Reject",
    nameOfProduct: "Braking System",
    productId: "PD2345",
    skuCode: "TOP-BRK-000453",
    hsnCode: "87083000",
  },
  {
    timeDate: "05 Jan 2025 / 11:00PM",
    status: "Reject",
    nameOfProduct: "Braking System",
    productId: "PD2345",
    skuCode: "TOP-BRK-000453",
    hsnCode: "87083000",
  },
  {
    timeDate: "05 Jan 2025 / 11:00PM",
    status: "Created",
    nameOfProduct: "Braking System",
    productId: "PD2345",
    skuCode: "TOP-BRK-000453",
    hsnCode: "87083000",
  },
  {
    timeDate: "05 Jan 2025 / 11:00PM",
    status: "Created",
    nameOfProduct: "Braking System",
    productId: "PD2345",
    skuCode: "TOP-BRK-000453",
    hsnCode: "87083000",
  },
  {
    timeDate: "05 Jan 2025 / 11:00PM",
    status: "Created",
    nameOfProduct: "Braking System",
    productId: "PD2345",
    skuCode: "TOP-BRK-000453",
    hsnCode: "87083000",
  },
  {
    timeDate: "05 Jan 2025 / 11:00PM",
    status: "Created",
    nameOfProduct: "Braking System",
    productId: "PD2345",
    skuCode: "TOP-BRK-000453",
    hsnCode: "87083000",
  },
  {
    timeDate: "05 Jan 2025 / 11:00PM",
    status: "Created",
    nameOfProduct: "Braking System",
    productId: "PD2345",
    skuCode: "TOP-BRK-000453",
    hsnCode: "87083000",
  },
];

export default function statusTable() {
  const [searchInput, setSearchInput] = useState(""); // Input field value
  const [searchQuery, setSearchQuery] = useState(""); // Actual search query for filtering
  const [isSearching, setIsSearching] = useState(false);

  const auth = useAppSelector((state) => state.auth.user);
  const performSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setIsSearching(false);
  }, []);

  const { debouncedCallback: debouncedSearch, cleanup: cleanupDebounce } =
    useDebounce(performSearch, 500);

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    setIsSearching(value.trim() !== "");
    debouncedSearch(value);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchInput("");
    setSearchQuery("");
    setIsSearching(false);

  };
  return (
    <div className="w-full">
      <Card className="shadow-sm rounded-none">
        <CardHeader className="space-y-4 sm:space-y-6">
          <div className="flex flex-col   w-full">
            <div className="flex flex-row  w-full border-b border-gray-200  ">
              <CardTitle className="text-[#000000] font-semibold text-lg ">
                Product Logs
              </CardTitle>
             

         
            </div>
            <div className="w-full mt-4 flex flex-row  justify-between items-center">
                <div className="flex flex-row gap-6 items-center ">
                 <SearchInput
                value={searchInput}
                onChange={handleSearchChange}
                onClear={handleClearSearch}
                isLoading={isSearching}
                placeholder="Search Spare parts"
              />
               <span className="text-[#1D1D1B] font-medium font-sans"> uploaded : 0</span>
               <span className="text-[#1D1D1B] font-medium font-sans"> Rejected : 0</span>
               
               </div>
               <div>
                <DynamicButton
                variant="default"
                text="Done"
                />
               </div>
               
               </div>
          </div>
        </CardHeader>

        <CardContent className="px-4">
          <div className=" bg-white shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-transparent">
                  <TableHead className="font-medium text-gray-700 font-sans">
                    Time Date
                  </TableHead>
                  <TableHead className="font-medium text-gray-700">
                    Status
                  </TableHead>
                  <TableHead className="font-medium text-gray-700">
                    Name of Product
                  </TableHead>
                  <TableHead className="font-medium text-gray-700">
                    Product ID
                  </TableHead>
                  <TableHead className="font-medium text-gray-700">
                    SKU Code
                  </TableHead>
                  <TableHead className="font-medium text-gray-700">
                    HSN Code
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableData.map((row, index) => (
                  <TableRow
                    key={index}
                    className={
                      row.status === "Reject"
                        ? "bg-red-50 hover:bg-red-100"
                        : "bg-green-50 hover:bg-green-100"
                    }
                  >
                    <TableCell className="font-medium text-gray-900">
                      {row.timeDate}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          row.status === "Reject" ? "destructive" : "default"
                        }
                        className={
                          row.status === "Reject"
                            ? "bg-red-100 text-red-800 hover:bg-red-200"
                            : "bg-green-100 text-green-800 hover:bg-green-200"
                        }
                      >
                        {row.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-900">
                      {row.nameOfProduct}
                    </TableCell>
                    <TableCell className="text-gray-900">
                      {row.productId}
                    </TableCell>
                    <TableCell className="text-gray-900">
                      {row.skuCode}
                    </TableCell>
                    <TableCell className="text-gray-900">
                      {row.hsnCode}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
