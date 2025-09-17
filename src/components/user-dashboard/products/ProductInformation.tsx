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
                <p className="text-lg font-semibold">{product.brand || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Model</label>
                <p className="text-lg font-semibold">{product.model || "N/A"}</p>
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
                  {product.variant.map((variantId: string, index: number) => (
                    <div key={index} className="text-sm text-gray-600">
                      Variant {index + 1}: {variantId}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No variants available</p>
            )}
          </CardContent>
        </Card>

        {/* Additional Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Product ID</label>
                <p className="text-sm font-mono bg-gray-100 p-2 rounded">{product._id || product.id || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <Badge variant="outline">{product.status || "Active"}</Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Created</label>
                <p className="text-sm">{product.created_at ? new Date(product.created_at).toLocaleDateString() : "N/A"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
