"use client";
import React from "react";
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
import { uploadLogStorage, type StoredUploadLog } from "@/service/uploadLogService";
import { Download } from "lucide-react";

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
  const [logs, setLogs] = useState<StoredUploadLog[]>([]);

  const auth = useAppSelector((state) => state.auth.user);
  const router = useRouter();
  const performSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setIsSearching(false);
  }, []);

  const { debouncedCallback: debouncedSearch, cleanup: cleanupDebounce } =
    useDebounce(performSearch, 500);

  // Load upload logs from local storage
  const loadUploadLogs = useCallback(() => {
    try {
      setLoading(true);
      const storedLogs = uploadLogStorage.getAllLogsArray();
      console.log("Upload logs loaded from storage:", storedLogs);
      console.log("Number of logs found:", storedLogs.length);
      storedLogs.forEach((log, index) => {
        console.log(`Log ${index}:`, {
          id: log.id,
          sessionId: log.sessionId,
          status: log.status,
          hasLogData: !!log.logData,
          logDataKeys: log.logData ? Object.keys(log.logData) : 'No logData'
        });
      });
      setLogs(storedLogs);
    } catch (error) {
      console.error("Failed to load upload logs", error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUploadLogs();
  }, [loadUploadLogs]);

  // Function to refresh logs
  const refreshLogs = useCallback(() => {
    loadUploadLogs();
  }, [loadUploadLogs]);

  // Function to export logs as CSV
  const exportLogsAsCSV = useCallback(() => {
    try {
      if (logs.length === 0) {
        alert('No logs to export');
        return;
      }

      // Create CSV headers
      const headers = [
        'Session ID',
        'Upload Type',
        'Status',
        'Created By',
        'Created At',
        'Duration (s)',
        'Total Rows',
        'Inserted',
        'Successful Products',
        'Failed Products',
        'Total Images',
        'OK Images',
        'Skip Images',
        'Fail Images',
        'Message'
      ];

      // Create CSV rows
      const csvRows = logs.map(log => [
        log.sessionId || '',
        log.uploadType || '',
        log.logData?.status || log.status || '',
        log.createdBy || '',
        new Date(log.createdAt).toLocaleString(),
        log.logData?.durationSec || '',
        log.logData?.totalRows || 0,
        log.logData?.inserted || 0,
        log.logData?.successLogs?.totalSuccessful || 0,
        log.logData?.failureLogs?.totalFailed || 0,
        log.logData?.imgSummary?.total || 0,
        log.logData?.imgSummary?.ok || 0,
        log.logData?.imgSummary?.skip || 0,
        log.logData?.imgSummary?.fail || 0,
        log.logData?.message || ''
      ]);

      // Combine headers and rows
      const csvContent = [headers, ...csvRows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `upload_logs_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log('CSV export completed successfully');
    } catch (error) {
      console.error('Failed to export CSV:', error);
      alert('Failed to export CSV. Please try again.');
    }
  }, [logs]);


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
  // Use logs data if available, otherwise use empty array
  const rows = logs && logs.length > 0 ? logs : [];

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
                <DynamicButton 
                  variant="outline" 
                  text="Export CSV" 
                  onClick={exportLogsAsCSV}
                  disabled={loading || logs.length === 0}
                  icon={<Download className="w-4 h-4 mr-2" />}
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
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No upload logs found. Upload some products to see logs here.
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((log: StoredUploadLog, index: number) => (
                  <React.Fragment key={log.id || index}>
                    <TableRow
                      className={
                        log.status === "failed"
                          ? "bg-red-50 hover:bg-red-100"
                          : "bg-green-50 hover:bg-green-100"
                      }
                    >
                      <TableCell className="font-medium text-gray-900">
                        {formatDate(log.createdAt, {
                          includeTime: true,
                          timeFormat: "12h",
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            log.status === "failed"
                              ? "destructive"
                              : log.status === "completed"
                              ? "default"
                              : "secondary"
                          }
                          className={
                            log.status === "failed"
                              ? "bg-red-100 text-red-800 hover:bg-red-200"
                              : log.status === "completed"
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                          }
                        >
                          {log.logData?.status || log.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-900">
                        {log.logData?.totalRows || 0}
                      </TableCell>
                      <TableCell className="text-gray-900">
                        {log.logData?.successLogs?.totalSuccessful || 0}
                      </TableCell>
                      <TableCell className="text-gray-900">
                        {log.logData?.failureLogs?.totalFailed || 0}
                      </TableCell>
                      <TableCell className="text-gray-900">
                        <DynamicButton
                          variant="outline"
                          text={
                            expandedSessionId === log.id
                              ? "Hide Details"
                              : "View Details"
                          }
                          onClick={() =>
                            setExpandedSessionId(
                              expandedSessionId === log.id
                                ? null
                                : log.id
                            )
                          }
                        />
                      </TableCell>
                    </TableRow>
                    {expandedSessionId === log.id && (
                      <TableRow>
                        <TableCell colSpan={6} className="bg-gray-50 p-0">
                          <div className="p-4">
                            <h4 className="font-semibold text-gray-900 mb-4">Upload Session Details</h4>
                            
                            {/* Session Info */}
                            <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                              <div>
                                <span className="font-medium text-gray-700">Session ID:</span>{" "}
                                {log.sessionId}
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Upload Type:</span>{" "}
                                {log.uploadType === 'bulk_upload' ? 'Bulk Upload' : 
                                 log.uploadType === 'bulk_edit' ? 'Bulk Edit' : 
                                 log.uploadType === 'dealer_upload' ? 'Dealer Upload' : 'Unknown'}
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Created By:</span>{" "}
                                {log.createdBy}
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Duration:</span>{" "}
                                {log.logData?.durationSec || 'N/A'}s
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Total Rows:</span>{" "}
                                {log.logData?.totalRows || 0}
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Inserted:</span>{" "}
                                {log.logData?.inserted || 0}
                              </div>
                            </div>

                            {/* Image Summary */}
                            {log.logData?.imgSummary && (
                              <div className="mb-6">
                                <h5 className="font-medium text-blue-700 mb-2">Image Summary</h5>
                                <div className="grid grid-cols-4 gap-4 text-sm">
                                  <div className="bg-blue-50 p-3 rounded">
                                    <div className="font-medium text-blue-800">Total</div>
                                    <div className="text-lg font-bold text-blue-900">{log.logData.imgSummary.total}</div>
                                  </div>
                                  <div className="bg-green-50 p-3 rounded">
                                    <div className="font-medium text-green-800">OK</div>
                                    <div className="text-lg font-bold text-green-900">{log.logData.imgSummary.ok}</div>
                                  </div>
                                  <div className="bg-yellow-50 p-3 rounded">
                                    <div className="font-medium text-yellow-800">Skip</div>
                                    <div className="text-lg font-bold text-yellow-900">{log.logData.imgSummary.skip}</div>
                                  </div>
                                  <div className="bg-red-50 p-3 rounded">
                                    <div className="font-medium text-red-800">Fail</div>
                                    <div className="text-lg font-bold text-red-900">{log.logData.imgSummary.fail}</div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Success Logs */}
                            {log.logData?.successLogs?.totalSuccessful > 0 && (
                              <div className="mb-6">
                                <h5 className="font-medium text-green-700 mb-3">Successful Products ({log.logData?.successLogs?.totalSuccessful})</h5>
                                <div className="overflow-x-auto">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead className="font-medium text-gray-700">Product ID</TableHead>
                                        <TableHead className="font-medium text-gray-700">SKU</TableHead>
                                        <TableHead className="font-medium text-gray-700">Product Name</TableHead>
                                        <TableHead className="font-medium text-gray-700">Status</TableHead>
                                        <TableHead className="font-medium text-gray-700">QC Status</TableHead>
                                        <TableHead className="font-medium text-gray-700">Images</TableHead>
                                        <TableHead className="font-medium text-gray-700">Message</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {log.logData?.successLogs?.products?.map((product, idx) => (
                                        <TableRow key={idx} className="bg-green-50">
                                          <TableCell className="text-sm">{String(product.productId || '')}</TableCell>
                                          <TableCell className="text-sm font-medium">{String(product.sku || '')}</TableCell>
                                          <TableCell className="text-sm">{String(product.productName || '')}</TableCell>
                                          <TableCell>
                                            <Badge className="bg-green-100 text-green-800">
                                              {String(product.status || '')}
                                            </Badge>
                                          </TableCell>
                                          <TableCell>
                                            <Badge className="bg-blue-100 text-blue-800">
                                              {String(product.qcStatus || '')}
                                            </Badge>
                                          </TableCell>
                                          <TableCell className="text-sm">{typeof product.images === 'number' ? product.images : String(product.images || 0)}</TableCell>
                                          <TableCell className="text-sm">{String(product.message || '')}</TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              </div>
                            )}

                            {/* Failure Logs */}
                            {log.logData?.failureLogs?.totalFailed > 0 && (
                              <div className="mb-6">
                                <h5 className="font-medium text-red-700 mb-3">Failed Products ({log.logData?.failureLogs?.totalFailed})</h5>
                                <div className="overflow-x-auto">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead className="font-medium text-gray-700">Product ID</TableHead>
                                        <TableHead className="font-medium text-gray-700">SKU</TableHead>
                                        <TableHead className="font-medium text-gray-700">Product Name</TableHead>
                                        <TableHead className="font-medium text-gray-700">Status</TableHead>
                                        <TableHead className="font-medium text-gray-700">Message</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {log.logData?.failureLogs?.products?.map((product, idx) => (
                                        <TableRow key={idx} className="bg-red-50">
                                          <TableCell className="text-sm">{String(product.productId || '')}</TableCell>
                                          <TableCell className="text-sm font-medium">{String(product.sku || '')}</TableCell>
                                          <TableCell className="text-sm">{String(product.productName || '')}</TableCell>
                                          <TableCell>
                                            <Badge className="bg-red-100 text-red-800">
                                              {String(product.status || '')}
                                            </Badge>
                                          </TableCell>
                                          <TableCell className="text-sm text-red-600">{String(product.message || '')}</TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              </div>
                            )}

                            {/* Errors */}
                            {log.logData?.errors && log.logData.errors.length > 0 && (
                              <div>
                                <h5 className="font-medium text-red-700 mb-2">Errors</h5>
                                <ul className="list-disc list-inside text-sm text-red-600">
                                  {log.logData.errors.map((error: string, idx: number) => (
                                    <li key={idx}>{error}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                  ))
                )}
              </TableBody>
            </Table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
