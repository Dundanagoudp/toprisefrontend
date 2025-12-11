"use client";

import { useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { selectDealerProduct, selectDealerProductLoading, selectDealerProductError } from "@/store/slice/dealer-product/dealerProductByIdSlice";
import { fetchDealerProductByIdThunk } from "@/store/slice/dealer-product/dealerProductByIdThunks";
import DealerProductViewRedux from "./DealerProductViewRedux";
import { DealerProduct } from "@/service/dealer-products-service";
import { getDealerById, getDealerIdFromUserId } from "@/service/dealerServices";
import type { Dealer } from "@/types/dealer-types";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import Link from "next/link";

interface ProductDetailsWrapperProps {
  productId: string;
}

export default function ProductDetailsWrapper({ productId }: ProductDetailsWrapperProps) {
  const dispatch = useAppDispatch();

  // Redux state
  const product = useAppSelector(selectDealerProduct);
  console.log("product", product);
  const loading = useAppSelector(selectDealerProductLoading);
  const error = useAppSelector(selectDealerProductError);

  // Permission states
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
          // Permission denied - this will be handled in the component render
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

  // Fetch product data using Redux
  useEffect(() => {
    if (productId) {
      dispatch(fetchDealerProductByIdThunk(productId));
    }
  }, [productId, dispatch]);

  if (loading) {
    return (
      <div className="p-6">
        <Breadcrumb>
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
        </Breadcrumb>
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
        <Breadcrumb>
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
        </Breadcrumb>
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

  return <DealerProductViewRedux product={product} allowedFields={allowedFields} readPermissionsEnabled={readPermissionsEnabled} canEditProductDetails={canEditProductDetails} showPermissionsCard={showPermissionsCard} dealerPermissions={dealerPermissions} />;
}
