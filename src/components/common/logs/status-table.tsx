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
import { useCallback, useEffect, useState } from "react";
import useDebounce from "@/utils/useDebounce";
import { uploadLogs } from "@/service/product-Service";
import { useRouter } from "next/navigation";

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
// Format date as 'DD MMM YYYY / hh:mmA' (e.g., 05 Jan 2025 / 11:00PM)
import formatDate from "@/utils/formateDate";

export default function statusTable() {
  const [searchInput, setSearchInput] = useState(""); // Input field value
  const [searchQuery, setSearchQuery] = useState(""); // Actual search query for filtering
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<any>(null);
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(
    null
  );
  const [logs, setLogs] = useState<any[]>([]);

  const auth = useAppSelector((state) => state.auth.user);
  const router = useRouter();
  const performSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setIsSearching(false);
  }, []);

  const { debouncedCallback: debouncedSearch, cleanup: cleanupDebounce } =
    useDebounce(performSearch, 500);

  useEffect(() => {
    async function handleUploadLogs() {
      try {
        setLoading(true);
        const response = await uploadLogs();
        if (response && response.data) {
          console.log("Logs fetched successfully:", response.data);
          setUploadMessage(response.data);
          setLogs(response.data.products || []);
        } else {
          console.error("Failed to fetch logs - no data received");
          setLogs([]);
        }
      } catch (error) {
        console.error("Failed to fetch logs", error);
        setLogs([]);
      } finally {
        setLoading(false);
      }
    }

    handleUploadLogs();
  }, []);

  // Function to refresh logs
  const refreshLogs = async () => {
    try {
      setLoading(true);
      const response = await uploadLogs();
      if (response && response.data) {
        console.log("Logs refreshed successfully:", response.data);
        setUploadMessage(response.data);
        setLogs(response.data.products || []);
      } else {
        console.error("Failed to refresh logs - no data received");
        setLogs([]);
      }
    } catch (error) {
      console.error("Failed to refresh logs", error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

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
  // Use logs data if available, otherwise fallback to uploadMessage, then tableData
  const rows = logs && logs.length > 0 
    ? logs 
    : (uploadMessage && uploadMessage.products && uploadMessage.products.length > 0 
      ? uploadMessage.products 
      : tableData);

  // Calculate totals
  const uploadedCount = rows.filter(
    (row: any) => row.status === "Created" || row.status === "Completed"
  ).length;
  const rejectedCount = rows.filter((row: any) => row.status === "Reject").length;

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
                <span className="text-[#1D1D1B] font-medium font-sans">
                  {` uploaded : ${uploadedCount}`}
                </span>
                <span className="text-[#1D1D1B] font-medium font-sans">
                  {` Rejected : ${rejectedCount}`}
                </span>
              </div>
              <div className="flex gap-2">
                <DynamicButton 
                  variant="outline" 
                  text={loading ? "Refreshing..." : "Refresh"} 
                  onClick={refreshLogs}
                  disabled={loading}
                />
                <DynamicButton variant="default" text="Done" onClick={() => router.push('/user/dashboard/product')} />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-4">
          <div className=" bg-white shadow-sm">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                <span className="ml-2 text-gray-600">Loading logs...</span>
              </div>
            ) : rows.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No logs found</h3>
                <p className="text-gray-500 text-center mb-4">
                  No product upload logs are available yet. Upload some products to see logs here.
                </p>
                <DynamicButton 
                  variant="default" 
                  text="Refresh" 
                  onClick={refreshLogs}
                />
              </div>
            ) : (
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
                    Total No of Product
                  </TableHead>
                  <TableHead className="font-medium text-gray-700">
                    Successful Uploads
                  </TableHead>
                  <TableHead className="font-medium text-gray-700">
                    Failed Uploads
                  </TableHead>
                  <TableHead className="font-medium text-gray-700">
                    Logs
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row: any, index: number) => (
                  <>
                    <TableRow
                      key={row._id || index}
                      className={
                        row.status === "Reject"
                          ? "bg-red-50 hover:bg-red-100"
                          : "bg-green-50 hover:bg-green-100"
                      }
                    >
                      <TableCell className="font-medium text-gray-900">
                        {formatDate(row.sessionTime, {
                          includeTime: true,
                          timeFormat: "12h",
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            row.status === "Reject"
                              ? "destructive"
                              : row.status === "Completed"
                              ? "default"
                              : "default"
                          }
                          className={
                            row.status === "Reject"
                              ? "bg-red-100 text-red-800 hover:bg-red-200"
                              : row.status === "Completed"
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                          }
                        >
                          {row.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-900">
                        {row.no_of_products}
                      </TableCell>
                      <TableCell className="text-gray-900">
                        {row.total_products_successful}
                      </TableCell>
                      <TableCell className="text-gray-900">
                        {row.total_products_failed}
                      </TableCell>
                      <TableCell className="text-gray-900">
                        <DynamicButton
                          variant="outline"
                          text={
                            expandedSessionId === (row._id || row.sessionId)
                              ? "Hide Logs"
                              : "View Logs"
                          }
                          onClick={() =>
                            setExpandedSessionId(
                              expandedSessionId === (row._id || row.sessionId)
                                ? null
                                : row._id || row.sessionId
                            )
                          }
                        />
                      </TableCell>
                    </TableRow>
                    {expandedSessionId === (row._id || row.sessionId) && (
                      <TableRow>
                        <TableCell colSpan={6} className="bg-gray-50 p-0">
                          <div className="p-4">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="font-medium text-gray-700">Log ID</TableHead>
                                  <TableHead className="font-medium text-gray-700">Product ID</TableHead>
                                  <TableHead className="font-medium text-gray-700">Message</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {(row.logs && row.logs.length > 0) ? (
                                  row.logs.map((log: any) => (
                                    <TableRow key={log._id}>
                                      <TableCell>{log._id}</TableCell>
                                      <TableCell>{log.productId || '-'}</TableCell>
                                      <TableCell>{log.message}</TableCell>
                                    </TableRow>
                                  ))
                                ) : (
                                  <TableRow>
                                    <TableCell colSpan={3} className="text-center">No logs found.</TableCell>
                                  </TableRow>
                                )}
                              </TableBody>
                            </Table>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
