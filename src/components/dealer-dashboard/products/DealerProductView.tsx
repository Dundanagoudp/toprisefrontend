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
  canViewField,
  type DealerProduct
} from "@/service/dealer-products-service";
import { useToast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import type { DealerPermissions } from "@/types/dealer-types";

interface ProductViewProps {
  product: DealerProduct;
  allowedFields?: string[] | null;
  readPermissionsEnabled?: boolean;
  canEditProductDetails?: boolean;
  showPermissionsCard?: boolean;
  dealerPermissions?: DealerPermissions | null;
}

export default function DealerProductView({ product, allowedFields, readPermissionsEnabled = true, canEditProductDetails = false, showPermissionsCard = false, dealerPermissions = null }: ProductViewProps) {
  const { showToast } = useToast();
  const router = useRouter();
  
  const handleEdit = () => {
    router.push(`/dealer/dashboard/product/productedit/${product._id}`);
  };

  const handleBack = () => {
    router.push("/dealer/dashboard/product");
  };



  // Permission-based field visibility with null checks

  const canViewImages = product.permission_matrix?.canView?.all_fields || canEditField(product.permission_matrix, 'images');
  const canViewVehicleInfo = product.permission_matrix?.canView?.all_fields || false;

  // Field-level read permission checks
  const canViewSkuCode = canViewField(allowedFields, 'sku_code', readPermissionsEnabled);
  const canViewProductName = canViewField(allowedFields, 'product_name', readPermissionsEnabled);
  const canViewBrand = canViewField(allowedFields, 'brand', readPermissionsEnabled);
  const canViewCategory = canViewField(allowedFields, 'category', readPermissionsEnabled);
  const canViewSubCategory = canViewField(allowedFields, 'sub_category', readPermissionsEnabled);
  const canViewProductType = canViewField(allowedFields, 'product_type', readPermissionsEnabled);
  const canViewModel = canViewField(allowedFields, 'model', readPermissionsEnabled);
  const canViewVariant = canViewField(allowedFields, 'variant', readPermissionsEnabled);
  const canViewMake = canViewField(allowedFields, 'make', readPermissionsEnabled);
  const canViewYearRange = canViewField(allowedFields, 'year_range', readPermissionsEnabled);
  const canViewIsUniversal = canViewField(allowedFields, 'is_universal', readPermissionsEnabled);
  const canViewImagesField = canViewField(allowedFields, 'images', readPermissionsEnabled) && canViewImages;
  const canViewVideoUrl = canViewField(allowedFields, 'video_url', readPermissionsEnabled);
  const canViewDimensions = canViewField(allowedFields, 'dimensions', readPermissionsEnabled);
  const canViewWeight = canViewField(allowedFields, 'weight', readPermissionsEnabled);
  const canViewManufacturerPartName = canViewField(allowedFields, 'manufacturer_part_name', readPermissionsEnabled);
  
  // Pricing and stock visibility checks
  const canViewPricing = canViewField(allowedFields, 'pricing', readPermissionsEnabled) || 
                         canViewField(allowedFields, 'mrp_with_gst', readPermissionsEnabled) ||
                         canViewField(allowedFields, 'base_selling_price', readPermissionsEnabled) ||
                         canViewField(allowedFields, 'dealer_selling_price', readPermissionsEnabled) ||
                         product.permission_matrix?.canView?.all_fields ||
                         canManage(product.permission_matrix, 'pricing');
  const canViewStock = canViewField(allowedFields, 'stock', readPermissionsEnabled) ||
                       canViewField(allowedFields, 'quantity_available', readPermissionsEnabled) ||
                       canViewField(allowedFields, 'in_stock', readPermissionsEnabled) ||
                       product.permission_matrix?.canView?.all_fields ||
                       canManage(product.permission_matrix, 'stock');

  // Check if any fields in a section are visible
  const hasProductDetails = canViewBrand || canViewCategory || canViewSubCategory || canViewProductType;
  const hasVehicleInfo = canViewModel || canViewVariant || canViewMake || canViewYearRange || canViewIsUniversal;
  const hasTechnicalSpecs = canViewDimensions || canViewWeight;

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
            {canViewProductName && (
              <h1 className="text-2xl font-bold text-gray-900">{product.product_name}</h1>
            )}
            {canViewSkuCode && (
              <p className="text-gray-600">SKU: {product.sku_code}</p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {canEditProductDetails && (
            <Button onClick={handleEdit} size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit Product
            </Button>
          )}
    
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Product Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Images */}
          {canViewImagesField && (
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
          {hasProductDetails && (
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
                    {canViewBrand && product.brand && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Brand</label>
                        <p className="text-lg font-semibold text-gray-900">{product.brand.brand_name || 'N/A'}</p>
                      </div>
                    )}
                    {canViewCategory && product.category && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Category</label>
                        <p className="text-lg font-semibold text-gray-900">{product.category.category_name || 'N/A'}</p>
                      </div>
                    )}
                    {canViewSubCategory && product.sub_category && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Sub Category</label>
                        <p className="text-lg font-semibold text-gray-900">{product.sub_category.subcategory_name || 'N/A'}</p>
                      </div>
                    )}
                    {canViewProductType && (product as any).product_type && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Product Type</label>
                        <p className="text-lg font-semibold text-gray-900">{(product as any).product_type}</p>
                      </div>
                    )}
                    {canViewManufacturerPartName && (product as any).manufacturer_part_name && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Manufacturer Part Name</label>
                        <p className="text-lg font-semibold text-gray-900">{(product as any).manufacturer_part_name}</p>
                      </div>
                    )}
                  </div>
                  {hasVehicleInfo && (
                    <div className="space-y-4">
                      {canViewModel && product.model && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Model</label>
                          <p className="text-lg font-semibold text-gray-900">{product.model.model_name || 'N/A'}</p>
                        </div>
                      )}
                      {canViewVariant && product.variant && product.variant.length > 0 && (
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
                      )}
                      {canViewMake && (product as any).make && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Make</label>
                          <p className="text-lg font-semibold text-gray-900">
                            {Array.isArray((product as any).make) 
                              ? (product as any).make.join(', ') 
                              : (product as any).make}
                          </p>
                        </div>
                      )}
                      {canViewYearRange && (product as any).year_range && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Year Range</label>
                          <p className="text-lg font-semibold text-gray-900">
                            {Array.isArray((product as any).year_range) 
                              ? (product as any).year_range
                                  .map((yr: any) => yr.year_name || yr.name || String(yr))
                                  .filter((yr: string) => yr && yr !== '')
                                  .join(', ')
                              : String((product as any).year_range)}
                          </p>
                        </div>
                      )}
                      {canViewIsUniversal && (product as any).is_universal !== undefined && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Is Universal</label>
                          <p className="text-lg font-semibold text-gray-900">
                            {(product as any).is_universal ? 'Yes' : 'No'}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Technical Specifications */}
          {hasTechnicalSpecs && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Technical Specifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {canViewDimensions && (product as any).dimensions && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Dimensions</label>
                      <p className="text-lg font-semibold text-gray-900">
                        {typeof (product as any).dimensions === 'string' 
                          ? (product as any).dimensions
                          : JSON.stringify((product as any).dimensions)}
                      </p>
                    </div>
                  )}
                  {canViewWeight && (product as any).weight !== undefined && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Weight</label>
                      <p className="text-lg font-semibold text-gray-900">
                        {(product as any).weight} {(product as any).weight_unit || 'kg'}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Video URL */}
          {canViewVideoUrl && (product as any).video_url && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Product Video
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video">
                  <iframe
                    src={(product as any).video_url}
                    className="w-full h-full rounded-lg"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pricing Information */}
          {canViewPricing && product.pricing && (
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
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(product.pricing.mrp_with_gst || 0)}</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Base Selling Price</p>
                    <p className="text-2xl font-bold text-blue-600">{formatCurrency(product.pricing.base_selling_price || 0)}</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Dealer Selling Price</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(product.pricing.dealer_selling_price || 0)}</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">GST Percentage</p>
                    <p className="text-2xl font-bold text-purple-600">{product.pricing.gst_percentage || 0}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar Information */}
        <div className="space-y-6">
          {/* Stock Status */}
          {canViewStock && product.dealer_info && (
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
                  <p className="text-3xl font-bold text-gray-900 mt-2">{product.dealer_info.quantity_available || 0}</p>
                  <p className="text-sm text-gray-600">Units Available</p>
                </div>
                
                <div className="space-y-3">
                  {canViewPricing && product.pricing && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Dealer Margin</span>
                      <span className="font-semibold text-green-600">{product.pricing.dealer_margin || 0}%</span>
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
          {showPermissionsCard && dealerPermissions && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Your Permissions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {/* Action Permissions */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Can Add Products</span>
                    {dealerPermissions.isAdd ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Can Delete Products</span>
                    {dealerPermissions.isDelete ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Can Update Stock</span>
                    {dealerPermissions.isUpdateStock ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  
                  {/* Divider */}
                  <div className="border-t border-gray-200 my-3"></div>
                  
                  {/* Read Permissions */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Can Read Product Details</span>
                    {dealerPermissions.readPermissions?.isEnabled ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  {dealerPermissions.readPermissions?.allowed_fields && dealerPermissions.readPermissions.allowed_fields.length > 0 && (
                    <div className="text-xs text-gray-500 pl-2">
                      {dealerPermissions.readPermissions.allowed_fields.length} field(s) allowed
                    </div>
                  )}
                  
                  {/* Update Permissions */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Can Edit Product Details</span>
                    {dealerPermissions.updatePermissions?.isEnabled ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  {dealerPermissions.updatePermissions?.allowed_fields && dealerPermissions.updatePermissions.allowed_fields.length > 0 && (
                    <div className="text-xs text-gray-500 pl-2">
                      {dealerPermissions.updatePermissions.allowed_fields.length} field(s) allowed
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

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
