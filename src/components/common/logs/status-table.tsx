"use client";
import React, { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
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
import { useRouter } from "next/navigation";
import { Download } from "lucide-react";
import formatDate from "@/utils/formateDate";

import {
  getProductBulkUploadLogs,
  deleteSingleProductBulkUploadLogs,
  deleteAllProductBulkUploadLogs,
} from "@/service/bulkupload-service";

export default function StatusTable() {
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(
    null
  );
  const [logs, setLogs] = useState<any[]>([]);
  const [selectedLogs, setSelectedLogs] = useState<string[]>([]);

  const router = useRouter();

  // -----------------------------------------
  // SEARCH
  // -----------------------------------------
  const performSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setIsSearching(false);
  }, []);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    setIsSearching(value.trim() !== "");
    performSearch(value);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearchQuery("");
  };

  // -----------------------------------------
  // FETCH LOGS FROM API
  // -----------------------------------------
  const fetchLogs = async () => {
    try {
      setLoading(true);

      const response = await getProductBulkUploadLogs();
      console.log("Product bulk upload logs:", response);

      const formattedLogs = response.map((item: any) => ({
        id: item._id,
        sessionId: item.sessionId,
        createdAt: item.created_at,
        status: item.status,
        createdBy: item.created_by,

        logData: {
          totalRows: item.no_of_products || 0,
          inserted: item.total_products_successful || 0,

          successLogs: {
            totalSuccessful: item.total_products_successful || 0,
            products: item.logs.filter((l: any) => l.message === "Created"|| l.message === "Updated"),
          },

          failureLogs: {
            totalFailed: item.total_products_failed || 0,
            products: item.logs.filter((l: any) => l.message !== "Created"),
          },
        },
      }));

      setLogs(formattedLogs);
    } catch (err) {
      console.error("Error fetching logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // -----------------------------------------
  // SELECT / UNSELECT
  // -----------------------------------------
  const toggleSelect = (id: string) => {
    setSelectedLogs((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedLogs.length === rows.length) {
      setSelectedLogs([]);
    } else {
      setSelectedLogs(rows.map((log) => log.id));
    }
  };

  // -----------------------------------------
  // DELETE SINGLE
  // -----------------------------------------
  const deleteSingleLog = async (id: string) => {
    if (!confirm("Are you sure you want to delete this log?")) return;

    try {
      await deleteSingleProductBulkUploadLogs(id);
      fetchLogs();
    } catch (err) {
      console.error(err);
    }
  };

  // -----------------------------------------
  // DELETE MULTIPLE
  // -----------------------------------------
  const deleteMultipleLogs = async () => {
    if (!confirm(`Delete ${selectedLogs.length} logs?`)) return;

    try {
      await deleteAllProductBulkUploadLogs(selectedLogs);
      setSelectedLogs([]);
      fetchLogs();
    } catch (err) {
      console.error(err);
    }
  };

  // -----------------------------------------
  // EXPORT ALL CSV
  // -----------------------------------------
  const exportLogsAsCSV = () => {
    if (logs.length === 0) return alert("No logs to export");

    const headers = [
      "Session ID",
      "Status",
      "Created By",
      "Created At",
      "Total Rows",
      "Successful",
      "Failed",
      "Message",
    ];

    const csvRows = logs.map((log) => [
      log.sessionId,
      log.status,
      log.createdBy,
      new Date(log.createdAt).toLocaleString(),
      log.logData.totalRows,
      log.logData.successLogs.totalSuccessful,
      log.logData.failureLogs.totalFailed,
      "",
    ]);

    const content = [headers, ...csvRows]
      .map((r) => r.map((c) => `"${c}"`).join(","))
      .join("\n");

    const blob = new Blob([content], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "bulk_upload_logs.csv";
    a.click();
  };

  // -----------------------------------------
  // EXPORT SINGLE LOG CSV  (NEW FEATURE)
  // -----------------------------------------
  const exportSingleLog = (log: any) => {
    if (!log) return;

    const headers = ["Product ID", "SKU", "Message", "Type"];

    const successRows = log.logData.successLogs.products.map((p: any) => [
      p.productId || "",
      p.sku || "",
      p.message || "",
      "SUCCESS",
    ]);

    const failedRows = log.logData.failureLogs.products.map((p: any) => [
      p.productId || "",
      p.sku || "",
      p.message || "",
      "FAILED",
    ]);

    const metaRows = [
      ["Session ID", log.sessionId],
      ["Status", log.status],
      ["Created At", new Date(log.createdAt).toLocaleString()],
      ["Created By", log.createdBy],
      ["Total Rows", log.logData.totalRows],
      ["Inserted", log.logData.inserted],
      ["Success Count", log.logData.successLogs.totalSuccessful],
      ["Failed Count", log.logData.failureLogs.totalFailed],
      [],
      headers,
    ];

    const allRows = [...successRows, ...failedRows];

    const csvData = [...metaRows, ...allRows]
      .map((row) => row.map((c) => `"${c}"`).join(","))
      .join("\n");

    const blob = new Blob([csvData], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `upload_log_${log.sessionId}.csv`;
    a.click();
  };

  // -----------------------------------------
  // SEARCH RESULT ROWS
  // -----------------------------------------
  const rows = logs.filter((log) =>
    searchQuery
      ? log.sessionId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.createdBy?.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  const uploadedCount = rows.length;
  const rejectedCount = rows.filter((r) => r.status === "Rejected").length;

  return (
    <div className="w-full">
      <Card className="shadow-sm rounded-none">
        <CardHeader>
          <div className="flex flex-col border-b pb-4">
            <CardTitle className="font-semibold text-lg">Product Logs</CardTitle>

            <div className="mt-4 flex justify-between items-center">
              <div className="flex gap-6 items-center">
                {/* <SearchInput
                  value={searchInput}
                  onChange={handleSearchChange}
                  onClear={handleClearSearch}
                  isLoading={isSearching}
                  placeholder="Search Session or Creator"
                /> */}

                <span>Uploaded: {uploadedCount}</span>
                <span>Rejected: {rejectedCount}</span>
              </div>

              <div className="flex gap-2">
                <DynamicButton
                  text={loading ? "Refreshing..." : "Refresh"}
                  variant="outline"
                  onClick={fetchLogs}
                />

                <DynamicButton
                  text="Export CSV"
                  variant="outline"
                  icon={<Download className="h-4 w-4" />}
                  onClick={exportLogsAsCSV}
                />

                <DynamicButton
                  text="Done"
                  variant="default"
                  onClick={() => router.push("/user/dashboard/product")}
                />
              </div>
            </div>
          </div>

          {selectedLogs.length > 0 && (
            <div className="p-3 bg-red-50 border rounded-md mt-4 flex justify-between items-center">
              <span className="text-red-700 font-medium">
                {selectedLogs.length} selected
              </span>

              <DynamicButton
                text="Delete Selected"
                variant="destructive"
                onClick={deleteMultipleLogs}
              />
            </div>
          )}
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="py-8 text-center">Loading...</div>
          ) : rows.length === 0 ? (
            <div className="py-8 text-center">No logs found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <input
                      type="checkbox"
                      checked={
                        selectedLogs.length === rows.length && rows.length > 0
                      }
                      onChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Success</TableHead>
                  <TableHead>Failed</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {rows.map((log) => (
                  <React.Fragment key={log.id}>
                    <TableRow>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedLogs.includes(log.id)}
                          onChange={() => toggleSelect(log.id)}
                        />
                      </TableCell>

                      <TableCell>
                        {formatDate(log.createdAt, {
                          includeTime: true,
                          timeFormat: "12h",
                        })}
                      </TableCell>

                      <TableCell>
                        <Badge>{log.status}</Badge>
                      </TableCell>

                      <TableCell>{log.logData.totalRows}</TableCell>
                      <TableCell>
                        {log.logData.successLogs.totalSuccessful}
                      </TableCell>
                      <TableCell>
                        {log.logData.failureLogs.totalFailed}
                      </TableCell>

                      <TableCell>
                        <div className="flex gap-2">
                          {/* View / Hide */}
                          <DynamicButton
                            variant="outline"
                            text={
                              expandedSessionId === log.sessionId
                                ? "Hide"
                                : "View"
                            }
                            onClick={() =>
                              setExpandedSessionId(
                                expandedSessionId === log.sessionId
                                  ? null
                                  : log.sessionId
                              )
                            }
                          />

                          {/* Export Single */}
                          <DynamicButton
                            variant="outline"
                            text="Export"
                            onClick={() => exportSingleLog(log)}
                          />

                          {/* Delete */}
                          <DynamicButton
                            variant="destructive"
                            text="Delete"
                            onClick={() => deleteSingleLog(log.id)}
                          />
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* Expanded Row */}
                    {expandedSessionId === log.sessionId && (
                      <TableRow>
                        <TableCell colSpan={7} className="bg-gray-50 p-4">
                          <h4 className="font-semibold mb-2">
                            Session Details
                          </h4>

                          <div className="grid grid-cols-2 gap-4">
                            <p>
                              <b>Session ID:</b> {log.sessionId}
                            </p>
                            <p>
                              <b>Created By:</b> {log.createdBy}
                            </p>
                            <p>
                              <b>Total Rows:</b> {log.logData.totalRows}
                            </p>
                            <p>
                              <b>Inserted:</b> {log.logData.inserted}
                            </p>
                          </div>

                          {/* Success Logs */}
                          {log.logData.successLogs.totalSuccessful > 0 && (
                            <>
                              <h5 className="mt-4 font-semibold text-green-700">
                                Successful Products
                              </h5>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Product ID</TableHead>
                                    <TableHead>Message</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {log.logData.successLogs.products.map(
                                    (p: any, idx: number) => (
                                      <TableRow key={idx}>
                                        <TableCell>{p.productId}</TableCell>
                                        <TableCell>{p.message}</TableCell>
                                      </TableRow>
                                    )
                                  )}
                                </TableBody>
                              </Table>
                            </>
                          )}

                          {/* Failure Logs */}
                          {log.logData.failureLogs.totalFailed > 0 && (
                            <>
                              <h5 className="mt-4 font-semibold text-red-700">
                                Failed Products
                              </h5>

                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Product ID</TableHead>
                                    <TableHead>Message</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {log.logData.failureLogs.products.map(
                                    (p: any, idx: number) => (
                                      <TableRow key={idx}>
                                        <TableCell>{p.productId}</TableCell>
                                        <TableCell className="text-red-600">
                                          {p.message}
                                        </TableCell>
                                      </TableRow>
                                    )
                                  )}
                                </TableBody>
                              </Table>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
