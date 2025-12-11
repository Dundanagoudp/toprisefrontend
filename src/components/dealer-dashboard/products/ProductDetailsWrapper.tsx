"use client";

import { useEffect, useState } from "react";
import DealerProductView from "./DealerProductView";
import { getDealerProductById, DealerProduct } from "@/service/dealer-products-service";
import { getDealerById, getDealerIdFromUserId } from "@/service/dealerServices";
import type { Dealer } from "@/types/dealer-types";
import { Breadcrumb } from "@/components/ui/breadcrumb";

interface ProductDetailsWrapperProps {
  productId: string;
}

export default function ProductDetailsWrapper({ productId }: ProductDetailsWrapperProps) {
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Product", href: "/dealer/dashboard/product" },
    { label: "Product Details", href: `/dealer/dashboard/product/productdetails/${productId}` }
  ];
  const [product, setProduct] = useState<DealerProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dealerId, setDealerId] = useState<string | null>(null);
  const [allowedFields, setAllowedFields] = useState<string[] | null>(null);
  const [readPermissionsEnabled, setReadPermissionsEnabled] = useState<boolean>(true);
  const [canEditProductDetails, setCanEditProductDetails] = useState<boolean>(false);
  const [showPermissionsCard, setShowPermissionsCard] = useState<boolean>(false);
  const [dealerPermissions, setDealerPermissions] = useState<Dealer['permission'] | null>(null);


  // Get dealer id from user id
  useEffect(() => {
    const fetchDealerId = async () => {
      try {
        const id = await getDealerIdFromUserId();
        setDealerId(id);
      } catch (err) {
        console.error("Failed to get dealer ID:", err);
      }
    };
    fetchDealerId();
  }, []);

  // Fetch dealer by id to get permissions
  useEffect(() => {
    const fetchDealerPermissions = async () => {
      if (!dealerId) return;
      
      try {
        const dealerResponse = await getDealerById(dealerId);
        const dealer = dealerResponse.data as Dealer;
        
        console.log("Dealer:", dealer);
        
        // Check if read permissions are enabled
        const isEnabled = dealer.permission?.readPermissions?.isEnabled ?? true;
        setReadPermissionsEnabled(isEnabled);
        const canEdit = dealer.permission?.updatePermissions?.isEnabled ?? true;
        setCanEditProductDetails(canEdit);
        
        // Store dealer permissions
        setDealerPermissions(dealer.permission || null);
        
        // Show permissions card if dealer has permissions configured
        const hasPermissions = dealer.permission !== undefined && dealer.permission !== null;
        setShowPermissionsCard(hasPermissions);
        
        // If read permissions are disabled, block access
        if (!isEnabled) {
          setError("You don't have permission to view product details");
          setLoading(false);
          return;
        }
        
        // Get allowed fields
        const fields = dealer.permission?.readPermissions?.allowed_fields;
        setAllowedFields(fields || null);
      } catch (err) {
        console.error("Failed to fetch dealer permissions:", err);
        // On error, allow all fields (fallback)
        setAllowedFields(null);
      }
    };

    fetchDealerPermissions();
  }, [dealerId]);

  // Fetch product data
  useEffect(() => {
    let isMounted = true;

    const loadProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        // Always fetch from API
        const productData = await getDealerProductById(productId);
        console.log("Fetched product data:", productData);
        
        if (isMounted) {
          setProduct(productData);
        }
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
        <Breadcrumb items={breadcrumbItems as any} />
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
        <Breadcrumb items={breadcrumbItems as any} />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {error ? "Permission Denied" : "Product Not Found"}
            </h3>
            <p className="text-gray-600">{error || "The requested product could not be found."}</p>
          </div>
        </div>
      </div>
    );
  }

  return <DealerProductView product={product} allowedFields={allowedFields} readPermissionsEnabled={readPermissionsEnabled} canEditProductDetails={canEditProductDetails} showPermissionsCard={showPermissionsCard} dealerPermissions={dealerPermissions} />;
}
