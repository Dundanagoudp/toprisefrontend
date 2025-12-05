"use client";

import { useState, useEffect } from "react";
import { getAuthToken } from "@/utils/auth";
import { fetchEmployeeByUserId, fetchPicklistsByEmployee, fetchStaffPicklistStats } from "@/service/order-service";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import DynamicButton from "@/components/common/button/button";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { DynamicPagination } from "@/components/common/pagination";

// Helper to decode token safely
const getUserIdFromToken = () => {
    try {
        const token = getAuthToken();
        if (!token) return null;
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.id || payload.userId;
    } catch { 
        return null; 
    }
};

const getStatusBadge = (status: string) => {
  const s = (status || "").toLowerCase();
  switch (s) {
    case "confirmed":
      return "bg-green-100 text-green-800 hover:bg-green-100";
    case "assigned":
      return "bg-blue-100 text-blue-800 hover:bg-blue-100";
    case "scanning":
      return "bg-purple-100 text-purple-800 hover:bg-purple-100";
    case "packed":
      return "bg-indigo-100 text-indigo-800 hover:bg-indigo-100";
    case "shipped":
      return "bg-cyan-100 text-cyan-800 hover:bg-cyan-100";
    case "delivered":
    case "completed":
      return "bg-emerald-100 text-emerald-800 hover:bg-emerald-100";
    case "cancelled":
    case "canceled":
      return "bg-red-100 text-red-800 hover:bg-red-100";
    case "returned":
      return "bg-orange-100 text-orange-800 hover:bg-orange-100";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-100";
  }
};

export default function StaffPicklistsTable() {
  const route = useRouter();
  const [picklists, setPicklists] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalPicklists, setTotalPicklists] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const userId = getUserIdFromToken();
   
        if (!userId) throw new Error("No user ID found");

        // 1. Get Employee ID
        const empRes = await fetchEmployeeByUserId(userId);
        const empId = empRes?.employee?._id;
        
        // 2. Fetch Data Parallel
        const [listRes, statsRes] = await Promise.all([
             fetchPicklistsByEmployee(empId, currentPage),
             fetchStaffPicklistStats(empId) 
        ]);

        const responseData = listRes as any;
        
        // Access the nested array directly based on your log
        const actualPicklists = responseData?.data?.picklists?.picklists || [];
        const paginationData = responseData?.data?.picklists?.pagination || responseData?.data?.pagination;
        console.log("Fetched picklists:", actualPicklists);
        setPicklists(actualPicklists);
        setTotalPicklists(paginationData?.totalItems || actualPicklists.length);
        setTotalPages(paginationData?.totalPages || 1);
        setStats(statsRes?.data);
      } catch (err) {
        console.error("Staff fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentPage]);

  return (
    <div className="space-y-6">
        {/* Staff Stats Card */}
        <Card>
            <CardHeader><CardTitle>My Picklists</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 border rounded">
                    <div className="text-sm text-gray-500">Total</div>
                    <div className="text-2xl font-bold">{stats?.summary?.totalPicklists || 0}</div>
                </div>
                <div className="p-4 border rounded">
                    <div className="text-sm text-gray-500">Pending</div>
                    <div className="text-2xl font-bold text-orange-600">
                        {stats?.data?.data?.[0]?.notStarted || 0}
                    </div>
                </div>
                {/* Add other stats as needed */}
            </CardContent>
        </Card>

        {/* Picklist Table */}
        <Card>
            <CardHeader className="flex flex-row justify-between">
                <div>
                    <CardTitle>Assigned Picklists</CardTitle>
                    <CardDescription>Manage your fulfillment tasks</CardDescription>
                </div>
                {/* <DynamicButton 
                    text="Go to Picklist View" 
                    customClassName="bg-primary text-white" 
                    onClick={() => route.push("/user/dashboard/picklist")}
                /> */}
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Picklist ID</TableHead>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                             [1,2,3].map(i => <TableRow key={i}><TableCell colSpan={4}><Skeleton className="h-8 w-full"/></TableCell></TableRow>)
                        ) : picklists.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                                    No Picklists found
                                </TableCell>
                            </TableRow>
                        ) : (
                            picklists.map((p) => (
                                <TableRow key={p.picklistId || p._id} className="cursor-pointer hover:bg-gray-50" onClick={() => route.push(`/user/dashboard/order/orderdetails/${p.order._id}`)}>
                                    <TableCell className="font-mono text-xs">{p.picklistId}</TableCell>
                                    <TableCell>{p.orderId}</TableCell>
                                    <TableCell>{new Date(p.orderDate).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <Badge className={getStatusBadge(p.orderStatus || p.scanStatus)}>
                                            {p.orderStatus || p.scanStatus}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>

        {/* Pagination */}
        {totalPicklists > 0 && totalPages > 1 && (
          <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
            <div className="text-sm text-gray-600 text-center sm:text-left">
              {`Showing ${(currentPage - 1) * itemsPerPage + 1}-${Math.min(
                currentPage * itemsPerPage,
                totalPicklists
              )} of ${totalPicklists} picklists`}
            </div>
            <div className="flex justify-center sm:justify-end">
              <DynamicPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalPicklists}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        )}
    </div>
  );
}