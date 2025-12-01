"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  RefreshCw,
  Eye,
  PackageCheck,
  MapPin,
  Calendar,
  User,
  Phone,
  Mail,
  Download,
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/components/ui/toast";
import {
  getAllPicklists,
  type PickupRequest,
  type PickupItem,
  type PicklistData,
} from "@/service/pickup-service";
import { generatePicklistPDF, generateSinglePicklistPDF } from "@/service/pdfService";
import { getDealerById } from "@/service/dealerServices";
import { getEmployeeById } from "@/service/employeeServices";
import { getSKUDetails } from "@/service/product-Service";
import DynamicPagination from "@/components/common/pagination/DynamicPagination";

export default function PickupManagement() {
  const router = useRouter();
  const { showToast } = useToast();
  
  // State management
  const [pickups, setPickups] = useState<PicklistData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [selectedPickup, setSelectedPickup] = useState<PicklistData | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isGeneratingSinglePDF, setIsGeneratingSinglePDF] = useState(false);
  const [skuDetailsMap, setSkuDetailsMap] = useState<Record<string, any>>({});
  const [loadingSKUs, setLoadingSKUs] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  // Helper function to enrich pickup data with dealer and staff info
  const enrichPickupData = async (pickupList: PicklistData[]) => {
    const enrichedPickups = await Promise.all(
      pickupList.map(async (pickup) => {
        const enrichedPickup = { ...pickup };
        
        // Fetch dealer info if not already present
        if (!pickup.dealerInfo && pickup.dealerId) {
          try {
            const dealerResponse = await getDealerById(pickup.dealerId);
            if (dealerResponse.success && dealerResponse.data) {
              enrichedPickup.dealerInfo = {
                name: dealerResponse.data.trade_name || dealerResponse.data.legal_name || 'Unknown Dealer',
                email: dealerResponse.data.contact_person?.email || '',
              };
              console.log(`Dealer fetched: ${pickup.dealerId}`, enrichedPickup.dealerInfo);
            }
          } catch (error) {
            console.error(`Error fetching dealer ${pickup.dealerId}:`, error);
          }
        }
        
        // Fetch staff info if not already present
        if (!pickup.staffInfo && pickup.fulfilmentStaff) {
          try {
            const staffResponse = await getEmployeeById(pickup.fulfilmentStaff);
            if (staffResponse.success && staffResponse.data) {
              enrichedPickup.staffInfo = {
                name: staffResponse.data.First_name || 'Unknown Staff',
                email: staffResponse.data.email || '',
              };
              console.log(`Staff fetched: ${pickup.fulfilmentStaff}`, enrichedPickup.staffInfo);
            }
          } catch (error) {
            console.error(`Error fetching staff ${pickup.fulfilmentStaff}:`, error);
          }
        }
        
        return enrichedPickup;
      })
    );
    
    return enrichedPickups;
  };

  // Fetch pickup data
  const fetchPickupData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getAllPicklists(
        currentPage,
        itemsPerPage,
        statusFilter !== "all" ? statusFilter : undefined
      );
      
      let pickupData: PicklistData[] = [];
      
      // Handle different response structures
      if (response?.data) {
        pickupData = Array.isArray(response.data) 
          ? response.data 
          : response.data.data || [];
        
        // Extract pagination data
        if (response.data.pagination) {
          setTotalPages(response.data.pagination.totalPages || 1);
          setTotalItems(response.data.pagination.totalItems || 0);
        }
      }
      
      // Enrich the pickup data with dealer and staff info
      const enrichedData = await enrichPickupData(pickupData);
      setPickups(enrichedData);
    } catch (error) {
      console.error("Error fetching pickup data:", error);
      setError("Failed to load picklist data");
      showToast("Failed to load picklist data", "error");
      setPickups([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, itemsPerPage, showToast]);

  // Load data on component mount and when filters change
  useEffect(() => {
    fetchPickupData();
  }, [fetchPickupData]);

  // Fetch SKU details when pickup is selected
  const fetchSKUDetails = useCallback(async (skuList: any[]) => {
    if (!skuList || skuList.length === 0) {
      return;
    }

    try {
      setLoadingSKUs(true);
      
      // Get unique SKUs
      const uniqueSKUs = Array.from(new Set(skuList.map(item => item.sku).filter(Boolean)));
      
      // Fetch details for each unique SKU
      const skuDetailsPromises = uniqueSKUs.map(async (sku) => {
        try {
          const response = await getSKUDetails(sku);
          if (response.success && response.data) {
            return { sku, data: response.data };
          }
          return { sku, data: null };
        } catch (error) {
          console.error(`Error fetching SKU details for ${sku}:`, error);
          return { sku, data: null };
        }
      });

      const results = await Promise.all(skuDetailsPromises);
      
      // Update the SKU details map using functional update to avoid dependency issues
      setSkuDetailsMap((prevMap) => {
        const newSkuDetailsMap: Record<string, any> = { ...prevMap };
        results.forEach(({ sku, data }) => {
          if (data) {
            newSkuDetailsMap[sku] = data;
          }
        });
        return newSkuDetailsMap;
      });
    } catch (error) {
      console.error("Error fetching SKU details:", error);
    } finally {
      setLoadingSKUs(false);
    }
  }, []);

  // Fetch SKU details when selectedPickup changes and dialog is open
  useEffect(() => {
    if (selectedPickup && isDetailDialogOpen) {
      const skuList = selectedPickup.skuDetails || selectedPickup.skuList || [];
      fetchSKUDetails(skuList);
    }
  }, [selectedPickup, isDetailDialogOpen, fetchSKUDetails]);

  // Filter pickups based on search (API handles status filter)
  const filteredPickups = (Array.isArray(pickups) ? pickups : []).filter(pickup => {
    const matchesSearch = 
      (pickup._id?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (pickup.linkedOrderId?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (pickup.dealerId?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (pickup.fulfilmentStaff?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });


  // Handle PDF generation
  const handleGeneratePDF = async () => {
    try {
      setIsGeneratingPDF(true);
      
      const title = `Picklist Management Report - ${new Date().toLocaleDateString()}`;
      const filters = {
        status: statusFilter !== 'all' ? statusFilter : undefined,
        priority: priorityFilter !== 'all' ? priorityFilter : undefined,
        searchTerm: searchTerm || undefined,
      };
      
      await generatePicklistPDF(filteredPickups, {
        title,
        includeFilters: statusFilter !== 'all' || priorityFilter !== 'all' || searchTerm !== '',
        filters
      });
      
      showToast("PDF generated successfully", "success");
    } catch (error) {
      console.error("Error generating PDF:", error);
      showToast("Failed to generate PDF", "error");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Handle single pickup PDF generation
  const handleGenerateSinglePickupPDF = async (pickup: PicklistData) => {
    try {
      setIsGeneratingSinglePDF(true);
      
      await generateSinglePicklistPDF(pickup);
      
      showToast("Picklist details PDF generated successfully", "success");
    } catch (error) {
      console.error("Error generating single pickup PDF:", error);
      showToast("Failed to generate picklist details PDF", "error");
    } finally {
      setIsGeneratingSinglePDF(false);
    }
  };

  // Utility functions
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "not started":
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800"><Clock className="w-3 h-3 mr-1" />Not Started</Badge>;
      case "in progress":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800"><Package className="w-3 h-3 mr-1" />In Progress</Badge>;
      case "completed":
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case "scanned":
        return <Badge variant="secondary" className="bg-purple-100 text-purple-800"><PackageCheck className="w-3 h-3 mr-1" />Scanned</Badge>;
      case "packed":
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><PackageCheck className="w-3 h-3 mr-1" />Packed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" />Urgent</Badge>;
      case "high":
        return <Badge variant="secondary" className="bg-red-100 text-red-800"><Clock className="w-3 h-3 mr-1" />High</Badge>;
      case "medium":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case "low":
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy HH:mm");
  };

  const formatAddress = (address: any) => {
    return `${address.address}, ${address.city}, ${address.state} - ${address.pincode}`;
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Loading picklist data...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchPickupData}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Picklist Management</h1>
          <p className="text-gray-600 mt-1">
            Manage picklist requests and mark items as packed
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            onClick={handleGeneratePDF} 
            variant="outline"
            disabled={isGeneratingPDF || filteredPickups.length === 0}
            className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
          >
            <Download className="h-4 w-4 mr-2" />
            {isGeneratingPDF ? "Generating..." : "Download PDF"}
          </Button>
          <Button onClick={fetchPickupData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          {/* <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </CardTitle> */}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex row-auto gap-2.5">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search picklists..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Not Started">Not Started</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setCurrentPage(1);
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pickup Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="h-5 w-5 mr-2" />
            Picklist Management ({filteredPickups.length})
          </CardTitle>
          <CardDescription>
            View and manage picklist requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Picklist ID</TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Dealer</TableHead>
                <TableHead>Staff</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Items</TableHead>
                {/* <TableHead>Overdue</TableHead> */}
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPickups.map((pickup) => (
                <TableRow key={pickup._id}>
                  <TableCell className="font-medium">{pickup._id}</TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {pickup.orderInfo?.orderId || pickup.linkedOrderId || 'N/A'}
                    </div>
                    {pickup.orderInfo?.order_Amount && (
                      <div className="text-sm text-gray-500">
                        ₹{pickup.orderInfo.order_Amount.toLocaleString()}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {pickup.orderInfo?.customerDetails?.name || 'N/A'}
                    </div>
                    {pickup.orderInfo?.customerDetails?.phone && (
                      <div className="text-sm text-gray-500">
                        {pickup.orderInfo.customerDetails.phone}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {pickup.dealerInfo?.name || pickup.dealerId || 'N/A'}
                    </div>
                    {pickup.dealerInfo?.email && (
                      <div className="text-sm text-gray-500">
                        {pickup.dealerInfo.email}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {pickup.staffInfo?.name || pickup.fulfilmentStaff || 'N/A'}
                    </div>
                    {pickup.staffInfo?.email && (
                      <div className="text-sm text-gray-500">
                        {pickup.staffInfo.email}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{pickup.createdAt ? formatDate(pickup.createdAt) : 'N/A'}</TableCell>
                  <TableCell>{getStatusBadge(pickup.scanStatus )}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {pickup.totalItems || pickup.skuList?.length || 0} item{(pickup.totalItems || pickup.skuList?.length || 0) !== 1 ? 's' : ''}
                    </div>
                    {pickup.uniqueSKUs && (
                      <div className="text-xs text-gray-500">
                        {pickup.uniqueSKUs} unique SKUs
                      </div>
                    )}
                  </TableCell>
                  {/* <TableCell>
                    {pickup.isOverdue ? (
                      <Badge variant="destructive" className="bg-red-100 text-red-800">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Overdue
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        On Time
                      </Badge>
                    )}
                  </TableCell> */}
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedPickup(pickup)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Picklist Details - {pickup._id}</DialogTitle>
                            <DialogDescription>
                              Detailed information about the picklist
                            </DialogDescription>
                          </DialogHeader>
                          {selectedPickup && (
                            <div className="space-y-6">
                              {/* Basic Information */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <h3 className="font-semibold mb-2">Picklist Information</h3>
                                  <div className="space-y-1 text-sm">
                                    <div><User className="inline h-4 w-4 mr-1" />ID: {selectedPickup._id}</div>
                                    <div><Phone className="inline h-4 w-4 mr-1" />Order ID: {selectedPickup.orderInfo?.orderId || selectedPickup.linkedOrderId || 'N/A'}</div>
                                    <div><Calendar className="inline h-4 w-4 mr-1" />Created: {selectedPickup.createdAt ? formatDate(selectedPickup.createdAt) : 'N/A'}</div>
                                    <div><Calendar className="inline h-4 w-4 mr-1" />Updated: {selectedPickup.updatedAt ? formatDate(selectedPickup.updatedAt) : 'N/A'}</div>
                                  </div>
                                </div>
                                <div>
                                  <h3 className="font-semibold mb-2">Assignment Information</h3>
                                  <div className="space-y-1 text-sm">
                                    <div><User className="inline h-4 w-4 mr-1" />Dealer: {selectedPickup.dealerInfo?.name || selectedPickup.dealerId || 'N/A'}</div>
                                    <div><Phone className="inline h-4 w-4 mr-1" />Staff: {selectedPickup.staffInfo?.name || selectedPickup.fulfilmentStaff || 'N/A'}</div>
                                    {selectedPickup.estimatedCompletionTime && (
                                      <div><Clock className="inline h-4 w-4 mr-1" />Est. Time: {selectedPickup.estimatedCompletionTime} min</div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Order Information */}
                              {selectedPickup.orderInfo && (
                                <div>
                                  <h3 className="font-semibold mb-2">Order Information</h3>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1 text-sm">
                                      <div><strong>Order Amount:</strong> ₹{selectedPickup.orderInfo.order_Amount?.toLocaleString() || 'N/A'}</div>
                                      <div><strong>Status:</strong> {selectedPickup.orderInfo.status || 'N/A'}</div>
                                      <div><strong>Payment Type:</strong> {selectedPickup.orderInfo.paymentType || 'N/A'}</div>
                                      <div><strong>Delivery Charges:</strong> ₹{selectedPickup.orderInfo.deliveryCharges || 0}</div>
                                    </div>
                                    <div className="space-y-1 text-sm">
                                      <div><strong>Customer Name:</strong> {selectedPickup.orderInfo.customerDetails?.name || 'N/A'}</div>
                                      <div><strong>Phone:</strong> {selectedPickup.orderInfo.customerDetails?.phone || 'N/A'}</div>
                                      <div><strong>Email:</strong> {selectedPickup.orderInfo.customerDetails?.email || 'N/A'}</div>
                                      <div><strong>Address:</strong> {selectedPickup.orderInfo.customerDetails?.address || 'N/A'}</div>
                                      <div><strong>Pincode:</strong> {selectedPickup.orderInfo.customerDetails?.pincode || 'N/A'}</div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Status Information */}
                              <div>
                                <h3 className="font-semibold mb-2">Status Information</h3>
                                <div className="text-sm">
                                  <div className="flex items-center gap-2">
                                    <span>Status:</span>
                                    {getStatusBadge(selectedPickup.scanStatus || 'Not Started')}
                                  </div>
                                  <div className="flex items-center gap-2 mt-2">
                                    <span>Invoice:</span>
                                    {selectedPickup.invoiceGenerated ? (
                                      <Badge variant="secondary" className="bg-green-100 text-green-800">Generated</Badge>
                                    ) : (
                                      <Badge variant="secondary" className="bg-gray-100 text-gray-800">Pending</Badge>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Items */}
                              <div>
                                <h3 className="font-semibold mb-2">SKU List ({selectedPickup.totalItems || selectedPickup.skuList?.length || 0} items, {selectedPickup.uniqueSKUs || 0} unique SKUs)</h3>
                                {loadingSKUs && (
                                  <div className="flex items-center justify-center py-4">
                                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                                    <span className="text-sm text-gray-500">Loading SKU details...</span>
                                  </div>
                                )}
                                <div className="space-y-2">
                                  {(selectedPickup.skuDetails || selectedPickup.skuList || []).map((item, index) => {
                                    const skuDetail = skuDetailsMap[item.sku];
                                    return (
                                      <div key={item._id || index} className="border rounded-lg p-3">
                                        <div className="flex justify-between items-start">
                                          <div className="flex-1">
                                            <div className="font-medium">SKU: {item.sku || 'N/A'}</div>
                                            <div className="text-sm text-gray-500">Quantity: {item.quantity || 0}</div>
                                            {/* <div className="text-sm text-gray-500">Barcode: {item.barcode || 'N/A'}</div> */}
                                            {skuDetail ? (
                                              <div className="mt-2 text-sm">
                                                <div><strong>Product:</strong> {skuDetail.product_name || 'N/A'}</div>
                                                <div><strong>Price:</strong> ₹{skuDetail.selling_price?.toLocaleString() || 0}</div>
                                                <div><strong>MRP:</strong> ₹{skuDetail.mrp_with_gst?.toLocaleString() || 0}</div>
                                                {skuDetail.manufacturer_part_name && (
                                                  <div><strong>Manufacturer Part:</strong> {skuDetail.manufacturer_part_name}</div>
                                                )}
                                              </div>
                                            ) : item.productDetails ? (
                                              <div className="mt-2 text-sm">
                                                <div><strong>Product:</strong> {item.productDetails.name || 'N/A'}</div>
                                                <div><strong>Price:</strong> ₹{item.productDetails.selling_price || 0}</div>
                                                <div><strong>MRP:</strong> ₹{item.productDetails.mrp || 0}</div>
                                              </div>
                                            ) : !loadingSKUs ? (
                                              <div className="mt-2 text-sm text-gray-400 italic">Product details not available</div>
                                            ) : null}
                                            {/* {item.error && (
                                              <div className="mt-2 text-sm text-red-500">
                                                <strong>Error:</strong> {item.error}
                                              </div>
                                            )} */}
                                          </div>
                                          <Badge variant="outline">SKU</Badge>
                                        </div>
                                      </div>
                                    );
                                  })}
                                  {(!selectedPickup.skuList || selectedPickup.skuList.length === 0) && (
                                    <div className="text-sm text-gray-500 italic">No SKUs found</div>
                                  )}
                                </div>
                              </div>

                              {/* Notes */}
                              {selectedPickup.notes && (
                                <div>
                                  <h3 className="font-semibold mb-2">Notes</h3>
                                  <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                    {selectedPickup.notes}
                                  </div>
                                </div>
                              )}

                              {/* Timestamps */}
                              <div>
                                <h3 className="font-semibold mb-2">Timestamps</h3>
                                <div className="space-y-1 text-sm">
                                  <div>Created: {selectedPickup.createdAt ? formatDate(selectedPickup.createdAt) : 'N/A'}</div>
                                  <div>Updated: {selectedPickup.updatedAt ? formatDate(selectedPickup.updatedAt) : 'N/A'}</div>
                                </div>
                              </div>
                            </div>
                          )}
                          <DialogFooter className="flex justify-between">
                            <Button 
                              variant="outline"
                              onClick={() => selectedPickup && handleGenerateSinglePickupPDF(selectedPickup)}
                              disabled={isGeneratingSinglePDF}
                              className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              {isGeneratingSinglePDF ? "Generating..." : "Download PDF"}
                            </Button>
                            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
                              Close
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalItems > 0 && totalPages > 1 && (
        <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
          <div className="text-sm text-gray-600 text-center sm:text-left">
            {`Showing ${(currentPage - 1) * itemsPerPage + 1}-${Math.min(
              currentPage * itemsPerPage,
              totalItems
            )} of ${totalItems} picklists`}
          </div>
          <div className="flex justify-center sm:justify-end">
            <DynamicPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              showItemsInfo={false}
            />
          </div>
        </div>
      )}
    </div>
  );
}
