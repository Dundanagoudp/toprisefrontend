'use client'
import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, X, Car, Bike } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { getUserProfile, UserVehicleDetails } from "@/service/user/userService";
import { getVehicleDetails } from "@/service/product-Service";
import { useRouter } from "next/navigation";
interface SearchInputWithVehiclesProps {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  onSubmit?: (value: string) => void;
  onSearchClick?: () => void; // New prop for search button click
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
  onVehicleSelect?: (vehicle: UserVehicleDetails) => void;
}

const SearchInputWithVehicles: React.FC<SearchInputWithVehiclesProps> = ({
  value,
  onChange,
  onClear,
  onSubmit,
  onSearchClick,
  isLoading = false,
  placeholder = "Search...",
  className = "",
  onVehicleSelect,
}) => {
  const [showVehicles, setShowVehicles] = useState(false);
  const [savedVehicles, setSavedVehicles] = useState<UserVehicleDetails[]>([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const router = useRouter();

  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Remove Enter key functionality - only allow search button click
    // if (e.key === 'Enter' && onSubmit && value.trim()) {
    //   onSubmit(value.trim());
    // }
  };

  const handleSavedVehicleClick = (vehicle: any) => {
  // Build a human-friendly vehicle name
  const vehicleName = [vehicle.brand, vehicle.model, vehicle.variant]
    .filter(Boolean)
    .join(" ");

  // Combine current input value and vehicle name into a single query
  const combinedQuery = [value?.trim(), vehicleName].filter(Boolean).join(" ").trim();

  // Log full selected vehicle object for debugging
  console.log("Selected vehicle:", vehicle);

  // Build new search params preserving existing entries (e.g. vehicleTypeId)
  const searchParams = new URLSearchParams(window.location.search);
  const params = new URLSearchParams(searchParams);
  params.set("query", combinedQuery);

  // Optionally include the vehicle id as well
  if (vehicle._id) {
    params.set("selectedVehicleId", String(vehicle._id));
  }

  // Navigate to search results with the combined query
  router.push(`/shop/search-results/?${params.toString()}`);

  // Close the lightbox
  setShowVehicles(false);
};

 // inside your component
const fetchSavedVehicles = async () => {
  if (!isAuthenticated || !user?._id) return;

  let mounted = true;
  setVehiclesLoading(true);

  try {
    const profileRes = await getUserProfile(user._id);
    if (!profileRes.success || !Array.isArray(profileRes.data?.vehicle_details)) {
      if (mounted) setSavedVehicles([]);
      return;
    }

    const rawVehicles = profileRes.data.vehicle_details as any[];

    // cache for getVehicleDetails responses
    const cache = new Map<string, any>();

    // helper that returns detail (from cache or network)
    const fetchDetail = async (brandId: string, modelId: string, variantId: string) => {
      const key = `${brandId}_${modelId}_${variantId}`;
      if (cache.has(key)) return cache.get(key);

      const p = getVehicleDetails(String(brandId), String(modelId), String(variantId))
        .then((res) => {
          cache.set(key, { ok: true, data: res?.data ?? res });
          return cache.get(key);
        })
        .catch((err) => {
          cache.set(key, { ok: false, err });
          return cache.get(key);
        });

      // store promise immediately to dedupe concurrent callers
      cache.set(key, p);
      const result = await p;
      return result;
    };

    // run all detail fetches in parallel (deduped by cache)
    const settled = await Promise.all(
      rawVehicles.map(async (v) => {
        // brand/model/variant may be ids or nested objects; normalize to strings
        const brandId = v?.brand?._id ?? v?.brand ?? "";
        const modelId = v?.model?._id ?? v?.model ?? "";
        const variantId = v?.variant?._id ?? v?.variant ?? "";

        const detail = await fetchDetail(brandId, modelId, variantId);

        return { original: v, detail };
      })
    );

    // map to enriched vehicles (keep original canonical object)
    const enriched = settled.map(({ original, detail }) => {
      const base = { ...original }; // keep existing keys
      if (!detail) return { ...base, brand: null, model: null, variant: null, _detailError: "no-detail" };

      // If cache stored a promise, it resolved above to an object: { ok: true/false, data/err } OR may be direct { ok... }
      const payload = detail.ok ? detail.data : null;
      if (detail.ok && payload) {
        return {
          ...base,
          brand: payload?.brand?.brand_name ?? payload?.brand_name ?? payload?.brand ?? base.brand ?? null,
          model: payload?.model?.model_name ?? payload?.model_name ?? payload?.model ?? base.model ?? null,
          variant: payload?.variant?.variant_name ?? payload?.variant_name ?? payload?.variant ?? base.variant ?? null,
          _detailResponse: payload,
        };
      }

      return {
        ...base,
        brand: base.brand ?? null,
        model: base.model ?? null,
        variant: base.variant ?? null,
        _detailError: detail.err?.message ?? detail.err ?? "failed",
      };
    });

    if (mounted) setSavedVehicles(enriched);
  } catch (err) {
    console.error("Failed to fetch saved vehicles:", err);
    if (mounted) setSavedVehicles([]);
  } finally {
    if (mounted) setVehiclesLoading(false);
  }

  return () => {
    mounted = false;
  };
};
useEffect(() => {
  let cleanup: (() => void) | undefined;
  (async () => {
    cleanup = await fetchSavedVehicles();
  })();
  return () => {
    if (typeof cleanup === "function") cleanup();
  };
}, [isAuthenticated, user?._id]);


   

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (isAuthenticated) {
      setShowVehicles(true);
      fetchSavedVehicles();
    }
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setShowVehicles(false);
    }, 200);
  };

  const handleVehicleClick = (vehicle: UserVehicleDetails) => {
    if (onVehicleSelect) {
      onVehicleSelect(vehicle);
    }
    setShowVehicles(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const getVehicleIcon = (vehicleType?: string) => {
    if (vehicleType?.toLowerCase() === 'bike' || vehicleType?.toLowerCase() === 'scooter') {
      return <Bike className="h-4 w-4" />;
    }
    return <Car className="h-4 w-4" />;
  };

  return (
    <div 
      ref={containerRef}
      className={`relative w-full sm:w-80 lg:w-96 ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div 
        className="flex items-center gap-2 h-10 rounded-lg bg-[#EBEBEB] px-4 py-0 cursor-pointer"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log("Search bar clicked, calling onSearchClick");
          if (onSearchClick) {
            onSearchClick();
          }
        }}
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 text-[#A3A3A3] flex-shrink-0 animate-spin" />
        ) : (
          <Search className="h-5 w-5 text-[#A3A3A3] flex-shrink-0" />
        )}
        <Input
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={handleKeyPress}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            // Trigger the parent div click
            if (onSearchClick) {
              onSearchClick();
            }
          }}
          className="bg-transparent font-[Poppins] border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-[#737373] placeholder:text-[#A3A3A3] h-10 p-0 flex-1 outline-none shadow-none cursor-pointer"
          readOnly
        />
        {value && onClear && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClear();
            }}
            className="h-6 w-6 p-0 hover:bg-gray-200 rounded-full flex-shrink-0"
            type="button"
          >
            <X className="h-4 w-4 text-[#A3A3A3]" />
          </Button>
        )}
      </div>

      {/* Vehicle Lightbox */}
      {showVehicles && isAuthenticated && (
        <div 
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-80 overflow-y-auto"
          onMouseEnter={() => {
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
            }
          }}
          onMouseLeave={handleMouseLeave}
        >
          <div className="p-3">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Your Saved Vehicles</h3>
            
            {vehiclesLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                <span className="ml-2 text-sm text-gray-500">Loading vehicles...</span>
              </div>
            ) : savedVehicles.length > 0 ? (
              <div className="space-y-2">
                {savedVehicles.map((vehicle, index) => (
                  <div
                    key={index}
                  onClick={() => handleSavedVehicleClick(vehicle)}

                    className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-50 cursor-pointer transition-colors border border-gray-100"
                  >
                    <div className="flex-shrink-0 text-gray-500">
                      {getVehicleIcon(vehicle.vehicle_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">
                          {vehicle.brand} {vehicle.model}
                        </span>
                        {vehicle.selected_vehicle && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Selected
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {vehicle.variant && <span>{vehicle.variant}</span>}
                        {vehicle.year_Range && (
                          <span className="ml-2">({vehicle.year_Range})</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Car className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No saved vehicles found</p>
                <p className="text-xs text-gray-400 mt-1">
                  Add vehicles in your profile to see them here
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Login prompt for non-authenticated users */}
      {showVehicles && !isAuthenticated && (
        <div 
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
          onMouseEnter={() => {
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
            }
          }}
          onMouseLeave={handleMouseLeave}
        >
          <div className="p-4 text-center">
            <Car className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-2">Login to see your saved vehicles</p>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => {
                // This will be handled by the parent component
                window.location.href = '/login';
              }}
            >
              Login / Sign Up
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchInputWithVehicles;