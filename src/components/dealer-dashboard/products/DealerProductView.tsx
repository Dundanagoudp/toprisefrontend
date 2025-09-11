"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Package, 
  ArrowLeft, 
  Edit, 
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Star,
  ShoppingCart,
  BarChart3,
  DollarSign,
  Truck,
  Shield,
  Tag,
  Calendar,
  User,
  Building,
  Car,
  Settings,
  Eye,
  Download,
  Share2
} from "lucide-react";
import { 
  getDealerProductById,
  formatCurrency, 
  formatProductDate,
  getStockStatusColor,
  getStockStatusText,
  getPriorityColor,
  getPriorityText,
  canEditField,
  canManage,
  type DealerProduct
} from "@/service/dealer-products-service";
import { useToast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";

interface ProductViewProps {
  product: DealerProduct;
}

export default function DealerProductView({ product }: ProductViewProps) {
  const { showToast } = useToast();
  const router = useRouter();

  const handleEdit = () => {
    router.push(`/dealer/dashboard/product/productedit/${product._id}`);
  };

  const handleBack = () => {
    router.push("/dealer/dashboard/product");
  };

  const canEdit = canEditField(product.permission_matrix, 'product_name');
  const canManageStock = canManage(product.permission_matrix, 'stock');
  const canManagePricing = canManage(product.permission_matrix, 'pricing');

  // Permission-based field visibility with null checks
  const canViewPricing = product.permission_matrix?.canView?.all_fields || canManagePricing;
  const canViewStock = product.permission_matrix?.canView?.all_fields || canManageStock;
  const canViewImages = product.permission_matrix?.canView?.all_fields || canEditField(product.permission_matrix, 'images');
  const canViewVehicleInfo = product.permission_matrix?.canView?.all_fields || false;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button onClick={handleBack} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{product.product_name}</h1>
            <p className="text-gray-600">SKU: {product.sku_code}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {canEdit && (
            <Button onClick={handleEdit} size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit Product
            </Button>
          )}
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Product Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Images */}
          {canViewImages && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Product Images
                </CardTitle>
              </CardHeader>
              <CardContent>
                {product.images && product.images.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {product.images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img 
                          src={image} 
                          alt={`${product.product_name} - Image ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg border"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                          <Button variant="secondary" size="sm" className="opacity-0 group-hover:opacity-100">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No images available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Product Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Product Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Brand</label>
                    <p className="text-lg font-semibold text-gray-900">{product.brand.brand_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Category</label>
                    <p className="text-lg font-semibold text-gray-900">{product.category.category_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Sub Category</label>
                    <p className="text-lg font-semibold text-gray-900">{product.sub_category.subcategory_name}</p>
                  </div>
                </div>
                {canViewVehicleInfo && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Model</label>
                      <p className="text-lg font-semibold text-gray-900">{product.model.model_name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Variants</label>
                      <div className="flex flex-wrap gap-2">
                        {product.variant.map((variant, index) => (
                          <Badge key={index} variant="outline">
                            {variant.variant_name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pricing Information */}
          {canViewPricing && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Pricing Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">MRP (with GST)</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(product.pricing.mrp_with_gst)}</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Base Selling Price</p>
                    <p className="text-2xl font-bold text-blue-600">{formatCurrency(product.pricing.base_selling_price)}</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Dealer Selling Price</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(product.pricing.dealer_selling_price)}</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">GST Percentage</p>
                    <p className="text-2xl font-bold text-purple-600">{product.pricing.gst_percentage}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar Information */}
        <div className="space-y-6">
          {/* Stock Status */}
          {canViewStock && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Stock Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <Badge 
                    variant="outline" 
                    className={`text-lg px-4 py-2 ${getStockStatusColor(product.dealer_info.in_stock, product.dealer_info.quantity_available)}`}
                  >
                    {getStockStatusText(product.dealer_info.in_stock, product.dealer_info.quantity_available)}
                  </Badge>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{product.dealer_info.quantity_available}</p>
                  <p className="text-sm text-gray-600">Units Available</p>
                </div>
                
                <div className="space-y-3">
                  {canViewPricing && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Dealer Margin</span>
                      <span className="font-semibold text-green-600">{product.pricing.dealer_margin}%</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Priority</span>
                    <Badge 
                      variant="outline" 
                      className={getPriorityColor(product.dealer_info.dealer_priority)}
                    >
                      {getPriorityText(product.dealer_info.dealer_priority)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Permissions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Your Permissions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Can Edit Product</span>
                  {canEdit ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Can Manage Stock</span>
                  {canManageStock ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Can Manage Pricing</span>
                  {canManagePricing ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Created</p>
                <p className="font-semibold text-gray-900">{formatProductDate(product.created_at)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Updated</p>
                <p className="font-semibold text-gray-900">{formatProductDate(product.updated_at)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
