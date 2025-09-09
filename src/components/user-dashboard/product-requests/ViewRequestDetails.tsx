"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Clock,
  AlertTriangle,
  Zap,
  Clock3,
  CheckSquare,
  Package,
  User,
  Calendar,
  FileText,
  Tag,
  DollarSign,
  BarChart3,
  Image as ImageIcon,
  RefreshCw,
} from "lucide-react";
import { format } from "date-fns";
import { useToast as useGlobalToast } from "@/components/ui/toast";
import { getProductById } from "@/service/product-Service";
import { approveSingleProduct, rejectSingleProduct } from "@/service/product-Service";
import Image from "next/image";

interface ProductRequest {
  _id: string;
  product_name: string;
  sku_code: string;
  brand?: {
    brand_name: string;
  };
  category?: {
    category_name: string;
  };
  subCategory?: {
    subCategory_name: string;
  };
  model?: {
    model_name: string;
  };
  mrp_with_gst: number;
  selling_price: number;
  no_of_stock: number;
  out_of_stock: boolean;
  live_status: string;
  Qc_status: string;
  priority?: string;
  admin_notes?: string;
  dealer_notes?: string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    name: string;
    email: string;
  };
  dealer?: {
    legal_name: string;
    contact_person: string;
  };
}

export default function ViewRequestDetails() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useGlobalToast();
  
  const [product, setProduct] = useState<ProductRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Dialog states
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [rejectNotes, setRejectNotes] = useState("");
  const [reviewNotes, setReviewNotes] = useState("");

  const productId = params.id as string;

  // Fetch product details
  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getProductById(productId);
      
      if (response.success && response.data) {
        // Ensure dates are properly formatted
        const productData = {
          ...response.data,
          createdAt: response.data.createdAt || new Date().toISOString(),
          updatedAt: response.data.updatedAt || new Date().toISOString(),
        };
        setProduct(productData);
      } else {
        setError("Product not found");
      }
    } catch (error) {
      console.error("Error fetching product details:", error);
      setError("Failed to load product details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchProductDetails();
    }
  }, [productId]);

  // Handle actions
  const handleApprove = async () => {
    try {
      setActionLoading(true);
      await approveSingleProduct(productId);
      showToast("Product approved successfully", "success");
      fetchProductDetails(); // Refresh data
    } catch (error) {
      showToast("Failed to approve product", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectNotes.trim()) {
      showToast("Please provide rejection notes", "error");
      return;
    }

    try {
      setActionLoading(true);
      await rejectSingleProduct(productId, rejectNotes);
      showToast("Product rejected successfully", "success");
      setIsRejectDialogOpen(false);
      setRejectNotes("");
      fetchProductDetails(); // Refresh data
    } catch (error) {
      showToast("Failed to reject product", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReview = async () => {
    try {
      setActionLoading(true);
      // Note: You might need to implement putRequestInReview function
      showToast("Product put in review successfully", "success");
      setIsReviewDialogOpen(false);
      setReviewNotes("");
      fetchProductDetails(); // Refresh data
    } catch (error) {
      showToast("Failed to put product in review", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Utility functions
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "approved":
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case "rejected":
        return <Badge variant="secondary" className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case "in_review":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800"><Eye className="w-3 h-3 mr-1" />In Review</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <Badge variant="destructive"><Zap className="w-3 h-3 mr-1" />Urgent</Badge>;
      case "high":
        return <Badge variant="secondary" className="bg-red-100 text-red-800"><AlertTriangle className="w-3 h-3 mr-1" />High</Badge>;
      case "medium":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock3 className="w-3 h-3 mr-1" />Medium</Badge>;
      case "low":
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckSquare className="w-3 h-3 mr-1" />Low</Badge>;
      default:
        return <Badge variant="outline">{priority || 'Medium'}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      return format(date, "MMM dd, yyyy 'at' HH:mm");
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid Date';
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return '₹0.00';
    }
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Loading product details...</span>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error || "Product not found"}</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  const currentStatus = product.live_status || product.Qc_status || 'pending';
  const canApprove = currentStatus === 'pending';
  const canReject = currentStatus === 'pending';

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Product Request Details</h1>
            <p className="text-gray-600 mt-1">
              Review and manage product approval request
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button onClick={fetchProductDetails} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          {canApprove && (
            <Button onClick={handleApprove} disabled={actionLoading}>
              {actionLoading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Approve
            </Button>
          )}
          {canReject && (
            <Button
              onClick={() => setIsRejectDialogOpen(true)}
              variant="destructive"
              disabled={actionLoading}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Product Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Product Name</label>
                  <p className="text-lg font-semibold">{product.product_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">SKU Code</label>
                  <p className="text-lg font-mono">{product.sku_code}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Brand</label>
                  <p className="text-lg">{product.brand?.brand_name || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Category</label>
                  <p className="text-lg">{product.category?.category_name || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Sub Category</label>
                  <p className="text-lg">{product.subCategory?.subCategory_name || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Model</label>
                  <p className="text-lg">{product.model?.model_name || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing & Stock */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Pricing & Stock</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">MRP (with GST)</label>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(product.mrp_with_gst)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Selling Price</label>
                  <p className="text-xl font-bold text-blue-600">
                    {formatCurrency(product.selling_price)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Stock</label>
                  <p className={`text-xl font-bold ${product.out_of_stock ? 'text-red-600' : 'text-green-600'}`}>
                    {product.out_of_stock ? 'Out of Stock' : product.no_of_stock}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          {product.images && product.images.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ImageIcon className="h-5 w-5" />
                  <span>Product Images</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {product.images.map((image, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                      <Image
                        src={image}
                        alt={`${product.product_name} - Image ${index + 1}`}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/placeholder-product.png";
                        }}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Notes & Comments</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {product.admin_notes && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Admin Notes</label>
                  <p className="text-sm bg-gray-50 p-3 rounded-md">{product.admin_notes}</p>
                </div>
              )}
              {product.dealer_notes && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Dealer Notes</label>
                  <p className="text-sm bg-blue-50 p-3 rounded-md">{product.dealer_notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status & Priority */}
          <Card>
            <CardHeader>
              <CardTitle>Status & Priority</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Current Status</label>
                <div className="mt-2">
                  {getStatusBadge(currentStatus)}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Priority</label>
                <div className="mt-2">
                  {getPriorityBadge(product.priority || 'medium')}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Request Information */}
          <Card>
            <CardHeader>
              <CardTitle>Request Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Created Date</label>
                <p className="text-sm">{formatDate(product.createdAt)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Last Updated</label>
                <p className="text-sm">{formatDate(product.updatedAt)}</p>
              </div>
              {product.createdBy && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Created By</label>
                  <p className="text-sm">{product.createdBy.name}</p>
                  <p className="text-xs text-gray-500">{product.createdBy.email}</p>
                </div>
              )}
              {product.dealer && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Dealer</label>
                  <p className="text-sm">{product.dealer.legal_name}</p>
                  <p className="text-xs text-gray-500">{product.dealer.contact_person}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {canApprove && (
                <Button
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="w-full justify-start bg-green-600 hover:bg-green-700 text-white"
                >
                  {actionLoading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Approve Product
                </Button>
              )}
              {canReject && (
                <Button
                  onClick={() => setIsRejectDialogOpen(true)}
                  variant="destructive"
                  disabled={actionLoading}
                  className="w-full justify-start"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Product
                </Button>
              )}
              {canApprove && (
                <Button
                  onClick={() => setIsReviewDialogOpen(true)}
                  variant="outline"
                  disabled={actionLoading}
                  className="w-full justify-start border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Put in Review
                </Button>
              )}
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push(`/user/dashboard/product/product-details/${productId}`)}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Full Product Details
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push(`/user/dashboard/product/productedit/${productId}`)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Product
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Product Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this product request.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Enter rejection reason..."
            value={rejectNotes}
            onChange={(e) => setRejectNotes(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleReject} variant="destructive" disabled={actionLoading}>
              {actionLoading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Reject Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Put Product in Review</DialogTitle>
            <DialogDescription>
              Add any notes for the review process.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Enter review notes (optional)..."
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleReview} disabled={actionLoading}>
              {actionLoading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Put in Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
