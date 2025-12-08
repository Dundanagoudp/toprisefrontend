"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Package,
  MoreHorizontal,
} from "lucide-react";
import { format } from "date-fns";
import DynamicPagination from "@/components/common/pagination/DynamicPagination";
import { getProductRequests } from "@/service/product-request-service";
import { ProductRequest } from "@/types/product-request-Types";

interface PendingProductsProps {
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  selectedRequests: string[];
  onSelectRequest: (requestId: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  selectAll: boolean;
  onApprove: (requestId: string) => void;
  onReject: (requestId: string) => void;
  onReview: (requestId: string) => void;
  onRefresh: () => void;
}

export default function PendingProducts({
  dateRange,
  selectedRequests,
  onSelectRequest,
  onSelectAll,
  selectAll,
  onApprove,
  onReject,
  onReview,
  onRefresh,
}: PendingProductsProps) {
  const router = useRouter();
  const [requests, setRequests] = useState<ProductRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      
      const filters: any = { status: "Pending" };
      
      if (dateRange.from) {
        filters.startDate = dateRange.from.toISOString();
      }
      if (dateRange.to) {
        filters.endDate = dateRange.to.toISOString();
      }

      const response = await getProductRequests(currentPage, itemsPerPage, filters);

      if (response.success) {
        const products = response.data?.products || [];
        const pagination = response.data?.pagination || {};
        
        setRequests(products);
        setTotalPages(pagination.totalPages || 1);
        setTotalItems(pagination.totalItems || 0);
      } else {
        setRequests([]);
        setTotalPages(1);
        setTotalItems(0);
      }
    } catch (error) {
      console.error("Error fetching pending requests:", error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, dateRange]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "Approved":
      case "approved":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case "Rejected":
      case "rejected":
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy HH:mm");
  };

  return (
    <div className="space-y-4">
      <ScrollArea className="h-[600px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox checked={selectAll} onCheckedChange={onSelectAll} />
              </TableHead>
              <TableHead>Product</TableHead>
              {/* <TableHead>Type</TableHead> */}
              <TableHead>Status</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-12">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    <span className="ml-2">Loading products...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No pending products found
                </TableCell>
              </TableRow>
            ) : (
              requests.map((request: any) => (
                <TableRow key={request._id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedRequests.includes(request._id)}
                      onCheckedChange={(checked) =>
                        onSelectRequest(request._id, checked as boolean)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{request.product_name || "N/A"}</div>
                      <div className="text-sm text-muted-foreground">
                        {request.sku_code || "N/A"}
                      </div>
                      <div className="text-sm text-muted-foreground line-clamp-2">
                        {request.admin_notes || "No description available"}
                      </div>
                    </div>
                  </TableCell>
                  {/* <TableCell>
                    <div className="flex items-center space-x-2">
                      <Package className="w-4 h-4" />
                      <span className="capitalize">Product</span>
                    </div>
                  </TableCell> */}
                  <TableCell>
                    {getStatusBadge(request.Qc_status || request.live_status || "Pending")}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">System</div>
                      <div className="text-sm text-muted-foreground">Dealer</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {formatDate(
                        request.created_at || request.createdAt || new Date().toISOString()
                      )}
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
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(`/user/dashboard/requests/${request._id}`)
                          }
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onApprove(request._id)}>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onReject(request._id)}>
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(`/user/dashboard/product/productedit/${request._id}`)
                          }
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </ScrollArea>

      {totalPages > 1 && (
        <div className="flex justify-center">
          <DynamicPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            showItemsInfo={true}
          />
        </div>
      )}
    </div>
  );
}

