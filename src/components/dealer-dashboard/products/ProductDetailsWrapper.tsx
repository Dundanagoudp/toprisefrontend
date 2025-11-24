"use client";

import { useEffect, useState } from "react";
import DealerProductView from "./DealerProductView";
import { getDealerProductById, DealerProduct } from "@/service/dealer-products-service";

interface ProductDetailsWrapperProps {
  productId: string;
}

export default function ProductDetailsWrapper({ productId }: ProductDetailsWrapperProps) {
  const [product, setProduct] = useState<DealerProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        // Always fetch from API
        const productData = await getDealerProductById(productId);
        //log the fetched product data
        console.log("Fetched product data:", productData);
        if (isMounted) {
          setProduct(productData);
        }
        //log the permission matrix
        console.log("Product Permission Matrix:", productData?.permission_matrix?.canView);
      } catch (err) {
        console.error("Failed to load product:", err);
        if (isMounted) {
          setError("Failed to load product details");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, [productId]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading product details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Product Not Found</h3>
            <p className="text-gray-600">{error || "The requested product could not be found."}</p>
          </div>
        </div>
      </div>
    );
  }

  return <DealerProductView product={product} />;
}