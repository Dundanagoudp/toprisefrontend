"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Package, Edit, Trash2 } from "lucide-react";
import { getProductById } from "@/service/catalogue-service";

interface ProductInformationProps {
  productId: string;
}

export default function ProductInformation({ productId }: ProductInformationProps) {
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProductDetails();
  }, [productId]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      console.log("Fetching product details for ID:", productId);
      
      const response = await getProductById(productId);
      console.log("Product API response:", response);
      
      if (response.success && response.data) {
        setProduct(response.data);
      } else {
        console.error("Failed to fetch product details");
      }
    } catch (error) {
      console.error("Error fetching product details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading product details...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">Product not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Package className="h-8 w-8" />
              {product.product_name || "Product Details"}
            </h1>
            <p className="text-gray-600 mt-1">Product Information</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Edit Product
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Product Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Product Name</label>
                <p className="text-lg font-semibold">{product.product_name || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">SKU Code</label>
                <p className="text-lg font-semibold">{product.sku_code || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Brand</label>
                <p className="text-lg font-semibold">
                  {typeof product.brand === 'object' && product.brand?.brand_name 
                    ? product.brand.brand_name 
                    : typeof product.brand === 'string' 
                    ? product.brand 
                    : "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Model</label>
                <p className="text-lg font-semibold">
                  {typeof product.model === 'object' && product.model?.model_name 
                    ? product.model.model_name 
                    : typeof product.model === 'string' 
                    ? product.model 
                    : "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Category</label>
                <p className="text-lg font-semibold">
                  {typeof product.category === 'object' && product.category?.category_name 
                    ? product.category.category_name 
                    : typeof product.category === 'string' 
                    ? product.category 
                    : "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Sub Category</label>
                <p className="text-lg font-semibold">
                  {typeof product.sub_category === 'object' && product.sub_category?.subcategory_name 
                    ? product.sub_category.subcategory_name 
                    : typeof product.sub_category === 'string' 
                    ? product.sub_category 
                    : "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Variants Information */}
        <Card>
          <CardHeader>
            <CardTitle>Variants</CardTitle>
          </CardHeader>
          <CardContent>
            {product.variant && Array.isArray(product.variant) ? (
              <div className="space-y-2">
                <Badge variant="secondary" className="text-sm">
                  {product.variant.length} variant(s)
                </Badge>
                <div className="space-y-1">
                  {product.variant.map((variant: any, index: number) => (
                    <div key={index} className="text-sm text-gray-600">
                      {typeof variant === 'object' && variant?.variant_name 
                        ? `${variant.variant_name} (${variant.variant_code || 'N/A'})` 
                        : typeof variant === 'string' 
                        ? `Variant ${index + 1}: ${variant}`
                        : `Variant ${index + 1}`}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No variants available</p>
            )}
          </CardContent>
        </Card>

        {/* Pricing & Stock Information */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing & Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">MRP (with GST)</label>
                <p className="text-lg font-semibold">₹{product.mrp_with_gst || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Selling Price</label>
                <p className="text-lg font-semibold">₹{product.selling_price || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">GST Percentage</label>
                <p className="text-lg font-semibold">{product.gst_percentage || "N/A"}%</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Stock</label>
                <p className="text-lg font-semibold">{product.no_of_stock || 0}</p>
                {product.out_of_stock && (
                  <Badge variant="destructive" className="mt-1">Out of Stock</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Year Range Information */}
        <Card>
          <CardHeader>
            <CardTitle>Year Range</CardTitle>
          </CardHeader>
          <CardContent>
            {product.year_range && Array.isArray(product.year_range) && product.year_range.length > 0 ? (
              <div className="space-y-2">
                <Badge variant="secondary" className="text-sm">
                  {product.year_range.length} year(s)
                </Badge>
                <div className="flex flex-wrap gap-2">
                  {product.year_range.map((year: any, index: number) => (
                    <Badge key={index} variant="outline">
                      {typeof year === 'object' && year?.year_name 
                        ? year.year_name 
                        : year}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No year range specified</p>
            )}
          </CardContent>
        </Card>

        {/* Additional Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Product ID</label>
                <p className="text-sm font-mono bg-gray-100 p-2 rounded">{product._id || product.id || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Live Status</label>
                <Badge variant={product.live_status === "Approved" ? "default" : "outline"}>
                  {product.live_status || "Pending"}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">QC Status</label>
                <Badge variant={product.Qc_status === "Approved" ? "default" : "outline"}>
                  {product.Qc_status || "Pending"}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Product Type</label>
                <Badge variant="secondary">{product.product_type || "N/A"}</Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">HSN Code</label>
                <p className="text-sm">{product.hsn_code || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Weight</label>
                <p className="text-sm">{product.weight ? `${product.weight} kg` : "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Warranty</label>
                <p className="text-sm">{product.warranty ? `${product.warranty} months` : "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Created</label>
                <p className="text-sm">{product.created_at ? new Date(product.created_at).toLocaleDateString() : "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Is Universal</label>
                <Badge variant={product.is_universal ? "default" : "outline"}>
                  {product.is_universal ? "Yes" : "No"}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Is Consumable</label>
                <Badge variant={product.is_consumable ? "default" : "outline"}>
                  {product.is_consumable ? "Yes" : "No"}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Is Returnable</label>
                <Badge variant={product.is_returnable ? "default" : "outline"}>
                  {product.is_returnable ? "Yes" : "No"}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Iteration</label>
                <p className="text-sm">#{product.iteration_number || 1}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dealer Assignments */}
        {product.available_dealers && Array.isArray(product.available_dealers) && product.available_dealers.length > 0 && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Dealer Assignments ({product.available_dealers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {product.available_dealers.map((dealer: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Dealer: {dealer.dealers_Ref || "N/A"}</p>
                      <p className="text-sm text-gray-600">Quantity: {dealer.quantity_per_dealer || 0}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Margin: {dealer.dealer_margin || 0}%</p>
                      <p className="text-sm text-gray-600">Priority: {dealer.dealer_priority_override || "N/A"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
