"use client";

import { useState, useEffect } from "react";
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
import { generatePickupListPDF, generateSinglePickupPDF } from "@/service/pdfService";

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

  // Fetch pickup data
  const fetchPickupData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Starting to fetch pickup data...');

      // Use real API calls with fallback to mock data
      try {
        console.log('Calling getAllPicklists API...');
        const response = await getAllPicklists();
        console.log('API Response received:', response);
        console.log('Response data:', response.data);
        console.log('Is response.data an array?', Array.isArray(response.data));
        
        // Handle different response structures
        if (response && response.data && Array.isArray(response.data)) {
          console.log('Using response.data directly (array):', response.data);
          setPickups(response.data);
        } else if (response && response.data && response.data.data && Array.isArray(response.data.data)) {
          console.log('Using response.data.data (nested):', response.data.data);
          setPickups(response.data.data);
        } else {
          console.log('No valid data found, setting empty array');
          console.log('Response structure:', response);
          setPickups([]);
        }
      } catch (apiError) {
        console.warn("API calls failed, using mock data:", apiError);
        // Fallback to mock data if API calls fail
        const mockPickups: PicklistData[] = [
          {
            _id: "1",
            linkedOrderId: "ORD-001",
            dealerId: "dealer-001",
            fulfilmentStaff: "staff-001",
            skuList: [
              {
                sku: "BP-001",
                quantity: 2,
                barcode: "BRK001",
                _id: "sku-1"
              }
            ],
            scanStatus: "Not Started",
            invoiceGenerated: false,
            updatedAt: "2025-01-19T10:00:00Z",
            createdAt: "2025-01-19T10:00:00Z",
            __v: 0,
            dealerInfo: null,
            staffInfo: null,
            orderInfo: null,
            skuDetails: [],
            totalItems: 1,
            uniqueSKUs: 1,
            isOverdue: false,
            estimatedCompletionTime: 30
          },
          {
            _id: "2",
            linkedOrderId: "ORD-002",
            dealerId: "dealer-002",
            fulfilmentStaff: "staff-002",
            skuList: [
              {
                sku: "AF-001",
                quantity: 1,
                barcode: "BRK002",
                _id: "sku-2"
              }
            ],
            scanStatus: "Packed",
            invoiceGenerated: false,
            updatedAt: "2025-01-19T15:30:00Z",
            createdAt: "2025-01-19T09:00:00Z",
            __v: 0,
            dealerInfo: null,
            staffInfo: null,
            orderInfo: null,
            skuDetails: [],
            totalItems: 1,
            uniqueSKUs: 1,
            isOverdue: false,
            estimatedCompletionTime: 30
          }
        ];

        setPickups(mockPickups);
      }
    } catch (error) {
      console.error("Error fetching pickup data:", error);
      setError("Failed to load picklist data");
      showToast("Failed to load picklist data", "error");
      
      // Set mock data as fallback even on error
      const mockPickups: PicklistData[] = [
        {
          _id: "1",
          linkedOrderId: "ORD-001",
          dealerId: "dealer-001",
          fulfilmentStaff: "staff-001",
          skuList: [
            {
              sku: "BP-001",
              quantity: 2,
              barcode: "BRK001",
              _id: "sku-1"
            }
          ],
          scanStatus: "Not Started",
          invoiceGenerated: false,
          updatedAt: "2025-01-19T10:00:00Z",
          createdAt: "2025-01-19T10:00:00Z",
          __v: 0,
          dealerInfo: null,
          staffInfo: null,
          orderInfo: null,
          skuDetails: [],
          totalItems: 1,
          uniqueSKUs: 1,
          isOverdue: false,
          estimatedCompletionTime: 30
        }
      ];
      setPickups(mockPickups);
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchPickupData();
  }, []);

  // Filter pickups based on search and filters
  const filteredPickups = (Array.isArray(pickups) ? pickups : []).filter(pickup => {
    const matchesSearch = 
      (pickup._id?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (pickup.linkedOrderId?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (pickup.dealerId?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (pickup.fulfilmentStaff?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || pickup.scanStatus === statusFilter;
    const matchesPriority = priorityFilter === "all"; // Priority not available in new structure
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Debug logging
  console.log('Pickups state:', pickups);
  console.log('Filtered pickups:', filteredPickups);
  console.log('Search term:', searchTerm);
  console.log('Status filter:', statusFilter);


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
      
      await generatePickupListPDF(filteredPickups as any, {
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
      
      await generateSinglePickupPDF(pickup as any);
      
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
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
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
                  <SelectItem value="Scanned">Scanned</SelectItem>
                  <SelectItem value="Packed">Packed</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setPriorityFilter("all");
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
                  <TableCell>{getStatusBadge(pickup.scanStatus || 'Not Started')}</TableCell>
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
                                <div className="space-y-2">
                                  {(selectedPickup.skuDetails || selectedPickup.skuList || []).map((item, index) => (
                                    <div key={item._id || index} className="border rounded-lg p-3">
                                      <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                          <div className="font-medium">SKU: {item.sku || 'N/A'}</div>
                                          <div className="text-sm text-gray-500">Quantity: {item.quantity || 0}</div>
                                          <div className="text-sm text-gray-500">Barcode: {item.barcode || 'N/A'}</div>
                                          {item.productDetails && (
                                            <div className="mt-2 text-sm">
                                              <div><strong>Product:</strong> {item.productDetails.name || 'N/A'}</div>
                                              <div><strong>Price:</strong> ₹{item.productDetails.selling_price || 0}</div>
                                              <div><strong>MRP:</strong> ₹{item.productDetails.mrp || 0}</div>
                                            </div>
                                          )}
                                          {item.error && (
                                            <div className="mt-2 text-sm text-red-500">
                                              <strong>Error:</strong> {item.error}
                                            </div>
                                          )}
                                        </div>
                                        <Badge variant="outline">SKU</Badge>
                                      </div>
                                    </div>
                                  ))}
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
    </div>
  );
}

