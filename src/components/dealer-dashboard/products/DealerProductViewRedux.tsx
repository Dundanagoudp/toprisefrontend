"use client";

import { useState } from "react";
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
  Share2,
} from "lucide-react";
import {
  formatCurrency,
  formatProductDate,
  getStockStatusColor,
  getStockStatusText,
  getPriorityColor,
  getPriorityText,
  canEditField,
  canManage,
  canViewField,
  type DealerProduct,
} from "@/service/dealer-products-service";
import { useToast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import type { DealerPermissions } from "@/types/dealer-types";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import { PRODUCT_FIELDS } from "@/lib/constants/product-fields";
import { Product } from "@/types/product-Types";

interface ProductViewProps {
  product: DealerProduct | null;
  allowedFields?: string[] | null;
  readPermissionsEnabled?: boolean;
  canEditProductDetails?: boolean;
  showPermissionsCard?: boolean;
  dealerPermissions?: DealerPermissions | null;
}

export default function DealerProductViewRedux({
  product,
  allowedFields,
  readPermissionsEnabled = true,
  canEditProductDetails = false,
  showPermissionsCard = false,
  dealerPermissions = null,
}: ProductViewProps) {
  const { showToast } = useToast();
  const router = useRouter();

  const handleEdit = () => {
    if (product?._id) {
      router.push(`/dealer/dashboard/product/productedit/${product._id}`);
    }
  };

  const handleBack = () => {
    router.push("/dealer/dashboard/product");
  };

  // Permission-based field visibility with null checks
  const fieldPermissions: Record<string, boolean> = PRODUCT_FIELDS.reduce(
    (acc: Record<string, boolean>, field: any) => {
      acc[field.value] = canViewField(
        allowedFields,
        field.value,
        readPermissionsEnabled
      );
      return acc;
    },
    {}
  );

  // Helper function for consistent permission checking
  const hasPermission = (fieldName: string): boolean => {
    return fieldPermissions[fieldName] || false;
  };

  // Composite permission checks for grouped fields
  const canViewPricing = hasPermission("mrp_with_gst") ||
                        hasPermission("selling_price") ||
                        hasPermission("gst_percentage") ||
                        hasPermission("hsn_code");

  const canViewStock = hasPermission("in_stock") ||
                      hasPermission("quantity_available");

  const canViewDealerInfo = hasPermission("dealer_info");

  // Helper component for permission-denied state
  const PermissionDeniedCard = ({ title }: { title: string }) => (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-red-600 font-semibold text-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 text-sm">
          You don't have permission to view this information.
        </p>
      </CardContent>
    </Card>
  );

  if (!product) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          {/* <Breadcrumb>
            <BreadcrumbList> */}
              {/* <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator /> */}
              {/* <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/dealer/dashboard/product">Product</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Product Details</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb> */}
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Product not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        {/* <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dealer/dashboard/product">Product</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Product Details</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb> */}
        <div className="flex items-center justify-between mt-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 font-sans">
              Product Overview
            </h1>
            <p className="text-base font-medium font-sans text-gray-500">
              View product details and manage inventory
            </p>
          </div>
          <div className="flex items-center gap-3">
            {canEditProductDetails && (
              <Button
                variant="outline"
                onClick={handleEdit}
                className="bg-red-50 border-red-200 hover:bg-red-100 hover:text-red-600 text-red-600"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Product
              </Button>
            )}
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Products
            </Button>
          </div>
        </div>
      </div>

      {/* Permissions Card */}
      {showPermissionsCard && dealerPermissions && (
        <div className="px-6 py-4">
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">
                  Your Permissions
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Read Access:</span>
                  <span
                    className={`ml-2 ${
                      dealerPermissions.readPermissions?.isEnabled
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {dealerPermissions.readPermissions?.isEnabled
                      ? "Enabled"
                      : "Disabled"}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Update Access:</span>
                  <span
                    className={`ml-2 ${
                      dealerPermissions.updatePermissions?.isEnabled
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {dealerPermissions.updatePermissions?.isEnabled
                      ? "Enabled"
                      : "Disabled"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Content */}
      <div className="p-4 sm:p-6 space-y-8">
        {/* Core Product Identity */}
        {hasPermission("sku_code") ||
        hasPermission("product_name") ||
        hasPermission("brand") ||
        hasPermission("category") ||
        hasPermission("sub_category") ||
        hasPermission("product_type") ? (
          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-red-600 font-semibold text-lg">
                Core Product Identity
              </CardTitle>
              <p className="text-sm text-gray-500">
                The core identifiers that define the product's identity, brand,
                and origin.
              </p>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hasPermission("sku_code") && (
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    SKU Code
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {product.sku_code || "-"}
                  </p>
                </div>
              )}
              {hasPermission("product_name") && (
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Product Name
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {(product as unknown as Product).product_name || "-"}
                  </p>
                </div>
              )}
              {hasPermission("manufacturer_part_name") && (
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Manufacturer Part Number
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {(product as unknown as Product).manufacturer_part_name || "-"}
                  </p>
                </div>
              )}

              {hasPermission("brand") && (
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Brand
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {(product as unknown as Product).brand?.brand_name || "-"}
                  </p>
                </div>
              )}
              {hasPermission("category") && (
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {(product as unknown as Product).category?.category_name || "-"}
                  </p>
                </div>
              )}
              {hasPermission("sub_category") && (
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Sub-category
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {(product as unknown as Product).sub_category?.subcategory_name || "-"}
                  </p>
                </div>
              )}
              {hasPermission("product_type") && (
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Product Type
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {(product as unknown as Product).product_type || "-"}
                  </p>
                </div>
              )}
              {hasPermission("vehicle_type") && (
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Vehicle Type
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {(product as any).brand?.type?.type_name || "-"}
                  </p>
                </div>
              )}
              {hasPermission("make") && (
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Make
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {(product as unknown as Product).make || "-"}
                  </p>
                </div>
              )}
              {hasPermission("hsn_code") && (
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    HSN Code
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {(product as unknown as Product).hsn_code || "-"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <PermissionDeniedCard title="Core Product Identity" />
        )}

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Vehicle Compatibility */}
          {hasPermission("vehicle_type") ||
          hasPermission("model") ||
          hasPermission("variant") ||
          hasPermission("year_range") ||
          hasPermission("is_universal") ? (
            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-red-600 font-semibold text-lg">
                  Vehicle Compatibility
                </CardTitle>
                <p className="text-sm text-gray-500">
                  The vehicle make, model, and variant the product is compatible
                  with.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {hasPermission("make") && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Make
                    </label>
                    <p className="text-sm text-gray-900 mt-1">{(product as unknown as Product).make ? (Array.isArray((product as unknown as Product).make) ? (product as unknown as Product).make.join(", ") : (product as unknown as Product).make) : "-"}</p>
                  </div>
                )}
                {hasPermission("model") && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Model
                    </label>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {(product as unknown as Product).model ? (
                        Array.isArray((product as unknown as Product).model) ? (
                          (product as unknown as Product).model.map(
                            (m: any, index: number) => (
                              <Badge key={index} variant="secondary" className="bg-red-200 text-gray-900">
                                {m.model_name}
                              </Badge>
                            )
                          )
                        ) : (
                          <Badge variant="secondary" className="bg-red-200 text-gray-900">
                            {(product as unknown as Product).model[0].model_name}
                          </Badge>
                        )
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </div>
                  </div>
                )}
                {hasPermission("variant") && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Variant
                    </label>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {product.variant && product.variant.length > 0 ? (
                        product.variant.map((variant) => (
                          <Badge key={variant._id} variant="secondary" className="bg-red-200 text-gray-900">
                            {variant.variant_name}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </div>
                  </div>
                )}
                {hasPermission("year_range") && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Year Range
                    </label>
                    <p className="text-sm text-gray-900 mt-1">{(product as unknown as Product).year_range && (product as unknown as Product).year_range.length > 0 ? (
                      (product as unknown as Product).year_range.map((yr: any, index: number) => (
                        <Badge key={index} variant="secondary" className="bg-red-200 text-gray-900">{yr.year_name}</Badge>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">-</span>
                    )}
                    </p>
                  </div>
                )}
                {hasPermission("is_universal") && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Is Universal
                    </label>
                    <p className="text-sm text-gray-900 mt-1">
                      {(product as any).is_universal ? "Yes" : "No"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <PermissionDeniedCard title="Vehicle Compatibility" />
          )}

          {/* Technical Specifications */}
          {hasPermission("weight") ||
          hasPermission("warranty") ||
          hasPermission("is_consumable") ? (
            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-red-600 font-semibold text-lg">
                  Technical Specifications
                </CardTitle>
                <p className="text-sm text-gray-500">
                  Relevant technical details to help users understand the product
                  quality and features.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Key Specifications
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {(product as any).key_specifications || "-"}
                  </p>
                </div>
                {hasPermission("weight") && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Weight
                    </label>
                    <p className="text-sm text-gray-900 mt-1">
                      {(product as unknown as Product).weight
                        ? `${(product as unknown as Product).weight} kg`
                        : "-"}
                    </p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Certifications
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {(product as any).certifications || "-"}
                  </p>
                </div>
                {hasPermission("warranty") && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Warranty
                    </label>
                    <p className="text-sm text-gray-900 mt-1">
                      {(product as unknown as Product).warranty
                        ? `${(product as unknown as Product).warranty} months`
                        : "-"}
                    </p>
                  </div>
                )}
                {hasPermission("is_consumable") && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Is Consumable
                    </label>
                    <p className="text-sm text-gray-900 mt-1">
                      {(product as unknown as Product).is_consumable ? "Yes" : "No"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <PermissionDeniedCard title="Technical Specifications" />
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Media & Assets */}
          {hasPermission("images") ? (
            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-red-600 font-semibold text-lg">
                  Media & Assets
                </CardTitle>
                <p className="text-sm text-gray-500">
                  Product images, videos, and brochures to enhance visual
                  representation and credibility.
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(product as unknown as Product).images && (product as unknown as Product).images.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {(product as unknown as Product).images.map((img: string, idx: number) => (
                        <div
                          key={idx}
                          className={idx === 0 ? "col-span-2" : ""}
                        >
                          <img
                            src={img}
                            alt={`img-${idx}`}
                            className={`w-full bg-gray-200 rounded-md object-cover ${
                              idx === 0 ? "aspect-video" : "aspect-square"
                            }`}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="aspect-video bg-gray-200 rounded-md flex items-center justify-center">
                      <Package className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <PermissionDeniedCard title="Media & Assets" />
          )}

          {/* Pricing & Stock */}
          {canViewPricing || canViewStock || canViewDealerInfo ? (
            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-red-600 font-semibold text-lg">
                  Pricing & Stock
                </CardTitle>
                <p className="text-sm text-gray-500">
                  Current pricing information and stock availability for this
                  product.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {hasPermission("mrp_with_gst") && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      MRP
                    </label>
                    <p className="text-sm text-gray-900 mt-1">
                      {(product as unknown as Product).mrp_with_gst
                        ? formatCurrency((product as unknown as Product).mrp_with_gst)
                        : "-"}
                    </p>
                  </div>
                )}
                {hasPermission("selling_price") && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Selling Price
                    </label>
                    <p className="text-sm text-gray-900 mt-1">
                      {(product as unknown as Product).selling_price
                        ? formatCurrency((product as unknown as Product).selling_price)
                        : "-"}
                    </p>
                  </div>
                )}
                {hasPermission("gst_percentage") && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      GST Percentage
                    </label>
                    <p className="text-sm text-gray-900 mt-1">
                      {(product as unknown as Product).gst_percentage
                        ? `${(product as unknown as Product).gst_percentage}%`
                        : "-"}
                    </p>
                  </div>
                )}
                {(hasPermission("in_stock") || hasPermission("quantity_available")) && (
                  <>
                    {hasPermission("in_stock") && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Stock Status
                        </label>
                        <div className="mt-1">
                          <Badge
                            className={getStockStatusColor(
                              product.dealer_info?.in_stock || false,
                              product.dealer_info?.quantity_available || 0
                            )}
                          >
                            {getStockStatusText(
                              product.dealer_info?.in_stock || false,
                              product.dealer_info?.quantity_available || 0
                            )}
                          </Badge>
                        </div>
                      </div>
                    )}
                    {hasPermission("quantity_available") && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Quantity Available
                        </label>
                        <p className="text-sm text-gray-900 mt-1">
                          {product.dealer_info?.quantity_available || 0}
                        </p>
                      </div>
                    )}
                  </>
                )}
                {canViewDealerInfo && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Dealer Margin
                    </label>
                    <p className="text-sm text-gray-900 mt-1">
                      {product.dealer_info?.dealer_margin
                        ? `${product.dealer_info.dealer_margin}%`
                        : "-"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <PermissionDeniedCard title="Pricing & Stock" />
          )}
        </div>

        {/* Product History */}
        {readPermissionsEnabled ? (
          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-red-600 font-semibold text-lg">
                Product History
              </CardTitle>
              <p className="text-sm text-gray-500">
                Track the history of changes and modifications made to this
                product.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Created At
                </label>
                <p className="text-sm text-gray-900 mt-1">
                  {product.created_at
                    ? formatProductDate(product.created_at)
                    : "-"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Last Updated
                </label>
                <p className="text-sm text-gray-900 mt-1">
                  {product.updated_at
                    ? formatProductDate(product.updated_at)
                    : "-"}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <PermissionDeniedCard title="Product History" />
        )}
      </div>
    </div>
  );
}
