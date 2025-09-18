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
    const loadProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try to get product data from sessionStorage first
        const storedProduct = sessionStorage.getItem('selectedProduct');
        if (storedProduct) {
          const parsedProduct = JSON.parse(storedProduct);
          console.log('Product loaded from sessionStorage:', parsedProduct);
          console.log('Permission matrix:', parsedProduct.permission_matrix);
          setProduct(parsedProduct);
          // Clear the stored data after use
          sessionStorage.removeItem('selectedProduct');
        } else {
          // Fallback to API call
          const productData = await getDealerProductById(productId);
          console.log('Product loaded from API:', productData);
          console.log('Permission matrix:', productData.permission_matrix);
          setProduct(productData);
        }
      } catch (err) {
        console.error("Failed to load product:", err);
        setError("Failed to load product details");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
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
