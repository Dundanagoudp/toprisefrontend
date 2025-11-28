"use client";
import React, { startTransition, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  getSubCategoriesByCategory,
  getBrandsByType,
  getModelsByBrand,
  getVariantsByModel,
  getVehicleDetails,
} from "@/service/product-Service";
import type { Category } from "@/types/product-Types";
import type { SubCategory } from "@/types/product-Types";
import type { Brand, Model, Variant } from "@/types/product-Types";
import { useAppSelector } from "@/store/hooks";
import { selectVehicleTypeId } from "@/store/slice/vehicle/vehicleSlice";
import { getUserProfile } from "@/service/user/userService";
import Link from "next/link";

type ApiResponse = {
  success?: boolean;
  message?: string;
  data?: any;
};

const PLACEHOLDER = "/placeholder.svg";

export default function SubcategoryFilter() {
  const router = useRouter();
  const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Dropdown state
  const [selectedSubcategory, setSelectedSubcategory] =
    useState<SubCategory | null>(null);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [brands, setBrands] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [variants, setVariants] = useState<any[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [selectedVariant, setSelectedVariant] = useState<string>("");
  const [loadingBrands, setLoadingBrands] = useState<boolean>(false);
  const [loadingModels, setLoadingModels] = useState<boolean>(false);
  const [loadingVariants, setLoadingVariants] = useState<boolean>(false);
  const typeId = useAppSelector(selectVehicleTypeId);
  const userId = useAppSelector((s) => s.auth.user?._id);
  const [savedVehicles, setSavedVehicles] = useState<any[]>([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);
  const [tickets, setTickets] = useState<any[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [ticketsError, setTicketsError] = useState<string | null>(null);

  // Build image URL (handles both absolute https and relative paths)
  const buildImageUrl = React.useCallback((path?: string) => {
    if (!path) return PLACEHOLDER;
    if (/^https?:\/\//i.test(path)) return path;
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "";
    const filesOrigin = apiBase.replace(/\/api$/, "");
    return `${filesOrigin}${path.startsWith("/") ? "" : "/"}${path}`;
  }, []);

  // Get category ID from URL search params (reactive)
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("category") ?? "";
  useEffect(() => {
    let mounted = true;
    const loadSavedVehicles = async () => {
      if (!userId) return;
      setVehiclesLoading(true);
      try {
        const res = await getUserProfile(userId);
        if (!mounted) return;
        const raw = Array.isArray(res?.data?.vehicle_details)
          ? res.data.vehicle_details
          : [];
        // fetch readable details in parallel
        const enriched = await Promise.all(
          raw.map(async (v: any) => {
            try {
              const brandId = v?.brand?._id ?? v?.brand ?? "";
              const modelId = v?.model?._id ?? v?.model ?? "";
              const variantId = v?.variant?._id ?? v?.variant ?? "";
              const det = await getVehicleDetails(
                String(brandId),
                String(modelId),
                String(variantId)
              );
              const payload = det?.data ?? det;
              // Handle different response structures - only access properties if payload has them
              const hasVehicleDetails =
                payload &&
                typeof payload === "object" &&
                !Array.isArray(payload) &&
                !("products" in payload);

              // Extract brand name with proper type checking
              let brandName = "";
              if (hasVehicleDetails && payload && typeof payload === "object") {
                brandName = (payload as any)?.brand?.brand_name || "";
              }
              if (!brandName) {
                brandName =
                  v?.brand?.brand_name ??
                  (typeof v?.brand === "string" ? v.brand : "") ??
                  "";
              }

              // Extract model name with proper type checking
              let modelName = "";
              if (hasVehicleDetails && payload && typeof payload === "object") {
                modelName = (payload as any)?.model?.model_name || "";
              }
              if (!modelName) {
                modelName =
                  v?.model?.model_name ??
                  (typeof v?.model === "string" ? v.model : "") ??
                  "";
              }

              // Extract variant name with proper type checking
              let variantName = "";
              if (hasVehicleDetails && payload && typeof payload === "object") {
                variantName = (payload as any)?.variant?.variant_name || "";
              }
              if (!variantName) {
                variantName =
                  v?.variant?.variant_name ??
                  (typeof v?.variant === "string" ? v.variant : "") ??
                  "";
              }
              return {
                _id: v._id ?? `${brandId}_${modelId}_${variantId}`,
                vehicle_type: v.vehicle_type,
                brandId,
                modelId,
                variantId,
                brand: brandName,
                model: modelName,
                variant: variantName,
                displayName: [brandName, modelName, variantName]
                  .filter(Boolean)
                  .join(" "),
              };
            } catch (err) {
              return {
                _id: v._id ?? "unknown",
                vehicle_type: v.vehicle_type,
                brand: v.brand,
                model: v.model,
                variant: v.variant,
                displayName: `${v.brand || ""} ${v.model || ""} ${
                  v.variant || ""
                }`.trim(),
              };
            }
          })
        );
        setSavedVehicles(enriched);
      } catch (err) {
        console.error("Failed to load saved vehicles:", err);
        setSavedVehicles([]);
      } finally {
        if (mounted) setVehiclesLoading(false);
      }
    };

    loadSavedVehicles();
    return () => {
      mounted = false;
    };
  }, [userId]);
  const handleSavedVehicleSelect = (sv: any) => {
    // set selects to vehicle ids (if available)
    if (sv.brandId) setSelectedBrand(String(sv.brandId));
    if (sv.modelId) {
      setSelectedModel(String(sv.modelId));
      fetchVariants(String(sv.modelId)); // load variants for that model
    }
    if (sv.variantId) setSelectedVariant(String(sv.variantId));
    // optionally scroll to selects
    const el = document.querySelector(
      ".grid.grid-cols-1.gap-4.md\\:grid-cols-3"
    );
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  useEffect(() => {
    let isCurrent = true;
    async function fetchSubcats() {
      setLoading(true);
      setError(null);
      setSubcategories([]);
      if (!categoryId) {
        setError("Category id missing in query string");
        setLoading(false);
        return;
      }
      try {
        const resp: ApiResponse = await getSubCategoriesByCategory(categoryId);
        if (!isCurrent) return;
        const data = (resp && (resp.data ?? (resp as unknown as any))) || [];
        setSubcategories(Array.isArray(data) ? (data as SubCategory[]) : []);
      } catch (err: any) {
        if (!isCurrent) return;
        console.error("getSubCategoriesByCategory error:", err);
        setError(err?.message ?? "Failed to load subcategories");
      } finally {
        if (!isCurrent) return;
        setLoading(false);
      }
    }
    fetchSubcats();
    return () => {
      isCurrent = false;
    };
  }, [categoryId]);

  const handleCardClick = (sub: SubCategory) => {
    if (selectedSubcategory?._id === sub._id && showDropdown) {
      // Close dropdown if clicking same card
      setShowDropdown(false);
      setSelectedSubcategory(null);
      clearSelections();
    } else {
      // Open dropdown for new selection
      setSelectedSubcategory(sub);
      setShowDropdown(true);
      clearSelections();
      fetchBrands();
    }
  };

  const clearSelections = () => {
    setSelectedBrand("");
    setSelectedModel("");
    setSelectedVariant("");
    setBrands([]);
    setModels([]);
    setVariants([]);
  };

  const fetchBrands = async () => {
    setLoadingBrands(true);
    try {
      const brandResponse = await getBrandsByType(typeId);
      console.log("brandResponse", brandResponse);
      setBrands(brandResponse.data ?? []);
    } catch (error) {
      console.error("Failed to fetch brands:", error);
      setBrands([]);
    } finally {
      setLoadingBrands(false);
    }
  };

  const fetchModels = async (brandId: string) => {
    setLoadingModels(true);
    try {
      const response = await getModelsByBrand(brandId);
      const items = response.data ?? [];
      setModels(items as any);
    } catch (error) {
      console.error("Failed to fetch models:", error);
      setModels([]);
    } finally {
      setLoadingModels(false);
    }
  };

  // UPDATED: make variant fetching consistent and defensive (handles both array responses and { products: [...] } shapes)
  const fetchVariants = async (modelId: string) => {
    setLoadingVariants(true);
    try {
      const response = await getVariantsByModel(modelId);
      // Defensive: response.data might be an array of variants OR an object containing `products` array
      let items: any[] = [];

      if (Array.isArray(response?.data)) {
        items = response.data;
      } else if (response?.data && Array.isArray(response.data.products)) {
        items = response.data.products;
      } else if (Array.isArray(response as any)) {
        // fallback if service directly returns an array
        items = response as any;
      } else if (response?.data && Array.isArray(response.data.products)) {
        items = response.data.products;
      } else {
        items = [];
      }

      setVariants(items as any);
    } catch (error) {
      console.error("Failed to fetch variants:", error);
      setVariants([]);
    } finally {
      setLoadingVariants(false);
    }
  };
  const handleShowProducts = () => {
    if (loading) return;
    const params = new URLSearchParams({
      subcategory: selectedSubcategory?._id || "",
      brand: selectedBrand || "",
      model: selectedModel || "",
      variant: selectedVariant || "",
    });

    setLoading(true);
    startTransition(() => {
      router.push(`/shop/vehicle-products?${params.toString()}`);
    });
  };

  const handleBrandChange = (brandId: string) => {
    setSelectedBrand(brandId);
    setSelectedModel("");
    setSelectedVariant("");
    setModels([]);
    setVariants([]);
    if (brandId) {
      fetchModels(brandId);
    }
  };

  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId);
    setSelectedVariant("");
    setVariants([]);
    if (modelId) {
      fetchVariants(modelId);
    }
  };

  const handleVariantChange = (variantId: string) => {
    setSelectedVariant(variantId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Enhanced Header */}
      <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="max-w-screen-2xl mx-auto px-4 py-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Link href="/" className="hover:text-primary transition-colors duration-200">
              Home
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">Categories</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-1">
                Browse by Category
              </h1>
              <p className="text-muted-foreground">
                Select a subcategory to find products for your vehicle
              </p>
            </div>
            {!loading && !error && subcategories.length > 0 && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                <span className="text-sm font-medium text-primary">
                  {subcategories.length} subcategories available
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 py-8">
        {loading && (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
              <span className="text-sm text-muted-foreground">Loading subcategories...</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 12 }).map((_, index) => (
                <div
                  key={index}
                  className="animate-pulse rounded-xl border border-border/50 bg-card/50 p-4"
                >
                  <div className="mb-3 h-20 rounded-lg bg-muted/60" />
                  <div className="h-3 w-3/4 rounded bg-muted/60" />
                  <div className="mt-2 h-2 w-1/2 rounded bg-muted/40" />
                </div>
              ))}
            </div>
          </div>
        )}
        {!loading && error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-destructive mb-2">Error Loading Subcategories</h2>
            <p className="text-muted-foreground">{error}</p>
          </div>
        )}
        {!loading && !error && subcategories.length === 0 && (
          <div className="rounded-xl border border-border/50 bg-card/50 p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-muted/50 flex items-center justify-center">
              <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">No Subcategories Found</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              We couldn't find any subcategories for this category. Please try a different category or check back later.
            </p>
          </div>
        )}
        {!loading && !error && subcategories.length > 0 && (
          <div className="space-y-8">
            {/* Enhanced subcategory grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {subcategories.map((sub) => (
                <div
                  key={sub._id}
                  className={`group relative flex flex-col items-start gap-3 rounded-xl border p-4 transition-all duration-300 cursor-pointer bg-card/50 backdrop-blur-sm hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 ${
                    selectedSubcategory?._id === sub._id && showDropdown
                      ? "border-primary/60 bg-primary/5 shadow-lg shadow-primary/10 scale-105"
                      : "border-border/40 hover:border-primary/30"
                  }`}
                  onClick={() => handleCardClick(sub)}
                >
                  {/* Enhanced image area with overlay */}
                  <div className="relative w-full h-24 overflow-hidden rounded-lg bg-gradient-to-br from-muted/30 to-muted/60">
                    <img
                      src={buildImageUrl(sub.subcategory_image)}
                      alt={sub.subcategory_name}
                      className="w-full h-full object-cover transition-all duration-300 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Selection indicator */}
                    {selectedSubcategory?._id === sub._id && showDropdown && (
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <ChevronUp className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Enhanced text content */}
                  <div className="w-full space-y-1">
                    <h3 className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors duration-200">
                      {sub.subcategory_name}
                    </h3>
                    {sub.subcategory_description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {sub.subcategory_description}
                      </p>
                    )}
                  </div>

                  {/* Enhanced interaction indicator */}
                  {selectedSubcategory?._id === sub._id && showDropdown && (
                    <div className="mt-auto w-full">
                      <div className="flex items-center justify-center text-xs text-primary font-medium bg-primary/10 rounded-lg px-2 py-1">
                        <span>Click to close</span>
                        <ChevronUp className="ml-1 h-3 w-3" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>




            {/* Enhanced Filter Dropdown Section */}
            {showDropdown && selectedSubcategory && (
              <div className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-8 shadow-xl shadow-primary/5">
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground">
                        Filter Products
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Find products for <span className="font-medium text-primary">{selectedSubcategory.subcategory_name}</span>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      setSelectedSubcategory(null);
                      clearSelections();
                    }}
                    className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200"
                  >
                    <ChevronUp className="h-5 w-5" />
                  </button>
                </div>
                {/* Saved Vehicles Section - Always show for debugging */}
                <div className="mb-6 p-4 rounded-xl bg-muted/30 border border-border/40">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
                        <svg className="w-3 h-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </div>
                      <h4 className="text-sm font-semibold text-foreground">
                        Your Saved Vehicles
                      </h4>
                      <div className="text-xs text-muted-foreground">
                        ({savedVehicles.length} vehicles)
                      </div>
                    </div>
                    <button
                      type="button"
                      className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-muted/50 transition-colors"
                      onClick={() => {
                        setSavedVehicles([]); // minimal toggle to hide if user wants
                      }}
                    >
                      Hide
                    </button>
                  </div>

                  <div className="flex items-center gap-3 overflow-x-auto pb-2">
                    {!userId ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Please log in to see your saved vehicles
                      </div>
                    ) : vehiclesLoading ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <svg
                          className="h-4 w-4 animate-spin"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="3"
                            opacity="0.25"
                          />
                        </svg>
                        Loading your vehicles...
                      </div>
                    ) : savedVehicles.length === 0 ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        No saved vehicles found. Add some vehicles to your profile to see them here.
                      </div>
                    ) : (
                      savedVehicles.map((sv) => (
                        <button
                          key={sv._id}
                          type="button"
                          onClick={() => handleSavedVehicleSelect(sv)}
                          className="flex-shrink-0 px-4 py-2 rounded-xl border border-border/60 bg-background/80 text-sm font-medium hover:shadow-md hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 group"
                          title={sv.displayName}
                        >
                          <div className="whitespace-nowrap flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-primary/60 group-hover:bg-primary transition-colors"></div>
                            <span className="font-semibold text-foreground">
                              {sv.brand}
                            </span>
                            <span className="text-muted-foreground">
                              {sv.model}
                            </span>
                            {sv.variant && (
                              <span className="text-muted-foreground">
                                · {sv.variant}
                              </span>
                            )}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  {/* Enhanced Brand Dropdown */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-md bg-primary/10 flex items-center justify-center">
                        <svg className="w-3 h-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                      </div>
                      <label className="text-sm font-semibold text-foreground">
                        Brand
                      </label>
                    </div>
                    <select
                      value={selectedBrand}
                      onChange={(e) => {
                        const brandId = e.target.value;
                        handleBrandChange(brandId);
                        console.log("Selected brandId:", brandId);
                      }}
                      className="w-full rounded-xl border border-border/60 bg-background/80 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200"
                      disabled={loadingBrands || brands.length === 0}
                    >
                      <option value="">Select Brand</option>
                      {brands.length === 0 && !loadingBrands && (
                        <option value="" disabled>
                          No brands available
                        </option>
                      )}
                      {brands.map((brand: any) => (
                        <option key={brand._id} value={brand._id}>
                          {brand.brand_name}
                        </option>
                      ))}
                    </select>
                    {loadingBrands && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                        Loading brands...
                      </div>
                    )}
                    {brands.length === 0 && !loadingBrands && (
                      <div className="text-sm text-muted-foreground bg-muted/30 rounded-lg px-3 py-2">
                        No brands found for this category
                      </div>
                    )}
                  </div>

                  {/* Enhanced Model Dropdown */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-md bg-primary/10 flex items-center justify-center">
                        <svg className="w-3 h-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <label className="text-sm font-semibold text-foreground">
                        Model
                      </label>
                    </div>
                    <select
                      value={selectedModel}
                      onChange={(e) => handleModelChange(e.target.value)}
                      className="w-full rounded-xl border border-border/60 bg-background/80 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200"
                      disabled={
                        loadingModels || !selectedBrand || models.length === 0
                      }
                    >
                      <option value="">Select Model</option>
                      {models.length === 0 &&
                        !loadingModels &&
                        selectedBrand && (
                          <option value="" disabled>
                            No models available
                          </option>
                        )}
                      {models.map((model) => (
                        <option key={model._id} value={model._id}>
                          {model.model_name}
                        </option>
                      ))}
                    </select>
                    {loadingModels && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                        Loading models...
                      </div>
                    )}
                    {models.length === 0 && !loadingModels && selectedBrand && (
                      <div className="text-sm text-muted-foreground bg-muted/30 rounded-lg px-3 py-2">
                        No models found for selected brand
                      </div>
                    )}
                  </div>

                  {/* Enhanced Variant Dropdown */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-md bg-primary/10 flex items-center justify-center">
                        <svg className="w-3 h-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                        </svg>
                      </div>
                      <label className="text-sm font-semibold text-foreground">
                        Variant
                      </label>
                    </div>
                    <select
                      value={selectedVariant}
                      onChange={(e) => handleVariantChange(e.target.value)}
                      className="w-full rounded-xl border border-border/60 bg-background/80 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200"
                      disabled={
                        loadingVariants ||
                        !selectedModel ||
                        variants.length === 0
                      }
                    >
                      <option value="">Select Variant</option>
                      {variants.length === 0 &&
                        !loadingVariants &&
                        selectedModel && (
                          <option value="" disabled>
                            No variants available
                          </option>
                        )}
                      {variants.map((variant) => (
                        <option key={variant._id} value={variant._id}>
                          {variant.variant_name}
                        </option>
                      ))}
                    </select>
                    {loadingVariants && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                        Loading variants...
                      </div>
                    )}
                    {variants.length === 0 &&
                      !loadingVariants &&
                      selectedModel && (
                        <div className="text-sm text-muted-foreground bg-muted/30 rounded-lg px-3 py-2">
                          No variants found for selected model
                        </div>
                      )}
                  </div>
                </div>

                {/* Enhanced Action Buttons */}
                <div className="mt-8 pt-6 border-t border-border/40">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      {selectedBrand && (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                          <div className="w-2 h-2 rounded-full bg-primary"></div>
                          <span className="font-medium text-primary">
                            {brands.find((b) => b._id === selectedBrand)?.brand_name}
                          </span>
                        </div>
                      )}
                      {selectedModel && (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                          <div className="w-2 h-2 rounded-full bg-primary"></div>
                          <span className="font-medium text-primary">
                            {models.find((m) => m._id === selectedModel)?.model_name}
                          </span>
                        </div>
                      )}
                      {selectedVariant && (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                          <div className="w-2 h-2 rounded-full bg-primary"></div>
                          <span className="font-medium text-primary">
                            {variants.find((v) => v._id === selectedVariant)?.variant_name}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setShowDropdown(false);
                          setSelectedSubcategory(null);
                          clearSelections();
                        }}
                        className="px-6 py-3 rounded-xl border border-border/60 bg-background/80 text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:border-border transition-all duration-200"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleShowProducts}
                        disabled={!selectedVariant || loading}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-primary/90 text-sm font-semibold text-primary-foreground hover:from-primary/90 hover:to-primary/80 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30"
                      >
                        {loading ? (
                          <>
                            <svg
                              className="h-4 w-4 animate-spin"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                                opacity="0.25"
                              />
                              <path
                                d="M22 12a10 10 0 00-10-10"
                                stroke="currentColor"
                                strokeWidth="4"
                                strokeLinecap="round"
                              />
                            </svg>
                            Searching...
                          </>
                        ) : (
                          <>
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            Search Products
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
