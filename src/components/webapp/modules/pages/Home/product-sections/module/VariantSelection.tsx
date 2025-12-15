"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { getVariantsByModel } from "@/service/product-Service";

interface Variant {
  _id: string;
  variant_name: string;
  variant_code: string;
  Year: string[];
  model: any;
  variant_image?: string;
  created_by: string;
  updated_by: any[];
  variant_status: string;
  variant_Description: string;
  created_at: string;
  updated_at: string;
  __v: number;
}

interface VariantSelectionProps {
  modelId: string;
}

const VariantSelection: React.FC<VariantSelectionProps> = ({ modelId }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const vehicleTypeId = searchParams.get("vehicleTypeId");
  const brandName = searchParams.get("brandName");
  const modelName = searchParams.get("modelName");
  
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    const fetchVariants = async () => {
      try {
        setLoading(true);
        const response = await getVariantsByModel(modelId);
        
        if (response && response.data && Array.isArray(response.data)) {
          setVariants(response.data);
        } else {
          setError("No variants found for this model");
        }
      } catch (err) {
        console.error("Error fetching variants:", err);
        setError("Failed to load variants. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (modelId) {
      fetchVariants();
    }
  }, [modelId]);

  const handleVariantClick = (variantId: string, variantName: string) => {
    // Navigate to products page with variant filter
    const params = new URLSearchParams();
    params.set("model", modelId);
    params.set("variant", variantId);
    if (vehicleTypeId) params.set("vehicleTypeId", vehicleTypeId);
    if (brandName) params.set("brand", brandName);

    router.push(`/shop/vehicle-products?${params.toString()}`);
  };

  const handleBackToModels = () => {
    if (brandName) {
      // Find brandId from URL or use a different approach
      router.back();
    } else {
      router.back();
    }
  };

  const filteredVariants = variants.filter(variant =>
    variant.variant_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const buildImageUrl = (path?: string) => {
    if (!path) return "/placeholder.svg";
    if (/^https?:\/\//i.test(path)) return path;
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "";
    const filesOrigin = apiBase.replace(/\/api$/, "");
    return `${filesOrigin}${path.startsWith("/") ? "" : "/"}${path}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-screen-2xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading variants...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-screen-2xl mx-auto px-4 py-6">
          <div className="text-center py-12">
            <div className="text-red-500 text-lg mb-4">
              <h3 className="text-xl font-semibold text-red-700 mb-2">Error</h3>
              <p className="text-red-500">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-screen-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link
              href="/"
              className="hover:text-primary cursor-pointer transition-colors"
            >
              Home
            </Link>
            <span>/</span>
            <Link
              href="/shop"
              className="hover:text-primary cursor-pointer transition-colors"
            >
              Shop
            </Link>
            <span>/</span>
            <Link
              href={vehicleTypeId ? `/shop/brands/${vehicleTypeId}` : "/shop"}
              className="hover:text-primary cursor-pointer transition-colors"
            >
              Brands
            </Link>
            <span>/</span>
            <span className="text-foreground">Select Variant</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-screen-2xl mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={handleBackToModels}
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Models
            </button>
          </div>
          
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Select a Variant
          </h1>
          <div className="text-muted-foreground">
            {brandName && modelName && (
              <p>
                Choose a variant from <span className="font-semibold text-primary">{brandName} {modelName}</span> to see available products
              </p>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Search variants..."
                className="w-full pl-10 pr-4 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                <Search className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Variants Grid */}
        {filteredVariants.length > 0 ? (
          <div className="mb-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-foreground">
                {filteredVariants.length} Variant{filteredVariants.length !== 1 ? "s" : ""} Available
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredVariants.map((variant) => (
                <div
                  key={variant._id}
                  className="bg-card rounded-lg border border-border p-4 hover:shadow-md hover:border-primary/50 transition-all cursor-pointer group"
                  onClick={() => handleVariantClick(variant._id, variant.variant_name)}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 flex items-center justify-center">
                      <img
                        src={buildImageUrl(variant.variant_image)}
                        alt={variant.variant_name}
                        className="w-full h-full object-contain rounded-lg"
                      />
                    </div>
                    <div className="text-center">
                      <h4 className="text-sm font-medium text-foreground line-clamp-2 leading-tight mb-1">
                        {variant.variant_name}
                      </h4>
                      {variant.Year && variant.Year.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          Year: {variant.Year.join(", ")}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">
              <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No Variants Found
              </h3>
              <p className="text-gray-500">
                {searchQuery
                  ? `No variants match "${searchQuery}". Try a different search term.`
                  : "No variants are available for this model at the moment."}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VariantSelection;
