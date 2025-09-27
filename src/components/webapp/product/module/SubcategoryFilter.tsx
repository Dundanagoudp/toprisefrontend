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
      const raw = Array.isArray(res?.data?.vehicle_details) ? res.data.vehicle_details : [];
      // fetch readable details in parallel
      const enriched = await Promise.all(
        raw.map(async (v: any) => {
          try {
            const brandId = v?.brand?._id ?? v?.brand ?? "";
            const modelId = v?.model?._id ?? v?.model ?? "";
            const variantId = v?.variant?._id ?? v?.variant ?? "";
            const det = await getVehicleDetails(String(brandId), String(modelId), String(variantId));
            const payload = det?.data ?? det;
            // Handle different response structures - only access properties if payload has them
            const hasVehicleDetails = payload && typeof payload === 'object' && !('products' in payload);
            const brandName = (hasVehicleDetails ? payload.brand?.brand_name : undefined) ?? v?.brand?.brand_name ?? (typeof v?.brand === 'string' ? v.brand : "") ?? "";
            const modelName = (hasVehicleDetails ? payload.model?.model_name : undefined) ?? v?.model?.model_name ?? (typeof v?.model === 'string' ? v.model : "") ?? "";
            const variantName = (hasVehicleDetails ? payload.variant?.variant_name : undefined) ?? v?.variant?.variant_name ?? (typeof v?.variant === 'string' ? v.variant : "") ?? "";
            return {
              _id: v._id ?? `${brandId}_${modelId}_${variantId}`,
              vehicle_type: v.vehicle_type,
              brandId,
              modelId,
              variantId,
              brand: brandName,
              model: modelName,
              variant: variantName,
              displayName: [brandName, modelName, variantName].filter(Boolean).join(" "),
            };
          } catch (err) {
            return {
              _id: v._id ?? "unknown",
              vehicle_type: v.vehicle_type,
              brand: v.brand,
              model: v.model,
              variant: v.variant,
              displayName: `${v.brand || ""} ${v.model || ""} ${v.variant || ""}`.trim(),
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
  const el = document.querySelector(".grid.grid-cols-1.gap-4.md\\:grid-cols-3");
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
    <div className="min-h-screen bg-background">
      <div className="max-w-screen-2xl mx-auto px-4 py-8">
        {loading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse rounded-lg border border-border bg-card p-4"
              >
                <div className="mb-3 h-48 rounded-md bg-muted" />
                <div className="h-4 w-3/4 rounded bg-muted" />
                <div className="mt-2 h-4 w-1/2 rounded bg-muted" />
              </div>
            ))}
          </div>
        )}
        {!loading && error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-6 text-center">
            <p className="text-destructive font-medium">{error}</p>
          </div>
        )}
        {!loading && !error && subcategories.length === 0 && (
          <div className="rounded-lg border border-border bg-card p-10 text-center">
            <h2 className="text-xl font-semibold text-foreground">
              No Subcategories Found
            </h2>
            <p className="mt-2 text-muted-foreground">
              We couldn’t find subcategories for this category.
            </p>
          </div>
        )}
        {!loading && !error && subcategories.length > 0 && (
          <div className="space-y-6">
            <div className="text-sm font-medium text-muted-foreground">
              {subcategories.length} subcategories available
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {subcategories.map((sub) => (
                <div
                  key={sub._id}
                  className={`group flex flex-col rounded-md border p-3 shadow-sm transition-all duration-200 hover:shadow-md cursor-pointer ${
                    selectedSubcategory?._id === sub._id && showDropdown
                      ? "border-primary/50 bg-primary/5 shadow-md"
                      : "border-border/60 bg-card/50 hover:border-primary/30 hover:bg-card"
                  }`}
                  onClick={() => handleCardClick(sub)}
                >
                  <div className="relative mb-3 aspect-square w-full overflow-hidden rounded-sm bg-muted/50">
                    <img
                      src={buildImageUrl(sub.subcategory_image)}
                      alt={sub.subcategory_name}
                      className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-1 flex-col min-h-0">
                    <h3 className="text-sm font-semibold text-foreground leading-tight line-clamp-1 mb-1">
                      {sub.subcategory_name}
                    </h3>
                    {sub.subcategory_description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {sub.subcategory_description}
                      </p>
                    )}
                  </div>
                  {selectedSubcategory?._id === sub._id && showDropdown && (
                    <div className="mt-2 flex justify-center">
                      <div className="flex items-center text-xs text-primary">
                        <span>Click again to close</span>
                        <ChevronUp className="ml-1 h-3 w-3" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            

            {/* Filter Dropdown Section */}
            {showDropdown && selectedSubcategory && (
              <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">
                    Filter for {selectedSubcategory.subcategory_name}
                  </h3>
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      setSelectedSubcategory(null);
                      clearSelections();
                    }}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ChevronUp className="h-5 w-5" />
                  </button>
                </div>
{savedVehicles.length > 0 && (
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-foreground">Saved Vehicles</h4>
          <button
            type="button"
            className="text-xs text-muted-foreground"
            onClick={() => {
              setSavedVehicles([]); // minimal toggle to hide if user wants
            }}
          >
            Hide
          </button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {vehiclesLoading ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25"/></svg>
              Loading...
            </div>
          ) : (
            savedVehicles.map((sv) => (
              <button
                key={sv._id}
                type="button"
                onClick={() => handleSavedVehicleSelect(sv)}
                className="flex-shrink-0 px-3 py-1.5 rounded-full border border-input bg-background text-sm font-medium hover:shadow-sm transition"
                title={sv.displayName}
              >
                <div className="whitespace-nowrap">
                  <span className="font-medium text-foreground">{sv.brand}</span>
                  <span className="text-muted-foreground ml-1"> {sv.model}</span>
                  {sv.variant && <span className="text-muted-foreground ml-1">· {sv.variant}</span>}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    )}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {/* Brand Dropdown */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Brand
                    </label>
                    <select
                      value={selectedBrand}
                      onChange={(e) => {
                        const brandId = e.target.value;
                        handleBrandChange(brandId);
                        console.log("Selected brandId:", brandId);
                      }}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
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
                      <div className="flex items-center text-xs text-muted-foreground">
                        <div className="mr-2 h-3 w-3 animate-spin rounded-full border border-primary border-t-transparent" />
                        Loading brands...
                      </div>
                    )}
                    {brands.length === 0 && !loadingBrands && (
                      <div className="text-xs text-muted-foreground">
                        No brands found for this category
                      </div>
                    )}
                  </div>

                  {/* Model Dropdown */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Model
                    </label>
                    <select
                      value={selectedModel}
                      onChange={(e) => handleModelChange(e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
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
                      <div className="flex items-center text-xs text-muted-foreground">
                        <div className="mr-2 h-3 w-3 animate-spin rounded-full border border-primary border-t-transparent" />
                        Loading models...
                      </div>
                    )}
                    {models.length === 0 && !loadingModels && selectedBrand && (
                      <div className="text-xs text-muted-foreground">
                        No models found for selected brand
                      </div>
                    )}
                  </div>

                  {/* Variant Dropdown */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Variant
                    </label>
                    <select
                      value={selectedVariant}
                      onChange={(e) => handleVariantChange(e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
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
                      <div className="flex items-center text-xs text-muted-foreground">
                        <div className="mr-2 h-3 w-3 animate-spin rounded-full border border-primary border-t-transparent" />
                        Loading variants...
                      </div>
                    )}
                    {variants.length === 0 &&
                      !loadingVariants &&
                      selectedModel && (
                        <div className="text-xs text-muted-foreground">
                          No variants found for selected model
                        </div>
                      )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {selectedBrand && (
                      <span className="mr-4">
                        Brand:{" "}
                        {
                          brands.find((b) => b._id === selectedBrand)
                            ?.brand_name
                        }
                      </span>
                    )}
                    {selectedModel && (
                      <span className="mr-4">
                        Model:{" "}
                        {
                          models.find((m) => m._id === selectedModel)
                            ?.model_name
                        }
                      </span>
                    )}
                    {selectedVariant && (
                      <span>
                        Variant:{" "}
                        {
                          variants.find((v) => v._id === selectedVariant)
                            ?.variant_name
                        }
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        setSelectedSubcategory(null);
                        clearSelections();
                      }}
                      className="rounded-md border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleShowProducts}
                      disabled={!selectedVariant || loading}
                      className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {loading ? (
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
                      ) : (
                        "Search Products"
                      )}
                    </button>
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
