"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { getBrandsByType } from "@/service/product-Service";
import { Brand } from "@/types/User/Search-Types";

interface BrandSelectionProps {
  vehicleTypeId: string;
}


const BrandSelection: React.FC<BrandSelectionProps> = ({ vehicleTypeId }) => {
  const router = useRouter();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoading(true);
        const response = await getBrandsByType(vehicleTypeId);
        console.log("response brands by type", response);
        if (response && response.data && Array.isArray(response.data)) {
          setBrands(response.data as unknown as Brand[]);
        } else {
          setError("No brands found for this vehicle type");
        }
      } catch (err) {
        console.error("Error fetching brands:", err);
        setError("Failed to load brands. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (vehicleTypeId) {
      fetchBrands();
    }
  }, [vehicleTypeId]);

  const handleBrandClick = (brandId: string, brandName: string) => {
    router.push(`/shop/model/${brandId}`);
    console.log(brandId, brandName);

  };

  const filteredBrands = brands.filter(brand =>
    brand.brand_name.toLowerCase().includes(searchQuery.toLowerCase())
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
              <p className="text-muted-foreground">Loading brands...</p>
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
              href="/"
              className="hover:text-primary cursor-pointer transition-colors"
            >
              Shop
            </Link>
            <span>/</span>
            <span className="text-foreground">Select Brand</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-screen-2xl mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </div>
          
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Select a Brand
          </h1>
          <p className="text-muted-foreground">
            Choose a brand to see available models
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Search brands..."
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

        {/* Brands Grid */}
        {filteredBrands.length > 0 ? (
          <div className="mb-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-foreground">
                {filteredBrands.length} Brand{filteredBrands.length !== 1 ? "s" : ""} Available
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filteredBrands.map((brand) => (
                <div
                  key={brand._id}
                  className="bg-card rounded-lg border border-border p-4 hover:shadow-md hover:border-primary/50 transition-all cursor-pointer group"
                  onClick={() => handleBrandClick(brand._id, brand.brand_name)}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 flex items-center justify-center">
                      <img
                        src={buildImageUrl(brand.brand_logo)}
                        alt={brand.brand_name}
                        className="w-full h-full object-contain rounded-lg"
                      />
                    </div>
                    <h4 className="text-sm font-medium text-foreground text-center line-clamp-2 leading-tight">
                      {brand.brand_name}
                    </h4>
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
                No Brands Found
              </h3>
              <p className="text-gray-500">
                {searchQuery
                  ? `No brands match "${searchQuery}". Try a different search term.`
                  : "No brands are available for this vehicle type at the moment."}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandSelection;
